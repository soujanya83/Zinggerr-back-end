import { SecurityAudit } from '../models/securityAudit.model.js';

export class AuditService {
  /**
   * Logs a security audit event in the database.
   * Does not throw on failure to prevent interrupting main request/response flow.
   * 
   * @param {string} [userId] - Associated User ID
   * @param {string} [sessionId] - Associated Session ID
   * @param {string} eventType - Type of security event (e.g., LOGIN, LOGOUT, REFRESH)
   * @param {string} [ipAddress] - Client IP address
   * @param {string} [userAgent] - Client User-Agent string
   * @param {object} [metadata] - Additional event metadata
   */
  static async logEvent(userId, sessionId, eventType, ipAddress, userAgent, metadata = {}) {
    try {
      await SecurityAudit.create({
        userId,
        sessionId,
        eventType,
        ipAddress,
        userAgent,
        metadata,
      });
    } catch (error) {
      console.error(`[AuditService] Failed to log security audit event (${eventType}):`, error);
    }
  }
}
