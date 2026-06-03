<?php

namespace App\Http\Controllers;

use App\Models\LichThi;
use App\Models\KetQuaThi;
use App\Models\LichThiHocVien;
use App\Models\KhoaHoc;
use App\Models\BaiThi;
use App\Models\DangKy;
use App\Models\ChungChi;
use App\Models\HocVienLop;
use App\Models\HoSoHocVien;
use App\Models\LopHoc;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ThiController extends Controller
{
    /**
     * Lấy bài thi của một khóa học theo loại thi.
     * Nếu khóa đào tạo theo tháng (có ma_khoa) chưa có bài thi riêng,
     * tự động kế thừa từ khóa danh mục cùng loai_bang.
     */
    private function getBaiThiCuaKhoa(int $khoaHocId, string $loaiThi): \Illuminate\Support\Collection
    {
        $khoa   = KhoaHoc::findOrFail($khoaHocId);
        $baiThi = BaiThi::where('khoa_hoc_id', $khoaHocId)
            ->where('loai', $loaiThi)
            ->orderBy('thu_tu')
            ->get();

        // Khóa đào tạo theo tháng chưa có bài thi → kế thừa từ danh mục cùng hạng
        if ($baiThi->isEmpty() && !is_null($khoa->ma_khoa)) {
            $khoaDanhMuc = KhoaHoc::where('loai_bang', $khoa->loai_bang)
                ->whereNull('ma_khoa')
                ->first();
            if ($khoaDanhMuc) {
                $baiThi = BaiThi::where('khoa_hoc_id', $khoaDanhMuc->id)
                    ->where('loai', $loaiThi)
                    ->orderBy('thu_tu')
                    ->get();
            }
        }

        return $baiThi;
    }

    // ── Lịch thi ────────────────────────────────────────────────────────────

    public function indexLichThi(Request $request)
    {
        $query = LichThi::with('khoaHoc')
            ->when($request->khoa_hoc_id, fn($q) => $q->where('khoa_hoc_id', $request->khoa_hoc_id))
            ->orderBy('ngay_thi');

        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function storeLichThi(Request $request)
    {
        $request->validate([
            'khoa_hoc_id' => 'required|exists:khoa_hoc,id',
            'ngay_thi'    => 'required|date',
            'gio_thi'     => 'required',
            'loai_thi'    => 'required|in:tot_nghiep,sat_hanh',
        ]);

        $lichThi = LichThi::create($request->all());
        return response()->json(['success' => true, 'message' => 'Tạo lịch thi thành công', 'data' => $lichThi], 201);
    }

    public function updateLichThi(Request $request, $id)
    {
        LichThi::findOrFail($id)->update($request->all());
        return response()->json(['success' => true, 'message' => 'Cập nhật thành công']);
    }

    public function destroyLichThi($id)
    {
        LichThi::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa lịch thi']);
    }

    // ── Học viên trong lịch thi ─────────────────────────────────────────────

    /**
     * Lấy danh sách học viên đủ điều kiện + đã xếp vào lịch thi + bài thi.
     */
    public function hocVienDuDieuKien(Request $request, $lichThiId)
    {
        $lichThi = LichThi::findOrFail($lichThiId);

        $lopIds        = LopHoc::where('khoa_hoc_id', $lichThi->khoa_hoc_id)->pluck('id');
        $daCoTrongLich = LichThiHocVien::where('lich_thi_id', $lichThiId)->pluck('ho_so_id');

        // Học viên đủ điều kiện chưa được xếp
        $hocVienDuDK = HocVienLop::with(['hoSo', 'lopHoc'])
            ->whereIn('lop_hoc_id', $lopIds)
            ->where('du_dieu_kien_thi_tn', true)
            ->whereNotIn('ho_so_id', $daCoTrongLich)
            ->get()
            ->map(fn($hvl) => [
                'ho_so_id'                 => $hvl->hoSo->id,
                'ho_ten'                   => $hvl->hoSo->ho_ten,
                'so_cccd'                  => $hvl->hoSo->so_cccd,
                'ngay_sinh'                => $hvl->hoSo->ngay_sinh,
                'so_dien_thoai'            => $hvl->hoSo->so_dien_thoai,
                'trang_thai'               => $hvl->hoSo->trang_thai,
                'ten_lop'                  => $hvl->lopHoc->ten_lop ?? '—',
                'so_buoi_ly_thuyet_da_hoc' => $hvl->so_buoi_ly_thuyet_da_hoc,
                'so_km_da_chay'            => $hvl->so_km_da_chay,
                'du_buoi_ly_thuyet'        => $hvl->du_buoi_ly_thuyet,
                'du_km_thuc_hanh'          => $hvl->du_km_thuc_hanh,
            ]);

        // Học viên đã được xếp vào lịch thi (kèm kết quả nếu có)
        $daXepVaoLich = LichThiHocVien::with('hoSo')
            ->where('lich_thi_id', $lichThiId)
            ->get()
            ->map(function ($lthv) use ($lichThiId, $lichThi) {
                $hoSo = $lthv->hoSo;

                // Kết quả thi trong lịch thi hiện tại
                $kqList = KetQuaThi::where('lich_thi_id', $lichThiId)
                    ->where('ho_so_id', $lthv->ho_so_id)
                    ->with('baiThi')
                    ->get();

                $diemTheo = [];
                foreach ($kqList as $kq) {
                    $diemTheo[$kq->bai_thi_id] = [
                        'diem'     => $kq->diem,
                        'ket_qua'  => $kq->ket_qua,
                        'nhan_xet' => $kq->nhan_xet,
                    ];
                }

                // Kết quả tổng hợp lịch thi hiện tại
                $tongKQ = null;
                if ($kqList->isNotEmpty()) {
                    $tongKQ = $kqList->every(fn($k) => $k->ket_qua === 'dat') ? 'dat' : 'khong_dat';
                    if ($kqList->contains(fn($k) => $k->ket_qua === 'vang_mat')) {
                        $tongKQ = 'vang_mat';
                    }
                }

                // ── Bài thi đã đậu từ các lần thi TRƯỚC (không tính lịch thi hiện tại) ──
                // Lấy tất cả lịch thi cùng loại + cùng khóa học, trừ lịch thi hiện tại
                $lichThiCungLoai = LichThi::where('khoa_hoc_id', $lichThi->khoa_hoc_id)
                    ->where('loai_thi', $lichThi->loai_thi)
                    ->where('id', '!=', $lichThiId)
                    ->pluck('id');

                // Bài thi đã đậu = bài thi có ket_qua = 'dat' trong bất kỳ lần thi nào trước
                $baiThiDaDat = KetQuaThi::where('ho_so_id', $lthv->ho_so_id)
                    ->whereIn('lich_thi_id', $lichThiCungLoai)
                    ->where('ket_qua', 'dat')
                    ->pluck('bai_thi_id')
                    ->unique()
                    ->values()
                    ->toArray();

                return [
                    'ho_so_id'       => $hoSo->id,
                    'ho_ten'         => $hoSo->ho_ten ?? '—',
                    'so_cccd'        => $hoSo->so_cccd ?? '—',
                    'ket_qua'        => $tongKQ,
                    'diem_theo'      => $diemTheo,
                    'bai_thi_da_dat' => $baiThiDaDat, // [bai_thi_id, ...] đã đậu từ lần trước
                ];
            });

        // Bài thi theo loại thi của lịch thi này
        $baiThi = $this->getBaiThiCuaKhoa($lichThi->khoa_hoc_id, $lichThi->loai_thi);

        return response()->json([
            'success'         => true,
            'du_dieu_kien'    => $hocVienDuDK,
            'da_xep_vao_lich' => $daXepVaoLich,
            'bai_thi'         => $baiThi,
        ]);
    }

    /**
     * Thêm học viên vào lịch thi — lưu vào lich_thi_hoc_vien.
     * Cập nhật trạng thái hồ sơ → chuan_bi_thi.
     */
    public function themHocVienVaoLich(Request $request, $lichThiId)
    {
        $request->validate([
            'ho_so_ids'   => 'required|array|min:1',
            'ho_so_ids.*' => 'required|exists:ho_so_hoc_vien,id',
        ]);

        $lichThi = LichThi::findOrFail($lichThiId);
        $lopIds  = LopHoc::where('khoa_hoc_id', $lichThi->khoa_hoc_id)->pluck('id');
        $added   = 0;

        foreach ($request->ho_so_ids as $hoSoId) {
            $duDK = HocVienLop::whereIn('lop_hoc_id', $lopIds)
                ->where('ho_so_id', $hoSoId)
                ->where('du_dieu_kien_thi_tn', true)
                ->exists();
            if (!$duDK) continue;

            $exists = LichThiHocVien::where('lich_thi_id', $lichThiId)
                ->where('ho_so_id', $hoSoId)
                ->exists();
            if ($exists) continue;

            LichThiHocVien::create(['lich_thi_id' => $lichThiId, 'ho_so_id' => $hoSoId]);

            HoSoHocVien::where('id', $hoSoId)
                ->whereIn('trang_thai', ['du_dieu_kien_thi_tn', 'dang_hoc'])
                ->update(['trang_thai' => 'chuan_bi_thi']);

            $added++;
        }

        return response()->json([
            'success' => true,
            'message' => "Đã thêm {$added} học viên vào lịch thi.",
            'added'   => $added,
        ]);
    }

    /**
     * Xóa học viên khỏi lịch thi (chưa có kết quả thi).
     */
    public function xoaHocVienKhoiLich(Request $request, $lichThiId, $hoSoId)
    {
        $daCoKQ = KetQuaThi::where('lich_thi_id', $lichThiId)
            ->where('ho_so_id', $hoSoId)
            ->whereNotNull('ket_qua')
            ->exists();

        if ($daCoKQ) {
            return response()->json(['success' => false, 'message' => 'Không thể xóa học viên đã có kết quả thi.'], 422);
        }

        LichThiHocVien::where('lich_thi_id', $lichThiId)->where('ho_so_id', $hoSoId)->delete();
        KetQuaThi::where('lich_thi_id', $lichThiId)->where('ho_so_id', $hoSoId)->whereNull('ket_qua')->delete();

        HoSoHocVien::where('id', $hoSoId)
            ->where('trang_thai', 'chuan_bi_thi')
            ->update(['trang_thai' => 'du_dieu_kien_thi_tn']);

        return response()->json(['success' => true, 'message' => 'Đã xóa học viên khỏi lịch thi.']);
    }

    // ── Kết quả thi ─────────────────────────────────────────────────────────

    /**
     * Nhập kết quả thi theo từng bài thi cho từng học viên.
     * Payload: { ket_qua: [{ ho_so_id, bai_thi_id, diem, ket_qua, nhan_xet }] }
     */
    public function nhapKetQua(Request $request, $lichThiId)
    {
        $request->validate([
            'ket_qua'                => 'required|array',
            'ket_qua.*.ho_so_id'     => 'required|exists:ho_so_hoc_vien,id',
            'ket_qua.*.bai_thi_id'   => 'required|exists:bai_thi,id',
            'ket_qua.*.diem'         => 'nullable|numeric|min:0|max:100',
            'ket_qua.*.ket_qua'      => 'nullable|in:dat,khong_dat,vang_mat',
        ]);

        $lichThi = LichThi::findOrFail($lichThiId);

        foreach ($request->ket_qua as $kq) {
            KetQuaThi::updateOrCreate(
                [
                    'ho_so_id'    => $kq['ho_so_id'],
                    'lich_thi_id' => $lichThiId,
                    'bai_thi_id'  => $kq['bai_thi_id'],
                ],
                [
                    'diem'     => $kq['diem'] ?? null,
                    'ket_qua'  => $kq['ket_qua'] ?? null,
                    'nhan_xet' => $kq['nhan_xet'] ?? null,
                ]
            );
        }

        // Sau khi nhập xong, tính kết quả tổng hợp cho từng học viên
        $hoSoIds = collect($request->ket_qua)->pluck('ho_so_id')->unique();
        $baiThiCount = $this->getBaiThiCuaKhoa($lichThi->khoa_hoc_id, $lichThi->loai_thi)->count();

        foreach ($hoSoIds as $hoSoId) {
            $allKQ = KetQuaThi::where('lich_thi_id', $lichThiId)
                ->where('ho_so_id', $hoSoId)
                ->whereNotNull('ket_qua')
                ->get();

            // Chỉ cập nhật trạng thái khi đã nhập đủ tất cả bài thi
            if ($allKQ->count() < $baiThiCount) continue;

            $coVangMat = $allKQ->contains(fn($k) => $k->ket_qua === 'vang_mat');
            $tatCaDat  = $allKQ->every(fn($k) => $k->ket_qua === 'dat');

            $newStatus = match(true) {
                $coVangMat => 'du_dieu_kien_thi_tn',
                $tatCaDat  => 'hoan_thanh_tn',
                default    => 'du_dieu_kien_thi_tn',
            };

            HoSoHocVien::where('id', $hoSoId)
                ->where('trang_thai', 'chuan_bi_thi')
                ->update(['trang_thai' => $newStatus]);
        }

        return response()->json(['success' => true, 'message' => 'Nhập kết quả thi thành công']);
    }

    // ── Chứng chỉ ───────────────────────────────────────────────────────────

    public function capChungChi(Request $request)
    {
        $request->validate([
            'ho_so_id'   => 'required|exists:ho_so_hoc_vien,id',
            'khoa_hoc_id' => 'required|exists:khoa_hoc,id',
            'ngay_cap'    => 'required|date',
        ]);

        $soChungChi = 'CC-' . strtoupper(Str::random(8)) . '-' . date('Y');

        $chungChi = ChungChi::create([
            'ho_so_id'     => $request->ho_so_id,
            'khoa_hoc_id'  => $request->khoa_hoc_id,
            'so_chung_chi' => $soChungChi,
            'ngay_cap'     => $request->ngay_cap,
            'ngay_het_han' => $request->ngay_het_han ?? null,
        ]);

        return response()->json(['success' => true, 'message' => 'Cấp chứng chỉ thành công', 'data' => $chungChi], 201);
    }

    // ── Học viên (user) ──────────────────────────────────────────────────────

    public function myKetQua(Request $request)
    {
        $user  = $request->auth_user;
        $hoSo  = HoSoHocVien::where('user_id', $user->id)->firstOrFail();

        $ketQua = KetQuaThi::with(['lichThi.khoaHoc', 'baiThi'])
            ->where('ho_so_id', $hoSo->id)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $ketQua]);
    }

    public function myChungChi(Request $request)
    {
        $user  = $request->auth_user;
        $hoSo  = HoSoHocVien::where('user_id', $user->id)->firstOrFail();

        $chungChi = ChungChi::with('khoaHoc')
            ->where('ho_so_id', $hoSo->id)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $chungChi]);
    }
}
