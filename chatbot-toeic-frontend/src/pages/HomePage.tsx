
import '../styles/Home.css';
import {courseList} from "../data/cousera";
import { mockTests } from '../data/mockTests';
import CardTest from '../components/CardTest';

export default function HomePage() {
  

  return (
    <div className="home-page">
      <div className="home-container">  
     
      

        <div className="div1">Thư viện đề thi</div>
        <div className="div2 user-card">
          <img src="/avatar-placeholder.png" alt="avatar" className="avatar" />
          <h3 className="username">google.@gmail.com</h3>
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
            {courseList.map((course, index) => (
              <button
                key={index}
                className={`course-item ${index === 0 ? "active" : ""}`}  // Đánh dấu "Tất cả" là active
              >
                {course}
              </button>
            ))}
          </div>
        </div>
        <div className="div4">
          <button className='btn-search'>Tìm kiếm</button>
        </div>
        <div className="div5">
        <div className="test-grid">
          {mockTests.map((test) => (
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
