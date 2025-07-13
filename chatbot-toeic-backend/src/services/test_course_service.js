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

export{
    getAllTestsWithCourses
};