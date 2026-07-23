import Joi from 'joi';

const objectIdPattern = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format',
});

// --- Course Validation ---
export const createCourseSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title cannot be empty',
  }),
  category: Joi.string().trim().required().messages({
    'any.required': 'Category is required',
    'string.empty': 'Category cannot be empty',
  }),
  description: Joi.string().trim().required().messages({
    'any.required': 'Description is required',
  }),
  thumbnail: Joi.string().trim().uri().optional().allow(''),
  status: Joi.string().trim().valid('draft', 'published', 'archived').optional().default('draft'),
  groupingLabel: Joi.string().trim().optional(),
  groupingSingular: Joi.string().trim().optional(),
  staff: Joi.array().items(objectIdPattern).optional(),
});

export const updateCourseSchema = Joi.object({
  title: Joi.string().trim().optional(),
  category: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  thumbnail: Joi.string().trim().uri().optional().allow(''),
  status: Joi.string().trim().valid('draft', 'published', 'archived').optional(),
  groupingLabel: Joi.string().trim().optional(),
  groupingSingular: Joi.string().trim().optional(),
  staff: Joi.array().items(objectIdPattern).optional(),
});

// --- AgeGroup Validation ---
export const createAgeGroupSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name cannot be empty',
  }),
  range: Joi.string().trim().optional().allow(''),
  icon: Joi.string().trim().optional(),
  thumbnail: Joi.string().trim().uri().optional().allow(''),
  description: Joi.string().trim().optional().allow(''),
  educators: Joi.array().items(objectIdPattern).optional(),
  status: Joi.string().trim().valid('draft', 'active').optional().default('draft'),
});

export const updateAgeGroupSchema = Joi.object({
  name: Joi.string().trim().optional(),
  range: Joi.string().trim().optional().allow(''),
  icon: Joi.string().trim().optional(),
  thumbnail: Joi.string().trim().uri().optional().allow(''),
  description: Joi.string().trim().optional().allow(''),
  educators: Joi.array().items(objectIdPattern).optional(),
  status: Joi.string().trim().valid('draft', 'active').optional(),
});

// --- Chapter Validation ---
export const createChapterSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title cannot be empty',
  }),
  description: Joi.string().trim().optional().allow(''),
  icon: Joi.string().trim().optional(),
  thumbnail: Joi.string().trim().uri().optional().allow(''),
  order: Joi.number().integer().min(1).optional(),
  visible: Joi.boolean().optional(),
});

export const updateChapterSchema = Joi.object({
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().optional().allow(''),
  icon: Joi.string().trim().optional(),
  thumbnail: Joi.string().trim().uri().optional().allow(''),
  order: Joi.number().integer().min(1).optional(),
  visible: Joi.boolean().optional(),
});

// --- Lesson Validation ---
export const createLessonSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title cannot be empty',
  }),
  description: Joi.string().trim().optional().allow(''),
  duration: Joi.string().trim().optional(),
  instructor: Joi.string().trim().optional().allow(''),
  status: Joi.string().trim().valid('draft', 'published').optional().default('draft'),
  thumbnail: Joi.string().trim().uri().optional().allow(''),
});

export const updateLessonSchema = Joi.object({
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().optional().allow(''),
  duration: Joi.string().trim().optional(),
  instructor: Joi.string().trim().optional().allow(''),
  status: Joi.string().trim().valid('draft', 'published').optional(),
  thumbnail: Joi.string().trim().uri().optional().allow(''),
});

// --- LessonContent Validation ---
export const createLessonContentSchema = Joi.object({
  type: Joi.string().trim().valid('video', 'interactive-video', 'pdf', 'mcq', 'fill-blanks', 'matching', 'drag-drop', 'worksheet', 'assignment', 'audio').required().messages({
    'any.required': 'Content type is required',
  }),
  title: Joi.string().trim().required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title cannot be empty',
  }),
  duration: Joi.string().trim().optional().allow(''),
  fileUrl: Joi.string().trim().optional().allow(''),
  interactiveVideoData: Joi.object({
    videoUrl: Joi.string().trim().uri().required(),
    interactions: Joi.array().items(Joi.object({
      time: Joi.number().required(),
      kind: Joi.string().valid('mcq', 'fill-blanks', 'matching', 'drag-drop', 'reflection', 'poll', 'hotspot', 'info').required(),
      title: Joi.string().required(),
      mandatory: Joi.boolean().optional(),
      skippable: Joi.boolean().optional(),
      onWrong: Joi.string().valid('reveal', 'rewind').optional(),
      rewindTo: Joi.number().optional(),
      mcq: Joi.object().optional(),
      fill: Joi.object().optional(),
      match: Joi.object().optional(),
      drag: Joi.object().optional(),
      reflection: Joi.object().optional(),
      poll: Joi.object().optional(),
      info: Joi.object().optional(),
    })).optional(),
  }).optional(),
  interactionData: Joi.any().optional(),
});

export const updateLessonContentSchema = Joi.object({
  type: Joi.string().trim().valid('video', 'interactive-video', 'pdf', 'mcq', 'fill-blanks', 'matching', 'drag-drop', 'worksheet', 'assignment', 'audio').optional(),
  title: Joi.string().trim().optional(),
  duration: Joi.string().trim().optional().allow(''),
  fileUrl: Joi.string().trim().optional().allow(''),
  interactiveVideoData: Joi.object({
    videoUrl: Joi.string().trim().uri().required(),
    interactions: Joi.array().items(Joi.object({
      time: Joi.number().required(),
      kind: Joi.string().valid('mcq', 'fill-blanks', 'matching', 'drag-drop', 'reflection', 'poll', 'hotspot', 'info').required(),
      title: Joi.string().required(),
      mandatory: Joi.boolean().optional(),
      skippable: Joi.boolean().optional(),
      onWrong: Joi.string().valid('reveal', 'rewind').optional(),
      rewindTo: Joi.number().optional(),
      mcq: Joi.object().optional(),
      fill: Joi.object().optional(),
      match: Joi.object().optional(),
      drag: Joi.object().optional(),
      reflection: Joi.object().optional(),
      poll: Joi.object().optional(),
      info: Joi.object().optional(),
    })).optional(),
  }).optional(),
  interactionData: Joi.any().optional(),
});
