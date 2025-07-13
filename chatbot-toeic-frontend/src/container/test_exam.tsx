import "../styles/Test_exam.css";
import { useParams } from "react-router-dom";
import CardQuestion from "../components/Card Question";
import { useEffect, useState } from "react";
import { getQuestionsByTestIdAPI, type Question } from "../services/question_test_services";

export default function TestExam() {
  const [questionData, setQuestionData] = useState<Question[]>([]);
  const { id } = useParams();


  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log("id hiện tai: ", id)
        const data = await getQuestionsByTestIdAPI(Number(id));
        setQuestionData(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <div className="test-page">
      <div className="test-container">
        <div className="test1">New Economy TOEIC Test 5</div>
        <div className="test2">2</div>
        <div className="test3">
          <div className="audio-controls">
            <button>▶</button>
            <div className="progress-bar">
              <div className="filled"></div>
            </div>
            <span>-47:00</span>
            <input type="range" />
            <button>⚙</button>
          </div>

          <div className="parts">
            {["Part 1", "Part 2", "Part 3", "Part 4", "Part 5", "Part 6", "Part 7"].map((part, idx) => (
              <div key={idx} className={`part-button ${idx === 4 ? "active" : ""}`}>{part}</div>
            ))}
          </div>
        </div>

        <div className="test4">
          {questionData.map((item, index) => (
            <CardQuestion key={item.id} item={item} index={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
