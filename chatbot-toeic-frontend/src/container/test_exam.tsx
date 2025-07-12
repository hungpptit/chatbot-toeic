import "../styles/Test_exam.css"


export default function TestExam(){
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
                        {['Part 1', 'Part 2', 'Part 3', 'Part 4', 'Part 5', 'Part 6', 'Part 7'].map((part, idx) => (
                        <div key={idx} className={`part-button ${idx === 4 ? 'active' : ''}`}>{part}</div>
                        ))}
                    </div>
                    </div>

                <div className="test4">4</div>
            </div>
        </div>
    );
}