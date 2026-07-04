import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export class AuthHelper {
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static generateAccessToken(user, sessionId) {
    return jwt.sign(
      {
        _id: user._id,
        email: user.email,
        sessionId,
      },
      env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: env.ACCESS_TOKEN_EXPIRY,
      }
    );
  }

  static generateRefreshToken(user, sessionId, expiresIn = env.REFRESH_TOKEN_EXPIRY) {
    return jwt.sign(
      {
        _id: user._id,
        sessionId,
      },
      env.REFRESH_TOKEN_SECRET,
      {
        expiresIn,
      }
    );
  }

  static verifyAccessToken(token) {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
  }

  static verifyRefreshToken(token) {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
  }
}
