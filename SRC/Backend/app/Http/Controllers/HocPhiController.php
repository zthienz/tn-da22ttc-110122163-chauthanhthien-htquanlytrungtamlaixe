<?php

namespace App\Http\Controllers;

use App\Models\HocPhi;
use App\Models\ThanhToan;
use Illuminate\Http\Request;

class HocPhiController extends Controller
{
    // Admin: Danh sách học phí
    public function index(Request $request)
    {
        $query = HocPhi::with(['hocVien.user', 'khoaHoc'])
            ->when($request->trang_thai, fn($q) => $q->where('trang_thai', $request->trang_thai))
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('hocVien.user', fn($u) => $u->where('ho_ten', 'like', "%{$request->search}%"));
            });

        return response()->json(['success' => true, 'data' => $query->latest()->get()]);
    }

    // Admin: Tạo học phí cho học viên
    public function store(Request $request)
    {
        $request->validate([
            'hoc_vien_id' => 'required|exists:hoc_vien,id',
            'khoa_hoc_id' => 'required|exists:khoa_hoc,id',
            'so_tien'     => 'required|numeric|min:0',
        ]);

        $hocPhi = HocPhi::create($request->all());
        return response()->json(['success' => true, 'message' => 'Tạo học phí thành công', 'data' => $hocPhi], 201);
    }

    // Admin: Ghi nhận thanh toán thủ công
    public function ghiThanhToan(Request $request, $hocPhiId)
    {
        $request->validate([
            'so_tien'     => 'required|numeric|min:1',
            'phuong_thuc' => 'required|in:tien_mat,chuyen_khoan,vnpay,momo',
        ]);

        $hocPhi = HocPhi::findOrFail($hocPhiId);

        $thanhtoan = ThanhToan::create([
            'hoc_phi_id'      => $hocPhiId,
            'so_tien'         => $request->so_tien,
            'phuong_thuc'     => $request->phuong_thuc,
            'ma_giao_dich'    => $request->ma_giao_dich ?? null,
            'trang_thai'      => 'thanh_cong',
            'ghi_chu'         => $request->ghi_chu ?? null,
            'ngay_thanh_toan' => now(),
        ]);

        // Cập nhật tổng đã thanh toán
        $tongDaTT = ThanhToan::where('hoc_phi_id', $hocPhiId)
            ->where('trang_thai', 'thanh_cong')->sum('so_tien');

        $trangThai = $tongDaTT >= $hocPhi->so_tien
            ? 'da_thanh_toan'
            : ($tongDaTT > 0 ? 'thanh_toan_mot_phan' : 'chua_thanh_toan');

        $hocPhi->update(['da_thanh_toan' => $tongDaTT, 'trang_thai' => $trangThai]);

        return response()->json(['success' => true, 'message' => 'Ghi nhận thanh toán thành công', 'data' => $thanhtoan]);
    }

    // User: Học phí của học viên
    public function myHocPhi(Request $request)
    {
        $user    = $request->auth_user;
        $hocVien = \App\Models\HocVien::where('user_id', $user->id)->firstOrFail();

        $hocPhi = HocPhi::with(['khoaHoc', 'thanhToan'])
            ->where('hoc_vien_id', $hocVien->id)
            ->latest()->get();

        return response()->json(['success' => true, 'data' => $hocPhi]);
    }
}
