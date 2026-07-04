import crypto from 'crypto';
import { SessionRepository } from '../repositories/session.repository.js';
import { AuditService } from './audit.service.js';
import { hashToken, compareToken } from '../utils/crypto.js';
import { AuthHelper } from '../utils/auth.js';
import { parseUserAgent } from '../utils/userAgentParser.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export class SessionService {
  /**
   * Creates a new session, generates access/refresh tokens, hashes the refresh token,
   * and saves the session metadata in the database.
   * 
   * @param {string} userId 
   * @param {boolean} rememberMe 
   * @param {string} ipAddress 
   * @param {string} userAgentString 
   * @returns {Promise<object>} { sessionId, accessToken, refreshToken }
   */
  static async createSession(userId, rememberMe, ipAddress, userAgentString) {
    const sessionId = crypto.randomUUID();
    const familyId = crypto.randomUUID();

    // rememberMe = true: 30 days, rememberMe = false: 7 days
    const tokenExpiryStr = rememberMe ? '30d' : '7d';
    const expiresMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + expiresMs);

    // Parse user agent to get client device info
    const { deviceName, browser, operatingSystem } = parseUserAgent(userAgentString);

    // Generate access and refresh tokens embedding the unique sessionId
    const accessToken = AuthHelper.generateAccessToken({ _id: userId }, sessionId);
    const refreshToken = AuthHelper.generateRefreshToken({ _id: userId }, sessionId, tokenExpiryStr);

    const refreshTokenHash = hashToken(refreshToken);

    // Store in DB
    await SessionRepository.create({
      sessionId,
      familyId,
      user: userId,
      refreshTokenHash,
      deviceName,
      browser,
      operatingSystem,
      userAgent: userAgentString,
      ipAddress,
      rememberMe,
      expiresAt,
    });

    return { sessionId, accessToken, refreshToken };
  }

  /**
   * Validates if a session exists, is not revoked, and is not expired.
   * @param {string} sessionId 
   * @returns {Promise<object|null>} The valid session or null
   */
  static async validateSession(sessionId) {
    const session = await SessionRepository.findBySessionId(sessionId);
    if (!session) {
      return null;
    }
    if (session.isRevoked || session.expiresAt < new Date()) {
      return null;
    }
    return session;
  }

  /**
   * Updates lastActiveAt to keep session activity current.
   * @param {string} sessionId 
   * @returns {Promise<object|null>}
   */
  static async updateActivity(sessionId) {
    return await SessionRepository.updateLastActive(sessionId);
  }

  /**
   * Handles refresh token rotation, validating incoming token and rotating hashes.
   * Leverages SHA-256 comparison and triggers reuse invalidation strategies on conflict.
   * 
   * @param {string} sessionId 
   * @param {string} incomingRefreshToken 
   * @param {string} ipAddress 
   * @param {string} userAgentString 
   * @returns {Promise<object>} { accessToken, refreshToken }
   */
  static async rotateRefreshToken(sessionId, incomingRefreshToken, ipAddress, userAgentString) {
    const session = await SessionRepository.findBySessionId(sessionId);
    if (!session) {
      throw new ApiError(401, 'Invalid session');
    }

    // Check if session has been revoked
    if (session.isRevoked) {
      // In a rotated flow, if a revoked session's token is used, it counts as a potential reuse warning
      await this.handleTokenReuse(session.user, sessionId, ipAddress, userAgentString);
      throw new ApiError(401, 'Session has been revoked');
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await SessionRepository.revokeSession(sessionId, 'LOGOUT');
      throw new ApiError(401, 'Session has expired');
    }

    // Compare token hash securely using timingSafeEqual
    const isValid = compareToken(incomingRefreshToken, session.refreshTokenHash);
    if (!isValid) {
      // Token Reuse Detected!
      await this.handleTokenReuse(session.user, sessionId, ipAddress, userAgentString);
      throw new ApiError(401, 'Security alert: Refresh token reuse detected');
    }

    // Generate new rotated tokens
    const tokenExpiryStr = session.rememberMe ? '30d' : '7d';
    const expiresMs = session.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + expiresMs);

    const newAccessToken = AuthHelper.generateAccessToken({ _id: session.user }, sessionId);
    const newRefreshToken = AuthHelper.generateRefreshToken({ _id: session.user }, sessionId, tokenExpiryStr);
    const newHash = hashToken(newRefreshToken);

    // Update refresh token hash in DB
    await SessionRepository.updateRefreshTokenHash(sessionId, newHash, expiresAt);

    // Sync client IP/Agent info if they changed during active session rotation
    if (ipAddress !== session.ipAddress || userAgentString !== session.userAgent) {
      const { deviceName, browser, operatingSystem } = parseUserAgent(userAgentString);
      await SessionRepository.updateSessionMetadata(sessionId, {
        ipAddress,
        userAgent: userAgentString,
        deviceName,
        browser,
        operatingSystem,
      });
    }

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, rememberMe: session.rememberMe };
  }

  /**
   * Handles refresh token reuse invalidation based on STRICT_MODE vs SESSION_MODE.
   * 
   * @param {string} userId 
   * @param {string} sessionId 
   * @param {string} ipAddress 
   * @param {string} userAgentString 
   */
  static async handleTokenReuse(userId, sessionId, ipAddress, userAgentString) {
    const strategy = process.env.TOKEN_REUSE_STRATEGY || 'STRICT_MODE';

    // Log the reuse attempt
    await AuditService.logEvent(userId, sessionId, 'TOKEN_REUSE_DETECTED', ipAddress, userAgentString, {
      strategyUsed: strategy,
    });

    if (strategy === 'STRICT_MODE') {
      // Revoke all sessions for this user
      await SessionRepository.revokeAllSessions(userId, 'TOKEN_REUSE');
      await AuditService.logEvent(userId, null, 'SESSION_REVOKED', ipAddress, userAgentString, {
        reason: 'Revoked all sessions for user due to token reuse detection under STRICT_MODE',
      });
    } else {
      // SESSION_MODE: Revoke only the affected session
      await SessionRepository.revokeSession(sessionId, 'TOKEN_REUSE');
      await AuditService.logEvent(userId, sessionId, 'SESSION_REVOKED', ipAddress, userAgentString, {
        reason: 'Revoked affected session due to token reuse detection under SESSION_MODE',
      });
    }
  }

  /**
   * Retrieves active/inactive sessions for device management listing.
   * 
   * @param {string} userId 
   * @param {string} currentSessionId 
   * @returns {Promise<array>} Sessions list
   */
  static async getUserSessions(userId, currentSessionId) {
    const sessions = await SessionRepository.findUserSessions(userId);
    return sessions.map((session) => ({
      sessionId: session.sessionId,
      deviceName: session.deviceName || 'Unknown Device',
      browser: session.browser || 'Unknown Browser',
      operatingSystem: session.operatingSystem || 'Unknown OS',
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      isRevoked: session.isRevoked,
      currentSession: session.sessionId === currentSessionId,
    }));
  }

  /**
   * Revokes a specific session (device logout).
   * 
   * @param {string} userId 
   * @param {string} sessionId 
   * @param {string} ipAddress 
   * @param {string} userAgentString 
   */
  static async revokeUserSession(userId, sessionId, ipAddress, userAgentString) {
    const session = await SessionRepository.findBySessionId(sessionId);
    if (!session) {
      throw new ApiError(404, 'Session not found');
    }
    if (session.user.toString() !== userId.toString()) {
      throw new ApiError(403, 'Forbidden: You do not have permission to revoke this session');
    }

    await SessionRepository.revokeSession(sessionId, 'LOGOUT');
    await AuditService.logEvent(userId, sessionId, 'SESSION_REVOKED', ipAddress, userAgentString, {
      reason: 'Revoked via device manager',
    });
  }

  /**
   * Revokes all other active sessions (logout all other devices).
   * 
   * @param {string} userId 
   * @param {string} currentSessionId 
   * @param {string} ipAddress 
   * @param {string} userAgentString 
   */
  static async revokeAllOtherUserSessions(userId, currentSessionId, ipAddress, userAgentString) {
    await SessionRepository.revokeAllSessions(userId, 'LOGOUT_ALL', currentSessionId);
    await AuditService.logEvent(userId, currentSessionId, 'LOGOUT_ALL', ipAddress, userAgentString, {
      reason: 'Revoked all other active sessions from session manager',
    });
  }
}
