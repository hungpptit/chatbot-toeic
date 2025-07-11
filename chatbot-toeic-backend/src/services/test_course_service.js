import db from "../models/index.js"

const Test = db.Test;
const Course = db.Course;

const getAllTestsWithCourses = async () => {
    try{
        const testList = await Test.findAll({
            order: [['id', 'ASC']],
            attributes: ['id', 'title', 'duration', 'participants','comments','questions', 'parts'],
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
            parts: test.parts,
            tags: test.Courses.map(course => course.name),
        }));
        return formattedTests;
    }catch{
        console.error('Error fetching tests with Courses', err);
        throw err;
    }

};

export{
    getAllTestsWithCourses
};