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
     * Ngoài ra còn trả về danh sách học viên CHƯA đủ điều kiện (cùng hạng, chưa đậu, chưa có trong lịch)
     * để hiển thị mờ trong UI.
     */
    public function hocVienDuDieuKien(Request $request, $lichThiId)
    {
        $lichThi = LichThi::findOrFail($lichThiId);

        // Lấy khóa học tương ứng để biết hạng bằng
        $khoa = KhoaHoc::findOrFail($lichThi->khoa_hoc_id);
        $loaiBang = $khoa->loai_bang;

        // Tìm TẤT CẢ khóa học cùng hạng bằng (bao gồm khóa danh mục và khóa đào tạo theo tháng)
        $khoaCungHang = KhoaHoc::where('loai_bang', $loaiBang)->pluck('id');

        // Lấy tất cả lớp thuộc các khóa học cùng hạng bằng
        $lopIds = LopHoc::whereIn('khoa_hoc_id', $khoaCungHang)->pluck('id');
        $daCoTrongLich = LichThiHocVien::where('lich_thi_id', $lichThiId)->pluck('ho_so_id');

        $trangThaiDaQua = ['hoan_thanh_tn', 'du_dieu_kien_sat_hanh', 'dang_thi_sat_hanh', 'da_cap_bang'];

        // ── Tìm học viên đã đậu TN hoàn toàn (để loại khỏi cả 2 danh sách nếu là lịch TN) ──
        $hoSoDaDauTN = collect();
        if ($lichThi->loai_thi === 'tot_nghiep') {
            $lichThiTNCungHang = LichThi::whereIn('khoa_hoc_id', $khoaCungHang)
                ->where('loai_thi', 'tot_nghiep')
                ->where('id', '!=', $lichThiId)
                ->pluck('id');

            $baiThiTN = $this->getBaiThiCuaKhoa($lichThi->khoa_hoc_id, 'tot_nghiep');
            $sobaithiCanDat = $baiThiTN->count();

            if ($sobaithiCanDat > 0 && $lichThiTNCungHang->isNotEmpty()) {
                $hoSoDaDauTN = KetQuaThi::whereIn('lich_thi_id', $lichThiTNCungHang)
                    ->where('ket_qua', 'dat')
                    ->select('ho_so_id', 'lich_thi_id')
                    ->get()
                    ->groupBy('ho_so_id')
                    ->filter(function ($rows) use ($sobaithiCanDat) {
                        $byLich = $rows->groupBy('lich_thi_id');
                        foreach ($byLich as $lichId => $baiDat) {
                            if ($baiDat->count() >= $sobaithiCanDat) return true;
                        }
                        return false;
                    })
                    ->keys();
            }
        }

        // ── Tìm học viên đã đậu SH hoàn toàn (để loại khỏi cả 2 danh sách nếu là lịch SH) ──
        $hoSoDaDauSH = collect();
        if ($lichThi->loai_thi === 'sat_hanh') {
            $lichThiSHCungHang = LichThi::whereIn('khoa_hoc_id', $khoaCungHang)
                ->where('loai_thi', 'sat_hanh')
                ->where('id', '!=', $lichThiId)
                ->pluck('id');

            $baiThiSH = $this->getBaiThiCuaKhoa($lichThi->khoa_hoc_id, 'sat_hanh');
            $soBaiSHCanDat = $baiThiSH->count();

            if ($soBaiSHCanDat > 0 && $lichThiSHCungHang->isNotEmpty()) {
                $hoSoDaDauSH = KetQuaThi::whereIn('lich_thi_id', $lichThiSHCungHang)
                    ->where('ket_qua', 'dat')
                    ->select('ho_so_id', 'lich_thi_id')
                    ->get()
                    ->groupBy('ho_so_id')
                    ->filter(function ($rows) use ($soBaiSHCanDat) {
                        $byLich = $rows->groupBy('lich_thi_id');
                        foreach ($byLich as $lichId => $baiDat) {
                            if ($baiDat->count() >= $soBaiSHCanDat) return true;
                        }
                        return false;
                    })
                    ->keys();
            }
        }

        // ── Helper: map HocVienLop → array thông tin ──────────────────────────
        $mapHocVien = function ($hvl) use ($lichThi) {
            $hoSo = $hvl->hoSo;
            $coPhiChuaThu = KetQuaThi::where('ho_so_id', $hoSo->id)
                ->whereHas('lichThi', fn($q) => $q
                    ->where('khoa_hoc_id', $lichThi->khoa_hoc_id)
                    ->where('loai_thi', $lichThi->loai_thi)
                )
                ->whereIn('ket_qua', ['khong_dat', 'vang_mat'])
                ->where('da_thu_phi', false)
                ->exists();

            return [
                'ho_so_id'                 => $hoSo->id,
                'ho_ten'                   => $hoSo->ho_ten,
                'so_cccd'                  => $hoSo->so_cccd,
                'ngay_sinh'                => $hoSo->ngay_sinh,
                'so_dien_thoai'            => $hoSo->so_dien_thoai,
                'trang_thai'               => $hoSo->trang_thai,
                'ten_lop'                  => $hvl->lopHoc->ten_lop ?? '—',
                'so_buoi_ly_thuyet_da_hoc' => $hvl->so_buoi_ly_thuyet_da_hoc,
                'so_km_da_chay'            => $hvl->so_km_da_chay,
                'du_buoi_ly_thuyet'        => $hvl->du_buoi_ly_thuyet,
                'du_km_thuc_hanh'          => $hvl->du_km_thuc_hanh,
                'co_phi_chua_thu'          => $coPhiChuaThu,
            ];
        };

        // ── Danh sách HỌC VIÊN ĐỦ ĐIỀU KIỆN (chưa có trong lịch) ─────────────
        $hocVienDuDK = HocVienLop::with(['hoSo', 'lopHoc'])
            ->whereIn('lop_hoc_id', $lopIds)
            ->where('du_dieu_kien_thi_tn', true)
            ->whereNotIn('ho_so_id', $daCoTrongLich)
            ->whereNotIn('ho_so_id', $hoSoDaDauTN)
            ->whereNotIn('ho_so_id', $hoSoDaDauSH)
            ->whereHas('hoSo', function ($q) use ($trangThaiDaQua, $lichThi) {
                if ($lichThi->loai_thi === 'tot_nghiep') {
                    $q->whereNotIn('trang_thai', $trangThaiDaQua);
                }
                if ($lichThi->loai_thi === 'sat_hanh') {
                    $q->whereIn('trang_thai', $trangThaiDaQua);
                }
            })
            ->get()
            ->map($mapHocVien);

        // ── Danh sách HỌC VIÊN CHƯA ĐỦ ĐIỀU KIỆN cùng hạng bằng ─────────────
        // Hiển thị mờ trong UI, không cho thêm vào lịch
        // Điều kiện: cùng hạng, chưa có trong lịch, chưa đậu, CHƯA đủ điều kiện thi
        $hoSoDuDKIds = $hocVienDuDK->pluck('ho_so_id'); // loại trừ để không trùng

        $hocVienChuaDuDK = HocVienLop::with(['hoSo', 'lopHoc'])
            ->whereIn('lop_hoc_id', $lopIds)
            ->where('du_dieu_kien_thi_tn', false)  // chưa đủ điều kiện
            ->whereNotIn('ho_so_id', $daCoTrongLich)
            ->whereNotIn('ho_so_id', $hoSoDaDauTN)
            ->whereNotIn('ho_so_id', $hoSoDaDauSH)
            ->whereNotIn('ho_so_id', $hoSoDuDKIds)
            ->whereHas('hoSo', function ($q) use ($trangThaiDaQua, $lichThi) {
                if ($lichThi->loai_thi === 'tot_nghiep') {
                    $q->whereNotIn('trang_thai', $trangThaiDaQua);
                }
                if ($lichThi->loai_thi === 'sat_hanh') {
                    $q->whereIn('trang_thai', $trangThaiDaQua);
                }
            })
            ->get()
            ->map($mapHocVien);

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
            'success'           => true,
            'du_dieu_kien'      => $hocVienDuDK,
            'chua_du_dieu_kien' => $hocVienChuaDuDK,
            'da_xep_vao_lich'   => $daXepVaoLich,
            'bai_thi'           => $baiThi,
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

        // Tìm tất cả lớp cùng hạng bằng (khóa danh mục + khóa đào tạo)
        $khoa = KhoaHoc::findOrFail($lichThi->khoa_hoc_id);
        $khoaCungHang = KhoaHoc::where('loai_bang', $khoa->loai_bang)->pluck('id');
        $lopIds = LopHoc::whereIn('khoa_hoc_id', $khoaCungHang)->pluck('id');
        $added   = 0;

        // Với lịch thi tốt nghiệp: tính trước danh sách học viên đã đậu TN hoàn toàn
        $hoSoDaDauTNSet = collect();
        if ($lichThi->loai_thi === 'tot_nghiep') {
            $baiThiTN = $this->getBaiThiCuaKhoa($lichThi->khoa_hoc_id, 'tot_nghiep');
            $soBaiThiCanDat = $baiThiTN->count();

            $lichThiTNCungHang = LichThi::whereIn('khoa_hoc_id', $khoaCungHang)
                ->where('loai_thi', 'tot_nghiep')
                ->where('id', '!=', $lichThiId)
                ->pluck('id');

            if ($soBaiThiCanDat > 0 && $lichThiTNCungHang->isNotEmpty()) {
                $hoSoDaDauTNSet = KetQuaThi::whereIn('lich_thi_id', $lichThiTNCungHang)
                    ->where('ket_qua', 'dat')
                    ->select('ho_so_id', 'lich_thi_id')
                    ->get()
                    ->groupBy('ho_so_id')
                    ->filter(function ($rows) use ($soBaiThiCanDat) {
                        $byLich = $rows->groupBy('lich_thi_id');
                        foreach ($byLich as $lichId => $baiDat) {
                            if ($baiDat->count() >= $soBaiThiCanDat) return true;
                        }
                        return false;
                    })
                    ->keys();
            }
        }

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

            // ── Kiểm tra học viên đã đậu TN rồi (không được xếp vào TN nữa) ──
            if ($lichThi->loai_thi === 'tot_nghiep' && $hoSoDaDauTNSet->contains($hoSoId)) {
                continue; // Học viên đã đậu TN → bỏ qua, không thêm vào lịch TN mới
            }

            // Cũng kiểm tra qua trạng thái hồ sơ (phòng trường hợp trạng thái đã được cập nhật)
            if ($lichThi->loai_thi === 'tot_nghiep') {
                $trangThaiDaQua = ['hoan_thanh_tn', 'du_dieu_kien_sat_hanh', 'dang_thi_sat_hanh', 'da_cap_bang'];
                $trangThaiHV = HoSoHocVien::where('id', $hoSoId)->value('trang_thai');
                if (in_array($trangThaiHV, $trangThaiDaQua)) continue;
            }

            // ── Kiểm tra phí thi lại chưa đóng ──────────────────────────────
            // Lần đầu thi (chưa có kết quả nào) → cho phép miễn phí
            // Đã thi trước đó và có bài rớt chưa đóng phí → block
            $coPhiChuaThu = KetQuaThi::where('ho_so_id', $hoSoId)
                ->whereHas('lichThi', fn($q) => $q
                    ->where('khoa_hoc_id', $lichThi->khoa_hoc_id)
                    ->where('loai_thi', $lichThi->loai_thi)
                )
                ->whereIn('ket_qua', ['khong_dat', 'vang_mat'])
                ->where('da_thu_phi', false)
                ->exists();

            if ($coPhiChuaThu) {
                // Không thêm — học viên còn phí thi lại chưa đóng
                continue;
            }

            LichThiHocVien::create(['lich_thi_id' => $lichThiId, 'ho_so_id' => $hoSoId]);

            // Khi xếp vào lịch TN: du_dieu_kien_thi_tn/dang_hoc → chuan_bi_thi
            // Khi xếp vào lịch SH: hoan_thanh_tn/du_dieu_kien_sat_hanh → chuan_bi_thi
            if ($lichThi->loai_thi === 'sat_hanh') {
                HoSoHocVien::where('id', $hoSoId)
                    ->whereIn('trang_thai', ['hoan_thanh_tn', 'du_dieu_kien_sat_hanh'])
                    ->update(['trang_thai' => 'chuan_bi_thi']);
            } else {
                HoSoHocVien::where('id', $hoSoId)
                    ->whereIn('trang_thai', ['du_dieu_kien_thi_tn', 'dang_hoc'])
                    ->update(['trang_thai' => 'chuan_bi_thi']);
            }

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

        $lichThi = LichThi::findOrFail($lichThiId);

        LichThiHocVien::where('lich_thi_id', $lichThiId)->where('ho_so_id', $hoSoId)->delete();
        KetQuaThi::where('lich_thi_id', $lichThiId)->where('ho_so_id', $hoSoId)->whereNull('ket_qua')->delete();

        // Khi xóa khỏi lịch TN → quay về chờ thi TN
        // Khi xóa khỏi lịch SH → quay về hoàn thành TN (chờ xếp sát hạch)
        if ($lichThi->loai_thi === 'sat_hanh') {
            HoSoHocVien::where('id', $hoSoId)
                ->where('trang_thai', 'chuan_bi_thi')
                ->update(['trang_thai' => 'hoan_thanh_tn']);
        } else {
            HoSoHocVien::where('id', $hoSoId)
                ->where('trang_thai', 'chuan_bi_thi')
                ->update(['trang_thai' => 'du_dieu_kien_thi_tn']);
        }

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
        $baiThiList = $this->getBaiThiCuaKhoa($lichThi->khoa_hoc_id, $lichThi->loai_thi);
        $baiThiCount = $baiThiList->count();
        $baiThiIds = $baiThiList->pluck('id');

        // Lấy tất cả lịch thi cùng loại + cùng hạng để kiểm tra bài đã đậu trước
        $khoa = KhoaHoc::findOrFail($lichThi->khoa_hoc_id);
        $khoaCungHang = KhoaHoc::where('loai_bang', $khoa->loai_bang)->pluck('id');
        $lichThiCungLoai = LichThi::whereIn('khoa_hoc_id', $khoaCungHang)
            ->where('loai_thi', $lichThi->loai_thi)
            ->pluck('id');

        foreach ($hoSoIds as $hoSoId) {
            // Kết quả lần thi hiện tại
            $kqLanNay = KetQuaThi::where('lich_thi_id', $lichThiId)
                ->where('ho_so_id', $hoSoId)
                ->whereNotNull('ket_qua')
                ->get();

            if ($kqLanNay->isEmpty()) continue;

            $coVangMat = $kqLanNay->contains(fn($k) => $k->ket_qua === 'vang_mat');

            if ($lichThi->loai_thi === 'tot_nghiep') {
                // ── Lịch thi TỐT NGHIỆP ─────────────────────────────────
                if ($coVangMat) {
                    // Vắng mặt → quay về chờ thi TN
                    HoSoHocVien::where('id', $hoSoId)
                        ->where('trang_thai', 'chuan_bi_thi')
                        ->update(['trang_thai' => 'du_dieu_kien_thi_tn']);
                    continue;
                }

                // Bài thi đã đạt trong tất cả lịch thi TN cùng hạng (bao gồm lần hiện tại)
                $baiDatIds = KetQuaThi::where('ho_so_id', $hoSoId)
                    ->whereIn('lich_thi_id', $lichThiCungLoai)
                    ->where('ket_qua', 'dat')
                    ->whereIn('bai_thi_id', $baiThiIds)
                    ->pluck('bai_thi_id')
                    ->unique();

                $tatCaBaiDat = $baiThiCount > 0 && $baiDatIds->count() >= $baiThiCount;

                if ($tatCaBaiDat) {
                    // Đậu toàn bộ bài thi TN → hoàn thành TN, chờ xếp lịch sát hạch
                    HoSoHocVien::where('id', $hoSoId)
                        ->whereIn('trang_thai', ['chuan_bi_thi', 'du_dieu_kien_thi_tn'])
                        ->update(['trang_thai' => 'hoan_thanh_tn']);
                } else {
                    // Còn bài rớt → quay về chờ thi TN
                    HoSoHocVien::where('id', $hoSoId)
                        ->where('trang_thai', 'chuan_bi_thi')
                        ->update(['trang_thai' => 'du_dieu_kien_thi_tn']);
                }
            } else {
                // ── Lịch thi SÁT HẠCH ───────────────────────────────────
                if ($coVangMat) {
                    // Vắng mặt → quay về chờ sát hạch (hoan_thanh_tn)
                    HoSoHocVien::where('id', $hoSoId)
                        ->where('trang_thai', 'chuan_bi_thi')
                        ->update(['trang_thai' => 'hoan_thanh_tn']);
                    continue;
                }

                // Bài thi sát hạch đã đạt trong tất cả lịch SH cùng hạng (bao gồm lần hiện tại)
                $baiDatIds = KetQuaThi::where('ho_so_id', $hoSoId)
                    ->whereIn('lich_thi_id', $lichThiCungLoai)
                    ->where('ket_qua', 'dat')
                    ->whereIn('bai_thi_id', $baiThiIds)
                    ->pluck('bai_thi_id')
                    ->unique();

                $tatCaBaiDat = $baiThiCount > 0 && $baiDatIds->count() >= $baiThiCount;

                if ($tatCaBaiDat) {
                    // Đậu toàn bộ bài thi sát hạch → đủ điều kiện cấp bằng lái
                    // Hồ sơ sẽ chuyển sang trang Cấp Bằng (không còn ở trang Hồ Sơ)
                    HoSoHocVien::where('id', $hoSoId)
                        ->whereIn('trang_thai', ['chuan_bi_thi', 'hoan_thanh_tn', 'du_dieu_kien_sat_hanh'])
                        ->update(['trang_thai' => 'du_dieu_kien_sat_hanh']);
                } else {
                    // Còn bài rớt sát hạch → quay về chờ sát hạch, cần đóng phí thi lại
                    HoSoHocVien::where('id', $hoSoId)
                        ->where('trang_thai', 'chuan_bi_thi')
                        ->update(['trang_thai' => 'hoan_thanh_tn']);
                }
            }
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
