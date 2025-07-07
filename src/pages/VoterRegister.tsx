import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, UserCheck, Eye, EyeOff, Send, RefreshCw } from 'lucide-react';
import { sendOTPEmail, generateOTP, verifyOTP, isValidEmail } from '../services/emailService';

const VoterRegister: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    voterId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dob: '',
    phone: '',
    address: '',
  });
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.voterId.trim()) {
      setError('Voter ID is required');
      return false;
    }
    if (!formData.name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.gender) {
      setError('Please select your gender');
      return false;
    }
    if (!formData.dob) {
      setError('Date of birth is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;

    setIsSendingOTP(true);
    setError('');

    try {
      const newOTP = generateOTP();
      setGeneratedOTP(newOTP);

      const emailData = {
        to_email: formData.email,
        to_name: formData.name,
        otp_code: newOTP,
        from_name: 'SecureVote Team'
      };

      const emailSent = await sendOTPEmail(emailData);
      
      if (emailSent) {
        setOtpSent(true);
        setStep(2);
        // For demo purposes, show OTP in console
        console.log(`Demo OTP for ${formData.email}: ${newOTP}`);
      } else {
        setError('Failed to send verification email. Please try again.');
      }
    } catch (error) {
      setError('An error occurred while sending the verification email.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    setIsSendingOTP(true);
    setOtpError('');

    try {
      const newOTP = generateOTP();
      setGeneratedOTP(newOTP);

      const emailData = {
        to_email: formData.email,
        to_name: formData.name,
        otp_code: newOTP,
        from_name: 'SecureVote Team'
      };

      const emailSent = await sendOTPEmail(emailData);
      
      if (emailSent) {
        console.log(`Demo OTP resent for ${formData.email}: ${newOTP}`);
        setOtpError('');
      } else {
        setOtpError('Failed to resend verification email. Please try again.');
      }
    } catch (error) {
      setOtpError('An error occurred while resending the verification email.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setOtpError('Please enter the verification code');
      return;
    }

    if (otp.length !== 6) {
      setOtpError('Verification code must be 6 digits');
      return;
    }

    setIsSubmitting(true);
    setOtpError('');

    // Simulate verification process
    setTimeout(() => {
      const isValid = verifyOTP(otp, generatedOTP);
      
      if (isValid) {
        setStep(3);
      } else {
        setOtpError('Invalid verification code. Please check and try again.');
      }
      setIsSubmitting(false);
    }, 1500);
  };

  const handleCompleteRegistration = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Voter Registration</h2>
            <p className="text-blue-100 mt-1">Join the democratic process today</p>
          </div>

          {/* Progress Bar */}
          <div className="px-8 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Personal Info</span>
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Email Verification</span>
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium">Complete</span>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Voter ID *
                      </label>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          name="voterId"
                          value={formData.voterId}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter unique voter ID"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      We'll send a verification code to this email address
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Create a secure password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Enter your complete address"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOTP}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSendingOTP ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Verification Code...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Email Verification
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="text-center">
                <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Verify Your Email</h3>
                <p className="text-gray-600 mb-2">
                  We've sent a 6-digit verification code to
                </p>
                <p className="font-semibold text-gray-900 mb-8">{formData.email}</p>
                
                {/* Demo OTP Display */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Demo Mode:</strong> Your verification code is: <span className="font-mono text-lg">{generatedOTP}</span>
                  </p>
                </div>

                {otpError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                    {otpError}
                  </div>
                )}
                
                <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }}>
                  <div className="max-w-xs mx-auto mb-6">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(value);
                        setOtpError('');
                      }}
                      className="w-full text-center px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || otp.length !== 6}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      'Verify & Complete Registration'
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-center space-x-4">
                  <p className="text-sm text-gray-500">Didn't receive the code?</p>
                  <button
                    onClick={handleResendOTP}
                    disabled={isSendingOTP}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 flex items-center"
                  >
                    {isSendingOTP ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Resend Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center">
                <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <UserCheck className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h3>
                <p className="text-gray-600 mb-2">
                  Your email has been verified successfully.
                </p>
                <p className="text-gray-600 mb-8">
                  You can now log in and participate in elections.
                </p>
                
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-8">
                  <h4 className="font-semibold text-green-900 mb-2">Registration Details</h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>Voter ID:</strong> {formData.voterId}</p>
                    <p><strong>Name:</strong> {formData.name}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleCompleteRegistration}
                  className="bg-green-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Proceed to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterRegister;