-- RESTORE database ChatbotToeic from backup file

RESTORE DATABASE [ChatbotToeic]
FROM DISK = N'/var/opt/mssql/backup/ChatbotToeic.bak'
WITH MOVE 'ChatbotToeic' TO '/var/opt/mssql/data/ChatbotToeic.mdf',
     MOVE 'ChatbotToeic_log' TO '/var/opt/mssql/data/ChatbotToeic_log.ldf',
     REPLACE;
GO
