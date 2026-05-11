<?php

namespace App\Http\Controllers;

use App\Models\KhoaHoc;
use Illuminate\Http\Request;

class KhoaHocController extends Controller
{
    // Public: Danh sách khóa học (cho trang quảng bá)
    public function publicIndex()
    {
        $khoaHoc = KhoaHoc::where('is_active', true)->latest()->get();
        return response()->json(['success' => true, 'data' => $khoaHoc]);
    }

    // Admin: Danh sách tất cả
    public function index()
    {
        $khoaHoc = KhoaHoc::withCount('lopHoc')->latest()->get();
        return response()->json(['success' => true, 'data' => $khoaHoc]);
    }

    // Admin: Tạo mới
    public function store(Request $request)
    {
        $request->validate([
            'ten_khoa'  => 'required|string|max:100',
            'loai_bang' => 'required|in:A1,A2,B1,B2,C,D,E',
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
