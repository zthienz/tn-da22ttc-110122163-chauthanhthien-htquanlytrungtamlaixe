<?php

namespace App\Http\Controllers;

use App\Models\LichHoc;
use App\Models\DiemDanh;
use App\Models\DangKy;
use Illuminate\Http\Request;

class LichHocController extends Controller
{
    // Admin: Lấy lịch học theo lớp
    public function index(Request $request)
    {
        $query = LichHoc::with('lopHoc.khoaHoc', 'xe')
            ->when($request->lop_hoc_id, fn($q) => $q->where('lop_hoc_id', $request->lop_hoc_id))
            ->when($request->from, fn($q) => $q->where('ngay_hoc', '>=', $request->from))
            ->when($request->to,   fn($q) => $q->where('ngay_hoc', '<=', $request->to))
            ->orderBy('ngay_hoc')->orderBy('gio_bat_dau');

        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    // Admin: Tạo buổi học
    public function store(Request $request)
    {
        $request->validate([
            'lop_hoc_id'  => 'required|exists:lop_hoc,id',
            'ngay_hoc'    => 'required|date',
            'gio_bat_dau' => 'required',
            'gio_ket_thuc' => 'required',
            'loai_buoi'   => 'required|in:ly_thuyet,thuc_hanh',
            'xe_id'       => 'nullable|exists:xe,id',
        ]);

        $lichHoc = LichHoc::create($request->all());
        return response()->json(['success' => true, 'message' => 'Tạo lịch học thành công', 'data' => $lichHoc], 201);
    }

    // Admin: Cập nhật buổi học
    public function update(Request $request, $id)
    {
        $lichHoc = LichHoc::findOrFail($id);
        $lichHoc->update($request->all());
        return response()->json(['success' => true, 'message' => 'Cập nhật thành công']);
    }

    // Admin: Xóa buổi học
    public function destroy($id)
    {
        LichHoc::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa buổi học']);
    }

    // Giáo viên/Admin: Điểm danh
    public function diemDanh(Request $request, $lichHocId)
    {
        $request->validate([
            'diem_danh' => 'required|array',
            'diem_danh.*.hoc_vien_id' => 'required|exists:hoc_vien,id',
            'diem_danh.*.co_mat'      => 'required|boolean',
        ]);

        foreach ($request->diem_danh as $dd) {
            DiemDanh::updateOrCreate(
                ['lich_hoc_id' => $lichHocId, 'hoc_vien_id' => $dd['hoc_vien_id']],
                ['co_mat' => $dd['co_mat'], 'ghi_chu' => $dd['ghi_chu'] ?? null]
            );
        }

        return response()->json(['success' => true, 'message' => 'Điểm danh thành công']);
    }

    // Lấy danh sách điểm danh của 1 buổi học
    public function getDiemDanh($lichHocId)
    {
        $lichHoc = LichHoc::with('lopHoc')->findOrFail($lichHocId);

        // Lấy tất cả học viên trong lớp
        $hocVienIds = DangKy::where('lop_hoc_id', $lichHoc->lop_hoc_id)
            ->where('trang_thai', 'da_duyet')
            ->with('hocVien.user')
            ->get();

        $diemDanh = DiemDanh::where('lich_hoc_id', $lichHocId)
            ->pluck('co_mat', 'hoc_vien_id');

        $result = $hocVienIds->map(fn($dk) => [
            'hoc_vien_id' => $dk->hoc_vien_id,
            'ho_ten'      => $dk->hocVien->user->ho_ten ?? '',
            'co_mat'      => $diemDanh[$dk->hoc_vien_id] ?? false,
        ]);

        return response()->json(['success' => true, 'data' => $result, 'lich_hoc' => $lichHoc]);
    }
}
