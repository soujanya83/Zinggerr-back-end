import { User } from '../models/user.model.js';
import { Role } from '../models/role.model.js';
import { AuthHelper } from '../utils/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import { SessionService } from '../services/session.service.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new ApiError(401, 'Unauthorized request');
  }

  try {
    const decodedToken = AuthHelper.verifyAccessToken(token);

    // Check if session ID is embedded in token
    if (!decodedToken.sessionId) {
      throw new ApiError(401, 'Invalid session token');
    }

    // Query session validity
    const session = await SessionService.validateSession(decodedToken.sessionId);
    if (!session) {
      throw new ApiError(401, 'Session is invalid, expired, or has been revoked');
    }

    // Update session last active time
    await SessionService.updateActivity(decodedToken.sessionId);

    const user = await User.findById(decodedToken._id).select('-password');
    if (!user) {
      throw new ApiError(401, 'User associated with session not found');
    }
    
    req.user = user;
    req.sessionId = decodedToken.sessionId;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid access token');
  }
});

export const checkSuperAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized request');
  }

  const role = await Role.findById(req.user.role);
  if (!role || role.name !== 'SuperAdmin') {
    throw new ApiError(403, 'Forbidden: Only SuperAdmin can perform this action');
  }

  next();
});
