-- SQL Migration: Create MLPredictionHistory Table
-- Mục đích: Lưu lịch sử predictions để phân tích trend và model drift
-- Chạy script này trực tiếp trong SQL Server Management Studio

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'MLPredictionHistory')
BEGIN
    CREATE TABLE MLPredictionHistory (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        weakSkills NVARCHAR(MAX) NULL,  -- JSON array of weak skills
        questionIds NVARCHAR(MAX) NULL,  -- JSON array of question IDs
        confidence FLOAT NULL,
        totalAttempts INT NULL,
        overallAccuracy FLOAT NULL,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_MLPredictionHistory_User 
            FOREIGN KEY (userId) 
            REFERENCES Users(id) 
            ON DELETE CASCADE 
            ON UPDATE CASCADE,
        
        INDEX IX_MLPredictionHistory_UserId NONCLUSTERED (userId),
        INDEX IX_MLPredictionHistory_CreatedAt NONCLUSTERED (createdAt),
        INDEX IX_MLPredictionHistory_UserId_CreatedAt NONCLUSTERED (userId, createdAt)
    );
    
    PRINT 'MLPredictionHistory table created successfully.';
END
ELSE
BEGIN
    PRINT 'MLPredictionHistory table already exists.';
END;
