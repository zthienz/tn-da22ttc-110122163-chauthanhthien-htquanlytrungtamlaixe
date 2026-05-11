<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HocVienController;
use App\Http\Controllers\KhoaHocController;
use App\Http\Controllers\LopHocController;
use App\Http\Controllers\LichHocController;
use App\Http\Controllers\ThiController;
use App\Http\Controllers\HocPhiController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\DangKyController;
use App\Http\Controllers\GiangVienController;
use App\Http\Controllers\XeController;

// ═══════════════════════════════════════════════════════
// PUBLIC
// ═══════════════════════════════════════════════════════

// Đăng nhập học viên (CCCD + ngày sinh)
Route::post('/auth/login',       [AuthController::class, 'loginHocVien']);

// Đăng nhập admin/giảng viên (email + password)
Route::post('/admin/login',      [AuthController::class, 'adminLogin']);

// Khóa học public (trang quảng bá)
Route::get('/khoa-hoc',          [KhoaHocController::class, 'publicIndex']);

// Đăng ký tư vấn từ trang quảng bá (tạo hồ sơ online)
Route::post('/dang-ky-tu-van',   [DangKyController::class, 'dangKyTuVan']);

// ═══════════════════════════════════════════════════════
// HỌC VIÊN (cần đăng nhập)
// ═══════════════════════════════════════════════════════
Route::middleware('auth.jwt')->group(function () {
    Route::get('/auth/me',                  [AuthController::class, 'me']);
    Route::post('/auth/doi-mat-khau',       [AuthController::class, 'doiMatKhau']);

    // Hồ sơ & tiến độ
    Route::get('/hoc-vien/profile',         [HocVienController::class, 'profile']);
    Route::put('/hoc-vien/profile',         [HocVienController::class, 'updateProfile']);
    Route::get('/hoc-vien/summary',         [HocVienController::class, 'summary']);
    Route::get('/hoc-vien/lich-hoc',        [HocVienController::class, 'myLichHoc']);
    Route::get('/hoc-vien/tien-do',         [HocVienController::class, 'tienDo']);
    Route::get('/hoc-vien/giang-vien',      [HocVienController::class, 'myGiangVien']);

    // Kết quả thi & chứng chỉ
    Route::get('/thi/ket-qua/my',           [ThiController::class, 'myKetQua']);
    Route::get('/thi/chung-chi/my',         [ThiController::class, 'myChungChi']);

    // Học phí
    Route::get('/hoc-phi/my',               [HocPhiController::class, 'myHocPhi']);
});

// ═══════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════
Route::middleware(['auth.jwt', 'role:admin|giang_vien'])->prefix('admin')->group(function () {

    // Dashboard
    Route::get('/dashboard',                [AdminController::class, 'dashboard']);

    // ── Hồ sơ học viên ──────────────────────────────────────────────────────
    Route::get('/ho-so',                    [AdminController::class, 'hoSoList']);
    Route::get('/ho-so/{id}',               [AdminController::class, 'hoSoDetail']);
    Route::post('/ho-so',                   [AdminController::class, 'taoHoSoOffline']);
    Route::patch('/ho-so/{id}/trang-thai',  [AdminController::class, 'capNhatTrangThai']);

    // Ghi nhận học phí
    Route::post('/ho-so/{id}/hoc-phi',      [AdminController::class, 'ghiNhanHocPhi']);

    // Tạo tài khoản học viên (sau khi đóng học phí)
    Route::post('/ho-so/{id}/tao-tai-khoan',        [AdminController::class, 'taoTaiKhoanHocVien']);

    // Xếp lớp + tạo tài khoản cùng lúc
    Route::post('/ho-so/{id}/xep-lop',              [AdminController::class, 'xepLopVaTaoTaiKhoan']);

    // Reset mật khẩu về mặc định (CCCD + ngày sinh)
    Route::post('/ho-so/{id}/reset-mat-khau',       [AdminController::class, 'resetMatKhauHocVien']);

    // ── Khóa học ────────────────────────────────────────────────────────────
    Route::get('/khoa-hoc',                 [KhoaHocController::class, 'index']);
    Route::post('/khoa-hoc',                [KhoaHocController::class, 'store']);
    Route::put('/khoa-hoc/{id}',            [KhoaHocController::class, 'update']);
    Route::delete('/khoa-hoc/{id}',         [KhoaHocController::class, 'destroy']);

    // ── Lớp học ─────────────────────────────────────────────────────────────
    Route::get('/lop-hoc',                  [LopHocController::class, 'index']);
    Route::get('/lop-hoc/{id}',             [LopHocController::class, 'show']);
    Route::post('/lop-hoc',                 [LopHocController::class, 'store']);
    Route::put('/lop-hoc/{id}',             [LopHocController::class, 'update']);
    Route::delete('/lop-hoc/{id}',          [LopHocController::class, 'destroy']);

    // ── Lịch học ────────────────────────────────────────────────────────────
    Route::get('/lich-hoc',                 [LichHocController::class, 'index']);
    Route::post('/lich-hoc',                [LichHocController::class, 'store']);
    Route::put('/lich-hoc/{id}',            [LichHocController::class, 'update']);
    Route::delete('/lich-hoc/{id}',         [LichHocController::class, 'destroy']);
    Route::get('/lich-hoc/{id}/diem-danh',  [LichHocController::class, 'getDiemDanh']);
    Route::post('/lich-hoc/{id}/diem-danh', [LichHocController::class, 'diemDanh']);

    // ── Thi ─────────────────────────────────────────────────────────────────
    Route::get('/lich-thi',                 [ThiController::class, 'indexLichThi']);
    Route::post('/lich-thi',                [ThiController::class, 'storeLichThi']);
    Route::put('/lich-thi/{id}',            [ThiController::class, 'updateLichThi']);
    Route::delete('/lich-thi/{id}',         [ThiController::class, 'destroyLichThi']);
    Route::post('/lich-thi/{id}/ket-qua',   [ThiController::class, 'nhapKetQua']);
    Route::post('/chung-chi',               [ThiController::class, 'capChungChi']);

    // ── Học phí ─────────────────────────────────────────────────────────────
    Route::get('/hoc-phi',                  [HocPhiController::class, 'index']);

    // ── Giảng viên ──────────────────────────────────────────────────────────
    Route::get('/giang-vien',               [AdminController::class, 'giangVienList']);
    Route::post('/giang-vien',              [AdminController::class, 'taoGiangVien']);
    Route::patch('/users/{id}/toggle',      [AdminController::class, 'toggleUser']);

    // ── Xe ──────────────────────────────────────────────────────────────────
    Route::get('/xe',                       [XeController::class, 'index']);
    Route::get('/xe/san-sang',              [XeController::class, 'xeSanSang']);
    Route::get('/xe/{id}',                  [XeController::class, 'show']);
    Route::post('/xe',                      [XeController::class, 'store']);
    Route::put('/xe/{id}',                  [XeController::class, 'update']);
    Route::delete('/xe/{id}',               [XeController::class, 'destroy']);
    Route::patch('/xe/{id}/trang-thai',     [XeController::class, 'capNhatTrangThai']);
    Route::patch('/xe/{id}/km',             [XeController::class, 'capNhatKm']);
    Route::patch('/lich-hoc/{id}/phan-xe',  [XeController::class, 'phanXeChoLichHoc']);

    // ── Báo lỗi xe (admin xem & xử lý) ─────────────────────────────────────
    Route::get('/bao-loi-xe',               [XeController::class, 'danhSachBaoLoi']);
    Route::patch('/bao-loi-xe/{id}/xu-ly',  [XeController::class, 'xuLyBaoLoi']);
});

// ═══════════════════════════════════════════════════════
// GIẢNG VIÊN
// ═══════════════════════════════════════════════════════
Route::middleware(['auth.jwt', 'role:giang_vien'])->prefix('giang-vien')->group(function () {
    Route::get('/thong-tin',                [GiangVienController::class, 'thongTin']);
    Route::get('/lop-cua-toi',              [GiangVienController::class, 'lopCuaToi']);
    Route::get('/lich-hom-nay',             [GiangVienController::class, 'lichHomNay']);
    Route::get('/lop/{lopId}/hoc-vien',     [GiangVienController::class, 'hocVienTrongLop']);
    Route::get('/lop/{lopId}/lich-hoc',     [GiangVienController::class, 'lichHocCuaLop']);

    // Xe
    Route::get('/xe-cua-toi',               [XeController::class, 'xeCuaToi']);
    Route::post('/bao-loi-xe',              [XeController::class, 'baoBaoLoi']);
    Route::get('/bao-loi-xe',               [XeController::class, 'lichSuBaoLoi']);
});
