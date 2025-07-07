import express from 'express';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import crypto from 'crypto';

const router = express.Router();

// @desc    Send OTP email
// @route   POST /api/email/send-otp
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email and name are required'
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real implementation, you would store this OTP in the database
    // with an expiration time. For demo purposes, we'll just send it.
    
    // Send OTP email
    const emailSent = await sendVerificationEmail(email, name, otp);
    
    if (emailSent) {
      res.json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          // In production, don't send OTP in response
          // This is just for demo purposes
          otp: process.env.NODE_ENV === 'development' ? otp : undefined
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send OTP'
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP'
    });
  }
});

// @desc    Verify OTP
// @route   POST /api/email/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      });
    }

    // In a real implementation, you would verify the OTP from the database
    // For demo purposes, we'll just check if it's a 6-digit number
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP format'
      });
    }

    // Simulate verification process
    // In production, check against stored OTP in database
    const isValid = true; // This would be the actual verification logic

    if (isValid) {
      res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP'
    });
  }
});

// @desc    Send test email
// @route   POST /api/email/test
// @access  Public
router.post('/test', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email and name are required'
      });
    }

    // Send a test verification email
    const emailSent = await sendVerificationEmail(email, name, '123456');
    
    if (emailSent) {
      res.json({
        success: true,
        message: 'Test email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email'
    });
  }
});

export default router; 