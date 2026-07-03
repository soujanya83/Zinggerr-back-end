import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { env } from '../config/env.js';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'Lax',
};

export class AuthController {
  static signup = async (req, res, next) => {
    try {
      const user = await AuthService.signup(req.body);
      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            { user },
            'User registered successfully. Please log in.'
          )
        );
    } catch (error) {
      next(error);
    }
  };

  static signin = async (req, res, next) => {
    try {
      const { user, accessToken, refreshToken } = await AuthService.signin(req.body);
      return res
        .status(200)
        .cookie('accessToken', accessToken, cookieOptions)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json(
          new ApiResponse(
            200,
            { user, accessToken, refreshToken },
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
      const { accessToken, refreshToken } = await AuthService.refreshAccessToken(incomingRefreshToken);
      
      return res
        .status(200)
        .cookie('accessToken', accessToken, cookieOptions)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json(
          new ApiResponse(
            200,
            { accessToken, refreshToken },
            'Access token refreshed successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  };

  static logout = async (req, res, next) => {
    try {
      await AuthService.logout(req.user._id);
      return res
        .status(200)
        .clearCookie('accessToken', cookieOptions)
        .clearCookie('refreshToken', cookieOptions)
        .json(new ApiResponse(200, {}, 'User logged out successfully'));
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
