import { useEffect, useState } from "react";
import {
  getCoursesWithTestsAPI,
  updateCourseNameAPI,
  deleteCourseByIdAPI,
  type CourseWithTests,
} from "../../services/testCourseService";
import "../../styles/adminCoursePage.css";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

export default function AdminCoursePage() {
  const [courses, setCourses] = useState<CourseWithTests[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [newCourseName, setNewCourseName] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await getCoursesWithTestsAPI();
        setCourses(res);
      } catch (error) {
        console.error("Lỗi khi load khóa học:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);
  

  const handleView = (courseId: number) => {
    alert(`Xem chi tiết khóa học ID: ${courseId}`);
  };

  const handleDelete = async (courseId: number) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa khóa học này?");
    if (!confirmDelete) return;

    try {
      await deleteCourseByIdAPI(courseId); // <-- Gọi API xóa
      setCourses((prev) => prev.filter((c) => c.id !== courseId)); // Cập nhật UI
      alert("✅ Xóa khóa học thành công.");
    } catch (error) {
      console.error("❌ Lỗi khi xóa khóa học:", error);
      alert("Lỗi khi xóa khóa học.");
    }
  };

  const openEditModal = (courseId: number, currentName: string) => {
    setSelectedCourseId(courseId);
    setNewCourseName(currentName);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCourseId(null);
    setNewCourseName("");
  };

  const handleSaveCourseName = async () => {
    if (!selectedCourseId) return;

    try {
      const updated = await updateCourseNameAPI(selectedCourseId, newCourseName);
      setCourses((prev) =>
        prev.map((course) =>
          course.id === selectedCourseId ? { ...course, name: updated.name } : course
        )
      );
      
      closeEditModal();
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật tên khóa học:", error);
      alert("Lỗi khi cập nhật tên khóa học.");
    }
  };

  if (loading) return <p>⏳ Đang tải danh sách khóa học...</p>;

  return (
    <div className="admin-course-container">
      <h2>📚 Danh sách khóa học</h2>
      <table className="course-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên khóa học</th>
            <th>Bài test</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.id}</td>
              <td>{course.name}</td>
              <td>
                <ul className="test-list">
                  {course.tests.map((test) => (
                    <li key={test.id} data-testid={test.id}>
                      {test.title}
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="icon-btn view"
                    onClick={() => handleView(course.id)}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="icon-btn edit"
                    onClick={() => openEditModal(course.id, course.name)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="icon-btn delete"
                    onClick={() => handleDelete(course.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Popup Modal */}
      {isEditModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="modal-title">Sửa tên khóa học</h2>
            <input
              type="text"
              className="modal-input"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="btn-save" onClick={handleSaveCourseName}> Lưu</button>
              <button className="btn-cancel" onClick={closeEditModal}> Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
