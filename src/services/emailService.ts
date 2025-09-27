/**
 * Email Service for sending OTPs
 * 
 * NOTE: This is a frontend mock service. For production, you need a backend API
 * to handle real email sending using nodemailer or other email services.
 * 
 * Frontend cannot directly use nodemailer due to browser security restrictions.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private static instance: EmailService;

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Check if backend email service is available
   */
  private async checkBackendService(): Promise<boolean> {
    try {
      // Try to reach a backend email API endpoint
      const response = await fetch('http://localhost:3001/api/email/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Send OTP email
   */
  async sendOTPEmail(email: string, otp: string): Promise<boolean> {
    try {
      const emailOptions: EmailOptions = {
        to: email,
        subject: 'SPE UNIBEN Elections - Your OTP Code',
        html: this.generateOTPEmailHTML(otp),
        text: this.generateOTPEmailText(otp)
      };

      // Check if backend service is available
      const backendAvailable = await this.checkBackendService();
      
      if (backendAvailable) {
        // Send via backend API
        try {
          const response = await fetch('http://localhost:3001/api/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: emailOptions.to,
              subject: emailOptions.subject,
              html: emailOptions.html,
              text: emailOptions.text
            })
          });

          if (response.ok) {
            console.log('📧 Email sent successfully via backend API');
            return true;
          } else {
            console.error('❌ Backend email service error:', response.statusText);
            return false;
          }
        } catch (error) {
          console.error('❌ Backend email service error:', error);
          return false;
        }
      } else {
        // Use mock service for development
        console.log('📧 Mock Email Service - Sending OTP Email:');
        console.log('To:', emailOptions.to);
        console.log('Subject:', emailOptions.subject);
        console.log('OTP Code:', otp);
        console.log('---');
        console.log('💡 To enable real emails, set up a backend API with email service');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }
    } catch (error) {
      console.error('❌ Email Service Error:', error);
      return false;
    }
  }

  /**
   * Generate HTML email template for OTP
   */
  private generateOTPEmailHTML(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SPE UNIBEN Elections - OTP</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">SPE UNIBEN Elections</h1>
            <p style="color: #e0e0e0; margin: 10px 0 0 0;">Your One-Time Password</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Your OTP Code</h2>
            <p>Use the following code to complete your login:</p>
            
            <div style="background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: 'Courier New', monospace;">${otp}</span>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              <strong>Important:</strong>
              <br>• This code expires in 5 minutes
              <br>• Do not share this code with anyone
              <br>• If you didn't request this code, please ignore this email
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
              <p>This is an automated message from SPE UNIBEN Elections System</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate plain text email for OTP
   */
  private generateOTPEmailText(otp: string): string {
    return `
SPE UNIBEN Elections - Your OTP Code

Your One-Time Password: ${otp}

This code expires in 5 minutes.

Important:
- Do not share this code with anyone
- If you didn't request this code, please ignore this email

This is an automated message from SPE UNIBEN Elections System
    `.trim();
  }

  /**
   * Send a test email (for development)
   */
  async sendTestEmail(email: string): Promise<boolean> {
    try {
      const emailOptions: EmailOptions = {
        to: email,
        subject: 'SPE UNIBEN Elections - Test Email',
        html: '<h1>Test Email</h1><p>This is a test email from SPE UNIBEN Elections System.</p>',
        text: 'Test Email - This is a test email from SPE UNIBEN Elections System.'
      };

      console.log('📧 Test Email Sent:', emailOptions);
      return true;
    } catch (error) {
      console.error('Test Email Error:', error);
      return false;
    }
  }
}

export default EmailService;
