#!/bin/bash

if [ -z "$SA_PASSWORD" ]; then
  echo "❌ SA_PASSWORD is not set. Exiting..."
  exit 1
fi

# 🛠️ Chạy SQL Server ngầm để chuẩn bị restore
/opt/mssql/bin/sqlservr &

# Lưu PID để giết đúng tiến trình sau
sql_pid=$!

echo "⏳ Waiting for SQL Server to be ready..."
for i in $(seq 1 30); do
  /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "SELECT 1" &> /dev/null
  if [ $? -eq 0 ]; then
    echo "✅ SQL Server is ready!"
    break
  fi
  echo "⌛ Still waiting ($i/30)..."
  sleep 3
done

if [ $i -eq 30 ]; then
  echo "❌ SQL Server không khởi động sau 90 giây. Thoát."
  kill $sql_pid
  exit 1
fi

# 🧱 Kiểm tra volume mount đúng
if [ ! -d /var/opt/mssql/data ]; then
  echo "❌ Volume chưa mount vào /var/opt/mssql/data. Thoát."
  kill $sql_pid
  exit 1
fi

# ✅ Kiểm tra database đã tồn tại và đã restore chưa
EXISTS=$(/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" \
  -Q "SET NOCOUNT ON; SELECT IIF(DB_ID('ChatbotToeic') IS NOT NULL, 1, 0)" -h -1 -W | tr -d '\r\n')

if [ "$EXISTS" = "0" ] && [ ! -f /var/opt/mssql/data/.restored ]; then
  echo "📦 Restore database ChatbotToeic từ file..."
  /mssql/restore.sh ChatbotToeic.bak ChatbotToeic

  echo "🔐 Đặt lại mật khẩu 'sa' sau khi restore..."
  /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" \
    -Q "ALTER LOGIN sa WITH PASSWORD = '$SA_PASSWORD'"

  echo "✅ Ghi nhận đã restore"
  touch /var/opt/mssql/data/.restored
else
  echo "✅ Database 'ChatbotToeic' đã tồn tại hoặc đã được restore. Bỏ qua restore."
fi

# 💥 Dừng tiến trình sqlservr nền một cách an toàn
echo "🧼 Dừng SQL Server nền tạm thời..."
kill $sql_pid
wait $sql_pid 2>/dev/null

# 🚀 Khởi động SQL Server chính thức
echo "🚀 Khởi động SQL Server chính thức..."
exec /opt/mssql/bin/sqlservr
