import express from 'express';
import Election from '../models/Election.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validateElectionCreation, validateCandidate, validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// @desc    Get all elections
// @route   GET /api/elections
// @access  Public
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isPublic: true };
    if (status && ['upcoming', 'active', 'completed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    const elections = await Election.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Election.countDocuments(query);

    res.json({
      success: true,
      data: {
        elections,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get elections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch elections'
    });
  }
});

// @desc    Get single election
// @route   GET /api/elections/:id
// @access  Public
router.get('/:id', validateId, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!election) {
      return res.status(404).json({
        success: false,
        error: 'Election not found'
      });
    }

    // Update status based on current time
    election.updateStatus();
    await election.save();

    res.json({
      success: true,
      data: { election }
    });
  } catch (error) {
    console.error('Get election error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch election'
    });
  }
});

// @desc    Create new election
// @route   POST /api/elections
// @access  Private (Admin only)
router.post('/', protect, adminOnly, validateElectionCreation, async (req, res) => {
  try {
    const { title, description, startDate, endDate, requirements, settings } = req.body;

    const election = await Election.create({
      title,
      description,
      startDate,
      endDate,
      requirements: requirements || {},
      settings: settings || {},
      createdBy: req.user._id
    });

    const populatedElection = await Election.findById(election._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      data: { election: populatedElection }
    });
  } catch (error) {
    console.error('Create election error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create election'
    });
  }
});

// @desc    Update election
// @route   PUT /api/elections/:id
// @access  Private (Admin only)
router.put('/:id', protect, adminOnly, validateId, async (req, res) => {
  try {
    const { title, description, startDate, endDate, status, requirements, settings } = req.body;

    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        error: 'Election not found'
      });
    }

    // Check if election has started and prevent certain changes
    if (election.status === 'active' || election.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify election that has started or completed'
      });
    }

    // Update fields
    if (title) election.title = title;
    if (description) election.description = description;
    if (startDate) election.startDate = startDate;
    if (endDate) election.endDate = endDate;
    if (status) election.status = status;
    if (requirements) election.requirements = { ...election.requirements, ...requirements };
    if (settings) election.settings = { ...election.settings, ...settings };

    await election.save();

    const updatedElection = await Election.findById(election._id)
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Election updated successfully',
      data: { election: updatedElection }
    });
  } catch (error) {
    console.error('Update election error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update election'
    });
  }
});

// @desc    Delete election
// @route   DELETE /api/elections/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, validateId, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        error: 'Election not found'
      });
    }

    // Check if election has started
    if (election.status === 'active' || election.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete election that has started or completed'
      });
    }

    await Election.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Election deleted successfully'
    });
  } catch (error) {
    console.error('Delete election error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete election'
    });
  }
});

// @desc    Add candidate to election
// @route   POST /api/elections/:id/candidates
// @access  Private (Admin only)
router.post('/:id/candidates', protect, adminOnly, validateId, validateCandidate, async (req, res) => {
  try {
    const { name, party, symbol, aadharId, description, manifesto } = req.body;

    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        error: 'Election not found'
      });
    }

    // Check if election has started
    if (election.status === 'active' || election.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot add candidates to election that has started or completed'
      });
    }

    // Check if candidate already exists
    const existingCandidate = election.candidates.find(
      candidate => candidate.aadharId === aadharId
    );

    if (existingCandidate) {
      return res.status(400).json({
        success: false,
        error: 'Candidate with this Aadhar ID already exists in this election'
      });
    }

    // Add candidate
    election.candidates.push({
      name,
      party,
      symbol,
      aadharId,
      description,
      manifesto
    });

    await election.save();

    res.status(201).json({
      success: true,
      message: 'Candidate added successfully',
      data: { election }
    });
  } catch (error) {
    console.error('Add candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add candidate'
    });
  }
});

// @desc    Update candidate
// @route   PUT /api/elections/:electionId/candidates/:candidateId
// @access  Private (Admin only)
router.put('/:electionId/candidates/:candidateId', protect, adminOnly, validateId, async (req, res) => {
  try {
    const { name, party, symbol, description, manifesto } = req.body;

    const election = await Election.findById(req.params.electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        error: 'Election not found'
      });
    }

    // Check if election has started
    if (election.status === 'active' || election.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify candidates in election that has started or completed'
      });
    }

    const candidate = election.candidates.id(req.params.candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found'
      });
    }

    // Update candidate fields
    if (name) candidate.name = name;
    if (party) candidate.party = party;
    if (symbol) candidate.symbol = symbol;
    if (description !== undefined) candidate.description = description;
    if (manifesto !== undefined) candidate.manifesto = manifesto;

    await election.save();

    res.json({
      success: true,
      message: 'Candidate updated successfully',
      data: { election }
    });
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update candidate'
    });
  }
});

// @desc    Remove candidate from election
// @route   DELETE /api/elections/:electionId/candidates/:candidateId
// @access  Private (Admin only)
router.delete('/:electionId/candidates/:candidateId', protect, adminOnly, validateId, async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        error: 'Election not found'
      });
    }

    // Check if election has started
    if (election.status === 'active' || election.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove candidates from election that has started or completed'
      });
    }

    const candidate = election.candidates.id(req.params.candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found'
      });
    }

    candidate.remove();
    await election.save();

    res.json({
      success: true,
      message: 'Candidate removed successfully',
      data: { election }
    });
  } catch (error) {
    console.error('Remove candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove candidate'
    });
  }
});

// @desc    Get election results
// @route   GET /api/elections/:id/results
// @access  Public
router.get('/:id/results', validateId, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        error: 'Election not found'
      });
    }

    // Check if results should be shown
    const now = new Date();
    if (!election.settings.showResultsBeforeEnd && now < election.endDate) {
      return res.status(403).json({
        success: false,
        error: 'Results are not available until the election ends'
      });
    }

    // Get vote statistics
    const Vote = (await import('../models/Vote.js')).default;
    const stats = await Vote.getElectionStats(req.params.id);
    const totalVotes = await Vote.getTotalVotes(req.params.id);

    // Map stats to candidates
    const results = election.candidates.map(candidate => {
      const candidateStats = stats.find(stat => stat._id === candidate._id.toString());
      return {
        candidate: {
          id: candidate._id,
          name: candidate.name,
          party: candidate.party,
          symbol: candidate.symbol
        },
        votes: candidateStats ? candidateStats.count : 0,
        verifiedVotes: candidateStats ? candidateStats.verifiedVotes : 0,
        unverifiedVotes: candidateStats ? candidateStats.unverifiedVotes : 0,
        percentage: totalVotes > 0 ? ((candidateStats ? candidateStats.count : 0) / totalVotes * 100).toFixed(2) : 0
      };
    });

    // Sort by votes (descending)
    results.sort((a, b) => b.votes - a.votes);

    res.json({
      success: true,
      data: {
        election: {
          id: election._id,
          title: election.title,
          status: election.status,
          totalVotes,
          results
        }
      }
    });
  } catch (error) {
    console.error('Get election results error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch election results'
    });
  }
});

export default router; 