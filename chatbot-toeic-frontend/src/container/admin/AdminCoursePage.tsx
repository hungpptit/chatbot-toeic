import { useEffect, useState } from "react";
import { getCoursesWithTestsAPI, type CourseWithTests } from "../../services/testCourseService";
import "../../styles/adminCoursePage.css";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";



export default function AdminCoursePage() {
  const [courses, setCourses] = useState<CourseWithTests[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleEdit = (courseId: number) => {
    alert(`Chỉnh sửa khóa học ID: ${courseId}`);
  };

  const handleDelete = (courseId: number) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa khóa học này?");
    if (confirmDelete) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
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
                  <button className="icon-btn view" onClick={() => handleView(course.id)}>
                    <FaEye />
                  </button>
                  <button className="icon-btn edit" onClick={() => handleEdit(course.id)}>
                    <FaEdit />
                  </button>
                  <button className="icon-btn delete" onClick={() => handleDelete(course.id)}>
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
