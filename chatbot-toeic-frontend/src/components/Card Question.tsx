import "../styles/cardQuestion.css";
import type { Question as QuestionItem } from "../services/question_test_services";

export interface QuestionType {
  id: number;
  name: string;
  description: string;
}

export interface Part {
  id: number;
  name: string;
}

type CardQuestionProps = {
  item: QuestionItem;
  index: number;
  selectedAnswer: string | null;
  onAnswer: (questionNumber: number, isAnswered: boolean) => void;
  onSelectAnswer: (questionId: number, selected: string) => void;
  showResult: boolean;
  incorrectAnswer: {
    questionId: number;
    correctAnswer: string;
    selectedAnswer: string;
    explanation: string;
  } | null;
};

export default function CardQuestion({
  index,
  item,
  selectedAnswer,
  onAnswer,
  onSelectAnswer,
  showResult,
  incorrectAnswer
}: CardQuestionProps) {
  const handleSelect = (option: string) => {
    if (showResult) return;
    onSelectAnswer(item.id, option);
    onAnswer(index, true);
  };

  const isCorrect = selectedAnswer === item.correctAnswer;

  return (
    <div className="card-container">
      <h2 className="card-question">
        {index}. {item.question}
      </h2>

      {item.questionType.name === "Multiple Choice" ? (
        <div className="card-options">
          {["A", "B", "C", "D"].map((opt) => {
          let className = "card-option";

          if (showResult) {
            if (opt === item.correctAnswer) {
              if (opt === selectedAnswer) {
                className += " correct"; // Bạn chọn đúng → xanh lá
              } else {
                className += " correct-answer"; // Không chọn nhưng là đáp án đúng → xanh dương
              }
            } else if (opt === selectedAnswer) {
              className += " incorrect"; // Bạn chọn sai → đỏ
            }
          } else {
            if (opt === selectedAnswer) {
              className += " selected"; // Khi chưa submit
            }
          }


            return (
              <button
                key={opt}
                className={className}
                onClick={() => handleSelect(opt)}
                disabled={showResult}
              >
                {opt}. {item[`option${opt}` as "optionA" | "optionB" | "optionC" | "optionD"]}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="card-input">
          <input type="text" placeholder="Your answer..." disabled />
        </div>
      )}

      {showResult && incorrectAnswer && (
        <div className="card-explanation">
          <p>
            Correct Answer: <span className="card-correct">{incorrectAnswer.correctAnswer}</span>
          </p>
          <p>Explanation: {incorrectAnswer.explanation}</p>
        </div>
      )}
    </div>
  );
}
