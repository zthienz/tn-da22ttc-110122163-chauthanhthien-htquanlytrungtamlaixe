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

        $lop      = LopHoc::with(['giangVienLyThuyet.user', 'giangVienThucHanh.user', 'xeLop.xe'])->find($request->lop_hoc_id);
        $loaiBuoi = $request->loai_buoi;

        // ── Kiểm tra trùng khung giờ trong cùng lớp ─────────────────────────
        $trungLich = LichHoc::where('lop_hoc_id', $request->lop_hoc_id)
            ->where('ngay_hoc', $request->ngay_hoc)
            ->where('gio_bat_dau', '<', $request->gio_ket_thuc)
            ->where('gio_ket_thuc', '>', $request->gio_bat_dau)
            ->first();

        if ($trungLich) {
            $loaiLabel = $trungLich->loai_buoi === 'ly_thuyet' ? 'Lý thuyết' : 'Thực hành';
            return response()->json([
                'success' => false,
                'message' => "Lớp này đã có buổi {$loaiLabel} vào {$trungLich->gio_bat_dau}–{$trungLich->gio_ket_thuc} ngày {$trungLich->ngay_hoc}. Vui lòng chọn khung giờ khác.",
            ], 422);
        }

        // ── Kiểm tra xe thực hành bị trùng khung giờ với lớp khác ───────────
        if ($request->loai_buoi === 'thuc_hanh' && $request->xe_id) {
            $trungXe = LichHoc::where('xe_id', $request->xe_id)
                ->where('loai_buoi', 'thuc_hanh')
                ->where('ngay_hoc', $request->ngay_hoc)
                ->where('gio_bat_dau', '<', $request->gio_ket_thuc)
                ->where('gio_ket_thuc', '>', $request->gio_bat_dau)
                ->with('lopHoc')
                ->first();

            if ($trungXe) {
                $xe         = Xe::find($request->xe_id);
                $tenLopTrung = $trungXe->lopHoc->ten_lop ?? "lớp #{$trungXe->lop_hoc_id}";
                return response()->json([
                    'success' => false,
                    'message' => "Xe {$xe->bien_so} đã được phân công cho {$tenLopTrung} vào {$trungXe->gio_bat_dau}–{$trungXe->gio_ket_thuc} ngày {$trungXe->ngay_hoc}. Vui lòng chọn xe khác.",
                ], 422);
            }
        }

        // ── Kiểm tra trùng lịch dạy của giảng viên phụ trách ────────────────
        // Lấy GV phụ trách buổi này (theo loại buổi)
        $gvId = $loaiBuoi === 'ly_thuyet'
            ? $lop?->giang_vien_ly_thuyet_id
            : $lop?->giang_vien_thuc_hanh_id;

        if ($gvId) {
            // Lấy TẤT CẢ lớp mà GV này phụ trách (cả vai LT lẫn vai TH), trừ lớp đang tạo
            $lopKhacIds = LopHoc::where('id', '!=', $request->lop_hoc_id)
                ->where(function ($q) use ($gvId) {
                    $q->where('giang_vien_ly_thuyet_id', $gvId)
                      ->orWhere('giang_vien_thuc_hanh_id', $gvId);
                })
                ->pluck('id');

            if ($lopKhacIds->isNotEmpty()) {
                // Kiểm tra bất kỳ buổi nào (LT hoặc TH) của GV đó trùng khung giờ
                $trungGV = LichHoc::whereIn('lop_hoc_id', $lopKhacIds)
                    ->where('ngay_hoc', $request->ngay_hoc)
                    ->where('gio_bat_dau', '<', $request->gio_ket_thuc)
                    ->where('gio_ket_thuc', '>', $request->gio_bat_dau)
                    ->with('lopHoc')
                    ->first();

                if ($trungGV) {
                    $loaiLabel   = $loaiBuoi === 'ly_thuyet' ? 'Lý thuyết' : 'Thực hành';
                    $loaiTrung   = $trungGV->loai_buoi === 'ly_thuyet' ? 'Lý thuyết' : 'Thực hành';
                    $tenLopTrung = $trungGV->lopHoc->ten_lop ?? "lớp #{$trungGV->lop_hoc_id}";
                    $gvTen = $loaiBuoi === 'ly_thuyet'
                        ? $lop->giangVienLyThuyet?->user?->ho_ten
                        : $lop->giangVienThucHanh?->user?->ho_ten;
                    return response()->json([
                        'success' => false,
                        'message' => "GV {$loaiLabel} ({$gvTen}) đang có lịch dạy buổi {$loaiTrung} tại {$tenLopTrung} vào {$trungGV->gio_bat_dau}–{$trungGV->gio_ket_thuc} ngày {$trungGV->ngay_hoc}. Vui lòng chọn khung giờ khác.",
                    ], 422);
                }
            }
        }

        // ── Kiểm tra trạng thái giảng viên ──────────────────────────────────
        if ($loaiBuoi === 'ly_thuyet') {
            $gvLT = $lop->giangVienLyThuyet;
            if (!$gvLT) {
                return response()->json(['success' => false, 'message' => 'Lớp này chưa có GV Lý thuyết. Vui lòng phân công giảng viên trước khi xếp lịch.'], 422);
            }
            if ($gvLT->trang_thai !== 'san_sang') {
                $ttLabel = $gvLT->trang_thai === 'nghi_phep' ? 'đang nghỉ phép' : 'đang bị đình chỉ';
                return response()->json(['success' => false, 'message' => "GV Lý thuyết ({$gvLT->user->ho_ten}) {$ttLabel}. Vui lòng phân công giảng viên khác trước khi xếp lịch."], 422);
            }
        } else { // thuc_hanh
            $gvTH = $lop->giangVienThucHanh;
            if (!$gvTH) {
                return response()->json(['success' => false, 'message' => 'Lớp này chưa có GV Thực hành. Vui lòng phân công giảng viên trước khi xếp lịch.'], 422);
            }
            if ($gvTH->trang_thai !== 'san_sang') {
                $ttLabel = $gvTH->trang_thai === 'nghi_phep' ? 'đang nghỉ phép' : 'đang bị đình chỉ';
                return response()->json(['success' => false, 'message' => "GV Thực hành ({$gvTH->user->ho_ten}) {$ttLabel}. Vui lòng phân công giảng viên khác trước khi xếp lịch."], 422);
            }

            // ── Kiểm tra trạng thái xe thực hành của lớp ────────────────────
            // Lấy xe từ xe_lop_hoc; nếu không có thì dùng xe_id được gửi lên
            $xeError = $this->kiemTraXeThucHanh($lop, $request->xe_id);
            if ($xeError) {
                return response()->json(['success' => false, 'message' => $xeError], 422);
            }
        }

        $lichHoc = LichHoc::create($request->all());
        return response()->json(['success' => true, 'message' => 'Tạo lịch học thành công', 'data' => $lichHoc], 201);
    }

    // Admin: Cập nhật buổi học
    public function update(Request $request, $id)
    {
        $lichHoc = LichHoc::findOrFail($id);

        $loaiBuoi   = $request->input('loai_buoi', $lichHoc->loai_buoi);
        $lopHocId   = $request->input('lop_hoc_id', $lichHoc->lop_hoc_id);
        $ngayHoc    = $request->input('ngay_hoc',    $lichHoc->ngay_hoc);
        $gioBatDau  = $request->input('gio_bat_dau', $lichHoc->gio_bat_dau);
        $gioKetThuc = $request->input('gio_ket_thuc', $lichHoc->gio_ket_thuc);

        // ── Kiểm tra trùng khung giờ trong cùng lớp (bỏ qua bản ghi đang sửa) ──
        $trungLich = LichHoc::where('lop_hoc_id', $lopHocId)
            ->where('ngay_hoc', $ngayHoc)
            ->where('id', '!=', $id)
            ->where(function ($q) use ($gioBatDau, $gioKetThuc) {
                $q->where('gio_bat_dau', '<', $gioKetThuc)
                  ->where('gio_ket_thuc', '>', $gioBatDau);
            })
            ->first();

        if ($trungLich) {
            $loaiLabel = $trungLich->loai_buoi === 'ly_thuyet' ? 'Lý thuyết' : 'Thực hành';
            return response()->json([
                'success' => false,
                'message' => "Lớp này đã có buổi {$loaiLabel} vào {$trungLich->gio_bat_dau}–{$trungLich->gio_ket_thuc} ngày {$trungLich->ngay_hoc}. Vui lòng chọn khung giờ khác.",
            ], 422);
        }

        // ── Kiểm tra xe thực hành bị trùng khung giờ với lớp khác ───────────
        $xeIdMoi = $request->has('xe_id') ? $request->xe_id : $lichHoc->xe_id;
        if ($loaiBuoi === 'thuc_hanh' && $xeIdMoi) {
            $trungXe = LichHoc::where('xe_id', $xeIdMoi)
                ->where('loai_buoi', 'thuc_hanh')
                ->where('ngay_hoc', $ngayHoc)
                ->where('id', '!=', $id)
                ->where('gio_bat_dau', '<', $gioKetThuc)
                ->where('gio_ket_thuc', '>', $gioBatDau)
                ->with('lopHoc')
                ->first();

            if ($trungXe) {
                $xe          = Xe::find($xeIdMoi);
                $tenLopTrung = $trungXe->lopHoc->ten_lop ?? "lớp #{$trungXe->lop_hoc_id}";
                return response()->json([
                    'success' => false,
                    'message' => "Xe {$xe->bien_so} đã được phân công cho {$tenLopTrung} vào {$trungXe->gio_bat_dau}–{$trungXe->gio_ket_thuc} ngày {$trungXe->ngay_hoc}. Vui lòng chọn xe khác.",
                ], 422);
            }
        }

        // ── Kiểm tra trùng lịch dạy của giảng viên phụ trách ────────────────
        $lop   = LopHoc::with(['giangVienLyThuyet.user', 'giangVienThucHanh.user', 'xeLop.xe'])->find($lopHocId);
        $gvId  = $loaiBuoi === 'ly_thuyet'
            ? $lop?->giang_vien_ly_thuyet_id
            : $lop?->giang_vien_thuc_hanh_id;

        if ($gvId) {
            // Lấy TẤT CẢ lớp mà GV này phụ trách (cả vai LT lẫn vai TH), trừ lớp đang sửa
            $lopKhacIds = LopHoc::where('id', '!=', $lopHocId)
                ->where(function ($q) use ($gvId) {
                    $q->where('giang_vien_ly_thuyet_id', $gvId)
                      ->orWhere('giang_vien_thuc_hanh_id', $gvId);
                })
                ->pluck('id');

            if ($lopKhacIds->isNotEmpty()) {
                // Kiểm tra bất kỳ buổi nào (LT hoặc TH) của GV đó trùng khung giờ
                $trungGV = LichHoc::whereIn('lop_hoc_id', $lopKhacIds)
                    ->where('ngay_hoc', $ngayHoc)
                    ->where('id', '!=', $id)
                    ->where('gio_bat_dau', '<', $gioKetThuc)
                    ->where('gio_ket_thuc', '>', $gioBatDau)
                    ->with('lopHoc')
                    ->first();

                if ($trungGV) {
                    $loaiLabel   = $loaiBuoi === 'ly_thuyet' ? 'Lý thuyết' : 'Thực hành';
                    $loaiTrung   = $trungGV->loai_buoi === 'ly_thuyet' ? 'Lý thuyết' : 'Thực hành';
                    $tenLopTrung = $trungGV->lopHoc->ten_lop ?? "lớp #{$trungGV->lop_hoc_id}";
                    $gvTen = $loaiBuoi === 'ly_thuyet'
                        ? $lop->giangVienLyThuyet?->user?->ho_ten
                        : $lop->giangVienThucHanh?->user?->ho_ten;
                    return response()->json([
                        'success' => false,
                        'message' => "GV {$loaiLabel} ({$gvTen}) đang có lịch dạy buổi {$loaiTrung} tại {$tenLopTrung} vào {$trungGV->gio_bat_dau}–{$trungGV->gio_ket_thuc} ngày {$trungGV->ngay_hoc}. Vui lòng chọn khung giờ khác.",
                    ], 422);
                }
            }
        }

        if ($loaiBuoi === 'ly_thuyet') {
            $gvLT = $lop?->giangVienLyThuyet;
            if ($gvLT && $gvLT->trang_thai !== 'san_sang') {
                $ttLabel = $gvLT->trang_thai === 'nghi_phep' ? 'đang nghỉ phép' : 'đang bị đình chỉ';
                return response()->json(['success' => false, 'message' => "GV Lý thuyết ({$gvLT->user->ho_ten}) {$ttLabel}. Vui lòng phân công giảng viên khác trước khi xếp lịch."], 422);
            }
        } else { // thuc_hanh
            $gvTH = $lop?->giangVienThucHanh;
            if ($gvTH && $gvTH->trang_thai !== 'san_sang') {
                $ttLabel = $gvTH->trang_thai === 'nghi_phep' ? 'đang nghỉ phép' : 'đang bị đình chỉ';
                return response()->json(['success' => false, 'message' => "GV Thực hành ({$gvTH->user->ho_ten}) {$ttLabel}. Vui lòng phân công giảng viên khác trước khi xếp lịch."], 422);
            }

            // ── Kiểm tra trạng thái xe thực hành của lớp ────────────────────
            $xeId    = $request->has('xe_id') ? $request->xe_id : $lichHoc->xe_id;
            $xeError = $this->kiemTraXeThucHanh($lop, $xeId);
            if ($xeError) {
                return response()->json(['success' => false, 'message' => $xeError], 422);
            }
        }

        $lichHoc->update($request->all());
        return response()->json(['success' => true, 'message' => 'Cập nhật thành công']);
    }

    /**
     * Kiểm tra xe thực hành của lớp có đang ở trạng thái cho phép xếp lịch không.
     *
     * Logic: ưu tiên xe gán trực tiếp ($xeIdManual), sau đó xét tất cả xe
     * trong xe_lop_hoc của lớp. Chỉ cần TẤT CẢ xe đều bị bảo trì/hỏng mới
     * chặn — nếu còn ít nhất 1 xe sẵn sàng thì cho phép tạo lịch.
     *
     * @param  LopHoc|null  $lop
     * @param  int|null     $xeIdManual  xe_id được gửi lên từ request (có thể null)
     * @return string|null  null = OK, string = thông báo lỗi
     */
    private function kiemTraXeThucHanh(?LopHoc $lop, ?int $xeIdManual): ?string
    {
        $BAD_STATES  = ['bao_tri', 'hong'];
        $STATE_LABEL = ['bao_tri' => 'đang bảo trì', 'hong' => 'đang hỏng'];

        // ── Trường hợp 1: admin chỉ định xe cụ thể ──────────────────────────
        if ($xeIdManual) {
            $xe = Xe::find($xeIdManual);
            if ($xe && in_array($xe->trang_thai, $BAD_STATES)) {
                $label = $STATE_LABEL[$xe->trang_thai];
                return "Xe {$xe->bien_so} ({$xe->hang_xe} {$xe->dong_xe}) {$label}. Vui lòng chọn xe khác hoặc sửa chữa xe trước khi xếp lịch.";
            }
            return null; // xe được chỉ định hợp lệ
        }

        // ── Trường hợp 2: xe phân qua xe_lop_hoc của lớp ───────────────────
        if (!$lop) return null;

        $xeLopList = $lop->xeLop->filter(fn($xl) => $xl->xe !== null);
        if ($xeLopList->isEmpty()) return null; // chưa phân xe → không chặn

        // Lấy danh sách xe đang bị bảo trì / hỏng
        $xeXau = $xeLopList->filter(fn($xl) => in_array($xl->xe->trang_thai, $BAD_STATES));

        // Nếu còn xe sẵn sàng (không phải tất cả đều hỏng) → cho phép
        if ($xeXau->count() < $xeLopList->count()) return null;

        // Tất cả xe của lớp đều bị bảo trì / hỏng → chặn
        $danhSach = $xeXau->map(fn($xl) => "{$xl->xe->bien_so} ({$STATE_LABEL[$xl->xe->trang_thai]})")->implode(', ');
        return "Tất cả xe thực hành của lớp hiện không thể sử dụng: {$danhSach}. Vui lòng kiểm tra lại trạng thái xe trước khi xếp lịch.";
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
            'ho_so_id'            => $hvl->ho_so_id,
            'ho_ten'              => $hvl->hoSo->ho_ten ?? '—',
            'so_cccd'             => $hvl->hoSo->so_cccd ?? '—',
            'co_mat'              => $diemDanhMap[$hvl->ho_so_id]->co_mat ?? false,
            'km_chay'             => $diemDanhMap[$hvl->ho_so_id]->km_chay ?? '',
            'ghi_chu'             => $diemDanhMap[$hvl->ho_so_id]->ghi_chu ?? '',
            // Tiến độ học viên — dùng để ẩn điểm danh khi đã đủ tiến độ
            'du_buoi_ly_thuyet'   => (bool) $hvl->du_buoi_ly_thuyet,
            'du_km_thuc_hanh'     => (bool) $hvl->du_km_thuc_hanh,
            'du_dieu_kien_thi_tn' => (bool) $hvl->du_dieu_kien_thi_tn,
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
