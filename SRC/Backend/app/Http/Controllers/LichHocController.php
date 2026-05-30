<?php

namespace App\Http\Controllers;

use App\Models\LichHoc;
use App\Models\DiemDanh;
use App\Models\HocVienLop;
use App\Models\HoSoHocVien;
use App\Models\GiangVien;
use App\Models\LopHoc;
use App\Models\Xe;
use Illuminate\Http\Request;

class LichHocController extends Controller
{
    // Admin: Lấy lịch học theo lớp / tuần
    public function index(Request $request)
    {
        $query = LichHoc::with(['lopHoc.khoaHoc', 'xe'])
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
            'lop_hoc_id'   => 'required|exists:lop_hoc,id',
            'ngay_hoc'     => 'required|date',
            'gio_bat_dau'  => 'required',
            'gio_ket_thuc' => 'required',
            'loai_buoi'    => 'required|in:ly_thuyet,thuc_hanh',
            'xe_id'        => 'nullable|exists:xe,id',
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

    // Lấy danh sách điểm danh của 1 buổi học
    public function getDiemDanh(Request $request, $lichHocId)
    {
        $lichHoc = LichHoc::with('lopHoc')->findOrFail($lichHocId);
        $user    = $request->auth_user;

        // Nếu là giảng viên, kiểm tra quyền
        if ($user->role === 'giang_vien') {
            $gv = GiangVien::where('user_id', $user->id)->first();
            if (!$gv) {
                return response()->json(['success' => false, 'message' => 'Không có quyền'], 403);
            }

            // Kiểm tra GV có dạy lớp này không
            $lop = LopHoc::where('id', $lichHoc->lop_hoc_id)
                ->where(fn($q) => $q->where('giang_vien_ly_thuyet_id', $gv->id)
                    ->orWhere('giang_vien_thuc_hanh_id', $gv->id))
                ->first();

            if (!$lop) {
                return response()->json(['success' => false, 'message' => 'Bạn không có quyền điểm danh lớp này'], 403);
            }

            // Kiểm tra loại buổi có khớp chuyên môn không
            if ($gv->chuyen_mon === 'ly_thuyet' && $lichHoc->loai_buoi !== 'ly_thuyet') {
                return response()->json(['success' => false, 'message' => 'Bạn chỉ được điểm danh buổi lý thuyết'], 403);
            }
            if ($gv->chuyen_mon === 'thuc_hanh' && $lichHoc->loai_buoi !== 'thuc_hanh') {
                return response()->json(['success' => false, 'message' => 'Bạn chỉ được điểm danh buổi thực hành'], 403);
            }
        }

        // Lấy tất cả học viên trong lớp qua bảng hoc_vien_lop
        $hocVienLopList = HocVienLop::with('hoSo')
            ->where('lop_hoc_id', $lichHoc->lop_hoc_id)
            ->get();

        // Lấy điểm danh đã có
        $diemDanhMap = DiemDanh::where('lich_hoc_id', $lichHocId)
            ->get()
            ->keyBy('ho_so_id');

        $result = $hocVienLopList->map(fn($hvl) => [
            'ho_so_id' => $hvl->ho_so_id,
            'ho_ten'   => $hvl->hoSo->ho_ten ?? '—',
            'so_cccd'  => $hvl->hoSo->so_cccd ?? '—',
            'co_mat'   => $diemDanhMap[$hvl->ho_so_id]->co_mat ?? false,
            'km_chay'  => $diemDanhMap[$hvl->ho_so_id]->km_chay ?? '',
            'ghi_chu'  => $diemDanhMap[$hvl->ho_so_id]->ghi_chu ?? '',
        ]);

        return response()->json([
            'success'   => true,
            'data'      => $result,
            'lich_hoc'  => $lichHoc,
        ]);
    }

    // Admin/GV: Lưu điểm danh
    public function diemDanh(Request $request, $lichHocId)
    {
        $request->validate([
            'diem_danh'             => 'required|array',
            'diem_danh.*.ho_so_id'  => 'required|exists:ho_so_hoc_vien,id',
            'diem_danh.*.co_mat'    => 'required|boolean',
        ]);

        $lichHoc = LichHoc::with('lopHoc.khoaHoc')->findOrFail($lichHocId);
        $user    = $request->auth_user;

        // Nếu là giảng viên, kiểm tra quyền
        if ($user->role === 'giang_vien') {
            $gv = GiangVien::where('user_id', $user->id)->first();
            if (!$gv) {
                return response()->json(['success' => false, 'message' => 'Không có quyền'], 403);
            }

            $lop = LopHoc::where('id', $lichHoc->lop_hoc_id)
                ->where(fn($q) => $q->where('giang_vien_ly_thuyet_id', $gv->id)
                    ->orWhere('giang_vien_thuc_hanh_id', $gv->id))
                ->first();

            if (!$lop) {
                return response()->json(['success' => false, 'message' => 'Bạn không có quyền điểm danh lớp này'], 403);
            }

            if ($gv->chuyen_mon === 'ly_thuyet' && $lichHoc->loai_buoi !== 'ly_thuyet') {
                return response()->json(['success' => false, 'message' => 'Bạn chỉ được điểm danh buổi lý thuyết'], 403);
            }
            if ($gv->chuyen_mon === 'thuc_hanh' && $lichHoc->loai_buoi !== 'thuc_hanh') {
                return response()->json(['success' => false, 'message' => 'Bạn chỉ được điểm danh buổi thực hành'], 403);
            }
        }

        // ── Lấy km buổi học cũ của xe (trước khi cập nhật) ──────────────────
        // Dùng MAX(km_chay) để nhất quán với cách tính km xe theo buổi
        $kmBuoiCu = 0;
        if ($lichHoc->loai_buoi === 'thuc_hanh') {
            $kmBuoiCu = DiemDanh::where('lich_hoc_id', $lichHocId)
                ->where('co_mat', true)
                ->whereNotNull('km_chay')
                ->where('km_chay', '>', 0)
                ->max('km_chay') ?? 0;
            $kmBuoiCu = floatval($kmBuoiCu);
        }

        // Xác định xe_id sớm để dùng cho cả phần lấy km cũ lẫn cập nhật km mới.
        // Ưu tiên xe gán trực tiếp trên buổi học (lich_hoc.xe_id),
        // nếu không có thì lấy từ bảng xe_lop_hoc (xe phân cho lớp).
        $xeIdBuoi = $lichHoc->xe_id;
        if (!$xeIdBuoi && $lichHoc->loai_buoi === 'thuc_hanh') {
            $xeLop    = \App\Models\XeLopHoc::where('lop_hoc_id', $lichHoc->lop_hoc_id)->first();
            $xeIdBuoi = $xeLop?->xe_id;
        }

        foreach ($request->diem_danh as $dd) {
            // Lấy bản ghi điểm danh cũ (nếu có) để tính delta km học viên
            $diemDanhCu = DiemDanh::where('lich_hoc_id', $lichHocId)
                ->where('ho_so_id', $dd['ho_so_id'])
                ->first();

            $kmCu  = $diemDanhCu ? floatval($diemDanhCu->km_chay ?? 0) : 0;
            $kmMoi = !empty($dd['km_chay']) ? floatval($dd['km_chay']) : 0;

            DiemDanh::updateOrCreate(
                ['lich_hoc_id' => $lichHocId, 'ho_so_id' => $dd['ho_so_id']],
                [
                    'co_mat'  => $dd['co_mat'],
                    'km_chay' => $dd['km_chay'] ?? null,
                    'ghi_chu' => $dd['ghi_chu'] ?? null,
                ]
            );

            // Cập nhật tiến độ học viên nếu có mặt
            if ($dd['co_mat']) {
                $hvl = HocVienLop::where('ho_so_id', $dd['ho_so_id'])
                    ->where('lop_hoc_id', $lichHoc->lop_hoc_id)
                    ->first();

                if ($hvl) {
                    if ($lichHoc->loai_buoi === 'ly_thuyet') {
                        // Chỉ tăng nếu chưa điểm danh buổi này trước đó
                        if (!$diemDanhCu || !$diemDanhCu->co_mat) {
                            $hvl->increment('so_buoi_ly_thuyet_da_hoc');
                        }
                    } elseif ($lichHoc->loai_buoi === 'thuc_hanh') {
                        // Chỉ tăng số buổi nếu chưa điểm danh buổi này trước đó
                        if (!$diemDanhCu || !$diemDanhCu->co_mat) {
                            $hvl->increment('so_buoi_thuc_hanh_da_hoc');
                        }
                        // Cập nhật km học viên theo delta (km mới - km cũ)
                        $deltaKmHocVien = $kmMoi - $kmCu;
                        if ($deltaKmHocVien != 0) {
                            $hvl->increment('so_km_da_chay', $deltaKmHocVien);
                        }
                    }
                    $hvl->refresh();
                    $hvl->kiemTraDieuKien();
                }
            } elseif ($diemDanhCu && $diemDanhCu->co_mat) {
                // Học viên từ có mặt → vắng: trừ lại km và số buổi đã cộng trước đó
                $hvl = HocVienLop::where('ho_so_id', $dd['ho_so_id'])
                    ->where('lop_hoc_id', $lichHoc->lop_hoc_id)
                    ->first();
                if ($hvl) {
                    if ($lichHoc->loai_buoi === 'ly_thuyet') {
                        $hvl->decrement('so_buoi_ly_thuyet_da_hoc');
                    } elseif ($lichHoc->loai_buoi === 'thuc_hanh') {
                        $hvl->decrement('so_buoi_thuc_hanh_da_hoc');
                        if ($kmCu > 0) {
                            $hvl->decrement('so_km_da_chay', $kmCu);
                        }
                    }
                    $hvl->refresh();
                    $hvl->kiemTraDieuKien();
                }
            }
        }

        // ── Cập nhật km xe ────────────────────────────────────────────────────
        // Km xe trong 1 buổi = MAX(km_chay) của các học viên có mặt trong buổi đó.
        // Dùng MAX để đảm bảo lấy quãng đường thực tế xe đã chạy, tránh sai lệch
        // khi các học viên nhập km khác nhau (nhất quán với logic syncKmXe).
        if ($lichHoc->loai_buoi === 'thuc_hanh' && $xeIdBuoi) {
            // Tìm MAX km từ dữ liệu vừa submit (học viên có mặt + có km)
            $kmBuoiMoi = 0;
            foreach ($request->diem_danh as $dd) {
                if (!empty($dd['co_mat']) && !empty($dd['km_chay']) && floatval($dd['km_chay']) > $kmBuoiMoi) {
                    $kmBuoiMoi = floatval($dd['km_chay']);
                }
            }

            // Tính delta km xe = km buổi mới - km buổi cũ (tránh cộng đôi khi điểm danh lại)
            $deltaKmXe = $kmBuoiMoi - $kmBuoiCu;
            if ($deltaKmXe != 0) {
                Xe::where('id', $xeIdBuoi)->increment('so_km_hien_tai', $deltaKmXe);
            }
        }

        return response()->json(['success' => true, 'message' => 'Điểm danh thành công']);
    }
}
