import db from '../models/index.js';
const Course = db.Course;
const getAllCourses = async () => {
  try {
    const courseList = await Course.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'name']
    });
    return courseList;
  } catch (err) {
    console.error('❌ Error fetching courses:', err);
    throw err;
  }
};
export { getAllCourses };