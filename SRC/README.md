# Hệ Thống Quản Lý Đào Tạo Lái Xe – Trung Tâm Sao Việt

Đồ án tốt nghiệp – Sinh viên: Châu Thành Thiện (MSSV: 110122163)

---

## Giới thiệu

Hệ thống quản lý toàn diện cho trung tâm đào tạo lái xe, bao gồm 5 ứng dụng độc lập giao tiếp qua một REST API dùng chung. Hệ thống hỗ trợ 4 nhóm người dùng: quản trị viên, giảng viên, học viên và khách truy cập.

---

## Kiến trúc hệ thống

```
SRC/
├── Backend/      → Laravel 12 (PHP 8.2)  – REST API       – Port 8000
├── Admin/        → React 19 + Vite       – Quản trị viên  – Port 5173
├── Frontend/     → React 19 + Vite       – Trang quảng bá – Port 5174
├── User/         → React 19 + Vite       – Cổng học viên  – Port 5175
└── Teacher/      → React 19 + Vite       – Cổng giảng viên– Port 5176
```

---

## Technology Stack

### Backend
| Thành phần | Công nghệ |
|---|---|
| Framework | Laravel 12 |
| Ngôn ngữ | PHP 8.2 |
| Xác thực | JWT (`tymon/jwt-auth`) + Laravel Sanctum |
| Database | MySQL |
| Mail | SMTP Gmail (PHPMailer + Laravel Mailer) |
| Queue / Cache | Database driver |
| AI | Google Gemini API |

### Frontend (tất cả 4 ứng dụng React)
| Thư viện | Phiên bản | Dùng ở |
|---|---|---|
| React | 19.1 | Tất cả |
| Vite | 6.3 | Tất cả |
| React Router DOM | 7.6 | Tất cả |
| Axios | 1.9 | Tất cả |
| React Toastify | 11.0 | Tất cả |
| React Icons | 5.5 | Tất cả |
| Recharts | 2.15 | Admin, User |
| jsPDF + jsPDF-autotable + html2canvas | 4.x / 5.x / 1.4 | Admin |
| @google/genai + @google/generative-ai | 2.x / 0.24 | Admin |

---

## Phân quyền

| Role | Ứng dụng | Port | Mô tả |
|---|---|---|---|
| Admin | Admin | 5173 | Toàn quyền quản lý hệ thống |
| Giảng viên | Admin / Teacher | 5173 / 5176 | Quản lý lớp, điểm danh, xe |
| Học viên | User | 5175 | Xem lịch học, kết quả thi, học phí |
| Khách | Frontend | 5174 | Xem khóa học, đăng ký tư vấn, liên hệ |

### Cơ chế đăng nhập
- **Admin / Giảng viên:** Email + mật khẩu
- **Học viên:** Số CCCD + ngày sinh

---

## Chức năng chính

### Admin (port 5173)

**Dành cho quản trị viên:**
- Dashboard: thống kê tổng quan, biểu đồ doanh thu, học viên, kết quả thi
- Hồ sơ học viên: tạo mới (offline & online), cập nhật, xóa, upload ảnh thẻ, duyệt trạng thái
- Học phí: ghi nhận, thu phí thi lại
- Tạo tài khoản học viên sau khi đóng học phí
- Xếp lớp học viên
- Khóa học đào tạo: quản lý theo tháng/năm, tạo lớp, phân học viên, phân xe
- Lớp học: CRUD, đồng bộ trạng thái, khai giảng
- Lịch học: CRUD, điểm danh
- Thi: lịch thi, nhập kết quả, thêm/xóa học viên dự thi, cấp chứng chỉ
- Bài thi: cấu hình điểm đạt/điểm tối đa theo hạng bằng
- Cấp bằng: bằng tốt nghiệp + bằng lái xe
- Giảng viên: CRUD, kích hoạt/vô hiệu hóa
- Xe: CRUD, quản lý số km, trạng thái, phân xe cho lịch học, xử lý báo lỗi
- Liên hệ: xem và xử lý yêu cầu từ khách
- AI Assistant: tích hợp Google Gemini trực tiếp trên giao diện
- Xuất PDF: báo cáo & danh sách

**Dành cho giảng viên (trong app Admin):**
- Thông tin cá nhân
- Lớp của tôi (danh sách học viên)
- Lịch dạy theo tuần
- Điểm danh
- Xe của tôi + báo lỗi xe

### Frontend – Trang quảng bá (port 5174)
- Trang chủ
- Danh sách khóa học + trang chi tiết theo slug
- Đăng ký tư vấn (tạo hồ sơ online)
- Tin tức
- Liên hệ

### User – Cổng học viên (port 5175)
- Dashboard: tổng quan tiến độ học
- Lịch học
- Tiến độ học tập
- Kết quả thi + chứng chỉ
- Học phí
- Hồ sơ cá nhân

### Teacher – Cổng giảng viên (port 5176)
- Dashboard
- Thông tin cá nhân
- Danh sách lớp học
- Lịch dạy
- Xe của tôi

---

## Yêu cầu hệ thống

- PHP >= 8.2
- Composer >= 2.x
- Node.js >= 18.x + npm >= 9.x
- MySQL >= 8.0
- Git

---

## Cài đặt & Chạy

### 1. Clone dự án

```bash
git clone <repository-url>
cd ChauThanhThien-DoAnTotNghiep/SRC
```

### 2. Backend (Laravel) – Port 8000

```bash
cd Backend

# Sao chép file cấu hình
cp .env.example .env

# Chỉnh sửa .env — cấu hình database MySQL
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=truonglai_db
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Cài dependencies
composer install

# Tạo khóa ứng dụng
php artisan key:generate

# Tạo khóa JWT
php artisan jwt:secret

# Chạy migration và seeder
php artisan migrate --seed

# Khởi động server
php artisan serve --port=8000
```

### 3. Admin – Port 5173

```bash
cd Admin

# Tạo file .env
cp .env.example .env   # hoặc tạo mới

# Thêm Gemini API Key vào .env
# VITE_API_URL=http://localhost:8000/api
# VITE_GEMINI_API_KEY=your_gemini_api_key

npm install
npm run dev   # → http://localhost:5173
```

### 4. Frontend – Trang quảng bá – Port 5174

```bash
cd Frontend

# VITE_API_URL=http://localhost:8000/api

npm install
npm run dev   # → http://localhost:5174
```

### 5. User – Cổng học viên – Port 5175

```bash
cd User

# VITE_API_URL=http://localhost:8000/api

npm install
npm run dev   # → http://localhost:5175
```

### 6. Teacher – Cổng giảng viên – Port 5176

```bash
cd Teacher

# VITE_API_URL=http://localhost:8000/api

npm install
npm run dev   # → http://localhost:5176
```

---

## Cấu hình .env Backend (các mục quan trọng)

```env
APP_NAME="Quan Ly Lai Xe"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=truonglai_db
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=          # sinh bằng: php artisan jwt:secret

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM_ADDRESS=your_email@gmail.com
MAIL_FROM_NAME="Trung Tâm Sao Việt"

# CORS – cho phép các frontend gọi API
FRONTEND_URL=http://localhost:5174
USER_URL=http://localhost:5175
TEACHER_URL=http://localhost:5176
```

---

## API Overview

Base URL: `http://localhost:8000/api`

| Nhóm | Prefix | Xác thực |
|---|---|---|
| Công khai | `/khoa-hoc`, `/dang-ky-tu-van`, `/lien-he` | Không |
| Học viên | `/auth/*`, `/hoc-vien/*`, `/thi/*`, `/hoc-phi/*` | JWT |
| Admin + Giảng viên | `/admin/*` | JWT + role |
| Giảng viên | `/giang-vien/*` | JWT + role |

Đăng nhập học viên: `POST /api/auth/login` (CCCD + ngày sinh)  
Đăng nhập admin/giảng viên: `POST /api/admin/login` (email + password)

---

## Build Production

```bash
# Backend
cd Backend
php artisan config:cache
php artisan route:cache
php artisan optimize

# Mỗi frontend app
npm run build   # tạo thư mục dist/
```

---

## Cấu trúc thư mục chi tiết

```
SRC/
├── Backend/
│   ├── app/
│   │   ├── Http/Controllers/    # AuthController, AdminController, HocVienController, ...
│   │   ├── Models/              # HocVien, GiangVien, LopHoc, Xe, ...
│   │   └── Middleware/          # JwtMiddleware, RoleMiddleware
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
│
├── Admin/
│   └── src/
│       ├── components/          # Layout, Navbar, Sidebar, AIAssistant
│       ├── context/             # AdminContext
│       └── pages/               # Dashboard, HoSo, LopHoc, Thi, Xe, GiangVien, ...
│
├── Frontend/
│   └── src/
│       ├── components/          # Navbar, Footer
│       └── pages/               # Home, KhoaHoc, DangKy, TinTuc, LienHe
│
├── User/
│   └── src/
│       ├── components/          # Layout
│       ├── context/             # UserContext
│       └── pages/               # Dashboard, LichHoc, TienDo, KetQuaThi, HocPhi, HoSo
│
└── Teacher/
    └── src/
        ├── components/          # Layout
        ├── context/             # TeacherContext
        └── pages/               # Dashboard, GVThongTin, GVLopHoc, GVLichHoc, GVXe
```

---

## Tác giả

**Châu Thành Thiện**  
MSSV: 110122163  
Đồ án tốt nghiệp – Hệ thống quản lý đào tạo lái xe  
Trung Tâm Sao Việt
