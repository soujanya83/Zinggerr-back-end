import { Course } from '../models/course.model.js';
import { AgeGroup } from '../models/ageGroup.model.js';
import { Chapter } from '../models/chapter.model.js';
import { Lesson } from '../models/lesson.model.js';
import { LessonContent } from '../models/lessonContent.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export class CourseController {
  // ==========================================
  // 1. Course Controllers
  // ==========================================

  static createCourse = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      if (!orgId) {
        throw new ApiError(400, 'Active organization context is missing. Please select or onboard an organization first.');
      }

      const course = await Course.create({
        ...req.body,
        organizationId: orgId,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, { course }, 'Course created successfully'));
    } catch (error) {
      next(error);
    }
  };

  static getCourses = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      if (!orgId) {
        throw new ApiError(400, 'Active organization context is missing.');
      }

      const courses = await Course.find({ organizationId: orgId })
        .populate('staff', 'firstname lastname avatar')
        .sort({ createdAt: -1 });

      return res
        .status(200)
        .json(new ApiResponse(200, { courses }, 'Courses retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  static getCourseById = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { id } = req.params;

      const course = await Course.findOne({ _id: id, organizationId: orgId })
        .populate('staff', 'firstname lastname avatar')
        .lean();

      if (!course) {
        throw new ApiError(404, 'Course not found or access denied');
      }

      // Aggregate all nested data to return the complete tree structure
      const ageGroups = await AgeGroup.find({ courseId: id }).lean();
      
      for (const ag of ageGroups) {
        const chapters = await Chapter.find({ ageGroupId: ag._id }).sort({ order: 1 }).lean();
        
        for (const ch of chapters) {
          const lessons = await Lesson.find({ chapterId: ch._id }).lean();
          
          for (const l of lessons) {
            l.contents = await LessonContent.find({ lessonId: l._id }).lean();
          }
          ch.lessons = lessons;
        }
        ag.chapters = chapters;
      }
      course.ageGroups = ageGroups;

      return res
        .status(200)
        .json(new ApiResponse(200, { course }, 'Course details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  static updateCourse = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { id } = req.params;

      const course = await Course.findOneAndUpdate(
        { _id: id, organizationId: orgId },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!course) {
        throw new ApiError(404, 'Course not found or access denied');
      }

      return res
        .status(200)
        .json(new ApiResponse(200, { course }, 'Course updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  static deleteCourse = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { id } = req.params;

      const course = await Course.findOneAndDelete({ _id: id, organizationId: orgId });
      if (!course) {
        throw new ApiError(404, 'Course not found or access denied');
      }

      // Cascade Delete
      await AgeGroup.deleteMany({ courseId: id });
      await Chapter.deleteMany({ courseId: id });
      await Lesson.deleteMany({ courseId: id });
      await LessonContent.deleteMany({ courseId: id });

      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Course and all child modules deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 2. AgeGroup Controllers
  // ==========================================

  static createAgeGroup = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { courseId } = req.params;

      const course = await Course.findOne({ _id: courseId, organizationId: orgId });
      if (!course) {
        throw new ApiError(404, 'Course not found or access denied');
      }

      const ageGroup = await AgeGroup.create({
        ...req.body,
        courseId,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, { ageGroup }, 'Age group created successfully'));
    } catch (error) {
      next(error);
    }
  };

  static updateAgeGroup = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { ageGroupId } = req.params;

      const ageGroup = await AgeGroup.findById(ageGroupId);
      if (!ageGroup) {
        throw new ApiError(404, 'Age group not found');
      }

      const course = await Course.findOne({ _id: ageGroup.courseId, organizationId: orgId });
      if (!course) {
        throw new ApiError(403, 'Access denied to this course scope');
      }

      Object.assign(ageGroup, req.body);
      await ageGroup.save();

      return res
        .status(200)
        .json(new ApiResponse(200, { ageGroup }, 'Age group updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  static deleteAgeGroup = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { ageGroupId } = req.params;

      const ageGroup = await AgeGroup.findById(ageGroupId);
      if (!ageGroup) {
        throw new ApiError(404, 'Age group not found');
      }

      const course = await Course.findOne({ _id: ageGroup.courseId, organizationId: orgId });
      if (!course) {
        throw new ApiError(403, 'Access denied to this course scope');
      }

      await AgeGroup.findByIdAndDelete(ageGroupId);

      // Cascade Delete
      await Chapter.deleteMany({ ageGroupId });
      await Lesson.deleteMany({ ageGroupId });
      await LessonContent.deleteMany({ ageGroupId });

      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Age group and all child modules deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 3. Chapter Controllers
  // ==========================================

  static createChapter = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { courseId, ageGroupId } = req.params;

      const ageGroup = await AgeGroup.findOne({ _id: ageGroupId, courseId });
      if (!ageGroup) {
        throw new ApiError(404, 'Age group not found under this course');
      }

      const course = await Course.findOne({ _id: courseId, organizationId: orgId });
      if (!course) {
        throw new ApiError(403, 'Access denied');
      }

      const chapter = await Chapter.create({
        ...req.body,
        courseId,
        ageGroupId,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, { chapter }, 'Chapter created successfully'));
    } catch (error) {
      next(error);
    }
  };

  static updateChapter = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { chapterId } = req.params;

      const chapter = await Chapter.findById(chapterId);
      if (!chapter) {
        throw new ApiError(404, 'Chapter not found');
      }

      const course = await Course.findOne({ _id: chapter.courseId, organizationId: orgId });
      if (!course) {
        throw new ApiError(403, 'Access denied');
      }

      Object.assign(chapter, req.body);
      await chapter.save();

      return res
        .status(200)
        .json(new ApiResponse(200, { chapter }, 'Chapter updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  static deleteChapter = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { chapterId } = req.params;

      const chapter = await Chapter.findById(chapterId);
      if (!chapter) {
        throw new ApiError(404, 'Chapter not found');
      }

      const course = await Course.findOne({ _id: chapter.courseId, organizationId: orgId });
      if (!course) {
        throw new ApiError(403, 'Access denied');
      }

      await Chapter.findByIdAndDelete(chapterId);

      // Cascade Delete
      await Lesson.deleteMany({ chapterId });
      await LessonContent.deleteMany({ chapterId });

      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Chapter and all child lessons deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 4. Lesson Controllers
  // ==========================================

  static createLesson = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { chapterId } = req.params;

      const chapter = await Chapter.findById(chapterId);
      if (!chapter) {
        throw new ApiError(404, 'Chapter not found');
      }

      const course = await Course.findOne({ _id: chapter.courseId, organizationId: orgId });
      if (!course) {
        throw new ApiError(403, 'Access denied');
      }

      const lesson = await Lesson.create({
        ...req.body,
        chapterId,
        ageGroupId: chapter.ageGroupId,
        courseId: chapter.courseId,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, { lesson }, 'Lesson created successfully'));
    } catch (error) {
      next(error);
    }
  };

  static updateLesson = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { lessonId } = req.params;

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new ApiError(404, 'Lesson not found');
      }

      const course = await Course.findOne({ _id: lesson.courseId, organizationId: orgId });
      if (!course) {
        throw new ApiError(403, 'Access denied');
      }

      Object.assign(lesson, req.body);
      await lesson.save();

      return res
        .status(200)
        .json(new ApiResponse(200, { lesson }, 'Lesson updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  static deleteLesson = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { lessonId } = req.params;

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new ApiError(404, 'Lesson not found');
      }

      const course = await Course.findOne({ _id: lesson.courseId, organizationId: orgId });
      if (!course) {
        throw new ApiError(403, 'Access denied');
      }

      await Lesson.findByIdAndDelete(lessonId);

      // Cascade Delete
      await LessonContent.deleteMany({ lessonId });

      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Lesson and all content blocks deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 5. LessonContent Controllers
  // ==========================================

  static createLessonContent = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { lessonId } = req.params;

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new ApiError(404, 'Lesson not found');
      }

      const course = await Course.findOne({ _id: lesson.courseId, organizationId: orgId });
      if (!course) {
        throw new ApiError(403, 'Access denied');
      }

      const lessonContent = await LessonContent.create({
        ...req.body,
        lessonId,
        courseId: lesson.courseId,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, { lessonContent }, 'Lesson content block created successfully'));
    } catch (error) {
      next(error);
    }
  };

  static updateLessonContent = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { contentId } = req.params;

      const content = await LessonContent.findById(contentId);
      if (!content) {
        throw new ApiError(404, 'Content block not found');
      }

      const course = await Course.findOne({ _id: content.courseId, organizationId: orgId });
      if (!course) {
        throw new ApiError(403, 'Access denied');
      }

      Object.assign(content, req.body);
      await content.save();

      return res
        .status(200)
        .json(new ApiResponse(200, { lessonContent: content }, 'Content block updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  static deleteLessonContent = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { contentId } = req.params;

      const content = await LessonContent.findById(contentId);
      if (!content) {
        throw new ApiError(404, 'Content block not found');
      }

      const course = await Course.findOne({ _id: content.courseId, organizationId: orgId });
      if (!course) {
        throw new ApiError(403, 'Access denied');
      }

      await LessonContent.findByIdAndDelete(contentId);

      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Content block deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
