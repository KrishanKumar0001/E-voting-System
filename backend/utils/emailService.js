import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send verification email
export const sendVerificationEmail = async (email, name, token) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"E-Voting System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - E-Voting System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">E-Voting System</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for registering with the E-Voting System. To complete your registration and start voting, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all; color: #495057;">
              ${verificationUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px;">
              This verification link will expire in 24 hours. If you didn't create an account with us, 
              please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This is an automated email from the E-Voting System. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, name, token) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: `"E-Voting System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - E-Voting System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">E-Voting System</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              You requested to reset your password for your E-Voting System account. 
              Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all; color: #495057;">
              ${resetUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px;">
              This reset link will expire in 1 hour. If you didn't request a password reset, 
              please ignore this email and your password will remain unchanged.
            </p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This is an automated email from the E-Voting System. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send vote confirmation email
export const sendVoteConfirmationEmail = async (email, name, electionTitle, candidateName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"E-Voting System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Vote Confirmation - E-Voting System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">E-Voting System</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Vote Confirmation</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Your vote has been successfully recorded in the <strong>${electionTitle}</strong> election.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #155724; margin: 0 0 10px 0;">Vote Details:</h3>
              <p style="color: #155724; margin: 0;"><strong>Election:</strong> ${electionTitle}</p>
              <p style="color: #155724; margin: 0;"><strong>Candidate:</strong> ${candidateName}</p>
              <p style="color: #155724; margin: 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px;">
              Thank you for participating in the democratic process. Your vote matters!
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              You can view the election results once the voting period ends.
            </p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This is an automated email from the E-Voting System. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Vote confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending vote confirmation email:', error);
    return false;
  }
};

// Send election notification email
export const sendElectionNotificationEmail = async (email, name, electionTitle, startDate, endDate) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"E-Voting System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'New Election Available - E-Voting System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">E-Voting System</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">New Election Notification</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              A new election is now available for voting: <strong>${electionTitle}</strong>
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #856404; margin: 0 0 10px 0;">Election Details:</h3>
              <p style="color: #856404; margin: 0;"><strong>Title:</strong> ${electionTitle}</p>
              <p style="color: #856404; margin: 0;"><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
              <p style="color: #856404; margin: 0;"><strong>End Date:</strong> ${new Date(endDate).toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/elections" 
                 style="background: #ffc107; color: #212529; padding: 15px 30px; text-decoration: none; 
                        border-radius: 5px; display: inline-block; font-weight: bold;">
                View Elections
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Make sure to cast your vote before the election ends. Every vote counts!
            </p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This is an automated email from the E-Voting System. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Election notification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending election notification email:', error);
    return false;
  }
};

// Send approval notification email
export const sendApprovalEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"E-Voting System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Account Approved - E-Voting System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">E-Voting System</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Account Approval</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Great news! Your account has been approved by our administration team. 
              You can now log in and participate in elections.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #155724; margin: 0 0 10px 0;">Account Status:</h3>
              <p style="color: #155724; margin: 0;"><strong>✅ Email Verified</strong></p>
              <p style="color: #155724; margin: 0;"><strong>✅ Admin Approved</strong></p>
              <p style="color: #155724; margin: 0;"><strong>✅ Ready to Vote</strong></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                 style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 5px; display: inline-block; font-weight: bold;">
                Login to Vote
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Thank you for your patience during the approval process. 
              We look forward to your participation in our democratic process!
            </p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This is an automated email from the E-Voting System. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Approval email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending approval email:', error);
    return false;
  }
};

// Send rejection notification email
export const sendRejectionEmail = async (email, name, reason) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"E-Voting System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Account Application Update - E-Voting System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">E-Voting System</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Application Update</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              We regret to inform you that your account application has not been approved at this time.
            </p>
            
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #721c24; margin: 0 0 10px 0;">Application Status:</h3>
              <p style="color: #721c24; margin: 0;"><strong>❌ Not Approved</strong></p>
              ${reason ? `<p style="color: #721c24; margin: 10px 0 0 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px;">
              If you believe this decision was made in error or if you would like to provide additional 
              information, please contact our support team.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Thank you for your interest in participating in our democratic process.
            </p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This is an automated email from the E-Voting System. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Rejection email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return false;
  }
};

// Send pending approval notification to admin
export const sendPendingApprovalNotification = async (adminEmail, adminName, pendingCount) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"E-Voting System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `Pending Approvals - ${pendingCount} New Voter(s)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">E-Voting System</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Admin Notification</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${adminName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              You have <strong>${pendingCount}</strong> new voter application(s) that require your approval.
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #856404; margin: 0 0 10px 0;">Action Required:</h3>
              <p style="color: #856404; margin: 0;">• Review pending voter applications</p>
              <p style="color: #856404; margin: 0;">• Approve or reject each application</p>
              <p style="color: #856404; margin: 0;">• Ensure all applications are processed promptly</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard" 
                 style="background: #ffc107; color: #212529; padding: 15px 30px; text-decoration: none; 
                        border-radius: 5px; display: inline-block; font-weight: bold;">
                Review Applications
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Please log in to your admin dashboard to review and process these applications.
            </p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This is an automated email from the E-Voting System. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Pending approval notification sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending pending approval notification:', error);
    return false;
  }
}; 