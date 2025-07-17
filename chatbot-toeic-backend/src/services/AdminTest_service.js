import db from "../models/index.js";

const Test = db.Test;
const Course = db.Course;
const Question = db.Question;
const Part = db.Part;
const QuestionType = db.QuestionType;

const getAllTestsWithCourses = async () => {
  try {
    const testList = await Test.findAll({
    order: [["id", "ASC"]],
    attributes: ["id", "title", "duration", "participants"],
    include: [
      {
        model: Course,
        attributes: ["name"],
        through: { attributes: [] },
      },
      {
        model: Question,
        as: "questions",
        attributes: ["id"], // chỉ cần id
        through: { attributes: [] },
      },
    ],
  });

  const formattedTests = testList.map((test) => ({
    id: test.id,
    title: test.title,
    duration: test.duration,
    participants: test.participants,
    questions: test.questions.length, // đếm từ bảng trung gian TestQuestions
    courses: test.Courses.map((course) => course.name),
  }));


    return formattedTests;
  } catch (error) {
    console.error("❌ Error fetching tests with Courses:", error);
    throw error;
  }
};

const getAllQuestionTypes = async () => {
  try {
    const questionTypes = await QuestionType.findAll({
      attributes: ['id', 'name', 'description'],
      order: [['id', 'ASC']],
    });
    return questionTypes;
  } catch (error) {
    console.error("❌ Error fetching Question Types:", error);
    throw error;
  }
};




const getAllParts = async () => {
  try {
    const parts = await Part.findAll({
      attributes: ['id', 'name'],
      order: [['id', 'ASC']],
    });
    return parts;
  } catch (error) {
    console.error("❌ Error fetching Parts:", error);
    throw error;
  }
};


export { getAllTestsWithCourses, getAllQuestionTypes, getAllParts };