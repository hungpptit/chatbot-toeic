import "../styles/cardQuestion.css";
import { useState } from "react";

export interface QuestionType {
  id: number;
  name: string;
  description: string;
}

export interface Part {
  id: number;
  name: string;
}

export type QuestionItem = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  typeId: number;
  partId: number;
  testId: number;
  questionType: QuestionType;
  part: Part;
};

type CardQuestionProps = {
  item: QuestionItem;
  index: number;
};

export default function CardQuestion({ index, item }: CardQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");

  const handleSelect = (option: string) => {
    setSelected(option);
  };

  return (
    <div className="card-container">
      <h2 className="card-question">{index}. {item.question}</h2>

      {item.questionType.name === "Multiple Choice" ? (
        <div className="card-options">
          {["A", "B", "C", "D"].map((opt) => (
            <button
              key={opt}
              className={`card-option ${selected === opt ? "selected" : ""}`}
              onClick={() => handleSelect(opt)}
            >
              {opt}. {item[`option${opt}` as "optionA" | "optionB" | "optionC" | "optionD"]}
            </button>
          ))}
        </div>
      ) : (
        <div className="card-input">
          <input
            type="text"
            placeholder="Your answer..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
      )}

      {/* <div className="card-explanation">
        <p>Correct Answer: <span className="card-correct">{item.correctAnswer}</span></p>
        <p>Explanation: {item.explanation}</p>
      </div> */}
    </div>
  );
}
