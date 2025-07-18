import { getAllTestsWithCourses, getAllCourseNames, getAllCoursesWithTests ,updateCourseName,
    deleteCourseById
} from "../services/test_course_service.js";

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


const updateCourseNameController = async (req, res) => {    
    try {
        const courseId = req.params.id;
        const newName = req.body.name;
        const updatedCourse = await updateCourseName(courseId, newName);
        res.status(200).json(updatedCourse);
    } catch (error) {
        console.error("Error in updateCourseNameController:", error);   
        res.status(500).json({ message: "Error updating course name" });
    }
}

const deleteCourseByIdController = async (req, res) => {
    try {
        const courseId = req.params.id;
        await deleteCourseById(courseId);
        res.status(200).json({ message: `Course with ID ${courseId} deleted successfully` });
    } catch (error) {
        console.error("Error in deleteCourseByIdController:", error);
        res.status(500).json({ message: "Error deleting course" });
    }
};


export {
    getAllTestsWithCoursesController,
    getAllCourseNamesController,
    getCoursesNameWithTests,
    updateCourseNameController,
    deleteCourseByIdController
};