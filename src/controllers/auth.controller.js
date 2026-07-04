import { AuthService } from '../services/auth.service.js';
import { SessionService } from '../services/session.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { env } from '../config/env.js';

const getCookieOptions = (maxAgeMs) => {
  const options = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'Lax',
  };
  if (maxAgeMs !== undefined) {
    options.maxAge = maxAgeMs;
  }
  return options;
};

export class AuthController {
  static signup = async (req, res, next) => {
    try {
      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        rememberMe: req.body.rememberMe,
      };
      const { user, accessToken, refreshToken } = await AuthService.signup(req.body, clientInfo);

      const refreshCookieExpiry = clientInfo.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

      return res
        .status(201)
        .cookie('accessToken', accessToken, getCookieOptions(24 * 60 * 60 * 1000))
        .cookie('refreshToken', refreshToken, getCookieOptions(refreshCookieExpiry))
        .json(
          new ApiResponse(
            201,
            { user },
            'User registered successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  };

  static signin = async (req, res, next) => {
    try {
      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const { user, accessToken, refreshToken } = await AuthService.signin(req.body, clientInfo);

      const rememberMe = !!req.body.rememberMe;
      const refreshCookieExpiry = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

      return res
        .status(200)
        .cookie('accessToken', accessToken, getCookieOptions(24 * 60 * 60 * 1000))
        .cookie('refreshToken', refreshToken, getCookieOptions(refreshCookieExpiry))
        .json(
          new ApiResponse(
            200,
            { user },
            'User logged in successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  };

  static refreshAccessToken = async (req, res, next) => {
    try {
      const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const { accessToken, refreshToken, rememberMe } = await AuthService.refreshAccessToken(incomingRefreshToken, clientInfo);
      
      const refreshCookieExpiry = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

      return res
        .status(200)
        .cookie('accessToken', accessToken, getCookieOptions(24 * 60 * 60 * 1000))
        .cookie('refreshToken', refreshToken, getCookieOptions(refreshCookieExpiry))
        .json(
          new ApiResponse(
            200,
            {},
            'Access token refreshed successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  };

  static logout = async (req, res, next) => {
    try {
      const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      await AuthService.logout(incomingRefreshToken, req.ip, req.headers['user-agent']);
      return res
        .status(200)
        .clearCookie('accessToken', getCookieOptions())
        .clearCookie('refreshToken', getCookieOptions())
        .json(new ApiResponse(200, {}, 'User logged out successfully'));
    } catch (error) {
      next(error);
    }
  };

  static changePassword = async (req, res, next) => {
    try {
      const { oldPassword, newPassword, confirmNewPassword } = req.body;
      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      await AuthService.changePassword(
        req.user._id,
        req.sessionId,
        { oldPassword, newPassword, confirmNewPassword },
        clientInfo
      );

      const policy = process.env.PASSWORD_CHANGE_POLICY || 'POLICY_A';
      if (policy === 'POLICY_B') {
        return res
          .status(200)
          .clearCookie('accessToken', getCookieOptions())
          .clearCookie('refreshToken', getCookieOptions())
          .json(new ApiResponse(200, {}, 'Password changed successfully. All sessions revoked, please login again.'));
      }

      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Password changed successfully'));
    } catch (error) {
      next(error);
    }
  };

  static getSessions = async (req, res, next) => {
    try {
      const sessions = await SessionService.getUserSessions(req.user._id, req.sessionId);
      return res
        .status(200)
        .json(new ApiResponse(200, { sessions }, 'Active sessions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  static getSession = async (req, res, next) => {
    try {
      const session = await SessionService.getSessionDetails(req.user._id, req.params.sessionId);
      
      const sessionDetails = {
        sessionId: session.sessionId,
        deviceName: session.deviceName || 'Unknown Device',
        browser: session.browser || 'Unknown Browser',
        operatingSystem: session.operatingSystem || 'Unknown OS',
        ipAddress: session.ipAddress,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt,
      };

      return res
        .status(200)
        .json(new ApiResponse(200, { session: sessionDetails }, 'Session details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  static revokeSession = async (req, res, next) => {
    try {
      await SessionService.revokeUserSession(req.user._id, req.params.sessionId, req.ip, req.headers['user-agent']);
      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Session successfully revoked'));
    } catch (error) {
      next(error);
    }
  };

  static revokeAllOtherSessions = async (req, res, next) => {
    try {
      await SessionService.revokeAllOtherUserSessions(req.user._id, req.sessionId, req.ip, req.headers['user-agent']);
      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'All other sessions successfully revoked'));
    } catch (error) {
      next(error);
    }
  };

  static onboardOrganization = async (req, res, next) => {
    try {
      const logoFilename = req.file ? req.file.filename : null;
      const user = await AuthService.onboardOrganization(req.user._id, req.body, logoFilename);
      
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { user },
            'Organization onboarded successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  };
}
