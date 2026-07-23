import mongoose, { Schema } from 'mongoose';

const interactionSchema = new Schema({
  time: { type: Number, required: true },
  kind: { 
    type: String, 
    enum: ['mcq', 'fill-blanks', 'matching', 'drag-drop', 'reflection', 'poll', 'hotspot', 'info'], 
    required: true 
  },
  title: { type: String, required: true },
  mandatory: { type: Boolean, default: true },
  skippable: { type: Boolean, default: false },
  onWrong: { type: String, enum: ['reveal', 'rewind'], default: 'reveal' },
  rewindTo: { type: Number, default: 0 },
  mcq: {
    question: String,
    options: [String],
    correct: [Number],
    multi: Boolean,
    explanation: String,
  },
  fill: {
    text: String,
    answers: [String],
  },
  match: {
    left: [String],
    right: [String],
  },
  drag: {
    items: [String],
    zones: [String],
    assignments: [Number],
  },
  reflection: {
    prompt: String,
  },
  poll: {
    question: String,
    options: [String],
  },
  info: {
    title: String,
    body: String,
  }
});

const lessonContentSchema = new Schema(
  {
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    type: {
      type: String,
      enum: ['video', 'interactive-video', 'pdf', 'mcq', 'fill-blanks', 'matching', 'drag-drop', 'worksheet', 'assignment', 'audio'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    interactiveVideoData: {
      videoUrl: String,
      interactions: [interactionSchema],
    },
    interactionData: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const LessonContent = mongoose.model('LessonContent', lessonContentSchema);
