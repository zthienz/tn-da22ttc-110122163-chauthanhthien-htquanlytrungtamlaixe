<?php

namespace App\Http\Controllers;

use App\Models\LopHoc;
use App\Models\DangKy;
use Illuminate\Http\Request;

class LopHocController extends Controller
{
    public function index(Request $request)
    {
        $lop = LopHoc::with(['khoaHoc', 'giaoVien.user'])
            ->withCount('dangKy')
            ->when($request->trang_thai, fn($q) => $q->where('trang_thai', $request->trang_thai))
            ->latest()->get();

        return response()->json(['success' => true, 'data' => $lop]);
    }

    public function show($id)
    {
        $lop = LopHoc::with(['khoaHoc', 'giaoVien.user', 'dangKy.hocVien.user', 'lichHoc'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $lop]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_lop'      => 'required|string',
            'khoa_hoc_id'  => 'required|exists:khoa_hoc,id',
            'ngay_bat_dau' => 'required|date',
        ]);

        $lop = LopHoc::create($request->all());
        return response()->json(['success' => true, 'message' => 'Tạo lớp học thành công', 'data' => $lop], 201);
    }

    public function update(Request $request, $id)
    {
        $lop = LopHoc::findOrFail($id);
        $lop->update($request->all());
        return response()->json(['success' => true, 'message' => 'Cập nhật thành công']);
    }

    public function destroy($id)
    {
        LopHoc::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa lớp học']);
    }

    // Duyệt đăng ký học viên vào lớp
    public function duyetDangKy(Request $request, $lopId, $dangKyId)
    {
        $dangKy = DangKy::where('lop_hoc_id', $lopId)->findOrFail($dangKyId);
        $dangKy->update(['trang_thai' => $request->trang_thai ?? 'da_duyet']);
        return response()->json(['success' => true, 'message' => 'Đã cập nhật trạng thái đăng ký']);
    }
}
