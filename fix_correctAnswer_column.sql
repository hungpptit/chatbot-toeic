-- Fix correctAnswer column length for different question types
USE ChatbotToeic;

-- Check current column definition
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Questions' AND COLUMN_NAME = 'correctAnswer';

-- Increase correctAnswer column length to handle longer answers
-- For Fill in Blank, Matching, Rearrangement, Short Answer types
ALTER TABLE Questions 
ALTER COLUMN correctAnswer NVARCHAR(500);

-- Verify the change
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Questions' AND COLUMN_NAME = 'correctAnswer';

PRINT '✅ correctAnswer column updated to NVARCHAR(500)';