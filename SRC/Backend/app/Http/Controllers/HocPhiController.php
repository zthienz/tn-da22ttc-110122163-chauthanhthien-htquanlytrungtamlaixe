<?php

namespace App\Http\Controllers;

use App\Models\ThanhToanHocPhi;
use Illuminate\Http\Request;

class HocPhiController extends Controller
{
    // Admin: Danh sách tất cả giao dịch học phí
    public function index(Request $request)
    {
        $query = ThanhToanHocPhi::with([
                'hoSo.khoaHoc',
                'hoSo.hocVienLop.lopHoc.khoaHoc',
            ])
            ->where('loai_phi', 'hoc_phi')
            ->when($request->phuong_thuc, fn($q) => $q->where('phuong_thuc', $request->phuong_thuc))
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('hoSo', fn($s) =>
                    $s->where('ho_ten', 'like', "%{$request->search}%")
                      ->orWhere('so_cccd', 'like', "%{$request->search}%")
                );
            });

        return response()->json([
            'success' => true,
            'data'    => $query->latest()->get(),
        ]);
    }

    // User: Học phí của học viên (dùng cho cổng học viên)
    public function myHocPhi(Request $request)
    {
        $user = $request->auth_user;

        $data = ThanhToanHocPhi::with(['hoSo.khoaHoc'])
            ->whereHas('hoSo', fn($q) => $q->where('user_id', $user->id))
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $data]);
    }
}
