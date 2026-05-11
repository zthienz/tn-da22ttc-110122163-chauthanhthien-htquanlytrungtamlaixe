<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\GiangVien;
use App\Models\KhoaHoc;
use App\Models\LopHoc;
use App\Models\LichHoc;
use App\Models\ThanhToanHocPhi;
use App\Models\HoSoHocVien;
use App\Models\HocVienLop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // ─── Dashboard ───────────────────────────────────────────────────────────
    public function dashboard()
    {
        $tongHoSo      = HoSoHocVien::count();
        $choMoLop      = HoSoHocVien::where('trang_thai', 'cho_mo_lop')->count();
        $dangHoc       = HoSoHocVien::where('trang_thai', 'dang_hoc')->count();
        $tongKhoaHoc   = KhoaHoc::where('is_active', true)->count();
        $lichHocHomNay = LichHoc::whereDate('ngay_hoc', today())->count();

        // Doanh thu tháng này
        $doanhThu = ThanhToanHocPhi::where('trang_thai', 'thanh_cong')
            ->whereMonth('ngay_thanh_toan', now()->month)
            ->whereYear('ngay_thanh_toan', now()->year)
            ->sum('so_tien');

        // Doanh thu 7 ngày gần nhất
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date    = now()->subDays($i);
            $revenue = ThanhToanHocPhi::where('trang_thai', 'thanh_cong')
                ->whereDate('ngay_thanh_toan', $date)->sum('so_tien');
            $chartData[] = ['date' => $date->format('d/m'), 'revenue' => (float) $revenue];
        }

        return response()->json([
            'success'   => true,
            'stats'     => [
                'tongHoSo'  => $tongHoSo,
                'choMoLop'  => $choMoLop,
                'dangHoc'   => $dangHoc,
                'khoaHoc'   => $tongKhoaHoc,
                'lichHoc'   => $lichHocHomNay,
                'doanhThu'  => (float) $doanhThu,
            ],
            'chartData' => $chartData,
        ]);
    }

    // ─── Danh sách hồ sơ học viên ────────────────────────────────────────────
    public function hoSoList(Request $request)
    {
        $query = HoSoHocVien::with(['khoaHoc', 'user'])
            ->when($request->trang_thai, fn($q) => $q->where('trang_thai', $request->trang_thai))
            ->when($request->search, fn($q) => $q
                ->where('ho_ten', 'like', "%{$request->search}%")
                ->orWhere('so_cccd', 'like', "%{$request->search}%")
                ->orWhere('so_dien_thoai', 'like', "%{$request->search}%")
            );

        $data = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data'    => $data->items(),
            'total'   => $data->total(),
            'pages'   => $data->lastPage(),
        ]);
    }

    // ─── Chi tiết hồ sơ ──────────────────────────────────────────────────────
    public function hoSoDetail($id)
    {
        $hoSo = HoSoHocVien::with([
            'khoaHoc',
            'user',
            'thanhToan',
            'hocVienLop.lopHoc.giangVienLyThuyet.user',
            'hocVienLop.lopHoc.giangVienThucHanh.user',
            'ketQuaThi.baiThi',
            'ketQuaThi.lichThi',
        ])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $hoSo]);
    }

    // ─── Admin nhập hồ sơ offline ────────────────────────────────────────────
    public function taoHoSoOffline(Request $request)
    {
        $request->validate([
            'ho_ten'      => 'required|string|max:100',
            'ngay_sinh'   => 'required|date',
            'so_cccd'     => 'required|string|max:20|unique:ho_so_hoc_vien,so_cccd',
            'khoa_hoc_id' => 'required|exists:khoa_hoc,id',
            'so_dien_thoai' => 'nullable|string|max:15',
            'dia_chi'     => 'nullable|string',
            'email'       => 'nullable|email',
        ]);

        $khoa = KhoaHoc::findOrFail($request->khoa_hoc_id);

        $hoSo = HoSoHocVien::create([
            'user_id'       => null, // chưa có tài khoản
            'khoa_hoc_id'   => $request->khoa_hoc_id,
            'ho_ten'        => $request->ho_ten,
            'ngay_sinh'     => $request->ngay_sinh,
            'so_cccd'       => $request->so_cccd,
            'dia_chi'       => $request->dia_chi,
            'so_dien_thoai' => $request->so_dien_thoai,
            'email'         => $request->email,
            'nguon_dang_ky' => 'offline',
            'trang_thai'    => 'cho_dong_hoc_phi',
            'trang_thai_hoc_phi' => 'chua_dong',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã tạo hồ sơ học viên offline thành công',
            'data'    => $hoSo,
        ], 201);
    }

    // ─── Ghi nhận đóng học phí ───────────────────────────────────────────────
    public function ghiNhanHocPhi(Request $request, $hoSoId)
    {
        $request->validate([
            'so_tien'     => 'required|numeric|min:1',
            'phuong_thuc' => 'required|in:tien_mat,chuyen_khoan,vnpay,momo',
        ]);

        $hoSo = HoSoHocVien::findOrFail($hoSoId);
        $khoa = KhoaHoc::findOrFail($hoSo->khoa_hoc_id);

        // Kiểm tra đã đóng đủ chưa
        if ($hoSo->trang_thai_hoc_phi === 'da_dong') {
            return response()->json([
                'success' => false,
                'message' => 'Học viên đã đóng đủ học phí rồi',
            ], 400);
        }

        // Ghi nhận thanh toán
        ThanhToanHocPhi::create([
            'ho_so_id'        => $hoSoId,
            'so_tien'         => $request->so_tien,
            'phuong_thuc'     => $request->phuong_thuc,
            'ma_giao_dich'    => $request->ma_giao_dich ?? null,
            'trang_thai'      => 'thanh_cong',
            'nguoi_thu'       => $request->auth_user->ho_ten,
            'ghi_chu'         => $request->ghi_chu ?? null,
            'ngay_thanh_toan' => now(),
        ]);

        // Cập nhật hồ sơ
        $hoSo->update([
            'hoc_phi_da_dong'    => $request->so_tien,
            'trang_thai_hoc_phi' => 'da_dong',
            'ngay_dong_hoc_phi'  => now(),
            'trang_thai'         => 'cho_mo_lop',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ghi nhận học phí thành công. Học viên chuyển sang trạng thái chờ mở lớp.',
            'data'    => $hoSo->fresh(),
        ]);
    }

    // ─── TẠO TÀI KHOẢN HỌC VIÊN (sau khi xếp vào lớp) ──────────────────────
    /**
     * Tài khoản: Số CCCD
     * Mật khẩu mặc định: Ngày sinh định dạng DDMMYYYY (VD: 16052004)
     */
    public function taoTaiKhoanHocVien(Request $request, $hoSoId)
    {
        $hoSo = HoSoHocVien::findOrFail($hoSoId);

        // Kiểm tra điều kiện
        if ($hoSo->trang_thai_hoc_phi !== 'da_dong') {
            return response()->json([
                'success' => false,
                'message' => 'Học viên chưa đóng học phí, không thể tạo tài khoản',
            ], 400);
        }

        if ($hoSo->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Học viên đã có tài khoản rồi',
            ], 400);
        }

        // Mật khẩu mặc định = ngày sinh DDMMYYYY
        $ngaySinh    = \Carbon\Carbon::parse($hoSo->ngay_sinh);
        $matKhauMacDinh = $ngaySinh->format('dmY'); // VD: 16052004

        DB::beginTransaction();
        try {
            // Tạo user
            $user = User::create([
                'ho_ten'        => $hoSo->ho_ten,
                'email'         => 'cccd_' . $hoSo->so_cccd, // dùng CCCD làm email nội bộ
                'password'      => Hash::make($matKhauMacDinh),
                'role'          => 'hoc_vien',
                'so_dien_thoai' => $hoSo->so_dien_thoai,
                'is_active'     => true,
            ]);

            // Gắn user vào hồ sơ
            $hoSo->update(['user_id' => $user->id]);

            DB::commit();

            return response()->json([
                'success'  => true,
                'message'  => 'Tạo tài khoản học viên thành công',
                'tai_khoan' => [
                    'so_cccd'        => $hoSo->so_cccd,
                    'mat_khau'       => $matKhauMacDinh,
                    'huong_dan'      => 'Học viên dùng số CCCD và ngày sinh (DDMMYYYY) để đăng nhập',
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tạo tài khoản: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ─── Xếp học viên vào lớp + tạo tài khoản ───────────────────────────────
    public function xepLopVaTaoTaiKhoan(Request $request, $hoSoId)
    {
        $request->validate([
            'lop_hoc_id' => 'required|exists:lop_hoc,id',
        ]);

        $hoSo   = HoSoHocVien::findOrFail($hoSoId);
        $lopHoc = LopHoc::with('khoaHoc')->findOrFail($request->lop_hoc_id);

        if ($hoSo->trang_thai_hoc_phi !== 'da_dong') {
            return response()->json([
                'success' => false,
                'message' => 'Học viên chưa đóng học phí',
            ], 400);
        }

        // Kiểm tra sĩ số
        $siSoHienTai = HocVienLop::where('lop_hoc_id', $request->lop_hoc_id)->count();
        if ($siSoHienTai >= $lopHoc->si_so_toi_da) {
            return response()->json([
                'success' => false,
                'message' => 'Lớp học đã đầy sĩ số',
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Tạo tài khoản nếu chưa có
            if (!$hoSo->user_id) {
                $ngaySinh = \Carbon\Carbon::parse($hoSo->ngay_sinh);
                $matKhau  = $ngaySinh->format('dmY');

                $user = User::create([
                    'ho_ten'        => $hoSo->ho_ten,
                    'email'         => 'cccd_' . $hoSo->so_cccd,
                    'password'      => Hash::make($matKhau),
                    'role'          => 'hoc_vien',
                    'so_dien_thoai' => $hoSo->so_dien_thoai,
                    'is_active'     => true,
                ]);
                $hoSo->update(['user_id' => $user->id]);
            }

            // Xếp vào lớp
            HocVienLop::updateOrCreate(
                ['ho_so_id' => $hoSoId],
                [
                    'lop_hoc_id'   => $request->lop_hoc_id,
                    'ngay_xep_lop' => today(),
                ]
            );

            // Cập nhật trạng thái hồ sơ
            $hoSo->update(['trang_thai' => 'dang_hoc']);

            // Cập nhật trạng thái lớp nếu cần
            if ($lopHoc->trang_thai === 'chuan_bi') {
                $lopHoc->update(['trang_thai' => 'dang_hoc']);
            }

            DB::commit();

            $ngaySinhFmt = \Carbon\Carbon::parse($hoSo->ngay_sinh)->format('dmY');

            return response()->json([
                'success' => true,
                'message' => "Đã xếp học viên vào lớp {$lopHoc->ten_lop} và tạo tài khoản thành công",
                'tai_khoan' => [
                    'so_cccd'   => $hoSo->so_cccd,
                    'mat_khau'  => $ngaySinhFmt,
                    'huong_dan' => 'Học viên dùng số CCCD và ngày sinh (DDMMYYYY) để đăng nhập tại cổng học viên',
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ─── Reset mật khẩu học viên về mặc định ─────────────────────────────────
    public function resetMatKhauHocVien($hoSoId)
    {
        $hoSo = HoSoHocVien::findOrFail($hoSoId);

        if (!$hoSo->user_id) {
            return response()->json(['success' => false, 'message' => 'Học viên chưa có tài khoản'], 400);
        }

        $user     = User::findOrFail($hoSo->user_id);
        $ngaySinh = \Carbon\Carbon::parse($hoSo->ngay_sinh);
        $matKhau  = $ngaySinh->format('dmY');

        $user->update(['password' => Hash::make($matKhau)]);

        return response()->json([
            'success'  => true,
            'message'  => 'Đã reset mật khẩu về mặc định',
            'mat_khau' => $matKhau,
        ]);
    }

    // ─── Cập nhật trạng thái hồ sơ ───────────────────────────────────────────
    public function capNhatTrangThai(Request $request, $hoSoId)
    {
        $request->validate([
            'trang_thai' => 'required|string',
        ]);

        $hoSo = HoSoHocVien::findOrFail($hoSoId);
        $hoSo->update(['trang_thai' => $request->trang_thai]);

        return response()->json(['success' => true, 'message' => 'Cập nhật trạng thái thành công']);
    }

    // ─── Danh sách giảng viên ────────────────────────────────────────────────
    public function giangVienList()
    {
        $list = GiangVien::with('user')->get()->map(fn($gv) => [
            'id'              => $gv->id,
            'user_id'         => $gv->user_id,
            'ho_ten'          => $gv->user->ho_ten ?? '',
            'email'           => $gv->user->email ?? '',
            'so_dien_thoai'   => $gv->user->so_dien_thoai ?? '',
            'chuyen_mon'      => $gv->chuyen_mon,
            'bang_cap'        => $gv->bang_cap,
            'nam_kinh_nghiem' => $gv->nam_kinh_nghiem,
            'is_active'       => $gv->user->is_active ?? true,
        ]);

        return response()->json(['success' => true, 'data' => $list]);
    }

    // ─── Tạo tài khoản giảng viên ────────────────────────────────────────────
    public function taoGiangVien(Request $request)
    {
        $request->validate([
            'ho_ten'      => 'required|string',
            'email'       => 'required|email|unique:users,email',
            'password'    => 'required|min:8',
            'chuyen_mon'  => 'required|in:ly_thuyet,thuc_hanh,ca_hai',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'ho_ten'        => $request->ho_ten,
                'email'         => $request->email,
                'password'      => Hash::make($request->password),
                'role'          => 'giang_vien',
                'so_dien_thoai' => $request->so_dien_thoai ?? null,
                'is_active'     => true,
            ]);

            GiangVien::create([
                'user_id'         => $user->id,
                'chuyen_mon'      => $request->chuyen_mon,
                'bang_cap'        => $request->bang_cap ?? null,
                'nam_kinh_nghiem' => $request->nam_kinh_nghiem ?? 0,
                'ghi_chu'         => $request->ghi_chu ?? null,
            ]);

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Tạo tài khoản giảng viên thành công'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ─── Kích hoạt / vô hiệu hóa tài khoản ──────────────────────────────────
    public function toggleUser($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);
        $status = $user->is_active ? 'kích hoạt' : 'vô hiệu hóa';
        return response()->json(['success' => true, 'message' => "Đã {$status} tài khoản"]);
    }
}
