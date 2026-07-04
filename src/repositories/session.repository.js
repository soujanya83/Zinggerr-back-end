import { Session } from '../models/session.model.js';

export class SessionRepository {
  /**
   * Creates a new session record.
   * @param {object} sessionData 
   * @returns {Promise<object>} Created session
   */
  static async create(sessionData) {
    return await Session.create(sessionData);
  }

  /**
   * Finds a session by its unique sessionId.
   * @param {string} sessionId 
   * @returns {Promise<object|null>} Found session
   */
  static async findBySessionId(sessionId) {
    return await Session.findOne({ sessionId });
  }

  /**
   * Finds a session by its current refreshTokenHash.
   * @param {string} refreshTokenHash 
   * @returns {Promise<object|null>} Found session
   */
  static async findByTokenHash(refreshTokenHash) {
    return await Session.findOne({ refreshTokenHash });
  }

  /**
   * Finds all sessions (active and revoked) for a specific user.
   * @param {string} userId 
   * @returns {Promise<array>} Array of sessions
   */
  static async findUserSessions(userId) {
    return await Session.find({ user: userId }).sort({ lastActiveAt: -1 });
  }

  /**
   * Soft revokes a specific session.
   * @param {string} sessionId 
   * @param {string} reason 
   * @returns {Promise<object|null>} Updated session
   */
  static async revokeSession(sessionId, reason) {
    return await Session.findOneAndUpdate(
      { sessionId, isRevoked: false },
      { 
        isRevoked: true, 
        revokedAt: new Date(), 
        revokedReason: reason 
      },
      { new: true }
    );
  }

  /**
   * Soft revokes all active sessions for a user, with optional exclusion.
   * @param {string} userId 
   * @param {string} reason 
   * @param {string} [exceptSessionId] - Optional session ID to keep active
   * @returns {Promise<object>} Update result summary
   */
  static async revokeAllSessions(userId, reason, exceptSessionId = null) {
    const filter = { user: userId, isRevoked: false };
    if (exceptSessionId) {
      filter.sessionId = { $ne: exceptSessionId };
    }
    return await Session.updateMany(
      filter,
      { 
        isRevoked: true, 
        revokedAt: new Date(), 
        revokedReason: reason 
      }
    );
  }

  /**
   * Rotates/updates the refresh token hash and expiration.
   * @param {string} sessionId 
   * @param {string} newHash 
   * @param {Date} expiresAt 
   * @returns {Promise<object|null>} Updated session
   */
  static async updateRefreshTokenHash(sessionId, newHash, expiresAt) {
    return await Session.findOneAndUpdate(
      { sessionId },
      { refreshTokenHash: newHash, expiresAt },
      { new: true }
    );
  }

  /**
   * Updates the lastActiveAt timestamp to current time.
   * @param {string} sessionId 
   * @returns {Promise<object|null>} Updated session
   */
  static async updateLastActive(sessionId) {
    return await Session.findOneAndUpdate(
      { sessionId },
      { lastActiveAt: new Date() },
      { new: true }
    );
  }

  /**
   * Finds all sessions belonging to the same token family.
   * @param {string} familyId 
   * @returns {Promise<array>} Array of sessions
   */
  static async findByFamilyId(familyId) {
    return await Session.find({ familyId });
  }

  /**
   * Updates session metadata fields.
   * @param {string} sessionId 
   * @param {object} metadata 
   * @returns {Promise<object|null>} Updated session
   */
  static async updateSessionMetadata(sessionId, metadata) {
    return await Session.findOneAndUpdate(
      { sessionId },
      metadata,
      { new: true }
    );
  }
}
