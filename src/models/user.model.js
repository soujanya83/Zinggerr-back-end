import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: [true, 'First name is required'],
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
    dob: {
      type: Date,
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
    centre: {
      type: Schema.Types.ObjectId,
      ref: 'Centre',
      required: [true, 'Centre association is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if it has been modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to check if password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
  // If password was selected: false, it might not be present on 'this' when checking
  // but usually users retrieve it explicitly when doing authentication.
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model('User', userSchema);
