import mongoose, { Schema } from 'mongoose';

const courseSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    groupingLabel: {
      type: String,
      default: 'Difficulty Levels',
    },
    groupingSingular: {
      type: String,
      default: 'Difficulty Level',
    },
    staff: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    enrolledCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model('Course', courseSchema);
