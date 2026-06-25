<?php

namespace App\Http\Controllers;

use App\Models\BaiThi;
use App\Models\KhoaHoc;
use Illuminate\Http\Request;

class BaiThiController extends Controller
{
    /**
     * Lấy danh sách tất cả bài thi, có thể lọc theo khoa_hoc_id.
     * Trả về kèm thông tin khóa học (loai_bang, ten_khoa).
     */
    public function index(Request $request)
    {
        $query = BaiThi::with('khoaHoc')
            ->when($request->khoa_hoc_id, fn($q) => $q->where('khoa_hoc_id', $request->khoa_hoc_id))
            ->when($request->loai_bang, function ($q) use ($request) {
                $khoaIds = KhoaHoc::where('loai_bang', $request->loai_bang)
                    ->whereNull('ma_khoa')
                    ->pluck('id');
                $q->whereIn('khoa_hoc_id', $khoaIds);
            })
            ->when($request->loai, fn($q) => $q->where('loai', $request->loai))
            ->orderBy('khoa_hoc_id')
            ->orderBy('loai')
            ->orderBy('thu_tu');

        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    /**
     * Lấy danh sách bài thi nhóm theo hạng bằng và loại thi.
     * Dùng cho trang quản lý tổng quan.
     */
    public function byLoaiBang()
    {
        // Chỉ lấy bài thi của khóa danh mục (không có ma_khoa)
        $baiThiList = BaiThi::with('khoaHoc')
            ->whereHas('khoaHoc', fn($q) => $q->whereNull('ma_khoa'))
            ->orderBy('khoa_hoc_id')
            ->orderBy('loai')
            ->orderBy('thu_tu')
            ->get();

        // Nhóm theo loai_bang → loai
        $grouped = [];
        foreach ($baiThiList as $b) {
            $loaiBang = $b->khoaHoc->loai_bang ?? '?';
            $loai     = $b->loai;
            if (!isset($grouped[$loaiBang])) {
                $grouped[$loaiBang] = [
                    'loai_bang'    => $loaiBang,
                    'khoa_hoc_id'  => $b->khoa_hoc_id,
                    'ten_khoa'     => $b->khoaHoc->ten_khoa ?? '—',
                    'tot_nghiep'   => [],
                    'sat_hanh'     => [],
                ];
            }
            $grouped[$loaiBang][$loai][] = $b;
        }

        return response()->json(['success' => true, 'data' => array_values($grouped)]);
    }

    /**
     * Tạo bài thi mới.
     */
    public function store(Request $request)
    {
        $request->validate([
            'khoa_hoc_id' => 'required|exists:khoa_hoc,id',
            'ten_bai_thi' => 'required|string|max:100',
            'loai'        => 'required|in:tot_nghiep,sat_hanh',
            'diem_dat'    => 'required|numeric|min:0',
            'diem_toi_da' => 'required|numeric|min:1',
            'phi_thi_lai' => 'nullable|numeric|min:0',
            'thu_tu'      => 'nullable|integer|min:1',
        ]);

        // Kiểm tra diem_dat <= diem_toi_da
        if ($request->diem_dat > $request->diem_toi_da) {
            return response()->json([
                'success' => false,
                'message' => 'Điểm đạt không thể lớn hơn điểm tối đa.',
            ], 422);
        }

        $baiThi = BaiThi::create([
            'khoa_hoc_id' => $request->khoa_hoc_id,
            'ten_bai_thi' => $request->ten_bai_thi,
            'loai'        => $request->loai,
            'diem_dat'    => $request->diem_dat,
            'diem_toi_da' => $request->diem_toi_da,
            'phi_thi_lai' => $request->phi_thi_lai ?? 0,
            'thu_tu'      => $request->thu_tu ?? 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo bài thi thành công',
            'data'    => $baiThi->load('khoaHoc'),
        ], 201);
    }

    /**
     * Cập nhật bài thi.
     */
    public function update(Request $request, $id)
    {
        $baiThi = BaiThi::findOrFail($id);

        $request->validate([
            'ten_bai_thi' => 'sometimes|required|string|max:100',
            'loai'        => 'sometimes|required|in:tot_nghiep,sat_hanh',
            'diem_dat'    => 'sometimes|required|numeric|min:0',
            'diem_toi_da' => 'sometimes|required|numeric|min:1',
            'phi_thi_lai' => 'nullable|numeric|min:0',
            'thu_tu'      => 'nullable|integer|min:1',
        ]);

        $diemDat    = $request->diem_dat    ?? $baiThi->diem_dat;
        $diemToiDa  = $request->diem_toi_da ?? $baiThi->diem_toi_da;

        if ($diemDat > $diemToiDa) {
            return response()->json([
                'success' => false,
                'message' => 'Điểm đạt không thể lớn hơn điểm tối đa.',
            ], 422);
        }

        $baiThi->update($request->only([
            'ten_bai_thi', 'loai', 'diem_dat', 'diem_toi_da', 'phi_thi_lai', 'thu_tu',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật bài thi thành công',
            'data'    => $baiThi->fresh('khoaHoc'),
        ]);
    }

    /**
     * Xóa bài thi.
     * Cảnh báo: chỉ xóa được nếu không có kết quả thi liên quan.
     */
    public function destroy($id)
    {
        $baiThi = BaiThi::findOrFail($id);

        // Kiểm tra có kết quả thi nào dùng bài thi này không
        $hasKetQua = \App\Models\KetQuaThi::where('bai_thi_id', $id)->exists();
        if ($hasKetQua) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa bài thi này vì đã có kết quả thi liên quan.',
            ], 422);
        }

        $baiThi->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa bài thi']);
    }
}
