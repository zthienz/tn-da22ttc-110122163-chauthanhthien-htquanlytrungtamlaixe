<?php

namespace App\Http\Controllers;

use App\Models\HoSoHocVien;
use App\Models\KhoaHoc;
use Illuminate\Http\Request;

class DangKyController extends Controller
{
    /**
     * Học viên đăng ký tư vấn từ trang quảng bá (online)
     * → Tạo hồ sơ với trạng thái "cho_dong_hoc_phi"
     * → Chưa có tài khoản, chờ admin xử lý
     */
    public function dangKyTuVan(Request $request)
    {
        $request->validate([
            'ho_ten'      => 'required|string|max:100',
            'dien_thoai'  => 'required|string|max:15',
            'khoa_hoc'    => 'required|string',
            'khu_vuc'     => 'nullable|string',
            'email'       => 'nullable|email',
            'ghi_chu'     => 'nullable|string',
        ]);

        // Tìm khóa học theo tên hoặc loại bằng
        $khoa = KhoaHoc::where('ten_khoa', 'like', '%' . $request->khoa_hoc . '%')
            ->orWhere('loai_bang', $request->khoa_hoc)
            ->first();

        // Tạo hồ sơ tư vấn (chưa có CCCD, ngày sinh — admin sẽ bổ sung)
        $hoSo = HoSoHocVien::create([
            'user_id'       => null,
            'khoa_hoc_id'   => $khoa?->id ?? null,
            'ho_ten'        => $request->ho_ten,
            'ngay_sinh'     => '2000-01-01', // placeholder, admin sẽ cập nhật
            'so_cccd'       => 'TV_' . time() . '_' . rand(1000, 9999), // tạm thời
            'so_dien_thoai' => $request->dien_thoai,
            'email'         => $request->email,
            'dia_chi'       => $request->khu_vuc,
            'nguon_dang_ky' => 'online',
            'trang_thai'    => 'cho_dong_hoc_phi',
            'trang_thai_hoc_phi' => 'chua_dong',
            'ghi_chu'       => "Khóa quan tâm: {$request->khoa_hoc}" . ($request->ghi_chu ? " | {$request->ghi_chu}" : ''),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký tư vấn thành công! Trung tâm sẽ liên hệ với bạn trong 24h.',
            'data'    => ['id' => $hoSo->id, 'ho_ten' => $hoSo->ho_ten],
        ], 201);
    }
}
