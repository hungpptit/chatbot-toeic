// chatbot-toeic-backend\src\controllers\AdminTest_xontroller.js

import Part from '../models/Part.js';
import {getAllTestsWithCourses,
  getAllQuestionTypes,
  getAllParts,
  createPart,
  createQuestionType,
  deletePart,
  deleteQuestionType,
  createNewTest,
  updatePartName,
  updateQuestionType,
  deleteTestById
 } from '../services/AdminTest_service.js';

const getTestList = async (req, res) => {
  try {
    const data = await getAllTestsWithCourses();
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching test list:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getQuestionTypes = async (req, res) => {
  try {
    const data = await getAllQuestionTypes();
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching question types:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getParts = async (req, res) => {
  try {
    const data = await getAllParts();
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching parts:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// Create Part
const createPartController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Part name is required" });

    const newPart = await createPart(name);
    res.status(201).json(newPart);
  } catch (err) {
    console.error('Error creating part:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Part
const deletePartController = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deletePart(id);

    if (!deleted) return res.status(404).json({ message: "Part not found" });

    res.status(200).json({ message: "Part deleted successfully" });
  } catch (err) {
    console.error('Error deleting part:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create QuestionType
const createQuestionTypeController = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Question type name is required" });

    const newType = await createQuestionType(name, description);
    res.status(201).json(newType);
  } catch (err) {
    console.error('Error creating question type:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete QuestionType
const deleteQuestionTypeController = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteQuestionType(id);

    if (!deleted) return res.status(404).json({ message: "Question type not found" });

    res.status(200).json({ message: "Question type deleted successfully" });
  } catch (err) {
    console.error('Error deleting question type:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Create Test new
const createNewTestController = async (req, res) => {
  try {
    const { title, courseId, questions } = req.body;
    // console.log("✅ Payload nhận được từ client:");
    console.log({ title, courseId, questions });

    // Validate input
    if (!title || !courseId || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: 'Missing or invalid fields: testTitle, courseId, and at least one question are required',
      });
    }

    const result = await createNewTest({ title, courseId, questions });

    res.status(201).json({
      message: 'Test created successfully',
      data: result, // Includes testId and questionIds
    });
  } catch (error) {
    console.error('Error in createNewTestController:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const deleteTestByIdController = async (req, res) => {
  const {testId} = req.params;
  console.log(`🗑️ [deleteTestByIdController] Deleting test with ID: `, testId);

  try {
    const result = await deleteTestById(testId);

    console.log(`✅ [deleteTestByIdController] Deleted test ID ${testId}`);
    res.status(200).json(result);
  } catch (error) {
    console.error(`❌ [deleteTestByIdController] Failed to delete test ID ${testId}:`, error.message);
    res.status(404).json({ message: error.message });
  }
};

const updatePartNameController = async (req, res) => {
  try {
    const { partId, name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Tên khóa học không hợp lệ." });
    }

    const updatedPart = await updatePartName(partId, name.trim());

    res.status(200).json({
      message: "Cập nhật tên khóa học thành công.",
      part: {
        id: updatedPart.id,
        name: updatedPart.name,
      },
    });
  } catch (error) {
    console.error("❌ Error in updateCourseNameController:", error);
    res.status(500).json({ message: "Cập nhật khóa học thất bại." });
  }
};
const updateQuestionTypeController = async (req, res) => {
  try {
    const { typeId, name, description } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Tên loại câu hỏi không hợp lệ." });
    }

    const updatedType = await updateQuestionType(typeId, name.trim(), description ?? null);

    res.status(200).json({
      message: "Cập nhật question type thành công.",
      questionType: {
        id: updatedType.id,
        name: updatedType.name,
        description: updatedType.description,
      },
    });
  } catch (error) {
    console.error("❌ Error in updateQuestionTypeController:", error);
    res.status(500).json({ message: "Cập nhật question type thất bại." });
  }
};

export {
  getTestList,
  getQuestionTypes,
  getParts,
  createPartController,
  deletePartController,
  createQuestionTypeController,
  deleteQuestionTypeController,
  createNewTestController,
  updatePartNameController,
  updateQuestionTypeController,
  deleteTestByIdController
};