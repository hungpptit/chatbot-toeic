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
    getAllCoursesWithTests
};