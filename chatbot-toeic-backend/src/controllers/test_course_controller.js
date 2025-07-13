import { getAllTestsWithCourses } from "../services/test_course_service.js";

const getAllTestsWithCoursesController = async (req, res) =>{
    try{
        const tests = await getAllTestsWithCourses();
        res.status(200).json(tests);
    }catch (error){
        console.error("Error in getAllTestsWithCoursesController: ", error);
        res.status(500).json({message: "Error fetching tests with courses"});
    }
};

export {
    getAllTestsWithCoursesController
};