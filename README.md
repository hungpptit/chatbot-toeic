# 🎓 Chatbot TOEIC - Hệ thống Luyện Thi TOEIC Thông Minh

Hệ thống web application hỗ trợ học và luyện thi TOEIC với tích hợp AI Chatbot, Machine Learning dự đoán điểm số, và quản lý bài thi.

## � Hướng Dẫn Cài Đặt và Chạy

### Yêu Cầu Hệ Thống
- **Node.js** 20 trở lên
- **SQL Server** 2019 trở lên
- **RAM**: Tối thiểu 4GB (khuyến nghị 8GB)

### Cài Đặt

#### 1. Clone Repository
```bash
git clone https://github.com/hungpptit/chatbot-toeic.git
cd chatbot-toeic
```

#### 2. Cài Đặt Backend
```bash
cd chatbot-toeic-backend
npm install
```

#### 3. Cài Đặt Frontend
```bash
cd chatbot-toeic-frontend
npm install
```

### Chạy Ứng Dụng

#### Backend
```bash
cd chatbot-toeic-backend
npm run dev        # Development mode
# hoặc
npm start          # Production mode
```
Backend chạy tại: **http://localhost:8080**

#### Frontend
```bash
cd chatbot-toeic-frontend
npm run dev
```
Frontend chạy tại: **http://localhost:5173**



---

## 📋 Mục Lục

- [Tổng Quan](#-tổng-quan)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
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

### Backend
- **Node.js 20** + **Express 5** - Server framework
- **SQL Server (MSSQL)** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Media storage
- **Google Generative AI** - AI Chatbot integration
- **ONNX Runtime** - ML model inference
- **Node-cron** - Scheduled tasks

### Machine Learning
- **Python** - ML model training
- **scikit-learn** - ML algorithms
- **pandas** - Data processing

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
│   │   └── server.js               # Entry point
│   │
│   ├── ml/                         # Machine Learning
│   │   ├── train_model.py          # Model training script
│   │   ├── predict_unified.py      # Prediction script
│   │   └── model/                  # Trained models
│   │
│   └── package.json
│
├── chatbot-toeic-frontend/         # Frontend React/TypeScript
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API services
│   │   ├── App.tsx                 # Root component
│   │   └── main.tsx                # Entry point
│   │
│   └── package.json
│
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

### 1. Backend Không Khởi Động

**Giải pháp:**
- Kiểm tra port 8080 có bị chiếm không
- Đảm bảo đã cài đặt SQL Server và cấu hình đúng
- Kiểm tra file cấu hình database

### 2. Database Connection Error

**Giải pháp:**
- Kiểm tra SQL Server đang chạy
- Xác nhận thông tin kết nối database
- Kiểm tra firewall

### 3. Frontend Không Kết Nối Backend

**Kiểm tra:**
- Backend có đang chạy tại http://localhost:8080
- Xem browser console (F12) để debug
- Kiểm tra cấu hình API URL trong frontend

### 4. Port Already in Use

```bash
# Windows - Kill process on port
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:8080 | xargs kill -9
```

---



## 🔐 Security Notes

**Khuyến nghị cho Production:**
1. Đổi mật khẩu mạnh hơn
2. Enable HTTPS
3. Cấu hình Firewall
4. Backup database định kỳ
5. Không commit thông tin nhạy cảm lên Git

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra [Troubleshooting](#-troubleshooting)
2. Tạo issue trên GitHub
3. Contact: phamtuanhung9a5@gmail.com

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

1. ✅ **Full-stack Application** - Frontend + Backend + Database
2. ✅ **AI Integration** - Google Gemini API cho Chatbot
3. ✅ **Machine Learning** - Dự đoán điểm TOEIC
4. ✅ **Modern Tech Stack** - React 19 + TypeScript + Node.js 20
5. ✅ **RESTful API** - Express.js best practices
6. ✅ **Database Design** - SQL Server + Sequelize ORM
7. ✅ **Authentication** - JWT + Role-based authorization
8. ✅ **Cloud Storage** - Cloudinary integration
9. ✅ **Responsive UI** - Mobile-friendly design
10. ✅ **Real-time Features** - Interactive learning experience

---

**📅 Last Updated:** November 5, 2025  
**🔖 Version:** 1.0.0  
**⭐ Star this repo if you find it helpful!**

