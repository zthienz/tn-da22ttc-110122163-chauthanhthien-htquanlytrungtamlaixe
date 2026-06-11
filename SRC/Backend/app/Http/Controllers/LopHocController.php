<?php

namespace App\Http\Controllers;

use App\Models\LopHoc;
use App\Models\HoSoHocVien;
use App\Models\GiangVien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LopHocController extends Controller
{
    public function index(Request $request)
    {
        $lop = LopHoc::with([
                'khoaHoc',
                'giangVienLyThuyet.user',
                'giangVienThucHanh.user',
                'xeLop.xe',  // xe thực hành phân cho lớp
            ])
            ->withCount('hocVienLop')
            ->when($request->trang_thai, fn($q) => $q->where('trang_thai', $request->trang_thai))
            ->latest()
            ->get()
            ->map(fn($l) => [
                'id'                       => $l->id,
                'ten_lop'                  => $l->ten_lop,
                'khoa_hoc_id'              => $l->khoa_hoc_id,
                'khoa_hoc'                 => $l->khoaHoc,
                'giang_vien_ly_thuyet_id'  => $l->giang_vien_ly_thuyet_id,
                'giang_vien_thuc_hanh_id'  => $l->giang_vien_thuc_hanh_id,
                'giang_vien_ly_thuyet'     => $l->giangVienLyThuyet,
                'giang_vien_thuc_hanh'     => $l->giangVienThucHanh,
                'xe_lop'                   => $l->xeLop,  // danh sách xe thực hành kèm trạng thái
                'ngay_khai_giang'          => $l->ngay_khai_giang?->format('Y-m-d'),
                'ngay_ket_thuc'            => $l->ngay_ket_thuc?->format('Y-m-d'),
                'si_so_toi_da'             => $l->si_so_toi_da,
                'trang_thai'               => $l->trang_thai,
                'ghi_chu'                  => $l->ghi_chu,
                'hoc_vien_count'           => $l->hoc_vien_lop_count,
            ]);

        return response()->json(['success' => true, 'data' => $lop]);
    }

    public function show($id)
    {
        $lop = LopHoc::with([
            'khoaHoc',
            'giangVienLyThuyet.user',
            'giangVienThucHanh.user',
            'hocVienLop.hoSo',
            'lichHoc',
        ])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $lop]);
    }

    /**
     * Kiểm tra giảng viên có thể được xếp dạy không.
     * Điều kiện: tài khoản đang hoạt động VÀ trạng thái là san_sang.
     */
    private function kiemTraGiangVienHopLe(?int $gvId, string $vai): ?array
    {
        if (!$gvId) return null;
        $gv = GiangVien::with('user')->find($gvId);
        if (!$gv) return ['success' => false, 'message' => "Không tìm thấy giảng viên ({$vai})."];
        if (!$gv->user?->is_active) {
            return ['success' => false, 'message' => "Giảng viên {$gv->user->ho_ten} ({$vai}) đang bị khóa tài khoản, không thể xếp dạy."];
        }
        $tt = $gv->trang_thai ?? 'san_sang';
        if ($tt !== 'san_sang') {
            $ttLabel = $tt === 'nghi_phep' ? 'đang nghỉ phép' : 'đang bị đình chỉ';
            return ['success' => false, 'message' => "Giảng viên {$gv->user->ho_ten} ({$vai}) {$ttLabel}, không thể xếp dạy."];
        }
        return null;
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_lop'     => 'required|string|max:100',
            'khoa_hoc_id' => 'required|exists:khoa_hoc,id',
        ]);

        // Kiểm tra giảng viên hợp lệ
        if ($request->giang_vien_ly_thuyet_id) {
            $err = $this->kiemTraGiangVienHopLe((int)$request->giang_vien_ly_thuyet_id, 'lý thuyết');
            if ($err) return response()->json($err, 422);
        }
        if ($request->giang_vien_thuc_hanh_id) {
            $err = $this->kiemTraGiangVienHopLe((int)$request->giang_vien_thuc_hanh_id, 'thực hành');
            if ($err) return response()->json($err, 422);
        }

        $lop = LopHoc::create([
            'khoa_hoc_id'             => $request->khoa_hoc_id,
            'ten_lop'                 => $request->ten_lop,
            'giang_vien_ly_thuyet_id' => $request->giang_vien_ly_thuyet_id ?: null,
            'giang_vien_thuc_hanh_id' => $request->giang_vien_thuc_hanh_id ?: null,
            'ngay_khai_giang'         => $request->ngay_khai_giang ?: null,
            'ngay_ket_thuc'           => $request->ngay_ket_thuc ?: null,
            'si_so_toi_da'            => $request->si_so_toi_da ?? 30,
            'trang_thai'              => 'chuan_bi',
            'ghi_chu'                 => $request->ghi_chu ?: null,
        ]);

        $this->dongBoTrangThaiKhoaHoc($lop->khoa_hoc_id);

        return response()->json([
            'success' => true,
            'message' => 'Tạo lớp học thành công',
            'data'    => $lop,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $lop = LopHoc::findOrFail($id);
        $trangThaiCu  = $lop->trang_thai;
        $trangThaiMoi = $request->trang_thai ?? $lop->trang_thai;

        DB::beginTransaction();
        try {
            // Kiểm tra giảng viên hợp lệ khi có thay đổi
            $gvLTId = $request->has('giang_vien_ly_thuyet_id') ? ($request->giang_vien_ly_thuyet_id ?: null) : $lop->giang_vien_ly_thuyet_id;
            $gvTHId = $request->has('giang_vien_thuc_hanh_id') ? ($request->giang_vien_thuc_hanh_id ?: null) : $lop->giang_vien_thuc_hanh_id;

            if ($gvLTId && $request->has('giang_vien_ly_thuyet_id')) {
                $err = $this->kiemTraGiangVienHopLe((int)$gvLTId, 'lý thuyết');
                if ($err) return response()->json($err, 422);
            }
            if ($gvTHId && $request->has('giang_vien_thuc_hanh_id')) {
                $err = $this->kiemTraGiangVienHopLe((int)$gvTHId, 'thực hành');
                if ($err) return response()->json($err, 422);
            }

            $lop->update([
                'ten_lop'                 => $request->ten_lop ?? $lop->ten_lop,
                'khoa_hoc_id'             => $request->khoa_hoc_id ?? $lop->khoa_hoc_id,
                'giang_vien_ly_thuyet_id' => $request->giang_vien_ly_thuyet_id ?: null,
                'giang_vien_thuc_hanh_id' => $request->giang_vien_thuc_hanh_id ?: null,
                'ngay_khai_giang'         => $request->ngay_khai_giang ?: $lop->ngay_khai_giang,
                'ngay_ket_thuc'           => $request->ngay_ket_thuc ?: $lop->ngay_ket_thuc,
                'si_so_toi_da'            => $request->si_so_toi_da ?? $lop->si_so_toi_da,
                'trang_thai'              => $trangThaiMoi,
                'ghi_chu'                 => $request->ghi_chu ?? $lop->ghi_chu,
            ]);

            // Khi lớp chuyển sang đang_hoc → cập nhật học viên chưa học sang dang_hoc
            if ($trangThaiCu !== 'dang_hoc' && $trangThaiMoi === 'dang_hoc') {
                HoSoHocVien::whereHas('hocVienLop', fn($q) => $q->where('lop_hoc_id', $lop->id))
                    ->whereIn('trang_thai', ['cho_mo_lop', 'chuan_bi_hoc'])
                    ->update(['trang_thai' => 'dang_hoc']);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Cập nhật thất bại: ' . $e->getMessage()], 500);
        }

        $this->dongBoTrangThaiKhoaHoc($lop->khoa_hoc_id);

        return response()->json(['success' => true, 'message' => 'Cập nhật lớp học thành công']);
    }

    public function destroy($id)
    {
        $lop = LopHoc::findOrFail($id);

        DB::beginTransaction();
        try {
            // Chuyển học viên trong lớp về chờ xếp lớp
            HoSoHocVien::whereHas('hocVienLop', fn($q) => $q->where('lop_hoc_id', $lop->id))
                ->update(['trang_thai' => 'cho_mo_lop']);

            // Xóa bản ghi hoc_vien_lop
            $lop->hocVienLop()->delete();
            $khoaHocId = $lop->khoa_hoc_id;
            $lop->delete();

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Xóa thất bại: ' . $e->getMessage()], 500);
        }

        $this->dongBoTrangThaiKhoaHoc($khoaHocId);

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa lớp học. Học viên đã được chuyển về trạng thái chờ xếp lớp.',
        ]);
    }

    /**
     * Đồng bộ trang_thai_khoa dựa trên trạng thái các lớp học bên trong:
     *   - Không có lớp nào              → chuan_bi
     *   - Có ít nhất 1 lớp dang_hoc     → dang_hoc
     *   - Tất cả lớp đều da_ket_thuc    → da_ket_thuc
     *   - Còn lại (tất cả chuan_bi)     → chuan_bi
     */
    private function dongBoTrangThaiKhoaHoc(int $khoaHocId): void
    {
        $lops = LopHoc::where('khoa_hoc_id', $khoaHocId)
            ->pluck('trang_thai');

        if ($lops->isEmpty()) {
            $ttMoi = 'chuan_bi';
        } elseif ($lops->contains('dang_hoc')) {
            $ttMoi = 'dang_hoc';
        } elseif ($lops->every(fn($tt) => $tt === 'da_ket_thuc')) {
            $ttMoi = 'da_ket_thuc';
        } else {
            $ttMoi = 'chuan_bi';
        }

        \App\Models\KhoaHoc::where('id', $khoaHocId)
            ->update(['trang_thai_khoa' => $ttMoi]);
    }

    /**
     * Đồng bộ lại trạng thái hồ sơ học viên theo trạng thái lớp hiện tại.
     * Dùng khi dữ liệu bị lệch (lớp đang học nhưng học viên vẫn ở cho_mo_lop).
     */
    public function dongBoTrangThai($id)
    {
        $lop = LopHoc::findOrFail($id);

        $soHV = 0;

        if ($lop->trang_thai === 'dang_hoc') {
            $soHV = HoSoHocVien::whereHas('hocVienLop', fn($q) => $q->where('lop_hoc_id', $lop->id))
                ->whereIn('trang_thai', ['cho_mo_lop', 'chuan_bi_hoc'])
                ->update(['trang_thai' => 'dang_hoc']);
        }

        return response()->json([
            'success' => true,
            'message' => "Đã đồng bộ {$soHV} học viên sang trạng thái phù hợp với lớp [{$lop->ten_lop}]",
            'so_hv_cap_nhat' => $soHV,
        ]);
    }
}
