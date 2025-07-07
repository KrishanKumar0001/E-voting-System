import express from 'express';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validation.js';
import { sendApprovalEmail, sendRejectionEmail, sendPendingApprovalNotification } from '../utils/emailService.js';

const router = express.Router();

// @desc    Get all voters (Admin only)
// @route   GET /api/voters
// @access  Private (Admin only)
router.get('/', protect, adminOnly, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const isEmailVerified = req.query.isEmailVerified;
    const isAdminApproved = req.query.isAdminApproved;
    const hasVoted = req.query.hasVoted;
    const status = req.query.status; // pending, approved, rejected

    // Build query
    const query = { isAdmin: false };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { voterId: { $regex: search, $options: 'i' } }
      ];
    }
    if (isEmailVerified !== undefined) query.isEmailVerified = isEmailVerified === 'true';
    if (isAdminApproved !== undefined) query.isAdminApproved = isAdminApproved === 'true';
    if (hasVoted !== undefined) query.hasVoted = hasVoted === 'true';
    
    // Filter by status
    if (status === 'pending') {
      query.isEmailVerified = true;
      query.isAdminApproved = false;
    } else if (status === 'approved') {
      query.isEmailVerified = true;
      query.isAdminApproved = true;
    } else if (status === 'rejected') {
      query.isActive = false;
    }

    const voters = await User.find(query)
      .select('-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        voters,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get voters error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voters'
    });
  }
});

// @desc    Get voter by ID (Admin only)
// @route   GET /api/voters/:id
// @access  Private (Admin only)
router.get('/:id', protect, adminOnly, validateId, async (req, res) => {
  try {
    const voter = await User.findById(req.params.id)
      .select('-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires');

    if (!voter) {
      return res.status(404).json({
        success: false,
        error: 'Voter not found'
      });
    }

    if (voter.isAdmin) {
      return res.status(400).json({
        success: false,
        error: 'This is an admin account, not a voter'
      });
    }

    res.json({
      success: true,
      data: { voter }
    });
  } catch (error) {
    console.error('Get voter error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voter'
    });
  }
});

// @desc    Update voter status (Admin only)
// @route   PUT /api/voters/:id/status
// @access  Private (Admin only)
router.put('/:id/status', protect, adminOnly, validateId, async (req, res) => {
  try {
    const { isActive, isEmailVerified } = req.body;

    const voter = await User.findById(req.params.id);

    if (!voter) {
      return res.status(404).json({
        success: false,
        error: 'Voter not found'
      });
    }

    if (voter.isAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify admin account'
      });
    }

    // Update status fields
    if (isActive !== undefined) voter.isActive = isActive;
    if (isEmailVerified !== undefined) voter.isEmailVerified = isEmailVerified;

    await voter.save();

    res.json({
      success: true,
      message: 'Voter status updated successfully',
      data: { voter }
    });
  } catch (error) {
    console.error('Update voter status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update voter status'
    });
  }
});

// @desc    Delete voter (Admin only)
// @route   DELETE /api/voters/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, validateId, async (req, res) => {
  try {
    const voter = await User.findById(req.params.id);

    if (!voter) {
      return res.status(404).json({
        success: false,
        error: 'Voter not found'
      });
    }

    if (voter.isAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete admin account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Voter deleted successfully'
    });
  } catch (error) {
    console.error('Delete voter error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete voter'
    });
  }
});

// @desc    Get voter statistics (Admin only)
// @route   GET /api/voters/stats/overview
// @access  Private (Admin only)
router.get('/stats/overview', protect, adminOnly, async (req, res) => {
  try {
    const totalVoters = await User.countDocuments({ isAdmin: false });
    const verifiedVoters = await User.countDocuments({ isAdmin: false, isEmailVerified: true });
    const activeVoters = await User.countDocuments({ isAdmin: false, isActive: true });
    const votersWhoVoted = await User.countDocuments({ isAdmin: false, hasVoted: true });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      isAdmin: false,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Gender distribution
    const genderStats = await User.aggregate([
      { $match: { isAdmin: false } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    // Age distribution
    const ageStats = await User.aggregate([
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
        overview: {
          totalVoters,
          verifiedVoters,
          activeVoters,
          votersWhoVoted,
          recentRegistrations,
          verificationRate: totalVoters > 0 ? ((verifiedVoters / totalVoters) * 100).toFixed(2) : 0,
          votingRate: totalVoters > 0 ? ((votersWhoVoted / totalVoters) * 100).toFixed(2) : 0
        },
        genderDistribution: genderStats,
        ageDistribution: ageStats
      }
    });
  } catch (error) {
    console.error('Get voter stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voter statistics'
    });
  }
});

// @desc    Export voters data (Admin only)
// @route   GET /api/voters/export
// @access  Private (Admin only)
router.get('/export', protect, adminOnly, async (req, res) => {
  try {
    const voters = await User.find({ isAdmin: false })
      .select('voterId name email gender dateOfBirth phone address isEmailVerified hasVoted isActive createdAt')
      .sort({ createdAt: -1 });

    // Convert to CSV format
    const csvHeader = 'Voter ID,Name,Email,Gender,Date of Birth,Phone,Address,Email Verified,Has Voted,Status,Created At\n';
    const csvRows = voters.map(voter => {
      return [
        voter.voterId,
        `"${voter.name}"`,
        voter.email,
        voter.gender,
        voter.dateOfBirth.toISOString().split('T')[0],
        voter.phone,
        `"${voter.address}"`,
        voter.isEmailVerified ? 'Yes' : 'No',
        voter.hasVoted ? 'Yes' : 'No',
        voter.isActive ? 'Active' : 'Inactive',
        voter.createdAt.toISOString()
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=voters_export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export voters error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export voters data'
    });
  }
});

// @desc    Approve/Reject voter (Admin only)
// @route   PUT /api/voters/:id/approval
// @access  Private (Admin only)
router.put('/:id/approval', protect, adminOnly, validateId, async (req, res) => {
  try {
    const { isAdminApproved, rejectionReason } = req.body;

    const voter = await User.findById(req.params.id);

    if (!voter) {
      return res.status(404).json({
        success: false,
        error: 'Voter not found'
      });
    }

    if (voter.isAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify admin account'
      });
    }

    // Check if email is verified before approval
    if (isAdminApproved && !voter.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Cannot approve voter with unverified email'
      });
    }

    // Update approval status
    voter.isAdminApproved = isAdminApproved;
    
    // If rejected, deactivate the account
    if (!isAdminApproved) {
      voter.isActive = false;
      voter.rejectionReason = rejectionReason;
    } else {
      voter.isActive = true;
      voter.rejectionReason = undefined;
    }

    await voter.save();

    // Send notification email
    try {
      if (isAdminApproved) {
        await sendApprovalEmail(voter.email, voter.name);
      } else {
        await sendRejectionEmail(voter.email, voter.name, rejectionReason);
      }
    } catch (emailError) {
      console.error('Failed to send approval/rejection email:', emailError);
      // Don't fail the approval process if email fails
    }

    res.json({
      success: true,
      message: isAdminApproved ? 'Voter approved successfully' : 'Voter rejected successfully',
      data: { voter }
    });
  } catch (error) {
    console.error('Update voter approval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update voter approval status'
    });
  }
});

// @desc    Bulk approve/reject voters (Admin only)
// @route   POST /api/voters/bulk-approval
// @access  Private (Admin only)
router.post('/bulk-approval', protect, adminOnly, async (req, res) => {
  try {
    const { voterIds, isAdminApproved, rejectionReason } = req.body;

    if (!Array.isArray(voterIds) || voterIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Voter IDs array is required'
      });
    }

    const voters = await User.find({
      _id: { $in: voterIds },
      isAdmin: false
    });

    if (voters.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No valid voters found'
      });
    }

    const updatePromises = voters.map(async (voter) => {
      // Check if email is verified before approval
      if (isAdminApproved && !voter.isEmailVerified) {
        return { voterId: voter._id, success: false, error: 'Email not verified' };
      }

      voter.isAdminApproved = isAdminApproved;
      
      if (!isAdminApproved) {
        voter.isActive = false;
        voter.rejectionReason = rejectionReason;
      } else {
        voter.isActive = true;
        voter.rejectionReason = undefined;
      }

      await voter.save();

      // Send notification email
      try {
        if (isAdminApproved) {
          await sendApprovalEmail(voter.email, voter.name);
        } else {
          await sendRejectionEmail(voter.email, voter.name, rejectionReason);
        }
      } catch (emailError) {
        console.error('Failed to send email to', voter.email, emailError);
      }

      return { voterId: voter._id, success: true };
    });

    const results = await Promise.all(updatePromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Bulk operation completed. ${successful} successful, ${failed} failed.`,
      data: { results }
    });
  } catch (error) {
    console.error('Bulk approval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk approval'
    });
  }
});

// @desc    Get pending approvals (Admin only)
// @route   GET /api/voters/pending-approvals
// @access  Private (Admin only)
router.get('/pending-approvals', protect, adminOnly, async (req, res) => {
  try {
    const pendingVoters = await User.find({
      isAdmin: false,
      isEmailVerified: true,
      isAdminApproved: false,
      isActive: true
    })
      .select('-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        pendingVoters,
        count: pendingVoters.length
      }
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending approvals'
    });
  }
});

export default router; 