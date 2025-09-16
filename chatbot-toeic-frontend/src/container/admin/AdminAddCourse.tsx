// dành cho admin thêm mới khóa học, part, question type, item thêm/ sửa
import { useState } from "react";
import { FaPlusCircle, FaBook, FaPuzzlePiece, FaQuestion, FaEdit,
  FaTrash, } from "react-icons/fa";
import "../../styles/adminAddCourse.css";
import {getAllCourseNamesAPI, insertCourseAPI,
    updateCourseNameAPI,
    deleteCourseByIdAPI
} from "../../services/testCourseService";

import{getAllQuestionTypesAPI,
    getAllPartsAPI,
    createPartAPI,
    createQuestionTypeAPI,
    deletePartAPI,
    deleteQuestionTypeAPI,
    updatePartNameAPI,
    updateQuestionTypeAPI,
    getAllSkillsAPI,
    createSkillAPI,
    deleteSkillAPI,
    updateSkillAPI,
} from "../../services/adminTestService";
import { useEffect } from "react";

interface DataItem {
  id: number;
  name: string;
}

export default function AdminAddCourse() {
  const [courseName, setCourseName] = useState("");
  const [partName, setPartName] = useState("");
  const [questionType, setQuestionType] = useState("");

  const [courses, setCourses] = useState<DataItem[]>([]);
  const [parts, setParts] = useState<DataItem[]>([]);
  const [questionTypes, setQuestionTypes] = useState<DataItem[]>([]);

  const [skillName, setSkillName] = useState("");
  const [skills, setSkills] = useState<DataItem[]>([]);

    const handleAddCourse = async () => {
        if (!courseName.trim()) return alert("Vui lòng nhập tên khóa học.");

        try {
            const newCourse = await insertCourseAPI(courseName.trim()); // Gọi API

            setCourses((prev) => [...prev, newCourse]); // Cập nhật UI
            setCourseName("");
            alert(`✅ Đã thêm khóa học: ${newCourse.name}`);
        } catch (error) {
            console.error("❌ Lỗi khi thêm khóa học:", error);
            alert("Đã xảy ra lỗi khi thêm khóa học.");
        }
    };

    const handleDeleteCourse = async (id: number) => {
        if (!window.confirm("Bạn có chắc muốn xóa khóa học này?")) return;

        try {
            await deleteCourseByIdAPI(id);
            setCourses((prev) => prev.filter((c) => c.id !== id));
            alert("🗑️ Đã xóa khóa học.");
        } catch (error) {
            console.error("❌ Lỗi khi xóa:", error);
            alert("Xóa thất bại.");
        }
        };

    const handleUpdateCourse = async (id: number) => {
        const currentCourse = courses.find((c) => c.id === id);
        if (!currentCourse) return;

        const newName = window.prompt("Nhập tên mới cho khóa học:", currentCourse.name);
        if (!newName || !newName.trim()) return;

        try {
            const updated = await updateCourseNameAPI(id, newName.trim());
            setCourses((prev) =>
            prev.map((c) => (c.id === id ? { ...c, name: updated.name } : c))
            );
            alert("✅ Đã cập nhật tên khóa học.");
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật:", error);
            alert("Cập nhật thất bại.");
        }
        };

    const handleAddPart = async () => {
        if (!partName.trim()) return alert("Vui lòng nhập tên part.");

        try {
            const newPart = await createPartAPI(partName.trim());
            setParts((prev) => [...prev, newPart]);
            setPartName("");
            alert(`✅ Đã thêm part: ${newPart.name}`);
        } catch (error) {
            console.error("❌ Lỗi khi thêm part:", error);
            alert("Thêm part thất bại.");
        }
    };

    const handleDeletePart = async (id: number) => {
        if (!window.confirm("Xóa part này?")) return;

        try {
            await deletePartAPI(id);
            setParts((prev) => prev.filter((p) => p.id !== id));
            alert("🗑️ Đã xóa part.");
        } catch (error) {
            console.error("❌ Lỗi khi xóa part:", error);
            alert("Xóa part thất bại.");
        }
    };
    const handleUpdatePart = async (id: number) => {
        const current = parts.find((p) => p.id === id);
        if (!current) return;

        const newName = window.prompt("Tên mới cho part:", current.name);
        if (!newName || !newName.trim()) return;

        try {
            const updated = await updatePartNameAPI(id, newName.trim());
            setParts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, name: updated.name } : p))
            );
            alert("✅ Đã cập nhật part.");
        } catch (error) {
            console.error("❌ Lỗi cập nhật part:", error);
            alert("Cập nhật part thất bại.");
        }
    };

    const handleAddQuestionType = async () => {
        if (!questionType.trim()) return alert("Vui lòng nhập loại câu hỏi.");

        try {
            const newQT = await createQuestionTypeAPI(questionType.trim());
            setQuestionTypes((prev) => [...prev, newQT]);
            setQuestionType("");
            alert(`✅ Đã thêm loại câu hỏi: ${newQT.name}`);
        } catch (error) {
            console.error("❌ Lỗi khi thêm question type:", error);
            alert("Thêm thất bại.");
        }
    };

    const handleDeleteQuestionType = async (id: number) => {
        if (!window.confirm("Xóa loại câu hỏi này?")) return;

        try {
            await deleteQuestionTypeAPI(id);
            setQuestionTypes((prev) => prev.filter((qt) => qt.id !== id));
            alert("🗑️ Đã xóa loại câu hỏi.");
        } catch (error) {
            console.error("❌ Lỗi khi xóa:", error);
            alert("Xóa thất bại.");
        }
    };


    const handleUpdateQuestionType = async (id: number) => {
        const current = questionTypes.find((qt) => qt.id === id);
        if (!current) return;

        const newName = window.prompt("Tên mới cho loại câu hỏi:", current.name);
        if (!newName || !newName.trim()) return;

        try {
            const updated = await updateQuestionTypeAPI(id, newName.trim());
            setQuestionTypes((prev) =>
            prev.map((qt) => (qt.id === id ? { ...qt, name: updated.name } : qt))
            );
            alert("✅ Đã cập nhật question type.");
        } catch (error) {
            console.error("❌ Lỗi cập nhật:", error);
            alert("Cập nhật thất bại.");
        }
    };

    // Tương tự cho Skill
    // Add Skill
    const handleAddSkill = async () => {
      if (!skillName.trim()) return alert("Vui lòng nhập tên Skill.");

      try {
        const newSkill = await createSkillAPI(skillName.trim());
        setSkills((prev) => [...prev, newSkill]);
        setSkillName("");
        alert(`✅ Đã thêm Skill: ${newSkill.name}`);
      } catch (error) {
        console.error("❌ Lỗi khi thêm Skill:", error);
        alert("Thêm Skill thất bại.");
      }
    };

    // Delete Skill
    const handleDeleteSkill = async (id: number) => {
      if (!window.confirm("Xóa Skill này?")) return;

      try {
        await deleteSkillAPI(id);
        setSkills((prev) => prev.filter((s) => s.id !== id));
        alert("🗑️ Đã xóa Skill.");
      } catch (error) {
        console.error("❌ Lỗi khi xóa Skill:", error);
        alert("Xóa Skill thất bại.");
      }
    };

    // Update Skill
    const handleUpdateSkill = async (id: number) => {
      const current = skills.find((s) => s.id === id);
      if (!current) return;

      const newName = window.prompt("Tên mới cho Skill:", current.name);
      if (!newName || !newName.trim()) return;

      try {
        const updated = await updateSkillAPI(id, { name: newName.trim() });
        setSkills((prev) =>
          prev.map((s) => (s.id === id ? { ...s, name: updated.name } : s))
        );
        alert("✅ Đã cập nhật Skill.");
      } catch (error) {
        console.error("❌ Lỗi cập nhật Skill:", error);
        alert("Cập nhật Skill thất bại.");
      }
    };


    useEffect(() => {
      const fetchAll = async () => {
        try {
          const [courseData, partData, questionTypeData, skillData] =
            await Promise.all([
              getAllCourseNamesAPI(),
              getAllPartsAPI(),
              getAllQuestionTypesAPI(),
              getAllSkillsAPI(),
            ]);
          setCourses(courseData);
          setParts(partData);
          setQuestionTypes(questionTypeData);
          setSkills(skillData);
        } catch (error) {
          console.error("❌ Lỗi khi tải dữ liệu:", error);
        }
      };
      fetchAll();
    }, []);



   return (
    <div className="admin-add-course-container">
      <h2>
        <FaPlusCircle /> Thêm mới dữ liệu
      </h2>

      {/* Box 1: Thêm khóa học */}
      <div className="admin-box">
        <h3>
          <FaBook /> Thêm Khóa Học
        </h3>
        <input
          type="text"
          placeholder="Tên khóa học"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
        />
        <button onClick={handleAddCourse}>
          <span style={{ marginRight: "6px" }}>
            <FaPlusCircle />
          </span>
          Thêm khóa học
        </button>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Khóa Học</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.name}</td>
                <td className="action-buttons">
                  <button onClick={() => handleUpdateCourse(course.id)}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteCourse(course.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Box 2: Thêm Part */}
      <div className="admin-box">
        <h3>
          <FaPuzzlePiece /> Thêm Part
        </h3>
        <input
          type="text"
          placeholder="Tên part"
          value={partName}
          onChange={(e) => setPartName(e.target.value)}
        />
        <button onClick={handleAddPart}>
          <span style={{ marginRight: "6px" }}>
            <FaPlusCircle />
          </span>
          Thêm part
        </button>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Part</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part) => (
              <tr key={part.id}>
                <td>{part.id}</td>
                <td>{part.name}</td>
                <td className="action-buttons">
                  <button onClick={() => handleUpdatePart(part.id)}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeletePart(part.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Box 3: Thêm Question Type */}
      <div className="admin-box">
        <h3>
          <FaQuestion /> Thêm Question Type
        </h3>
        <input
          type="text"
          placeholder="Loại câu hỏi"
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
        />
        <button onClick={handleAddQuestionType}>
          <span style={{ marginRight: "6px" }}>
            <FaPlusCircle />
          </span>
          Thêm question type
        </button>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Loại câu hỏi</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {questionTypes.map((qt) => (
              <tr key={qt.id}>
                <td>{qt.id}</td>
                <td>{qt.name}</td>
                <td className="action-buttons">
                  <button onClick={() => handleUpdateQuestionType(qt.id)}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteQuestionType(qt.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Box 4: Thêm Skill */}
      <div className="admin-box">
        <h3>
          <FaPuzzlePiece /> Thêm Skill
        </h3>
        <input
          type="text"
          placeholder="Tên Skill"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
        />
        <button onClick={handleAddSkill}>
          <span style={{ marginRight: "6px" }}>
            <FaPlusCircle />
          </span>
          Thêm Skill
        </button>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Skill</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td className="action-buttons">
                  <button onClick={() => handleUpdateSkill(s.id)}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteSkill(s.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}