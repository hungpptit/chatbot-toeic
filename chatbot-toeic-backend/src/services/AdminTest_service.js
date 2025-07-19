import db from "../models/index.js";


const Test = db.Test;
const Course = db.Course;
const Question = db.Question;
const Part = db.Part;
const QuestionType = db.QuestionType;
const TestQuestion = db.TestQuestion;
const Test_Courses = db.TestCourse;

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

// Create Part
const createPart = async (name) => {
  try {
    const newPart = await Part.create({ name });
    return newPart;
  } catch (error) {
    console.error("❌ Error creating Part:", error);
    throw error;
  }
};

// Create QuestionType
const createQuestionType = async (name, description) => {
  try {
    const newType = await QuestionType.create({ name, description });
    return newType;
  } catch (error) {
    console.error("❌ Error creating QuestionType:", error);
    throw error;
  }
};

// Delete Part by ID
const deletePart = async (id) => {
  try {
    const deleted = await Part.destroy({ where: { id } });
    return deleted > 0; // true if deleted
  } catch (error) {
    console.error("❌ Error deleting Part:", error);
    throw error;
  }
};

// Delete QuestionType by ID
const deleteQuestionType = async (id) => {
  try {
    const deleted = await QuestionType.destroy({ where: { id } });
    return deleted > 0;
  } catch (error) {
    console.error("❌ Error deleting QuestionType:", error);
    throw error;
  }
};

// update part name
const updatePartName = async (PartId, newName) => { 
  try {
    const part = await Part.findByPk(PartId);
    if (!part) {
      throw new Error(`Part with ID ${PartId} not found`);
    }
    part.name = newName;
    await part.save();
    return part;
  } catch (error) {
    console.error("❌ Error updating course name:", error);
    throw error;
  }
};

// update course questionType
const updateQuestionType = async (typeId, newName, newDescription = null) => {
  try {
    const questionType = await QuestionType.findByPk(typeId);
    if (!questionType) {      
      throw new Error(`QuestionType with ID ${typeId} not found`);
    }
    questionType.name = newName;
    questionType.description = newDescription;
    await questionType.save();
    return questionType;
  } catch (error) {
    console.error("❌ Error updating question type:", error);
    throw error;  
  }
};





const createNewTest = async (testData) => {
  try {
    const { title, courseId, questions } = testData;

    // Create test
    const test = await db.Test.create({
      title,
      duration: "45 minutes", // Default value, can be updated later
      participants: 0, // Default value, can be updated later
      comments: null, // Default value, can be updated later
      questions: questions.length,
    });

    // Create test-course relationship
    await db.sequelize.models.Test_Courses.create({
      courseId,
      testId: test.id,
    });

    // Create questions
    const questionRecords = await Promise.all(questions.map(async (q) => {
      const question = await Question.create({
        question: q.question || null,
        optionA: q.optionA || null,
        optionB: q.optionB || null,
        optionC: q.optionC || null,
        optionD: q.optionD || null,
        correctAnswer: q.correctAnswer || null,
        explanation: q.explanation || null,
        typeId: q.typeId || 1,
        partId: q.partId || null,
      });
      return question;
    }));

    // Create test-question relationships
    const testQuestionRecords = questionRecords.map((q, index) => ({
      testId: test.id,
      questionId: q.id,
      sortOrder: index + 1,
    }));
    await TestQuestion.bulkCreate(testQuestionRecords);

    return {
      testId: test.id,
      questionIds: questionRecords.map(q => q.id),
    };
  } catch (err) {
    console.error('❌ Error creating test:', err);
    throw err;
  }
};




export { getAllTestsWithCourses,
  getAllQuestionTypes,
  getAllParts,createPart,
  createQuestionType,
  deletePart,
  deleteQuestionType, 
  createNewTest,
  updatePartName,
  updateQuestionType
 };