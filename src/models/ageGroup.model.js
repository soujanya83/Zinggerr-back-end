import mongoose, { Schema } from 'mongoose';

const ageGroupSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    range: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '👶',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    educators: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['draft', 'active'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export const AgeGroup = mongoose.model('AgeGroup', ageGroupSchema);
