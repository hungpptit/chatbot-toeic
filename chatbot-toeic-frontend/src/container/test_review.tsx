import '../styles/testReview.css';
import { useParams, useLocation  } from "react-router-dom";
import {mockTests} from '../data/mockTests';


export default function TestReview(){
    const location = useLocation();
    const testTitle = location.state?.title || "New Economy TOEIC Test";


    return (
        <div className="review-page">
            <div className="review-container">
                <div className="review1">{testTitle}</div>
                <div className="review2">
                    <h3>Kết quả làm bài của bạn:</h3>
                    <table className="result-table">
                        <thead>
                        <tr>
                            <th>Ngày làm</th>
                            <th>Kết quả</th>
                            <th>Thời gian làm bài</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {mockTests.map((item, index) => (
                            <tr key={index}>
                            <td>
                                {item.date}
                                <div>
                                {item.tags.map((tag, i) => (
                                    <span className="tag" key={i}>{tag}</span>
                                ))}
                                </div>
                            </td>
                            <td>{item.score}</td>
                            <td>{item.time}</td>
                            <td><a href="#">Xem chi tiết</a></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>


            </div>
        </div>
    )
}