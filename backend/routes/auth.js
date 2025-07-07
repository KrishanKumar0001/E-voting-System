import express from 'express';
import User from '../models/User.js';
import { protect, generateToken } from '../middleware/auth.js';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendPendingApprovalNotification } from '../utils/emailService.js';
import crypto from 'crypto';

const router = express.Router();

// @desc    Register a new voter
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const {
      voterId,
      name,
      email,
      password,
      gender,
      dateOfBirth,
      phone,
      address
    } = req.body;

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

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      voterId: voterId.toUpperCase(),
      name,
      email,
      password,
      gender,
      dateOfBirth,
      phone,
      address,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail registration if email fails
    }

    // Send pending approval notification to all admins
    try {
      const admins = await User.find({ isAdmin: true, isActive: true });
      const pendingCount = await User.countDocuments({
        isAdmin: false,
        isEmailVerified: true,
        isAdminApproved: false,
        isActive: true
      });
      
      for (const admin of admins) {
        await sendPendingApprovalNotification(admin.email, admin.name, pendingCount);
      }
    } catch (notificationError) {
      console.error('Admin notification sending failed:', notificationError);
      // Don't fail registration if notification fails
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification and wait for admin approval.',
      data: {
        user: {
          id: user._id,
          voterId: user.voterId,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isAdminApproved: user.isAdminApproved
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    // Check if user is approved (for non-admin users)
    if (!user.isAdmin && !user.isAdminApproved) {
      return res.status(401).json({
        success: false,
        error: 'Your account is pending admin approval. Please wait for approval.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          voterId: user.voterId,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isEmailVerified: user.isEmailVerified,
          hasVoted: user.hasVoted
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
});

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
router.post('/admin/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user by email
    const user = await User.findOne({ email, isAdmin: true }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Admin account is deactivated'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: user._id,
          voterId: user.voterId,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Admin login failed. Please try again.'
    });
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required'
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Email verification failed'
    });
  }
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend verification email'
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        error: 'Failed to send password reset email'
      });
    }

    res.json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request'
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user information'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token. However, we can implement server-side
    // logout by maintaining a blacklist of tokens if needed.
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// @desc    Check approval status
// @route   GET /api/auth/approval-status
// @access  Private
router.get('/approval-status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        isEmailVerified: user.isEmailVerified,
        isAdminApproved: user.isAdminApproved,
        isActive: user.isActive,
        canVote: user.canVote(),
        rejectionReason: user.rejectionReason
      }
    });
  } catch (error) {
    console.error('Check approval status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check approval status'
    });
  }
});

export default router; 