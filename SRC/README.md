# Hệ Thống Quản Lý Đào Tạo Lái Xe

## Cấu trúc dự án

```
SRC/
├── Backend/     → Laravel (PHP) - REST API - Port 8000
├── Admin/       → React + Vite  - Quản trị viên - Port 5173
├── Frontend/    → React + Vite  - Trang quảng bá - Port 5174
└── User/        → React + Vite  - Cổng học viên  - Port 5175
```

## Cài đặt & Chạy

### Backend (Laravel)
```bash
cd Backend
# Cấu hình .env (DB, Mail, JWT)
php artisan jwt:secret
php artisan migrate
php artisan serve --port=8000
```

### Admin
```bash
cd Admin
npm install
npm run dev   # → http://localhost:5173
```

### Frontend (Trang quảng bá)
```bash
cd Frontend
npm install
npm run dev   # → http://localhost:5174
```

### User (Cổng học viên)
```bash
cd User
npm install
npm run dev   # → http://localhost:5175
```

## Phân quyền

| Role        | Truy cập |
|-------------|----------|
| Admin       | Toàn bộ hệ thống (port 5173) |
| Giáo viên   | Cập nhật buổi học, đánh giá (port 5173) |
| Học viên    | Xem lịch học, kết quả thi, thanh toán (port 5175) |
| Khách       | Xem thông tin khóa học (port 5174) |

## Database: MySQL
Tên database: `quan_ly_lai_xe`
