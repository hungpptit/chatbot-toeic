-- ============================================================================
-- CREATE MLPredictions TABLE
-- ============================================================================
-- Purpose: Cache ML prediction results for instant retrieval
-- Updated: After each test submission (real-time)
-- ============================================================================

CREATE TABLE MLPredictions (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,
    weakSkills NVARCHAR(MAX) NULL, -- JSON array: ["Grammar", "Vocabulary"]
    questionIds NVARCHAR(MAX) NULL, -- JSON array: [363, 364, 365, ...]
    confidence FLOAT NULL, -- Average confidence score
    totalAttempts INT DEFAULT 0, -- Total questions answered by user
    overallAccuracy FLOAT NULL, -- User's overall accuracy
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_MLPredictions_Users FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT UQ_MLPredictions_UserId UNIQUE (userId) -- One prediction per user
);

-- Index for fast lookup
CREATE INDEX IDX_MLPredictions_UserId ON MLPredictions(userId);
CREATE INDEX IDX_MLPredictions_UpdatedAt ON MLPredictions(updatedAt);

-- ✅ Optional: Store prediction history (for analytics)
CREATE TABLE MLPredictionHistory (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,
    weakSkills NVARCHAR(MAX),
    questionIds NVARCHAR(MAX),
    confidence FLOAT,
    createdAt DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_MLPredictionHistory_Users FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE INDEX IDX_MLPredictionHistory_UserId_CreatedAt ON MLPredictionHistory(userId, createdAt DESC);
