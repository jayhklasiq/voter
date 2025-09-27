import { OTPData } from '../types/election';
import EmailService from './emailService';

class OTPService {
  private static instance: OTPService;
  private otpStorage: Map<string, OTPData> = new Map();
  private readonly OTP_EXPIRY_MINUTES = 5; // OTP expires in 5 minutes
  private emailService: EmailService;

  private constructor() {
    this.emailService = EmailService.getInstance();
  }

  static getInstance(): OTPService {
    if (!OTPService.instance) {
      OTPService.instance = new OTPService();
    }
    return OTPService.instance;
  }

  /**
   * Generate a 6-digit OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to email using the email service
   */
  private async sendOTPToEmail(email: string, otp: string): Promise<boolean> {
    try {
      return await this.emailService.sendOTPEmail(email, otp);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return false;
    }
  }

  /**
   * Generate and send OTP to the provided email
   */
  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Clean email
      const cleanEmail = email.toLowerCase().trim();
      
      // Generate OTP
      const otp = this.generateOTP();
      const expiresAt = Date.now() + (this.OTP_EXPIRY_MINUTES * 60 * 1000);
      
      // Store OTP data
      this.otpStorage.set(cleanEmail, {
        email: cleanEmail,
        otp,
        expiresAt
      });
      
      // Send OTP via email
      const emailSent = await this.sendOTPToEmail(cleanEmail, otp);
      
      if (emailSent) {
        return {
          success: true,
          message: `OTP sent to ${cleanEmail}. Please check your email.`
        };
      } else {
        return {
          success: false,
          message: 'Failed to send OTP. Please try again.'
        };
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'An error occurred while sending OTP. Please try again.'
      };
    }
  }

  /**
   * Verify OTP for the provided email
   */
  verifyOTP(email: string, inputOTP: string): { success: boolean; message: string } {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const storedOTPData = this.otpStorage.get(cleanEmail);
      
      if (!storedOTPData) {
        return {
          success: false,
          message: 'No OTP found for this email. Please request a new OTP.'
        };
      }
      
      // Check if OTP has expired
      if (Date.now() > storedOTPData.expiresAt) {
        this.otpStorage.delete(cleanEmail);
        return {
          success: false,
          message: 'OTP has expired. Please request a new OTP.'
        };
      }
      
      // Verify OTP
      if (storedOTPData.otp === inputOTP) {
        // Remove OTP after successful verification
        this.otpStorage.delete(cleanEmail);
        return {
          success: true,
          message: 'OTP verified successfully.'
        };
      } else {
        return {
          success: false,
          message: 'Invalid OTP. Please check and try again.'
        };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'An error occurred while verifying OTP. Please try again.'
      };
    }
  }

  /**
   * Check if there's a pending OTP for the email
   */
  hasPendingOTP(email: string): boolean {
    const cleanEmail = email.toLowerCase().trim();
    const storedOTPData = this.otpStorage.get(cleanEmail);
    
    if (!storedOTPData) {
      return false;
    }
    
    // Check if OTP has expired
    if (Date.now() > storedOTPData.expiresAt) {
      this.otpStorage.delete(cleanEmail);
      return false;
    }
    
    return true;
  }

  /**
   * Get remaining time for OTP in seconds
   */
  getRemainingTime(email: string): number {
    const cleanEmail = email.toLowerCase().trim();
    const storedOTPData = this.otpStorage.get(cleanEmail);
    
    if (!storedOTPData) {
      return 0;
    }
    
    const remainingMs = storedOTPData.expiresAt - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  }
}

export default OTPService;
