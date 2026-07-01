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
    centre: {
      type: Schema.Types.ObjectId,
      ref: 'Centre',
      required: [true, 'Centre association is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique role names *per centre*
roleSchema.index({ centre: 1, name: 1 }, { unique: true });

export const Role = mongoose.model('Role', roleSchema);
