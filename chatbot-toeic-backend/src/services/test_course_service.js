import db from "../models/index.js"

const Test = db.Test;
const Course = db.Course;

const getAllTestsWithCourses = async () => {
    try{
        const testList = await Test.findAll({
            order: [['id', 'ASC']],
            attributes: ['id', 'title', 'duration', 'participants','comments','questions'],
            include:{
                model: Course,
                attributes: ['name'],
                through: { attributes: [] },
            },
        });
        const formattedTests = testList.map(test => ({
            id: test.id,
            title: test.title,
            duration: test.duration,
            participants: test.participants,
            comments: test.comments,
            questions: test.questions,
         
            tags: test.Courses.map(course => course.name),
        }));
        return formattedTests;
    }catch (error){
        console.error('Error fetching tests with Courses', error);
        throw error;
    }

};


const getAllCourseNames = async () => {
  try {
    const courses = await Course.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });

    // Trả về mảng tên
     return courses.map(course => ({
      id: course.id,
      name: course.name,
    }));
  } catch (error) {
    console.error("❌ Error fetching course names:", error);
    throw error;
  }
};

const updateCourseName = async (courseId, newName) => {
  try {
    const course = await Course.findByPk(courseId);

    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    course.name = newName;
    await course.save();

    console.log(`✅ Course ID ${courseId} updated to "${newName}"`);
    return {
      id: course.id,
      name: course.name,
    };
  } catch (error) {
    console.error("❌ Error updating course name:", error);
    throw error;
  }
};
  
const deleteCourseById = async (courseId) => {
  try {
    const course = await Course.findByPk(courseId);

    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    await course.destroy();

    console.log(`🗑️ Course ID ${courseId} has been deleted`);
    return { success: true, message: `Course ID ${courseId} deleted` };
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    throw error;
  }
};

const insertCourse = async (courseName) => {
  try {
    if (!courseName || !courseName.trim()) {
      throw new Error("Tên khóa học không được để trống.");
    }

    const newCourse = await Course.create({ name: courseName.trim() });

    console.log(`✅ Course "${newCourse.name}" created with ID ${newCourse.id}`);
    return {
      id: newCourse.id,
      name: newCourse.name,
    };
  } catch (error) {
    console.error("❌ Error inserting new course:", error);
    throw error;
  }
};


const getAllCoursesWithTests = async () => {
  try {
    const courses = await Course.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: Test,
          attributes: ['id', 'title'],
        },
      ],
      order: [['name', 'ASC']],
    });

    // Trả về mảng gồm mỗi course có id, name, và mảng tests
    return courses.map(course => ({
      id: course.id,
      name: course.name,
      tests: course.Tests.map(test => ({
        id: test.id,
        title: test.title,
      })),
    }));
  } catch (error) {
    console.error("❌ Error fetching courses with tests:", error);
    throw error;
  }
};


export{
    getAllTestsWithCourses,
    getAllCourseNames,
    getAllCoursesWithTests,
    updateCourseName,
    deleteCourseById,
    insertCourse
};