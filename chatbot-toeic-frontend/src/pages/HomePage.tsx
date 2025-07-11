
import '../styles/Home.css';
import CardTest from '../components/CardTest';
import { getAllCoursesAPI, type Course } from '../services/coursesServices';
import { useEffect, useState } from 'react';
import { getAllTestsWithCourseAPI, type Test } from '../services/testCourseService';
import { getCurrentUser, type User } from "../services/authService";

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [tests, setTest] = useState<Test[]>([]);
  const [user, setUser] = useState<User | null>(null);

  
  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);
  useEffect(() =>{
    const fetchTests = async () =>{
      try{
        const data = await getAllTestsWithCourseAPI();
        setTest(data);
      }catch (error){
        console.error("lỗi khi lấy danh sách các tests: ", error);
      }
    }
    fetchTests();
  }, []);
  

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCoursesAPI();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="home-page">
      <div className="home-container">  
     
      

        <div className="div1">Thư viện đề thi</div>
        <div className="div2 user-card">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="avatar" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="64"
              height="64"
              className="avatar"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6H4z" />
            </svg>
          )}

          <h3 className="username">{user?.email || 'Chưa đăng nhập'}</h3>
          <hr />
          <p className="warning">
            <span className="icon">⚠️</span> Bạn chưa tạo mục tiêu cho quá trình luyện thi của mình. 
            <a href="#" className="link"> Tạo ngay.</a>
          </p>
          <button className="result-button">
            📊 Thống kê kết quả
          </button>
        </div>

        <div className="div3">
           <div className="course-list">
            {loading ? (
              <p>Đang tải khóa học...</p>
            ) : (
              courses.map((course) => (
                <button
                  key={course.id}
                  className={`course-item ${course.id === 1 ? 'active' : ''}`} // Đánh dấu "Tất cả"
                >
                  {course.name}
                </button>
              ))
            )}
          </div>
        </div>
        <div className="div4">
          <button className='btn-search'>Tìm kiếm</button>
        </div>
        <div className="div5">
        <div className="test-grid">
          {tests.map((test) => (
            <CardTest
              key={test.id}
              title={test.title}
              duration={test.duration}
              participants={test.participants}
              comments={test.comments}
              questions={test.questions}
              parts={test.parts}
              tags={test.tags}
            />
          ))}
        </div>
      </div>

    
     
    

      </div>
    </div>
  );
}
