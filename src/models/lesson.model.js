import mongoose, { Schema } from 'mongoose';

const lessonSchema = new Schema(
  {
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
      index: true,
    },
    ageGroupId: {
      type: Schema.Types.ObjectId,
      ref: 'AgeGroup',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '10 min',
    },
    instructor: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    thumbnail: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Lesson = mongoose.model('Lesson', lessonSchema);
