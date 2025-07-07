import express from 'express';
import User from '../models/User.js';
import Election from '../models/Election.js';
import Vote from '../models/Vote.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    // Get basic counts
    const totalVoters = await User.countDocuments({ isAdmin: false });
    const totalElections = await Election.countDocuments();
    const totalVotes = await Vote.countDocuments({ isCancelled: false });
    const totalCandidates = await Election.aggregate([
      { $unwind: '$candidates' },
      { $count: 'total' }
    ]);

    // Get recent activity
    const recentVotes = await Vote.find({ isCancelled: false })
      .populate('voterId', 'name')
      .populate('electionId', 'title')
      .sort({ timestamp: -1 })
      .limit(5);

    const recentRegistrations = await User.find({ isAdmin: false })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const activeElections = await Election.find({ status: 'active' })
      .select('title startDate endDate totalVotes')
      .sort({ startDate: 1 });

    // Get voting statistics
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const votesToday = await Vote.countDocuments({
      timestamp: { $gte: startOfDay },
      isCancelled: false
    });

    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const votesThisWeek = await Vote.countDocuments({
      timestamp: { $gte: thisWeek },
      isCancelled: false
    });

    // Get system health metrics
    const verifiedVoters = await User.countDocuments({ isAdmin: false, isEmailVerified: true });
    const verificationRate = totalVoters > 0 ? ((verifiedVoters / totalVoters) * 100).toFixed(2) : 0;
    const votingRate = totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalVoters,
          totalElections,
          totalVotes,
          totalCandidates: totalCandidates.length > 0 ? totalCandidates[0].total : 0,
          votesToday,
          votesThisWeek,
          verificationRate: parseFloat(verificationRate),
          votingRate: parseFloat(votingRate)
        },
        recentActivity: {
          votes: recentVotes,
          registrations: recentRegistrations
        },
        activeElections
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const period = req.query.period || '30'; // days
    const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Registration trends
    const registrationTrends = await User.aggregate([
      { $match: { isAdmin: false, createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Voting trends
    const votingTrends = await Vote.aggregate([
      { $match: { timestamp: { $gte: daysAgo }, isCancelled: false } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Election participation
    const electionParticipation = await Election.aggregate([
      {
        $lookup: {
          from: 'votes',
          localField: '_id',
          foreignField: 'electionId',
          as: 'votes'
        }
      },
      {
        $addFields: {
          voteCount: { $size: '$votes' },
          participationRate: {
            $multiply: [
              { $divide: [{ $size: '$votes' }, { $literal: 1000 }] }, // Assuming 1000 total voters
              100
            ]
          }
        }
      },
      {
        $project: {
          title: 1,
          status: 1,
          voteCount: 1,
          participationRate: 1,
          startDate: 1,
          endDate: 1
        }
      },
      { $sort: { startDate: -1 } }
    ]);

    // Gender and age distribution
    const genderDistribution = await User.aggregate([
      { $match: { isAdmin: false } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    const ageDistribution = await User.aggregate([
      { $match: { isAdmin: false } },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365.25 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$age', 25] }, then: '18-24' },
                { case: { $lt: ['$age', 35] }, then: '25-34' },
                { case: { $lt: ['$age', 45] }, then: '35-44' },
                { case: { $lt: ['$age', 55] }, then: '45-54' },
                { case: { $lt: ['$age', 65] }, then: '55-64' }
              ],
              default: '65+'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        registrationTrends,
        votingTrends,
        electionParticipation,
        genderDistribution,
        ageDistribution
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private (Admin only)
router.get('/health', protect, adminOnly, async (req, res) => {
  try {
    // Check database connection
    const dbStatus = 'connected'; // This would be checked in a real implementation

    // Check email service
    const emailStatus = process.env.EMAIL_USER ? 'configured' : 'not_configured';

    // Get system metrics
    const totalUsers = await User.countDocuments();
    const totalElections = await Election.countDocuments();
    const totalVotes = await Vote.countDocuments();

    // Check for any issues
    const issues = [];
    
    if (emailStatus === 'not_configured') {
      issues.push('Email service not configured');
    }

    const unverifiedUsers = await User.countDocuments({ isAdmin: false, isEmailVerified: false });
    if (unverifiedUsers > 0) {
      issues.push(`${unverifiedUsers} users have unverified emails`);
    }

    const cancelledVotes = await Vote.countDocuments({ isCancelled: true });
    if (cancelledVotes > 0) {
      issues.push(`${cancelledVotes} votes have been cancelled`);
    }

    res.json({
      success: true,
      data: {
        status: issues.length === 0 ? 'healthy' : 'warning',
        database: dbStatus,
        emailService: emailStatus,
        metrics: {
          totalUsers,
          totalElections,
          totalVotes
        },
        issues
      }
    });
  } catch (error) {
    console.error('Get health error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check system health'
    });
  }
});

// @desc    Export system data
// @route   GET /api/admin/export
// @access  Private (Admin only)
router.get('/export', protect, adminOnly, async (req, res) => {
  try {
    const type = req.query.type || 'all';

    let data = {};

    if (type === 'all' || type === 'users') {
      const users = await User.find({ isAdmin: false })
        .select('voterId name email gender dateOfBirth phone address isEmailVerified hasVoted isActive createdAt')
        .sort({ createdAt: -1 });
      data.users = users;
    }

    if (type === 'all' || type === 'elections') {
      const elections = await Election.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
      data.elections = elections;
    }

    if (type === 'all' || type === 'votes') {
      const votes = await Vote.find({ isCancelled: false })
        .populate('voterId', 'name email voterId')
        .populate('electionId', 'title')
        .sort({ timestamp: -1 });
      data.votes = votes;
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data'
    });
  }
});

// @desc    Create admin user
// @route   POST /api/admin/create-admin
// @access  Private (Admin only)
router.post('/create-admin', protect, adminOnly, async (req, res) => {
  try {
    const { voterId, name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { voterId }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email 
          ? 'Email already registered' 
          : 'Voter ID already exists'
      });
    }

    // Create admin user
    const admin = await User.create({
      voterId: voterId.toUpperCase(),
      name,
      email,
      password,
      isAdmin: true,
      isEmailVerified: true, // Admin emails are pre-verified
      gender: 'other', // Default values for required fields
      dateOfBirth: new Date('1990-01-01'),
      phone: '0000000000',
      address: 'Admin Address'
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        admin: {
          id: admin._id,
          voterId: admin.voterId,
          name: admin.name,
          email: admin.email,
          isAdmin: admin.isAdmin
        }
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create admin user'
    });
  }
});

// @desc    Get pending approvals count
// @route   GET /api/admin/pending-approvals-count
// @access  Private (Admin only)
router.get('/pending-approvals-count', protect, adminOnly, async (req, res) => {
  try {
    const pendingCount = await User.countDocuments({
      isAdmin: false,
      isEmailVerified: true,
      isAdminApproved: false,
      isActive: true
    });

    const unverifiedCount = await User.countDocuments({
      isAdmin: false,
      isEmailVerified: false,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        pendingApprovals: pendingCount,
        unverifiedUsers: unverifiedCount
      }
    });
  } catch (error) {
    console.error('Get pending approvals count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending approvals count'
    });
  }
});

export default router; 