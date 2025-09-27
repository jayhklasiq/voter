/**
 * Email Service for sending OTPs
 * 
 * This service attempts to send emails via a backend API first,
 * then falls back to a mock service for development.
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
      const emailApiUrl = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:3001/api/email';
      const response = await fetch(`${emailApiUrl}/health`, {
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
          const emailApiUrl = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:3001/api/email';
          const response = await fetch(`${emailApiUrl}/send`, {
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
            return true;
          } else {
            return false;
          }
        } catch {
          return false;
        }
      } else {
        // Use mock service for development
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }
    } catch {
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

}

export default EmailService;
