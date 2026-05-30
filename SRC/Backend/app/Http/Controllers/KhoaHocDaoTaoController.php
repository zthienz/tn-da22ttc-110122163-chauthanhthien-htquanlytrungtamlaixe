<?php

namespace App\Http\Controllers;

use App\Models\KhoaHoc;
use App\Models\LopHoc;
use App\Models\HoSoHocVien;
use App\Models\XeLopHoc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KhoaHocDaoTaoController extends Controller
{
    // ── Danh sách khóa học đào tạo (có thang/nam/hang_bang) ──────────────────
    public function index(Request $request)
    {
        $query = KhoaHoc::withCount(['lopHoc', 'hoSo'])
            ->whereNotNull('ma_khoa'); // chỉ lấy khóa đào tạo (có mã)

        if ($request->hang_bang) {
            $query->where('hang_bang', $request->hang_bang);
        }
        if ($request->nam) {
            $query->where('nam', $request->nam);
        }

        $list = $query->orderByDesc('nam')->orderByDesc('thang')->get()
            ->map(fn($k) => [
                'id'                => $k->id,
                'ma_khoa'           => $k->ma_khoa,
                'ten_khoa_dao_tao'  => $k->ten_khoa_dao_tao,
                'thang'             => $k->thang,
                'nam'               => $k->nam,
                'hang_bang'         => $k->hang_bang,
                'trang_thai'        => $k->trang_thai_khoa,
                'ghi_chu'           => $k->ghi_chu,
                'lop_count'         => $k->lop_hoc_count,
                'hoc_vien_count'    => $k->ho_so_count,
            ]);

        return response()->json(['success' => true, 'data' => $list]);
    }

    // ── Chi tiết khóa học đào tạo (kèm lớp + học viên) ───────────────────────
    public function show($id)
    {
        $khoa = KhoaHoc::findOrFail($id);

        // Lấy các lớp thuộc khóa này
        $lopHoc = LopHoc::with([
                'giangVienLyThuyet.user',
                'giangVienThucHanh.user',
                'hocVienLop',
                'xeLop.xe',
            ])
            ->withCount('hocVienLop')
            ->where('khoa_hoc_id', $id)
            ->get()
            ->map(fn($l) => [
                'id'                        => $l->id,
                'ten_lop'                   => $l->ten_lop,
                'giang_vien_ly_thuyet_id'   => $l->giang_vien_ly_thuyet_id,
                'giang_vien_thuc_hanh_id'   => $l->giang_vien_thuc_hanh_id,
                'giang_vien_ly_thuyet'      => $l->giangVienLyThuyet,
                'giang_vien_thuc_hanh'      => $l->giangVienThucHanh,
                'ngay_khai_giang'           => $l->ngay_khai_giang?->format('Y-m-d'),
                'si_so_toi_da'              => $l->si_so_toi_da,
                'trang_thai'                => $l->trang_thai,
                'ghi_chu'                   => $l->ghi_chu,
                'hoc_vien_count'            => $l->hoc_vien_lop_count,
                'xe_lop'                    => $l->xeLop,
                'xe_ids'                    => $l->xeLop->pluck('xe_id')->toArray(),
            ]);

        // Lấy học viên thuộc khóa này
        $hocVien = HoSoHocVien::with(['hocVienLop.lopHoc'])
            ->where('khoa_hoc_id', $id)
            ->get()
            ->map(fn($hv) => [
                'id'                    => $hv->id,
                'ho_ten'                => $hv->ho_ten,
                'so_cccd'               => $hv->so_cccd,
                'so_dien_thoai'         => $hv->so_dien_thoai,
                'trang_thai'            => $hv->trang_thai,
                'trang_thai_hoc_phi'    => $hv->trang_thai_hoc_phi,
                'lop_hoc'               => $hv->hocVienLop?->lopHoc,
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id'                => $khoa->id,
                'ma_khoa'           => $khoa->ma_khoa,
                'ten_khoa_dao_tao'  => $khoa->ten_khoa_dao_tao,
                'thang'             => $khoa->thang,
                'nam'               => $khoa->nam,
                'hang_bang'         => $khoa->hang_bang,
                'trang_thai'        => $khoa->trang_thai_khoa,
                'ghi_chu'           => $khoa->ghi_chu,
                'lop_hoc'           => $lopHoc,
                'hoc_vien'          => $hocVien,
                'hoc_vien_count'    => $hocVien->count(),
            ],
        ]);
    }

    // ── Tạo khóa học đào tạo ─────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'ma_khoa'           => 'required|string|max:20|unique:khoa_hoc,ma_khoa',
            'ten_khoa_dao_tao'  => 'required|string|max:200',
            'thang'             => 'required|integer|min:1|max:12',
            'nam'               => 'required|integer|min:2020|max:2050',
            'hang_bang'         => 'required|string|max:5',
        ]);

        $khoa = KhoaHoc::create([
            'ma_khoa'           => $request->ma_khoa,
            'ten_khoa_dao_tao'  => $request->ten_khoa_dao_tao,
            'ten_khoa'          => $request->ten_khoa_dao_tao, // dùng chung cột
            'thang'             => $request->thang,
            'nam'               => $request->nam,
            'hang_bang'         => $request->hang_bang,
            'loai_bang'         => $request->hang_bang,        // dùng chung cột
            'trang_thai_khoa'   => 'chuan_bi',
            'ghi_chu'           => $request->ghi_chu,
            'is_active'         => true,
            // Giá trị mặc định cho các trường bắt buộc
            'hoc_phi'           => 0,
            'so_buoi_ly_thuyet_toi_thieu' => 0,
            'so_km_toi_thieu'   => 0,
        ]);

        return response()->json(['success' => true, 'message' => 'Tạo khóa học thành công', 'data' => $khoa], 201);
    }

    // ── Cập nhật khóa học đào tạo ────────────────────────────────────────────
    public function update(Request $request, $id)
    {
        $khoa = KhoaHoc::findOrFail($id);

        $request->validate([
            'ma_khoa' => 'sometimes|string|max:20|unique:khoa_hoc,ma_khoa,' . $id,
        ]);

        $khoa->update([
            'ma_khoa'           => $request->ma_khoa ?? $khoa->ma_khoa,
            'ten_khoa_dao_tao'  => $request->ten_khoa_dao_tao ?? $khoa->ten_khoa_dao_tao,
            'ten_khoa'          => $request->ten_khoa_dao_tao ?? $khoa->ten_khoa,
            'thang'             => $request->thang ?? $khoa->thang,
            'nam'               => $request->nam ?? $khoa->nam,
            'hang_bang'         => $request->hang_bang ?? $khoa->hang_bang,
            'loai_bang'         => $request->hang_bang ?? $khoa->loai_bang,
            'trang_thai_khoa'   => $request->trang_thai ?? $khoa->trang_thai_khoa,
            'ghi_chu'           => $request->ghi_chu ?? $khoa->ghi_chu,
        ]);

        return response()->json(['success' => true, 'message' => 'Cập nhật thành công']);
    }

    // ── Xóa khóa học đào tạo ─────────────────────────────────────────────────
    public function destroy($id)
    {
        $khoa = KhoaHoc::withCount(['lopHoc'])->findOrFail($id);

        // Kiểm tra có học viên đang học (trang_thai = dang_hoc) không
        $hocVienDangHoc = \App\Models\HoSoHocVien::where('khoa_hoc_id', $id)
            ->where('trang_thai', 'dang_hoc')
            ->count();

        if ($hocVienDangHoc > 0) {
            return response()->json([
                'success' => false,
                'message' => "Không thể xóa khóa học đang có {$hocVienDangHoc} học viên đang học.",
            ], 400);
        }

        // Xóa khóa học — các lớp học bên trong sẽ tự xóa theo (onDelete cascade)
        $khoa->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa khóa học và ' . $khoa->lop_hoc_count . ' lớp học liên quan.',
        ]);
    }

    // ── Tạo lớp học trong khóa đào tạo ───────────────────────────────────────
    public function storeLop(Request $request, $khoaId)
    {
        $khoa = KhoaHoc::findOrFail($khoaId);

        $request->validate([
            'ten_lop' => 'required|string|max:100',
        ]);

        $lop = LopHoc::create([
            'khoa_hoc_id'               => $khoaId,
            'ten_lop'                   => $request->ten_lop,
            'giang_vien_ly_thuyet_id'   => $request->giang_vien_ly_thuyet_id ?: null,
            'giang_vien_thuc_hanh_id'   => $request->giang_vien_thuc_hanh_id ?: null,
            'ngay_khai_giang'           => $request->ngay_khai_giang ?: null,
            'si_so_toi_da'              => $request->si_so_toi_da ?? 30,
            'trang_thai'                => 'chuan_bi',
            'ghi_chu'                   => $request->ghi_chu ?: null,
        ]);

        return response()->json(['success' => true, 'message' => 'Tạo lớp học thành công', 'data' => $lop], 201);
    }

    // ── Cập nhật lớp học ─────────────────────────────────────────────────────
    public function updateLop(Request $request, $lopId)
    {
        $lop = LopHoc::findOrFail($lopId);

        $lop->update([
            'ten_lop'                   => $request->ten_lop ?? $lop->ten_lop,
            'giang_vien_ly_thuyet_id'   => $request->giang_vien_ly_thuyet_id ?: null,
            'giang_vien_thuc_hanh_id'   => $request->giang_vien_thuc_hanh_id ?: null,
            'ngay_khai_giang'           => $request->ngay_khai_giang ?: $lop->ngay_khai_giang,
            'si_so_toi_da'              => $request->si_so_toi_da ?? $lop->si_so_toi_da,
            'trang_thai'                => $request->trang_thai ?? $lop->trang_thai,
            'ghi_chu'                   => $request->ghi_chu ?? $lop->ghi_chu,
        ]);

        return response()->json(['success' => true, 'message' => 'Cập nhật lớp thành công']);
    }

    // ── Xóa lớp học ──────────────────────────────────────────────────────────
    public function destroyLop($lopId)
    {
        $lop = LopHoc::findOrFail($lopId);

        if ($lop->hocVienLop()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa lớp đang có học viên',
            ], 400);
        }

        $lop->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa lớp học']);
    }

    // ── Phân học viên vào lớp ────────────────────────────────────────────────
    public function phanHocVien(Request $request, $lopId)
    {
        $lop = LopHoc::findOrFail($lopId);

        $request->validate([
            'ho_so_ids'   => 'required|array|min:1',
            'ho_so_ids.*' => 'exists:ho_so_hoc_vien,id',
        ]);

        $khoa = KhoaHoc::findOrFail($lop->khoa_hoc_id);
        $soHienTai = $lop->hocVienLop()->count();
        $soThem = count($request->ho_so_ids);

        if ($soHienTai + $soThem > $lop->si_so_toi_da) {
            return response()->json([
                'success' => false,
                'message' => "Lớp chỉ còn " . ($lop->si_so_toi_da - $soHienTai) . " chỗ trống",
            ], 400);
        }

        DB::transaction(function () use ($request, $lop) {
            foreach ($request->ho_so_ids as $hoSoId) {
                $hoSo = HoSoHocVien::find($hoSoId);
                if (!$hoSo) continue;

                // Tạo bản ghi hoc_vien_lop
                \App\Models\HocVienLop::updateOrCreate(
                    ['ho_so_id' => $hoSoId],
                    [
                        'lop_hoc_id'    => $lop->id,
                        'ngay_xep_lop'  => now(),
                        'so_buoi_ly_thuyet_da_hoc'  => 0,
                        'so_buoi_thuc_hanh_da_hoc'  => 0,
                        'so_km_da_chay'             => 0,
                        'du_dieu_kien_thi_tn'       => false,
                    ]
                );

                // Cập nhật trạng thái học viên
                $hoSo->update(['trang_thai' => 'dang_hoc']);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Đã phân ' . $soThem . ' học viên vào lớp',
        ]);
    }

    // ── Phân xe cho lớp ──────────────────────────────────────────────────────
    public function phanXe(Request $request, $lopId)
    {
        $lop = LopHoc::findOrFail($lopId);

        $request->validate([
            'xe_ids'   => 'required|array',
            'xe_ids.*' => 'exists:xe,id',
        ]);

        // Xóa xe cũ, thêm xe mới
        XeLopHoc::where('lop_hoc_id', $lopId)->delete();

        foreach ($request->xe_ids as $xeId) {
            XeLopHoc::create(['lop_hoc_id' => $lopId, 'xe_id' => $xeId]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật xe cho lớp (' . count($request->xe_ids) . ' xe)',
        ]);
    }

    // ── Danh sách học viên chờ mở lớp theo hạng bằng ────────────────────────
    public function hocVienChoMoLop(Request $request)
    {
        $query = HoSoHocVien::where('trang_thai', 'cho_mo_lop')
            ->where('trang_thai_hoc_phi', 'da_dong');

        // Lọc theo hạng bằng (qua khoa_hoc)
        if ($request->hang_bang) {
            $query->whereHas('khoaHoc', fn($q) => $q->where('loai_bang', $request->hang_bang));
        }

        $list = $query->with('khoaHoc')->get()->map(fn($hv) => [
            'id'                    => $hv->id,
            'ho_ten'                => $hv->ho_ten,
            'so_cccd'               => $hv->so_cccd,
            'so_dien_thoai'         => $hv->so_dien_thoai,
            'trang_thai_hoc_phi'    => $hv->trang_thai_hoc_phi,
            'khoa_hoc'              => $hv->khoaHoc ? ['loai_bang' => $hv->khoaHoc->loai_bang] : null,
        ]);

        return response()->json(['success' => true, 'data' => $list]);
    }
}
