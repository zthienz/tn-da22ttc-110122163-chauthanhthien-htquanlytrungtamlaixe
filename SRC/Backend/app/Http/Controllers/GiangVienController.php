<?php

namespace App\Http\Controllers;

use App\Models\GiangVien;
use App\Models\LopHoc;
use App\Models\LichHoc;
use App\Models\HocVienLop;
use App\Models\HoSoHocVien;
use Illuminate\Http\Request;

class GiangVienController extends Controller
{
    // Thông tin cá nhân giảng viên
    public function thongTin(Request $request)
    {
        $user = $request->auth_user;
        $gv   = GiangVien::with('user')
            ->where('user_id', $user->id)
            ->withCount(['lopHocLyThuyet', 'lopHocThucHanh'])
            ->first();

        if (!$gv) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin giảng viên'], 404);
        }

        $lopCount = $gv->lop_hoc_ly_thuyet_count + $gv->lop_hoc_thuc_hanh_count;

        return response()->json([
            'success' => true,
            'data'    => [
                'id'              => $gv->id,
                'ho_ten'          => $gv->user->ho_ten,
                'email'           => $gv->user->email,
                'so_dien_thoai'   => $gv->user->so_dien_thoai,
                'chuyen_mon'      => $gv->chuyen_mon,
                'bang_cap'        => $gv->bang_cap,
                'nam_kinh_nghiem' => $gv->nam_kinh_nghiem,
                'ghi_chu'         => $gv->ghi_chu,
                'lop_count'       => $lopCount,
            ],
        ]);
    }

    // Danh sách lớp của giảng viên
    public function lopCuaToi(Request $request)
    {
        $user = $request->auth_user;
        $gv   = GiangVien::where('user_id', $user->id)->first();

        if (!$gv) {
            return response()->json(['success' => true, 'data' => []]);
        }

        // Lấy lớp mà GV dạy lý thuyết HOẶC thực hành
        $lopLT = LopHoc::with(['khoaHoc'])
            ->withCount('hocVienLop')
            ->where('giang_vien_ly_thuyet_id', $gv->id)
            ->get()
            ->map(fn($l) => array_merge($l->toArray(), ['chuyen_mon' => 'ly_thuyet', 'hoc_vien_count' => $l->hoc_vien_lop_count]));

        $lopTH = LopHoc::with(['khoaHoc'])
            ->withCount('hocVienLop')
            ->where('giang_vien_thuc_hanh_id', $gv->id)
            ->get()
            ->map(fn($l) => array_merge($l->toArray(), ['chuyen_mon' => 'thuc_hanh', 'hoc_vien_count' => $l->hoc_vien_lop_count]));

        $all = $lopLT->merge($lopTH)->unique('id')->values();

        return response()->json(['success' => true, 'data' => $all]);
    }

    // Học viên trong lớp
    public function hocVienTrongLop(Request $request, $lopId)
    {
        $user = $request->auth_user;
        $gv   = GiangVien::where('user_id', $user->id)->first();

        // Kiểm tra GV có dạy lớp này không
        $lop = LopHoc::where('id', $lopId)
            ->where(fn($q) => $q->where('giang_vien_ly_thuyet_id', $gv?->id)
                ->orWhere('giang_vien_thuc_hanh_id', $gv?->id))
            ->first();

        if (!$lop) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền xem lớp này'], 403);
        }

        $hvLop = HocVienLop::with('hoSo')
            ->where('lop_hoc_id', $lopId)
            ->get()
            ->map(fn($hvl) => [
                'id'                          => $hvl->id,
                'ho_so_id'                    => $hvl->ho_so_id,
                'ho_ten'                      => $hvl->hoSo->ho_ten,
                'so_cccd'                     => $hvl->hoSo->so_cccd,
                'so_dien_thoai'               => $hvl->hoSo->so_dien_thoai,
                'so_buoi_ly_thuyet_da_hoc'    => $hvl->so_buoi_ly_thuyet_da_hoc,
                'so_buoi_thuc_hanh_da_hoc'    => $hvl->so_buoi_thuc_hanh_da_hoc,
                'so_km_da_chay'               => $hvl->so_km_da_chay,
                'du_dieu_kien_thi_tn'         => $hvl->du_dieu_kien_thi_tn,
            ]);

        return response()->json(['success' => true, 'data' => $hvLop]);
    }

    // Lịch học của lớp
    public function lichHocCuaLop(Request $request, $lopId)
    {
        $user = $request->auth_user;
        $gv   = GiangVien::where('user_id', $user->id)->first();

        $lop = LopHoc::where('id', $lopId)
            ->where(fn($q) => $q->where('giang_vien_ly_thuyet_id', $gv?->id)
                ->orWhere('giang_vien_thuc_hanh_id', $gv?->id))
            ->first();

        if (!$lop) {
            return response()->json(['success' => false, 'message' => 'Không có quyền'], 403);
        }

        $lichHoc = LichHoc::where('lop_hoc_id', $lopId)
            ->when($request->from, fn($q) => $q->where('ngay_hoc', '>=', $request->from))
            ->orderBy('ngay_hoc')->orderBy('gio_bat_dau')
            ->get();

        return response()->json(['success' => true, 'data' => $lichHoc]);
    }

    // Lịch dạy hôm nay
    public function lichHomNay(Request $request)
    {
        $user = $request->auth_user;
        $gv   = GiangVien::where('user_id', $user->id)->first();

        if (!$gv) return response()->json(['success' => true, 'data' => []]);

        $lopIds = LopHoc::where('giang_vien_ly_thuyet_id', $gv->id)
            ->orWhere('giang_vien_thuc_hanh_id', $gv->id)
            ->pluck('id');

        $lich = LichHoc::with('lopHoc')
            ->whereIn('lop_hoc_id', $lopIds)
            ->whereDate('ngay_hoc', today())
            ->orderBy('gio_bat_dau')
            ->get();

        return response()->json(['success' => true, 'data' => $lich]);
    }
}
