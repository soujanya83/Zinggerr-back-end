/**
 * Reset Password Success Confirmation HTML Email Template
 * @returns {string} HTML Content
 */
export const resetPasswordTemplate = () => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1a202c; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #edf2f7;">
        <img src="cid:zinggerrlogo" alt="Zinggerr Logo" style="height: 32px; width: auto; max-height: 32px; object-fit: contain;" />
      </div>
      
      <h2 style="color: #10b981; text-align: center; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 16px; tracking: -0.025em;">Password Reset Successful</h2>
      
      <p style="font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 24px;">
        Hello,
      </p>
      
      <p style="font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 24px;">
        This email confirms that the password for your Zinggerr account has been successfully reset. You can now log back into your workspace using your new password.
      </p>
      
      <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; border: 1px solid #edf2f7; margin: 24px 0;">
        <p style="font-size: 13px; line-height: 1.5; color: #4a5568; margin: 0; font-weight: 500;">
          Security Alert:
        </p>
        <p style="font-size: 13px; line-height: 1.5; color: #718096; margin: 4px 0 0 0;">
          All other active browser and device sessions have been revoked for security purposes. If you did not make this change, please contact a center administrator or support immediately to secure your account.
        </p>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 32px 0;" />
      
      <p style="font-size: 12px; line-height: 1.5; color: #a0aec0; text-align: center; margin-bottom: 0;">
        This is an automated notification. Please do not reply directly to this email.
      </p>
    </div>
  `;
};
