-- Fix UserTests.testId to allow NULL for practice mode
-- Run this on your SQL Server database

USE [ChatbotToeic]; -- Replace with your actual database name
GO

-- Make testId nullable
ALTER TABLE UserTests
ALTER COLUMN testId INT NULL;
GO

-- Verify the change
SELECT 
    COLUMN_NAME,
    IS_NULLABLE,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'UserTests' AND COLUMN_NAME = 'testId';
GO

PRINT 'UserTests.testId is now nullable for practice mode support!';
