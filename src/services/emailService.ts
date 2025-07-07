import emailjs from 'emailjs-com';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'your_service_id'; // Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'your_template_id'; // Replace with your EmailJS template ID
const EMAILJS_PUBLIC_KEY = 'your_public_key'; // Replace with your EmailJS public key

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface OTPData {
  to_email: string;
  to_name: string;
  otp_code: string;
  from_name: string;
}

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
export const sendOTPEmail = async (emailData: OTPData): Promise<boolean> => {
  try {
    // For demo purposes, we'll simulate email sending
    // In production, you would use EmailJS or another email service
    
    console.log('Sending OTP email to:', emailData.to_email);
    console.log('OTP Code:', emailData.otp_code);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo, we'll show the OTP in console and return success
    // In production, uncomment the following lines and configure EmailJS:
    
    /*
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: emailData.to_email,
        to_name: emailData.to_name,
        otp_code: emailData.otp_code,
        from_name: emailData.from_name,
        subject: 'SecureVote - Email Verification Code',
        message: `Your verification code is: ${emailData.otp_code}. This code will expire in 10 minutes.`
      }
    );
    
    return result.status === 200;
    */
    
    return true; // Simulate successful email sending
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
};

// Verify OTP (in production, this would be handled by backend)
export const verifyOTP = (enteredOTP: string, actualOTP: string): boolean => {
  return enteredOTP === actualOTP;
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};