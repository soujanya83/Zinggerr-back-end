import mongoose, { Schema } from 'mongoose';

const chapterSchema = new Schema(
  {
    ageGroupId: {
      type: Schema.Types.ObjectId,
      ref: 'AgeGroup',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '📖',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 1,
    },
    visible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Chapter = mongoose.model('Chapter', chapterSchema);
