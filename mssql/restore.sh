#!/bin/bash
# Script to restore MSSQL database from .bak file
set -e

# 🧩 Tham số
BACKUP_FILE="$1"
DB_NAME="$2"
DATA_PATH="/var/opt/mssql/data"
BACKUP_PATH="/var/opt/mssql/backup/$BACKUP_FILE"

# ✅ Kiểm tra đủ tham số chưa
if [ -z "$BACKUP_FILE" ] || [ -z "$DB_NAME" ]; then
  echo "❌ Usage: $0 <backup_file.bak> <database_name>"
  exit 1
fi

# ✅ Kiểm tra file tồn tại
if [ ! -f "$BACKUP_PATH" ]; then
  echo "❌ Backup file not found at: $BACKUP_PATH"
  exit 1
fi

# ⏳ Chờ SQL Server sẵn sàng
echo "⏳ Waiting for SQL Server to be ready..."
for i in {1..30}; do
  /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -Q "SELECT 1" &> /dev/null
  if [ $? -eq 0 ]; then
    echo "✅ SQL Server is ready!"
    break
  fi
  echo "⌛ Still waiting... ($i/30)"
  sleep 3
done

if [ $i -eq 30 ]; then
  echo "❌ SQL Server not ready after 90s. Abort."
  exit 1
fi

# 📦 Thực hiện restore
echo "🚀 Restoring $DB_NAME from $BACKUP_FILE..."
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -Q "
RESTORE DATABASE [$DB_NAME]
FROM DISK = N'$BACKUP_PATH'
WITH MOVE '$DB_NAME' TO '$DATA_PATH/${DB_NAME}.mdf',
     MOVE '${DB_NAME}_log' TO '$DATA_PATH/${DB_NAME}_log.ldf',
     REPLACE
"

echo "✅ Restore of $DB_NAME completed."
# echo "👤 Tạo login mới 'chatbot_admin' với quyền sysadmin..."
# /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "IF NOT EXISTS (SELECT * FROM sys.sql_logins WHERE name = 'chatbot_admin') BEGIN CREATE LOGIN chatbot_admin WITH PASSWORD = 'Doancanhantoeic123!'; ALTER SERVER ROLE sysadmin ADD MEMBER chatbot_admin; END"
