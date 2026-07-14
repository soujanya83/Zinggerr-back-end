/**
 * Forgot Password HTML Email Template
 * @param {string} resetURL - Secure unique URL containing the password reset token parameter
 * @returns {string} HTML Content
 */
export const forgotPasswordTemplate = (resetURL) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1a202c; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #edf2f7;">
        <img src="cid:zinggerrlogo" alt="Zinggerr Logo" style="height: 32px; width: auto; max-height: 32px; object-fit: contain;" />
      </div>
      
      <h2 style="color: #4f46e5; text-align: center; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 16px; tracking: -0.025em;">Reset Your Password</h2>
      
      <p style="font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 24px;">
        Hello,
      </p>
      
      <p style="font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 24px;">
        You requested a password reset for your Zinggerr account. Please click the button below to secure your credentials and choose a new password. This recovery link is valid for <strong>15 minutes</strong>:
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetURL}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25); transition: background-color 0.2s;">Reset Password</a>
      </div>
      
      <p style="font-size: 13px; line-height: 1.5; color: #718096; margin-top: 32px; margin-bottom: 8px;">
        If the button doesn't work, copy and paste the link below into your browser address bar:
      </p>
      
      <p style="word-break: break-all; color: #4f46e5; font-size: 13px; font-family: monospace; background-color: #f7fafc; padding: 12px; border-radius: 6px; border: 1px solid #edf2f7; margin-bottom: 24px;">
        ${resetURL}
      </p>
      
      <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 32px 0;" />
      
      <p style="font-size: 12px; line-height: 1.5; color: #a0aec0; text-align: center; margin-bottom: 0;">
        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </div>
  `;
};
