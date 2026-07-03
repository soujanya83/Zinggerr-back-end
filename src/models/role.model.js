import mongoose, { Schema } from 'mongoose';

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
          type: Schema.Types.ObjectId,
          ref: 'Permission',
      },
    ],
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique role names *per organization*
roleSchema.index({ organization: 1, name: 1 }, { unique: true });

export const Role = mongoose.model('Role', roleSchema);
