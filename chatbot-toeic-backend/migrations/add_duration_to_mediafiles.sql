-- Migration: Add duration column to MediaFiles table
-- Date: 2025-10-03
-- Description: Add duration field to store audio/video duration in seconds

USE [ChatBot_TOEIC];
GO

-- Add duration column to MediaFiles table
ALTER TABLE MediaFiles 
ADD duration FLOAT NULL;
GO

-- Add comment for documentation
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Duration in seconds for audio/video files', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'MediaFiles', 
    @level2type = N'COLUMN', @level2name = N'duration';
GO

PRINT 'Migration completed: Added duration column to MediaFiles table';