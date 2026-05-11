<?php

namespace App\Http\Controllers;

use App\Models\LichThi;
use App\Models\KetQuaThi;
use App\Models\DangKy;
use App\Models\ChungChi;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ThiController extends Controller
{
    // Admin: Danh sách lịch thi
    public function indexLichThi(Request $request)
    {
        $query = LichThi::with('lopHoc.khoaHoc')
            ->when($request->lop_hoc_id, fn($q) => $q->where('lop_hoc_id', $request->lop_hoc_id))
            ->orderBy('ngay_thi');

        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    // Admin: Tạo lịch thi
    public function storeLichThi(Request $request)
    {
        $request->validate([
            'lop_hoc_id' => 'required|exists:lop_hoc,id',
            'ngay_thi'   => 'required|date',
            'gio_thi'    => 'required',
            'loai_thi'   => 'required|in:ly_thuyet,thuc_hanh,sa_hinh',
        ]);

        $lichThi = LichThi::create($request->all());
        return response()->json(['success' => true, 'message' => 'Tạo lịch thi thành công', 'data' => $lichThi], 201);
    }

    // Admin: Cập nhật lịch thi
    public function updateLichThi(Request $request, $id)
    {
        LichThi::findOrFail($id)->update($request->all());
        return response()->json(['success' => true, 'message' => 'Cập nhật thành công']);
    }

    // Admin: Xóa lịch thi
    public function destroyLichThi($id)
    {
        LichThi::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa lịch thi']);
    }

    // Admin/Giáo viên: Nhập kết quả thi
    public function nhapKetQua(Request $request, $lichThiId)
    {
        $request->validate([
            'ket_qua'   => 'required|array',
            'ket_qua.*.hoc_vien_id' => 'required|exists:hoc_vien,id',
            'ket_qua.*.diem'        => 'nullable|numeric|min:0|max:100',
            'ket_qua.*.ket_qua'     => 'required|in:dat,khong_dat,vang',
        ]);

        foreach ($request->ket_qua as $kq) {
            KetQuaThi::updateOrCreate(
                ['hoc_vien_id' => $kq['hoc_vien_id'], 'lich_thi_id' => $lichThiId],
                [
                    'diem'     => $kq['diem'] ?? null,
                    'ket_qua'  => $kq['ket_qua'],
                    'nhan_xet' => $kq['nhan_xet'] ?? null,
                ]
            );
        }

        return response()->json(['success' => true, 'message' => 'Nhập kết quả thi thành công']);
    }

    // Admin: Cấp chứng chỉ
    public function capChungChi(Request $request)
    {
        $request->validate([
            'hoc_vien_id' => 'required|exists:hoc_vien,id',
            'khoa_hoc_id' => 'required|exists:khoa_hoc,id',
            'ngay_cap'    => 'required|date',
        ]);

        $soChungChi = 'CC-' . strtoupper(Str::random(8)) . '-' . date('Y');

        $chungChi = ChungChi::create([
            'hoc_vien_id'  => $request->hoc_vien_id,
            'khoa_hoc_id'  => $request->khoa_hoc_id,
            'so_chung_chi' => $soChungChi,
            'ngay_cap'     => $request->ngay_cap,
            'ngay_het_han' => $request->ngay_het_han ?? null,
        ]);

        return response()->json(['success' => true, 'message' => 'Cấp chứng chỉ thành công', 'data' => $chungChi], 201);
    }

    // User: Kết quả thi của học viên
    public function myKetQua(Request $request)
    {
        $user    = $request->auth_user;
        $hocVien = \App\Models\HocVien::where('user_id', $user->id)->firstOrFail();

        $ketQua = KetQuaThi::with(['lichThi.lopHoc.khoaHoc'])
            ->where('hoc_vien_id', $hocVien->id)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $ketQua]);
    }

    // User: Chứng chỉ của học viên
    public function myChungChi(Request $request)
    {
        $user    = $request->auth_user;
        $hocVien = \App\Models\HocVien::where('user_id', $user->id)->firstOrFail();

        $chungChi = ChungChi::with('khoaHoc')
            ->where('hoc_vien_id', $hocVien->id)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $chungChi]);
    }
}
