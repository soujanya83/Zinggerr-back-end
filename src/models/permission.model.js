import mongoose, { Schema } from 'mongoose';

const permissionSchema = new Schema(
  {
    module: {
      type: String,
      required: [true, 'Module is required'],
      trim: true,
      index: true,
    },
    permissions: [{
      type:String,
    }],
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique module names *per organization*
permissionSchema.index({ organization: 1, module: 1 }, { unique: true });

export const Permission = mongoose.model('Permission', permissionSchema);
