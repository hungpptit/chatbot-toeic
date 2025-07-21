
import '../styles/Home.css';
import CardTest from '../components/CardTest';
import { getAllCoursesAPI, type Course } from '../services/coursesServices';
import { useEffect, useState } from 'react';
import { getAllTestsWithCourseAPI, type Test } from '../services/testCourseService';
import { getCurrentUser, type User } from "../services/authService";

export default function HomePage() {
  // Loại bỏ dấu tiếng Việt
  function removeVietnameseTones(str: string) {
    return str
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [tests, setTest] = useState<Test[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>('Tất cả');
  const [searchTerm, setSearchTerm] = useState<string>('');

  
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
              <>
                <button
                  className={`course-item ${selectedCourse === 'Tất cả' ? 'active' : ''}`}
                  onClick={() => setSelectedCourse('Tất cả')}
                >
                  Tất cả
                </button>
                {courses.map((course) => (
                  <button
                    key={course.id}
                    className={`course-item ${selectedCourse === course.name ? 'active' : ''}`}
                    onClick={() => setSelectedCourse(course.name)}
                  >
                    {course.name}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
        <div className="div4">
          <input
            type="text"
            className="search-input"
            placeholder="Nhập từ khóa đề thi..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '400px', marginRight: '8px', padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button className='btn-search'>Tìm kiếm</button>
        </div>
        <div className="div5">
          <div className="test-grid">
            {tests
              .filter(test => {
                const filterCourse = selectedCourse === 'Tất cả' || (test.tags && test.tags.includes(selectedCourse));
                const search = searchTerm.trim();
                if (!search) return filterCourse;
                const titleNoDiacritic = removeVietnameseTones(test.title.toLowerCase());
                const searchNoDiacritic = removeVietnameseTones(search.toLowerCase());
                return filterCourse && titleNoDiacritic.includes(searchNoDiacritic);
              })
              .map((test) => (
                <CardTest
                  key={test.id}
                  id={test.id}
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
