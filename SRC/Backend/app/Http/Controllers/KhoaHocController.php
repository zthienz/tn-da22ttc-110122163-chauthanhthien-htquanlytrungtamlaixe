<?php

namespace App\Http\Controllers;

use App\Models\KhoaHoc;
use Illuminate\Http\Request;

class KhoaHocController extends Controller
{
    // Thứ tự hiển thị từ thấp đến cao
    private const BANG_ORDER = ['A1','A','B1','B2','C1','C','D','E','CE'];

    private function sortByBang($collection)
    {
        return $collection->sortBy(fn($k) =>
            array_search($k->loai_bang, self::BANG_ORDER) !== false
                ? array_search($k->loai_bang, self::BANG_ORDER)
                : 99
        )->values();
    }

    // Public: Danh sách loại bằng lái (cho trang quảng bá) — chỉ loại bằng thuần
    public function publicIndex()
    {
        $khoaHoc = $this->sortByBang(
            KhoaHoc::where('is_active', true)
                ->whereNull('thang')
                ->get()
        );
        return response()->json(['success' => true, 'data' => $khoaHoc]);
    }

    // Admin: Danh sách tất cả loại bằng lái (không phải khóa học đào tạo theo tháng)
    public function index()
    {
        $khoaHoc = $this->sortByBang(
            KhoaHoc::withCount('lopHoc')
                ->whereNull('thang')   // chỉ lấy loại bằng lái thuần, không lấy khóa học theo tháng
                ->get()
        );
        return response()->json(['success' => true, 'data' => $khoaHoc]);
    }

    // Admin: Tạo mới
    public function store(Request $request)
    {
        $request->validate([
            'ten_khoa'  => 'required|string|max:150',
            'loai_bang' => 'required|in:A1,A,B1,B2,C1,C,D,E,CE',
            'hoc_phi'   => 'required|numeric|min:0',
        ]);

        $khoaHoc = KhoaHoc::create($request->all());
        return response()->json(['success' => true, 'message' => 'Tạo khóa học thành công', 'data' => $khoaHoc], 201);
    }

    // Admin: Cập nhật
    public function update(Request $request, $id)
    {
        $khoaHoc = KhoaHoc::findOrFail($id);
        $khoaHoc->update($request->all());
        return response()->json(['success' => true, 'message' => 'Cập nhật thành công', 'data' => $khoaHoc]);
    }

    // Admin: Xóa
    public function destroy($id)
    {
        KhoaHoc::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa khóa học']);
    }
}
