// danh sách đề phần admin item danh sahch đề
// chatbot-toeic-frontend\src\container\admin\AdminTestPage.tsx
import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import "../../styles/AdminTestPage.css";
import {getAllTestsAPI, type Test, deleteTestByIdAPI} from '../../services/adminTestService';
// import {deleteCourseByIdAPI} from '../../services/testCourseService'
import { useNavigate } from "react-router-dom";


export default function AdminTestPage() {
    const [tests, setTests] = useState<Test[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchTests = async () => {
        try {
          const data = await getAllTestsAPI();
          setTests(data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách đề thi:", error);
        }
      };

      fetchTests();
    }, []);



  const handleView = (id: number, title: string) => {
    console.log("Xem chi tiết đề", id, title);
    navigate(`/admin/tests/${id}/view`, {
      state: { title , mode: "view"}, 
    });
  };

  const handleEdit = (id: number, title: string) => {
    console.log("Chỉnh sửa đề", id, title);
    navigate(`/admin/tests/${id}/view`, {
      state: { title , mode: "edit"}, 
    });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa đề thi này không?")) {
      try {
        await deleteTestByIdAPI(id);
        setTests((prev) => prev.filter((test) => test.id !== id));
        alert("Đã xóa đề thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa đề:", error);
        alert("Xóa đề thất bại!");
      }
    }
  };

  return (
    <div className="admin-test-page">
      <h2>📑 Danh sách đề thi</h2>
      <table className="test-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên đề</th>
            <th>Khóa học</th>
            <th>Thời lượng</th>
            <th>Số câu</th>
            <th>Số người làm</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
            {tests.map((test) => (
            <tr key={test.id}>
              <td>{test.id}</td>
              <td>{test.title}</td>
              <td>{test.courses.join(", ")}</td>
              <td>{test.duration} phút</td>
              <td>{test.questions}</td>
              <td>{test.participants}</td>
              <td className="actions">
                <button className="view-btn" onClick={() => handleView(test.id, test.title)} title="Xem">
                  <FaEye />
                </button>
                <button className="edit-btn-page" onClick={() => handleEdit(test.id, test.title)} title="Chỉnh sửa">
                  <FaEdit />
                </button>
                <button className="delete-btn-page" onClick={() => handleDelete(test.id)} title="Xóa">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
