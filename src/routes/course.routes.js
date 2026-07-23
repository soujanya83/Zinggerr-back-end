import { Router } from 'express';
import { CourseController } from '../controllers/course.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createCourseSchema,
  updateCourseSchema,
  createAgeGroupSchema,
  updateAgeGroupSchema,
  createChapterSchema,
  updateChapterSchema,
  createLessonSchema,
  updateLessonSchema,
  createLessonContentSchema,
  updateLessonContentSchema,
} from '../validations/course.validation.js';

const router = Router();

// --- Course Routes ---
router
  .route('/')
  .post(verifyJWT, validate(createCourseSchema), CourseController.createCourse)
  .get(verifyJWT, CourseController.getCourses);

router
  .route('/:id')
  .get(verifyJWT, CourseController.getCourseById)
  .put(verifyJWT, validate(updateCourseSchema), CourseController.updateCourse)
  .delete(verifyJWT, CourseController.deleteCourse);

// --- AgeGroup Routes ---
router
  .route('/:courseId/age-groups')
  .post(verifyJWT, validate(createAgeGroupSchema), CourseController.createAgeGroup);

router
  .route('/age-groups/:ageGroupId')
  .put(verifyJWT, validate(updateAgeGroupSchema), CourseController.updateAgeGroup)
  .delete(verifyJWT, CourseController.deleteAgeGroup);

// --- Chapter Routes ---
router
  .route('/:courseId/age-groups/:ageGroupId/chapters')
  .post(verifyJWT, validate(createChapterSchema), CourseController.createChapter);

router
  .route('/chapters/:chapterId')
  .put(verifyJWT, validate(updateChapterSchema), CourseController.updateChapter)
  .delete(verifyJWT, CourseController.deleteChapter);

// --- Lesson Routes ---
router
  .route('/chapters/:chapterId/lessons')
  .post(verifyJWT, validate(createLessonSchema), CourseController.createLesson);

router
  .route('/lessons/:lessonId')
  .put(verifyJWT, validate(updateLessonSchema), CourseController.updateLesson)
  .delete(verifyJWT, CourseController.deleteLesson);

// --- LessonContent Routes ---
router
  .route('/lessons/:lessonId/contents')
  .post(verifyJWT, validate(createLessonContentSchema), CourseController.createLessonContent);

router
  .route('/contents/:contentId')
  .put(verifyJWT, validate(updateLessonContentSchema), CourseController.updateLessonContent)
  .delete(verifyJWT, CourseController.deleteLessonContent);

export default router;
