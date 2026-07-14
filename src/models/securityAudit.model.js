import mongoose, { Schema } from 'mongoose';

const securityAuditSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'REFRESH',
        'TOKEN_REUSE_DETECTED',
        'SESSION_REVOKED',
        'PASSWORD_CHANGED',
        'PASSWORD_RESET',
        'LOGOUT_ALL',
        'FAILED_LOGIN'
      ],
      index: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

export const SecurityAudit = mongoose.model('SecurityAudit', securityAuditSchema);
