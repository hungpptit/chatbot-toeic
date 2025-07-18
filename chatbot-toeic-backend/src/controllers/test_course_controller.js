import { getAllTestsWithCourses, getAllCourseNames, getAllCoursesWithTests } from "../services/test_course_service.js";

const getAllTestsWithCoursesController = async (req, res) =>{
    try{
        const tests = await getAllTestsWithCourses();
        res.status(200).json(tests);
    }catch (error){
        console.error("Error in getAllTestsWithCoursesController: ", error);
        res.status(500).json({message: "Error fetching tests with courses"});
    }
};

const getAllCourseNamesController = async (req, res) => {
    try {
        const courses = await getAllCourseNames();
        res.status(200).json(courses);
    } catch (error) {
        console.error("Error in getAllCourseNamesController: ", error);
        res.status(500).json({ message: "Error fetching course names" });
    }
}  

const getCoursesNameWithTests = async (req, res) => {
  try {
    const courses = await getAllCoursesWithTests();
    return res.status(200).json(courses);
  } catch (error) {
    console.error("Error in getAllCoursesWithTestsController:", error);
    return res.status(500).json({ message: "Error fetching courses with tests" });
  }
};

export {
    getAllTestsWithCoursesController,
    getAllCourseNamesController,
    getCoursesNameWithTests
};