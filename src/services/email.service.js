import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import logger from '../config/logger.js';

let transporter = null;

// Initialize the Nodemailer SMTP transporter
const initializeTransporter = () => {
  if (
    !env.SMTP_HOST ||
    !env.SMTP_PORT ||
    !env.SMTP_USER ||
    !env.SMTP_PASS ||
    env.SMTP_USER === 'placeholder_user' ||
    env.SMTP_PASS === 'placeholder_pass'
  ) {
    logger.warn('SMTP credentials are not configured or still placeholders. EmailService will run in MOCK mode.');
    return null;
  }

  try {
    const config = {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // True for port 465, false for other ports (587, 2525)
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    };

    // For local dev with Mailtrap / ethereal, rejectUnauthorized can be false to prevent SSL handshake issues
    if (env.NODE_ENV === 'development') {
      config.tls = {
        rejectUnauthorized: false,
      };
    }

    const t = nodemailer.createTransport(config);
    logger.info(`Nodemailer SMTP Transporter initialized successfully at ${env.SMTP_HOST}:${env.SMTP_PORT}`);
    return t;
  } catch (error) {
    logger.error(`Failed to initialize Nodemailer SMTP transporter: ${error.message}`);
    return null;
  }
};

transporter = initializeTransporter();

export class EmailService {
  /**
   * Send an email using SMTP transport
   * @param {Object} options
   * @param {string} options.to - Recipient email address
   * @param {string} options.subject - Email subject line
   * @param {string} [options.html] - Rich HTML email body content
   * @param {string} [options.text] - Plain text fallback body content
   * @param {string} [options.from] - Sender email address override
   * @returns {Promise<Object>} Response info containing message ID or mock output
   */
  static async sendEmail({ to, subject, html, text, from, attachments }) {
    const sender = from || env.EMAIL_FROM || 'no-reply@zingger.com';
    const mailOptions = {
      from: sender,
      to,
      subject,
      text: text || '',
      html: html || '',
      attachments: attachments || [],
    };

    if (!transporter) {
      logger.info(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      logger.debug(`[MOCK EMAIL BODY] HTML: ${html || 'N/A'} | Text: ${text || 'N/A'}`);
      return {
        messageId: `mock-id-${Date.now()}`,
        mock: true,
        envelope: { from: sender, to: [to] },
      };
    }

    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Error sending email to ${to}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verifies the SMTP connection status
   * @returns {Promise<boolean>}
   */
  static async verifyConnection() {
    if (!transporter) {
      return false;
    }
    try {
      await transporter.verify();
      return true;
    } catch (error) {
      logger.error(`SMTP connection verification failed: ${error.message}`);
      return false;
    }
  }
}
