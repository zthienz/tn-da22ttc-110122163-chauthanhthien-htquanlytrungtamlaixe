<?php

namespace App\Http\Controllers;

use App\Models\LopHoc;
use Illuminate\Http\Request;

class LopHocController extends Controller
{
    public function index(Request $request)
    {
        $lop = LopHoc::with([
                'khoaHoc',
                'giangVienLyThuyet.user',
                'giangVienThucHanh.user',
            ])
            ->withCount('hocVienLop')
            ->when($request->trang_thai, fn($q) => $q->where('trang_thai', $request->trang_thai))
            ->latest()
            ->get()
            ->map(fn($l) => [
                'id'                       => $l->id,
                'ten_lop'                  => $l->ten_lop,
                'khoa_hoc_id'              => $l->khoa_hoc_id,
                'khoa_hoc'                 => $l->khoaHoc,
                'giang_vien_ly_thuyet_id'  => $l->giang_vien_ly_thuyet_id,
                'giang_vien_thuc_hanh_id'  => $l->giang_vien_thuc_hanh_id,
                'giang_vien_ly_thuyet'     => $l->giangVienLyThuyet,
                'giang_vien_thuc_hanh'     => $l->giangVienThucHanh,
                'ngay_khai_giang'          => $l->ngay_khai_giang?->format('Y-m-d'),
                'ngay_ket_thuc'            => $l->ngay_ket_thuc?->format('Y-m-d'),
                'si_so_toi_da'             => $l->si_so_toi_da,
                'trang_thai'               => $l->trang_thai,
                'ghi_chu'                  => $l->ghi_chu,
                'hoc_vien_count'           => $l->hoc_vien_lop_count,
            ]);

        return response()->json(['success' => true, 'data' => $lop]);
    }

    public function show($id)
    {
        $lop = LopHoc::with([
            'khoaHoc',
            'giangVienLyThuyet.user',
            'giangVienThucHanh.user',
            'hocVienLop.hoSo',
            'lichHoc',
        ])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $lop]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_lop'     => 'required|string|max:100',
            'khoa_hoc_id' => 'required|exists:khoa_hoc,id',
        ]);

        $lop = LopHoc::create([
            'khoa_hoc_id'             => $request->khoa_hoc_id,
            'ten_lop'                 => $request->ten_lop,
            'giang_vien_ly_thuyet_id' => $request->giang_vien_ly_thuyet_id ?: null,
            'giang_vien_thuc_hanh_id' => $request->giang_vien_thuc_hanh_id ?: null,
            'ngay_khai_giang'         => $request->ngay_khai_giang ?: null,
            'ngay_ket_thuc'           => $request->ngay_ket_thuc ?: null,
            'si_so_toi_da'            => $request->si_so_toi_da ?? 30,
            'trang_thai'              => 'chuan_bi',
            'ghi_chu'                 => $request->ghi_chu ?: null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo lớp học thành công',
            'data'    => $lop,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $lop = LopHoc::findOrFail($id);

        $lop->update([
            'ten_lop'                 => $request->ten_lop ?? $lop->ten_lop,
            'khoa_hoc_id'             => $request->khoa_hoc_id ?? $lop->khoa_hoc_id,
            'giang_vien_ly_thuyet_id' => $request->giang_vien_ly_thuyet_id ?: null,
            'giang_vien_thuc_hanh_id' => $request->giang_vien_thuc_hanh_id ?: null,
            'ngay_khai_giang'         => $request->ngay_khai_giang ?: $lop->ngay_khai_giang,
            'ngay_ket_thuc'           => $request->ngay_ket_thuc ?: $lop->ngay_ket_thuc,
            'si_so_toi_da'            => $request->si_so_toi_da ?? $lop->si_so_toi_da,
            'trang_thai'              => $request->trang_thai ?? $lop->trang_thai,
            'ghi_chu'                 => $request->ghi_chu ?? $lop->ghi_chu,
        ]);

        return response()->json(['success' => true, 'message' => 'Cập nhật lớp học thành công']);
    }

    public function destroy($id)
    {
        $lop = LopHoc::findOrFail($id);

        // Kiểm tra có học viên chưa
        if ($lop->hocVienLop()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa lớp đang có học viên',
            ], 400);
        }

        $lop->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa lớp học']);
    }
}
