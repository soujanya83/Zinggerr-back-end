import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    middlename: {
      type: String,
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    avatar: {
      type: String,
      trim: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role association is required'],
      index: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    userType: {
      type: String,
      enum: ['individual', 'organization'],
      default: 'individual',
      required: true,
    },
    organizations: [{
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    }],
    selectedOrganization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    extraPermissions: {
      type: [String],
      default: [],
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
