import { User } from '../models/user.model.js';
import { Role } from '../models/role.model.js';
import { AuthHelper } from '../utils/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new ApiError(401, 'Unauthorized request');
  }

  try {
    const decodedToken = AuthHelper.verifyAccessToken(token);
    const user = await User.findById(decodedToken._id).select('-password -refreshToken');
    
    if (!user) {
      throw new ApiError(401, 'Invalid access token');
    }
    
    req.user = user;
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
