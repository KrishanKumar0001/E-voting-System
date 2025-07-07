import express from 'express';
import Vote from '../models/Vote.js';
import Election from '../models/Election.js';
import User from '../models/User.js';
import { protect, voterOnly } from '../middleware/auth.js';
import { validateVote, validateId } from '../middleware/validation.js';
import { sendVoteConfirmationEmail } from '../utils/emailService.js';

const router = express.Router();

// @desc    Cast a vote
// @route   POST /api/votes
// @access  Private (Voters only)
router.post('/', protect, voterOnly, validateVote, async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;

    // Check if election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        error: 'Election not found'
      });
    }

    // Check if election is currently active
    const now = new Date();
    if (now < election.startDate || now > election.endDate || election.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Election is not currently active for voting'
      });
    }

    // Check if candidate exists in this election
    const candidate = election.candidates.find(c => c._id.toString() === candidateId);
    if (!candidate) {
      return res.status(400).json({
        success: false,
        error: 'Invalid candidate for this election'
      });
    }

    // Check if user has already voted in this election
    const existingVote = await Vote.findOne({
      voterId: req.user._id,
      electionId: electionId,
      isCancelled: false
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        error: 'You have already voted in this election'
      });
    }

    // Check if user meets election requirements
    const userAge = req.user.age;
    if (userAge < election.requirements.minimumAge) {
      return res.status(400).json({
        success: false,
        error: `You must be at least ${election.requirements.minimumAge} years old to vote in this election`
      });
    }

    // Check if user is approved to vote
    if (!req.user.canVote()) {
      return res.status(400).json({
        success: false,
        error: 'Your account is not fully approved. Please ensure your email is verified and wait for admin approval.'
      });
    }

    if (election.requirements.allowedGenders && 
        election.requirements.allowedGenders.length > 0 &&
        !election.requirements.allowedGenders.includes(req.user.gender)) {
      return res.status(400).json({
        success: false,
        error: 'You are not eligible to vote in this election based on gender requirements'
      });
    }

    // Create vote
    const vote = await Vote.create({
      voterId: req.user._id,
      electionId: electionId,
      candidateId: candidateId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop',
        sessionId: req.sessionID || 'unknown'
      }
    });

    // Update election total votes
    election.totalVotes += 1;
    await election.save();

    // Update user hasVoted status
    req.user.hasVoted = true;
    await req.user.save();

    // Send confirmation email
    try {
      await sendVoteConfirmationEmail(
        req.user.email,
        req.user.name,
        election.title,
        candidate.name
      );
    } catch (emailError) {
      console.error('Failed to send vote confirmation email:', emailError);
      // Don't fail the vote if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Vote cast successfully',
      data: {
        vote: {
          id: vote._id,
          electionId: vote.electionId,
          candidateId: vote.candidateId,
          timestamp: vote.timestamp,
          isVerified: vote.isVerified
        },
        candidate: {
          name: candidate.name,
          party: candidate.party,
          symbol: candidate.symbol
        }
      }
    });
  } catch (error) {
    console.error('Cast vote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cast vote'
    });
  }
});

// @desc    Get user's voting history
// @route   GET /api/votes/history
// @access  Private (Voters only)
router.get('/history', protect, voterOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const votes = await Vote.find({
      voterId: req.user._id,
      isCancelled: false
    })
      .populate('electionId', 'title status startDate endDate')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vote.countDocuments({
      voterId: req.user._id,
      isCancelled: false
    });

    // Get candidate details for each vote
    const votesWithCandidates = await Promise.all(
      votes.map(async (vote) => {
        const election = await Election.findById(vote.electionId);
        const candidate = election?.candidates.find(c => c._id.toString() === vote.candidateId);
        
        return {
          id: vote._id,
          election: vote.electionId,
          candidate: candidate ? {
            name: candidate.name,
            party: candidate.party,
            symbol: candidate.symbol
          } : null,
          timestamp: vote.timestamp,
          isVerified: vote.isVerified,
          isCancelled: vote.isCancelled
        };
      })
    );

    res.json({
      success: true,
      data: {
        votes: votesWithCandidates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get voting history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voting history'
    });
  }
});

// @desc    Get vote details
// @route   GET /api/votes/:id
// @access  Private
router.get('/:id', protect, validateId, async (req, res) => {
  try {
    const vote = await Vote.findById(req.params.id)
      .populate('voterId', 'name email voterId')
      .populate('electionId', 'title status');

    if (!vote) {
      return res.status(404).json({
        success: false,
        error: 'Vote not found'
      });
    }

    // Check if user can view this vote
    if (!req.user.isAdmin && vote.voterId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get candidate details
    const election = await Election.findById(vote.electionId);
    const candidate = election?.candidates.find(c => c._id.toString() === vote.candidateId);

    res.json({
      success: true,
      data: {
        vote: {
          id: vote._id,
          voter: vote.voterId,
          election: vote.electionId,
          candidate: candidate ? {
            name: candidate.name,
            party: candidate.party,
            symbol: candidate.symbol
          } : null,
          timestamp: vote.timestamp,
          isVerified: vote.isVerified,
          isCancelled: vote.isCancelled,
          metadata: vote.metadata
        }
      }
    });
  } catch (error) {
    console.error('Get vote details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vote details'
    });
  }
});

// @desc    Cancel a vote (within 24 hours)
// @route   POST /api/votes/:id/cancel
// @access  Private
router.post('/:id/cancel', protect, validateId, async (req, res) => {
  try {
    const { reason } = req.body;

    const vote = await Vote.findById(req.params.id);

    if (!vote) {
      return res.status(404).json({
        success: false,
        error: 'Vote not found'
      });
    }

    // Check if user can cancel this vote
    if (!req.user.isAdmin && vote.voterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if vote can be cancelled
    if (!vote.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        error: 'Vote cannot be cancelled after 24 hours or if already cancelled'
      });
    }

    // Cancel the vote
    await vote.cancelVote(req.user._id, reason);

    // Update election total votes
    const election = await Election.findById(vote.electionId);
    if (election) {
      election.totalVotes = Math.max(0, election.totalVotes - 1);
      await election.save();
    }

    // Update user hasVoted status if they have no other votes
    const otherVotes = await Vote.find({
      voterId: req.user._id,
      isCancelled: false
    });

    if (otherVotes.length === 0) {
      req.user.hasVoted = false;
      await req.user.save();
    }

    res.json({
      success: true,
      message: 'Vote cancelled successfully',
      data: { vote }
    });
  } catch (error) {
    console.error('Cancel vote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel vote'
    });
  }
});

// @desc    Verify a vote (Admin only)
// @route   POST /api/votes/:id/verify
// @access  Private (Admin only)
router.post('/:id/verify', protect, validateId, async (req, res) => {
  try {
    const { verificationMethod = 'manual' } = req.body;

    const vote = await Vote.findById(req.params.id);

    if (!vote) {
      return res.status(404).json({
        success: false,
        error: 'Vote not found'
      });
    }

    if (vote.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Vote is already verified'
      });
    }

    vote.isVerified = true;
    vote.verificationMethod = verificationMethod;
    await vote.save();

    res.json({
      success: true,
      message: 'Vote verified successfully',
      data: { vote }
    });
  } catch (error) {
    console.error('Verify vote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify vote'
    });
  }
});

// @desc    Get all votes (Admin only)
// @route   GET /api/votes
// @access  Private (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const electionId = req.query.electionId;
    const isVerified = req.query.isVerified;

    // Build query
    const query = { isCancelled: false };
    if (electionId) query.electionId = electionId;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const votes = await Vote.find(query)
      .populate('voterId', 'name email voterId')
      .populate('electionId', 'title status')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vote.countDocuments(query);

    res.json({
      success: true,
      data: {
        votes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all votes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch votes'
    });
  }
});

export default router; 