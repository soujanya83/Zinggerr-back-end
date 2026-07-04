import mongoose, { Schema } from 'mongoose';

const sessionSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    familyId: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    deviceName: {
      type: String,
    },
    browser: {
      type: String,
    },
    operatingSystem: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
    },
    revokedReason: {
      type: String,
      enum: ['LOGOUT', 'LOGOUT_ALL', 'TOKEN_REUSE', 'PASSWORD_CHANGED', 'ADMIN_ACTION'],
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Session = mongoose.model('Session', sessionSchema);
