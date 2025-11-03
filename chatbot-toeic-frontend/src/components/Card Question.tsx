import React from "react";
import "../styles/cardQuestion.css";
import type { QuestionWithMedia as QuestionItem } from "../services/question_test_services";

// ✅ Global audio manager - only one audio plays at a time
let currentPlayingAudio: HTMLAudioElement | null = null;

const pauseAllAudio = (exceptElement?: HTMLAudioElement) => {
  if (currentPlayingAudio && currentPlayingAudio !== exceptElement) {
    currentPlayingAudio.pause();
  }
};

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
    startSecond?: number;  // ✅ Add timing info
    endSecond?: number;    // ✅ Add timing info
  } | null;
  onAudioReplay?: (startSecond?: number, endSecond?: number) => void; // ✅ Audio replay function
  hasGlobalAudio?: boolean; // ✅ Whether global audio is available
  mode?: "exam" | "review" | "practice"; // ✅ Mode for conditional rendering
};

export default function CardQuestion({
  index,
  item,
  selectedAnswer,
  onAnswer,
  onSelectAnswer,
  showResult,
  incorrectAnswer,
  onAudioReplay,
  hasGlobalAudio,
  mode = "exam" // ✅ Default to exam mode
}: CardQuestionProps) {
  // ✅ Helper function to get image URL for this question
  const getQuestionImage = (): string | null => {
    const imageMapping = item.mediaMappings?.find(m => m.media?.type === 'image');
    return imageMapping?.media?.url || null;
  };

  // ✅ Helper function to get audio timing for this question
  const getAudioTiming = (): { startSecond?: number, endSecond?: number, audioUrl?: string } => {
    const audioMapping = item.mediaMappings?.find(m => m.media?.type === 'audio');
    return {
      startSecond: audioMapping?.startSecond,
      endSecond: audioMapping?.endSecond,
      audioUrl: audioMapping?.media?.url
    };
  };

  // ✅ Handle replay audio for this specific question
  const handleReplayClick = () => {
    if (!onAudioReplay || !hasGlobalAudio) return;
    
    // Priority: incorrectAnswer timing > question media timing
    let startSecond = incorrectAnswer?.startSecond;
    let endSecond = incorrectAnswer?.endSecond;
    
    if (startSecond === undefined || endSecond === undefined) {
      const timing = getAudioTiming();
      startSecond = startSecond || timing.startSecond;
      endSecond = endSecond || timing.endSecond;
    }
    
    // ✅ Visual feedback - temporarily disable button
    const button = document.activeElement as HTMLButtonElement;
    if (button && button.classList.contains('audio-replay-btn')) {
      button.style.opacity = '0.6';
      button.disabled = true;
      setTimeout(() => {
        button.style.opacity = '1';
        button.disabled = false;
      }, 500);
    }
    
    onAudioReplay(startSecond, endSecond);
  };

  const handleSelect = (option: string) => {
    if (showResult) return;
    onSelectAnswer(item.id, option);
    onAnswer(index, true);
  };

  // Determine cursor style for card-option
  const getCursorStyle = () => {
    return showResult ? 'not-allowed' : 'pointer';
  };

  const questionImage = getQuestionImage();
  const audioTiming = getAudioTiming(); // ✅ Get audio timing and URL

  // ✅ Audio player time control for practice mode - Allow seeking within range only
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  React.useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || mode !== "practice" || !audioTiming.audioUrl) return;
    if (audioTiming.startSecond === undefined || audioTiming.endSecond === undefined) return;

    const startSec = audioTiming.startSecond;
    const endSec = audioTiming.endSecond;

    // Set initial playback position
    const handleLoadedMetadata = () => {
      audioElement.currentTime = startSec;
    };

    // Allow seeking ONLY within startSec-endSec range
    const handleSeeking = () => {
      if (audioElement.currentTime < startSec) {
        audioElement.currentTime = startSec;
      } else if (audioElement.currentTime > endSec) {
        audioElement.currentTime = endSec;
      }
    };

    // Monitor playback and pause at endSecond
    const handleTimeUpdate = () => {
      if (audioElement.currentTime >= endSec) {
        audioElement.pause();
        audioElement.currentTime = startSec; // Reset to start for replay
      }
      // Safety: if somehow below start, reset
      if (audioElement.currentTime < startSec) {
        audioElement.currentTime = startSec;
      }
    };

    // ✅ Ensure only ONE audio plays at a time
    const handlePlay = () => {
      // Pause all other audio first
      pauseAllAudio(audioElement);
      // Set this as current playing
      currentPlayingAudio = audioElement;
      
      // Ensure playback starts within range
      if (audioElement.currentTime < startSec || audioElement.currentTime >= endSec) {
        audioElement.currentTime = startSec;
      }
    };

    // Clear reference when paused
    const handlePause = () => {
      if (currentPlayingAudio === audioElement) {
        currentPlayingAudio = null;
      }
    };

    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('seeking', handleSeeking);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);

    return () => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('seeking', handleSeeking);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      
      // Cleanup: if this was the playing audio, clear it
      if (currentPlayingAudio === audioElement) {
        currentPlayingAudio = null;
      }
    };
  }, [mode, audioTiming.audioUrl, audioTiming.startSecond, audioTiming.endSecond]);

  // const isCorrect = selectedAnswer === item.correctAnswer;

  return (
    <div className="card-container">
      {/* ✅ Question Image (if exists) */}
      {questionImage && (
        <div className="question-image-container" style={{
          marginBottom: '15px',
          textAlign: 'center' as const
        }}>
          <img 
            src={questionImage} 
            alt={`Question ${index} image`}
            style={{
              maxWidth: '100%',
              maxHeight: '250px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>
      )}

      {/* ✅ Per-question Audio Player (practice mode only) */}
      {mode === "practice" && audioTiming.audioUrl && (
        <div className="question-audio-container" style={{
          marginBottom: '15px',
          padding: '12px',
          backgroundColor: '#f0f7ff',
          borderRadius: '8px',
          border: '1px solid #4CAF50',
          boxShadow: '0 2px 6px rgba(76, 175, 80, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>🎵</span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              color: '#2c5f2d'
            }}>
              Audio cho câu hỏi này
            </span>
          </div>
          <audio 
            ref={audioRef}
            controls 
            style={{
              width: '100%',
              height: '40px'
            }}
          >
            <source src={audioTiming.audioUrl} type="audio/mpeg" />
            Trình duyệt không hỗ trợ audio.
          </audio>
        </div>
      )}

      <h2 className="card-question">
        {index}. {item.question}
      </h2>

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
            style={{ cursor: getCursorStyle() }}
          >
            {opt}. {item[`option${opt}` as "optionA" | "optionB" | "optionC" | "optionD"]}
          </button>
        );
        })}
      </div>

      {showResult && incorrectAnswer && (
        <div className="card-explanation">
          <div className="explanation-header">
            <p>
              Correct Answer: <span className="card-correct">{incorrectAnswer.correctAnswer}</span>
            </p>
            {/* ✅ Audio Replay Button */}
            {hasGlobalAudio && (incorrectAnswer.startSecond !== undefined || getAudioTiming().startSecond !== undefined) && (
              <button 
                className="audio-replay-btn"
                onClick={handleReplayClick}
                title={`Nghe lại đoạn audio từ ${incorrectAnswer.startSecond || getAudioTiming().startSecond}s đến ${incorrectAnswer.endSecond || getAudioTiming().endSecond}s`}
              >
                🎵 Nghe lại câu này
              </button>
            )}
          </div>
          <p>Explanation: {incorrectAnswer.explanation}</p>
        </div>
      )}
    </div>
  );
}
