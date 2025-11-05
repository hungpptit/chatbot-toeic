# 🎓 Chatbot TOEIC - Hệ thống Luyện Thi TOEIC Thông Minh

Hệ thống web application hỗ trợ học và luyện thi TOEIC với tích hợp AI Chatbot, Machine Learning dự đoán điểm số, và quản lý bài thi.

## 📋 Mục Lục

- [Tổng Quan](#-tổng-quan)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt](#-cài-đặt)
- [Cấu Hình](#-cấu-hình)
- [Chạy Ứng Dụng](#-chạy-ứng-dụng)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)
- [Tính Năng Chính](#-tính-năng-chính)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Tổng Quan

Chatbot TOEIC là một hệ thống học tập thông minh giúp người dùng:
- ✅ Làm bài test TOEIC online (Listening & Reading)
- 🤖 Tương tác với AI Chatbot để học từ vựng và ngữ pháp
- 📊 Dự đoán điểm số TOEIC bằng Machine Learning
- 📈 Theo dõi tiến độ học tập và phân tích kết quả
- 👥 Quản lý người dùng và bài thi (dành cho Admin)

---

## 🛠 Công Nghệ Sử Dụng

### Frontend
- **React 19** + **TypeScript** - UI Framework
- **Vite** - Build tool & Dev server
- **React Router v7** - Routing
- **Axios** - HTTP Client
- **Chart.js** - Data visualization
- **React Icons** - Icon library
- **SweetAlert2** - Beautiful alerts
- **React Markdown** - Markdown rendering

### Backend
- **Node.js 20** + **Express 5** - Server framework
- **SQL Server (MSSQL)** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Media storage
- **Google Generative AI** - AI Chatbot integration
- **ONNX Runtime** - ML model inference
- **Redis/ioredis** - Caching
- **Node-cron** - Scheduled tasks
- **Multer** - File upload handling

### DevOps & Tools
- **Docker** + **Docker Compose** - Containerization
- **Nginx** - Web server (Frontend)
- **Python** - ML model training (scikit-learn, pandas)

---

## 💻 Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết
- **Docker Desktop** (phiên bản 20.10 trở lên)
- **Docker Compose** (phiên bản 2.0 trở lên)
- **Git** (để clone repository)
- **Node.js 20+** (nếu chạy development mode không dùng Docker)
- **RAM**: Tối thiểu 8GB (khuyến nghị 16GB)
- **Disk Space**: Tối thiểu 10GB trống

### Hệ Điều Hành
- Windows 10/11 (WSL2 recommended)
- macOS 10.15+
- Linux (Ubuntu 20.04+, Debian, CentOS)

---

## 📦 Cài Đặt

### Bước 1: Clone Repository

```bash
git clone https://github.com/hungpptit/chatbot-toeic.git
cd chatbot-toeic
```

### Bước 2: Chuẩn Bị File Cấu Hình

Tạo file `.env` trong thư mục gốc:

```bash
# Windows PowerShell
New-Item -Path .env -ItemType File

# Linux/macOS
touch .env
```

### Bước 3: Cấu Hình Biến Môi Trường

Mở file `.env` và thêm nội dung sau (điều chỉnh theo môi trường của bạn):

```env
# Database Configuration
DB_USERNAME=sa
DB_PASS=YourStrong@Passw0rd
DB_NAME=ChatbotToeic
DB_HOST=mssql
DB_PORT=1433

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration (cho upload media)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google AI API
GOOGLE_API_KEY=your-google-gemini-api-key

# OpenAI API (optional)
OPENAI_API_KEY=your-openai-api-key

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email Configuration (cho reset password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Node Environment
NODE_ENV=production

# Port Configuration
BACKEND_PORT=8080
FRONTEND_PORT=5173
```

### Bước 4: Chuẩn Bị Database Backup (Optional)

Nếu bạn có file backup database (.bak), đặt vào:
```
mssql/backup/ChatbotToeic.bak
```

---

## 🚀 Chạy Ứng Dụng

### Phương Án 1: Sử Dụng Docker (Khuyến Nghị) ⭐

Docker sẽ tự động build và chạy tất cả các service (Database, Backend, Frontend).

#### Khởi động tất cả services:

```bash
docker-compose up -d
```

Lệnh này sẽ:
1. ✅ Build Docker images cho Backend, Frontend, và Database
2. ✅ Khởi tạo SQL Server database
3. ✅ Restore database từ backup (nếu có)
4. ✅ Chạy backend server trên port 8080
5. ✅ Chạy frontend trên port 5173

#### Kiểm tra trạng thái:

```bash
docker-compose ps
```

#### Xem logs:

```bash
# Tất cả services
docker-compose logs -f

# Chỉ backend
docker-compose logs -f backend

# Chỉ frontend
docker-compose logs -f frontend

# Chỉ database
docker-compose logs -f mssql
```

#### Dừng services:

```bash
docker-compose down
```

#### Dừng và xóa volumes (xóa database):

```bash
docker-compose down -v
```

#### Rebuild sau khi thay đổi code:

```bash
# Rebuild tất cả
docker-compose up -d --build

# Rebuild chỉ backend
docker-compose up -d --build backend

# Rebuild chỉ frontend
docker-compose up -d --build frontend
```

---

### Phương Án 2: Chạy Development Mode (Không dùng Docker)

#### A. Cài Đặt SQL Server

Cài đặt SQL Server riêng hoặc sử dụng SQL Server container:

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
   -p 1433:1433 --name sql_server \
   -d mcr.microsoft.com/mssql/server:2022-latest
```

#### B. Setup Backend

```bash
cd chatbot-toeic-backend

# Cài đặt dependencies
npm install

# Chạy database migrations (nếu có)
# npm run migrate

# Chạy development server
npm run dev

# Hoặc production mode
npm start
```

Backend sẽ chạy tại: `http://localhost:8080`

#### C. Setup Frontend

Mở terminal mới:

```bash
cd chatbot-toeic-frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## 🌐 Truy Cập Ứng Dụng

Sau khi khởi động thành công:

- **Frontend (User Interface)**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Health Check**: http://localhost:8080/health (nếu có)

### Demo Online

Truy cập phiên bản demo tại: 👉 [https://hungptit.dev](https://hungptit.dev)

### Tài Khoản Mặc Định

Nếu database được seed với dữ liệu mẫu:

**Admin:**
- Email: `admin@toeic.com`
- Password: `admin123`

**User:**
- Email: `user@toeic.com`
- Password: `user123`

---

## 📁 Cấu Trúc Dự Án

```
chatbot-toeic/
│
├── chatbot-toeic-backend/          # Backend Node.js/Express
│   ├── src/
│   │   ├── config/                 # Database & app configuration
│   │   ├── controllers/            # Route controllers
│   │   ├── models/                 # Sequelize models
│   │   ├── routes/                 # API routes
│   │   ├── services/               # Business logic
│   │   ├── middleware/             # Express middleware
│   │   ├── utils/                  # Utility functions
│   │   ├── cronJobs/               # Scheduled tasks
│   │   └── server.js               # Entry point
│   │
│   ├── ml/                         # Machine Learning
│   │   ├── train_model.py          # Model training script
│   │   ├── predict_unified.py      # Prediction script
│   │   └── model/                  # Trained models (.pkl, .onnx)
│   │
│   ├── migrations/                 # Database migrations
│   ├── Dockerfile
│   ├── package.json
│   └── wait-for-db.sh             # DB initialization script
│
├── chatbot-toeic-frontend/         # Frontend React/TypeScript
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   ├── pages/                  # Page components
│   │   ├── layouts/                # Layout components
│   │   ├── services/               # API services
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── utils/                  # Utility functions
│   │   ├── styles/                 # CSS/styling
│   │   ├── App.tsx                 # Root component
│   │   └── main.tsx                # Entry point
│   │
│   ├── public/                     # Static assets
│   ├── Dockerfile
│   ├── nginx.conf                  # Nginx configuration
│   ├── package.json
│   └── vite.config.ts
│
├── mssql/                          # Database setup
│   ├── backup/                     # Database backup files
│   ├── init/                       # Initialization scripts
│   ├── Dockerfile
│   └── restore.sql
│
├── docker-compose.yml              # Docker orchestration
├── .env                            # Environment variables (create this)
├── .gitignore
└── README.md                       # This file
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Đăng ký tài khoản mới |
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/logout` | Đăng xuất |
| POST | `/auth/refresh-token` | Refresh JWT token |
| POST | `/auth/forgot-password` | Quên mật khẩu |
| POST | `/auth/reset-password` | Reset mật khẩu |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Lấy thông tin profile |
| PUT | `/users/profile` | Cập nhật profile |
| GET | `/users/history` | Lịch sử làm bài |
| GET | `/users/statistics` | Thống kê học tập |

### Test Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tests` | Lấy danh sách bài test |
| GET | `/tests/:id` | Chi tiết bài test |
| POST | `/tests` | Tạo bài test mới (Admin) |
| PUT | `/tests/:id` | Cập nhật bài test (Admin) |
| DELETE | `/tests/:id` | Xóa bài test (Admin) |
| POST | `/tests/:id/submit` | Nộp bài test |

### Chatbot Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chatbot/message` | Gửi tin nhắn cho chatbot |
| GET | `/chatbot/history` | Lịch sử chat |
| DELETE | `/chatbot/history` | Xóa lịch sử chat |

### ML Prediction Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ml/predict` | Dự đoán điểm TOEIC |
| GET | `/ml/user-predictions` | Lịch sử dự đoán |

### Media Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/media/upload` | Upload file audio/image |
| GET | `/media/:id` | Lấy thông tin media |
| DELETE | `/media/:id` | Xóa media file |

---

## ✨ Tính Năng Chính

### 1. 👤 Quản Lý Người Dùng
- Đăng ký, đăng nhập, quên mật khẩu
- Phân quyền: Admin, User
- Google OAuth login
- Profile management

### 2. 📝 Hệ Thống Bài Test
- **Listening Test**: 4 parts (Photographs, Q&A, Conversations, Talks)
- **Reading Test**: 3 parts (Incomplete Sentences, Text Completion, Reading Comprehension)
- **Mixed Test**: Kết hợp Listening + Reading
- Tự động chấm điểm
- Xem đáp án và giải thích

### 3. 🤖 AI Chatbot
- Hỏi đáp về từ vựng, ngữ pháp TOEIC
- Tích hợp Google Gemini AI
- Lưu lịch sử chat
- Context-aware conversations

### 4. 📊 Machine Learning Prediction
- Dự đoán điểm TOEIC dựa trên:
  - Lịch sử làm bài
  - Thời gian làm bài
  - Tỷ lệ đúng/sai theo part
  - Xu hướng học tập
- Visualize kết quả bằng biểu đồ

### 5. 📈 Theo Dõi Tiến Độ
- Dashboard với biểu đồ
- Phân tích điểm mạnh/yếu
- Lịch sử làm bài chi tiết
- So sánh tiến độ theo thời gian

### 6. 🎧 Media Management
- Upload audio cho Listening test
- Upload hình ảnh cho câu hỏi
- Cloud storage (Cloudinary)
- Tự động detect duration audio

### 7. 👨‍💼 Admin Panel
- Quản lý users
- Tạo/sửa/xóa bài test
- Upload batch questions
- Xem thống kê hệ thống

---

## 🐛 Troubleshooting

### 1. Docker Container Không Khởi Động

**Kiểm tra logs:**
```bash
docker-compose logs backend
docker-compose logs mssql
```

**Giải pháp:**
- Đảm bảo port 8080, 5173, 1433 không bị chiếm
- Kiểm tra file `.env` đã cấu hình đúng
- Restart Docker Desktop

### 2. Database Connection Error

**Lỗi:** `Cannot connect to SQL Server`

**Giải pháp:**
```bash
# Kiểm tra SQL Server container
docker exec -it mssql_server_dev /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd' -Q "SELECT @@VERSION"

# Nếu lỗi, restart container
docker-compose restart mssql

# Đợi database khởi tạo (30-60 giây)
docker-compose logs -f mssql
```

### 3. Frontend Không Kết Nối Backend

**Kiểm tra:**
- Backend có đang chạy: http://localhost:8080
- Kiểm tra CORS settings trong backend
- Xem browser console (F12) để debug

**File cấu hình API trong frontend:**
```typescript
// src/services/api.ts
const API_BASE_URL = 'http://localhost:8080/api';
```

### 4. ML Prediction Không Hoạt Động

**Yêu cầu:**
- Python 3.8+ installed
- Trained model files trong `ml/model/`

**Train model:**
```bash
cd chatbot-toeic-backend/ml
pip install -r requirements.txt
python train_unified_model.py
```

### 5. Cloudinary Upload Lỗi

**Kiểm tra:**
- File `.env` có đầy đủ: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Tạo tài khoản miễn phí tại: https://cloudinary.com

### 6. Port Already in Use

```bash
# Windows - Kill process on port
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:8080 | xargs kill -9
```

### 7. Rebuild Clean

Nếu gặp lỗi lạ, thử rebuild hoàn toàn:

```bash
# Stop và xóa containers + volumes
docker-compose down -v

# Xóa images cũ
docker rmi chatbot-toeic-backend chatbot-toeic-frontend

# Rebuild từ đầu
docker-compose up -d --build
```

---

## 🔐 Security Notes

### Production Deployment

1. **Đổi JWT_SECRET** trong `.env`
2. **Đổi DB_PASS** mạnh hơn
3. **Enable HTTPS** (sử dụng Let's Encrypt)
4. **Setup Firewall** rules
5. **Environment Variables**: Không commit file `.env` lên Git
6. **Database Backup**: Setup automated backup
7. **Rate Limiting**: Enable trong Express middleware
8. **SQL Injection**: Đã protect bằng Sequelize ORM
9. **XSS Protection**: React tự động escape
10. **CORS**: Cấu hình allowed origins cụ thể

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra [Troubleshooting](#-troubleshooting)
2. Xem logs: `docker-compose logs -f`
3. Tạo issue trên GitHub
4. Contact: phamtuanhung9a5@gmail.com

---

## 📄 License

MIT License - Tự do sử dụng cho mục đích học tập và nghiên cứu.

---

## 👥 Contributors

- **Phát triển**: Phạm Tuấn Hùng
- **Trường**: Học viện Công nghệ Bưu chính Viễn thông (PTIT)
- **Email**: phamtuanhung9a5@gmail.com

---

## 🎓 Dành Cho Giáo Viên

### Các Điểm Nổi Bật Của Dự Án:

1. ✅ **Full-stack Application** với kiến trúc microservices
2. ✅ **Docker Containerization** - Deploy dễ dàng
3. ✅ **AI Integration** - Google Gemini API
4. ✅ **Machine Learning** - Dự đoán điểm số
5. ✅ **Modern Frontend** - React 19 + TypeScript + Vite
6. ✅ **RESTful API Design** - Express.js best practices
7. ✅ **Database Design** - SQL Server + Sequelize ORM
8. ✅ **Authentication & Authorization** - JWT + Role-based
9. ✅ **Cloud Storage** - Cloudinary integration
10. ✅ **Real-time Features** - Caching with Redis

### Chạy Demo Nhanh:

```bash
# Clone và chạy chỉ với 3 lệnh
git clone https://github.com/hungpptit/chatbot-toeic.git
cd chatbot-toeic
docker-compose up -d

# Đợi 2 phút để khởi tạo database
# Truy cập: http://localhost:5173
```

---

**📅 Last Updated:** November 5, 2025  
**🔖 Version:** 1.0.0  
**⭐ Star this repo if you find it helpful!**
