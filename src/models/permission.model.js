import mongoose, { Schema } from 'mongoose';

const permissionSchema = new Schema(
  {
    module: {
      type: String,
      required: [true, 'Module is required'],
      unique: true,
      trim: true,
      index: true,
    },
    permissions: [{
      type:String,
    }]
  },
  {
    timestamps: true,
  }
);

export const Permission = mongoose.model('Permission', permissionSchema);
