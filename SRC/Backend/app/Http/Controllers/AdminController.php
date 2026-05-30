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
use App\Models\BaoLoiXe;
use App\Models\DiemDanh;
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

    // ─── Chart doanh thu theo kỳ ─────────────────────────────────────────────
    public function chartDoanhThu(Request $request)
    {
        $ky = $request->ky ?? 'thang_nay'; // thang_nay | thang | quy | nam
        $data = [];

        switch ($ky) {
            // Tất cả các ngày trong tháng hiện tại
            case 'thang_nay':
                $daysInMonth = now()->daysInMonth;
                for ($d = 1; $d <= $daysInMonth; $d++) {
                    $date    = now()->startOfMonth()->addDays($d - 1);
                    $revenue = ThanhToanHocPhi::where('trang_thai', 'thanh_cong')
                        ->whereDate('ngay_thanh_toan', $date)->sum('so_tien');
                    $data[] = ['label' => $date->format('d/m'), 'revenue' => (float) $revenue];
                }
                break;

            // 12 tháng gần nhất
            case 'thang':
                for ($i = 11; $i >= 0; $i--) {
                    $date    = now()->subMonths($i);
                    $revenue = ThanhToanHocPhi::where('trang_thai', 'thanh_cong')
                        ->whereMonth('ngay_thanh_toan', $date->month)
                        ->whereYear('ngay_thanh_toan',  $date->year)
                        ->sum('so_tien');
                    $data[] = ['label' => 'T' . $date->format('n/y'), 'revenue' => (float) $revenue];
                }
                break;

            // 8 quý gần nhất (2 năm)
            case 'quy':
                for ($i = 7; $i >= 0; $i--) {
                    $date     = now()->subMonths($i * 3);
                    $quy      = ceil($date->month / 3);
                    $startM   = ($quy - 1) * 3 + 1;
                    $endM     = $quy * 3;
                    $revenue  = ThanhToanHocPhi::where('trang_thai', 'thanh_cong')
                        ->whereYear('ngay_thanh_toan', $date->year)
                        ->whereMonth('ngay_thanh_toan', '>=', $startM)
                        ->whereMonth('ngay_thanh_toan', '<=', $endM)
                        ->sum('so_tien');
                    $data[] = ['label' => "Q{$quy}/{$date->format('y')}", 'revenue' => (float) $revenue];
                }
                $seen = []; $unique = [];
                foreach ($data as $d) {
                    if (!in_array($d['label'], $seen)) { $seen[] = $d['label']; $unique[] = $d; }
                }
                $data = array_slice($unique, -8);
                break;

            // 5 năm gần nhất
            case 'nam':
                for ($i = 4; $i >= 0; $i--) {
                    $year    = now()->subYears($i)->year;
                    $revenue = ThanhToanHocPhi::where('trang_thai', 'thanh_cong')
                        ->whereYear('ngay_thanh_toan', $year)
                        ->sum('so_tien');
                    $data[] = ['label' => (string) $year, 'revenue' => (float) $revenue];
                }
                break;
        }

        return response()->json(['success' => true, 'data' => $data]);
    }

    // ─── Chart học viên đăng ký mới vs hoàn thành (6 tháng) ─────────────────
    public function chartHocVien()
    {
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $date  = now()->subMonths($i);
            $month = $date->month;
            $year  = $date->year;

            $dangKy = HoSoHocVien::whereMonth('created_at', $month)
                ->whereYear('created_at', $year)
                ->count();

            $hoanThanh = HoSoHocVien::whereIn('trang_thai', ['da_cap_bang', 'du_dieu_kien_thi_tn'])
                ->whereMonth('updated_at', $month)
                ->whereYear('updated_at', $year)
                ->count();

            $data[] = [
                'label'       => 'T' . $date->format('n/y'),
                'dang_ky'     => $dangKy,
                'hoan_thanh'  => $hoanThanh,
            ];
        }
        return response()->json(['success' => true, 'data' => $data]);
    }

    // ─── Hoạt động gần đây ───────────────────────────────────────────────────
    public function hoatDongGanDay()
    {
        $activities = collect();

        // 1. Hồ sơ mới đăng ký (online qua trang quảng bá)
        HoSoHocVien::with('khoaHoc')
            ->where('nguon_dang_ky', 'online')
            ->latest()->limit(8)->get()
            ->each(fn($h) => $activities->push([
                'type'  => 'ho_so_online',
                'icon'  => '🌐',
                'color' => '#3b82f6',
                'title' => "Đăng ký mới: {$h->ho_ten}",
                'desc'  => ($h->khoaHoc ? "Hạng {$h->khoaHoc->hang_bang}" : 'Chưa chọn khóa')
                         . ' · ' . ($h->so_dien_thoai ?: $h->email ?: '—'),
                'time'  => $h->created_at,
                'link'  => '/ho-so',
            ]));

        // 2. Hồ sơ mới tạo offline (admin tạo)
        HoSoHocVien::with('khoaHoc')
            ->where('nguon_dang_ky', 'offline')
            ->latest()->limit(5)->get()
            ->each(fn($h) => $activities->push([
                'type'  => 'ho_so_offline',
                'icon'  => '📋',
                'color' => '#6366f1',
                'title' => "Hồ sơ mới: {$h->ho_ten}",
                'desc'  => ($h->khoaHoc ? "Hạng {$h->khoaHoc->hang_bang}" : 'Chưa chọn khóa')
                         . ' · Đăng ký trực tiếp',
                'time'  => $h->created_at,
                'link'  => '/ho-so',
            ]));

        // 3. Thanh toán học phí gần đây
        ThanhToanHocPhi::with('hoSo')
            ->where('trang_thai', 'thanh_cong')
            ->latest()->limit(8)->get()
            ->each(fn($t) => $activities->push([
                'type'  => 'thanh_toan',
                'icon'  => '💰',
                'color' => '#10b981',
                'title' => 'Đóng học phí: ' . ($t->hoSo?->ho_ten ?? '—'),
                'desc'  => number_format($t->so_tien, 0, ',', '.') . 'đ'
                         . ' · ' . match($t->phuong_thuc) {
                               'tien_mat'       => 'Tiền mặt',
                               'chuyen_khoan'   => 'Chuyển khoản',
                               default          => $t->phuong_thuc ?? '—',
                           }
                         . ($t->ghi_chu ? " · {$t->ghi_chu}" : ''),
                'time'  => $t->created_at,
                'link'  => '/ho-so',
            ]));

        // 4. Báo lỗi xe từ giảng viên
        BaoLoiXe::with(['xe', 'giangVien.user'])
            ->latest()->limit(8)->get()
            ->each(fn($b) => $activities->push([
                'type'  => 'bao_loi_xe',
                'icon'  => match($b->muc_do) {
                    'nghiem_trong' => '🔴',
                    'trung_binh'   => '🟠',
                    default        => '🟡',
                },
                'color' => match($b->muc_do) {
                    'nghiem_trong' => '#ef4444',
                    'trung_binh'   => '#f97316',
                    default        => '#f59e0b',
                },
                'title' => 'Báo lỗi xe: ' . $b->tieu_de,
                'desc'  => ($b->xe?->bien_so ?? '—')
                         . ' · GV: ' . ($b->giangVien?->user?->ho_ten ?? '—')
                         . ($b->mo_ta ? ' · ' . mb_substr($b->mo_ta, 0, 60) . (mb_strlen($b->mo_ta) > 60 ? '...' : '') : ''),
                'time'  => $b->created_at,
                'link'  => '/xe',
            ]));

        // 5. Học viên vắng mặt có ghi lý do (điểm danh gần đây)
        DiemDanh::with(['hoSo', 'lichHoc.lopHoc'])
            ->where('co_mat', false)
            ->whereNotNull('ghi_chu')
            ->where('ghi_chu', '!=', '')
            ->latest()->limit(8)->get()
            ->each(fn($d) => $activities->push([
                'type'  => 'vang_mat',
                'icon'  => '❌',
                'color' => '#8b5cf6',
                'title' => 'Vắng mặt: ' . ($d->hoSo?->ho_ten ?? '—'),
                'desc'  => ($d->lichHoc?->lopHoc?->ten_lop ?? '—')
                         . ' · ' . ($d->lichHoc?->ngay_hoc?->format('d/m/Y') ?? '—')
                         . ' · Lý do: ' . $d->ghi_chu,
                'time'  => $d->created_at,
                'link'  => '/lich-hoc',
            ]));

        // Gộp, sắp xếp theo thời gian mới nhất, lấy 15 hoạt động
        $result = $activities
            ->filter(fn($a) => $a['time'] !== null)
            ->sortByDesc('time')
            ->take(15)
            ->values()
            ->map(fn($a) => array_merge($a, [
                'time_human' => $a['time']->diffForHumans(),
                'time_fmt'   => $a['time']->format('d/m/Y H:i'),
            ]));

        return response()->json(['success' => true, 'data' => $result]);
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
            'ho_ten'        => 'required|string|max:100',
            'ngay_sinh'     => 'required|date',
            'so_cccd'       => 'required|string|size:12|regex:/^\d{12}$/|unique:ho_so_hoc_vien,so_cccd',
            'khoa_hoc_id'   => 'required|exists:khoa_hoc,id',
            'so_dien_thoai' => 'nullable|string|regex:/^0\d{9}$/',
            'dia_chi'       => 'nullable|string',
            'email'         => 'nullable|string|regex:/@gmail\.com$/i',
            'anh_the'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        // Xử lý upload ảnh thẻ — lưu thẳng vào public/anh_the/
        $anhThePath = null;
        if ($request->hasFile('anh_the')) {
            $file     = $request->file('anh_the');
            $fileName = 'hocvien_' . preg_replace('/[^a-zA-Z0-9]/', '', $request->ho_ten) . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads'), $fileName);
            $anhThePath = $fileName;
        }

        $hoSo = HoSoHocVien::create([
            'user_id'            => null,
            'khoa_hoc_id'        => $request->khoa_hoc_id,
            'ho_ten'             => $request->ho_ten,
            'ngay_sinh'          => $request->ngay_sinh,
            'so_cccd'            => $request->so_cccd,
            'dia_chi'            => $request->dia_chi,
            'so_dien_thoai'      => $request->so_dien_thoai,
            'email'              => $request->email,
            'anh_the'            => $anhThePath,
            'nguon_dang_ky'      => 'offline',
            'trang_thai'         => 'cho_dong_hoc_phi',
            'trang_thai_hoc_phi' => 'chua_dong',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã tạo hồ sơ học viên offline thành công',
            'data'    => $hoSo,
        ], 201);
    }

    // ─── Upload ảnh thẻ riêng lẻ ─────────────────────────────────────────────
    public function uploadAnhThe(Request $request, $hoSoId)
    {
        $request->validate([
            'anh_the' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $hoSo = HoSoHocVien::findOrFail($hoSoId);

        $file     = $request->file('anh_the');
        $fileName = 'hocvien_' . preg_replace('/[^a-zA-Z0-9]/', '', $hoSo->ho_ten) . '_' . time() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('uploads'), $fileName);

        $hoSo->update(['anh_the' => $fileName]);

        return response()->json([
            'success'  => true,
            'message'  => 'Cập nhật ảnh thẻ thành công',
            'anh_the'  => $fileName,
            'anh_url'  => url('uploads/' . $fileName),
        ]);
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
        $ngaySinh       = \Carbon\Carbon::parse($hoSo->ngay_sinh);
        $matKhauMacDinh = $ngaySinh->format('dmY');
        $emailNb        = 'cccd_' . $hoSo->so_cccd;

        DB::beginTransaction();
        try {
            // Kiểm tra email nội bộ đã tồn tại chưa
            $existingUser = User::where('email', $emailNb)->first();
            if ($existingUser) {
                $hoSo->update(['user_id' => $existingUser->id]);
                DB::commit();
                return response()->json([
                    'success'   => true,
                    'message'   => 'Đã liên kết tài khoản hiện có cho học viên',
                    'tai_khoan' => [
                        'so_cccd'   => $hoSo->so_cccd,
                        'mat_khau'  => $matKhauMacDinh,
                        'huong_dan' => 'Học viên dùng số CCCD và ngày sinh (DDMMYYYY) để đăng nhập',
                    ],
                ]);
            }

            // Tạo user mới
            $user = User::create([
                'ho_ten'        => $hoSo->ho_ten,
                'email'         => $emailNb,
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
                $emailNb  = 'cccd_' . $hoSo->so_cccd;

                // Kiểm tra email nội bộ đã tồn tại chưa (tránh duplicate)
                $existingUser = User::where('email', $emailNb)->first();
                if ($existingUser) {
                    // Gắn user đã có vào hồ sơ
                    $hoSo->update(['user_id' => $existingUser->id]);
                } else {
                    $user = User::create([
                        'ho_ten'        => $hoSo->ho_ten,
                        'email'         => $emailNb,
                        'password'      => Hash::make($matKhau),
                        'role'          => 'hoc_vien',
                        'so_dien_thoai' => $hoSo->so_dien_thoai,
                        'is_active'     => true,
                    ]);
                    $hoSo->update(['user_id' => $user->id]);
                }
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

    // ─── Cập nhật thông tin hồ sơ ────────────────────────────────────────────
    public function capNhatHoSo(Request $request, $hoSoId)
    {
        $hoSo = HoSoHocVien::findOrFail($hoSoId);

        $request->validate([
            'ho_ten'        => 'required|string|max:100',
            'ngay_sinh'     => 'required|date',
            'so_cccd'       => 'required|string|size:12|regex:/^\d{12}$/|unique:ho_so_hoc_vien,so_cccd,' . $hoSoId,
            'khoa_hoc_id'   => 'required|exists:khoa_hoc,id',
            'so_dien_thoai' => 'nullable|string|regex:/^0\d{9}$/',
            'dia_chi'       => 'nullable|string',
            'email'         => 'nullable|string|regex:/@gmail\.com$/i',
            'anh_the'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $anhThePath = $hoSo->anh_the;
        if ($request->hasFile('anh_the')) {
            $file     = $request->file('anh_the');
            $fileName = 'hocvien_' . preg_replace('/[^a-zA-Z0-9]/', '', $request->ho_ten) . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads'), $fileName);
            $anhThePath = $fileName;
        }

        $hoSo->update([
            'ho_ten'        => $request->ho_ten,
            'ngay_sinh'     => $request->ngay_sinh,
            'so_cccd'       => $request->so_cccd,
            'khoa_hoc_id'   => $request->khoa_hoc_id,
            'so_dien_thoai' => $request->so_dien_thoai,
            'dia_chi'       => $request->dia_chi,
            'email'         => $request->email,
            'anh_the'       => $anhThePath,
        ]);

        return response()->json(['success' => true, 'message' => 'Cập nhật hồ sơ thành công', 'data' => $hoSo->fresh()]);
    }

    // ─── Xóa hồ sơ ───────────────────────────────────────────────────────────
    public function xoaHoSo($hoSoId)
    {
        $hoSo = HoSoHocVien::findOrFail($hoSoId);

        if (in_array($hoSo->trang_thai, ['dang_hoc', 'da_cap_bang'])) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa hồ sơ học viên đang học hoặc đã cấp bằng',
            ], 400);
        }

        $hoSo->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa hồ sơ học viên']);
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
            'ghi_chu'         => $gv->ghi_chu,
            'anh_dai_dien'    => $gv->anh_dai_dien,
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
            'anh_dai_dien' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
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

            $anhPath = null;
            if ($request->hasFile('anh_dai_dien')) {
                $file     = $request->file('anh_dai_dien');
                $fileName = 'giangvien_' . preg_replace('/[^a-zA-Z0-9]/', '', $request->ho_ten) . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads'), $fileName);
                $anhPath = $fileName;
            }

            GiangVien::create([
                'user_id'         => $user->id,
                'chuyen_mon'      => $request->chuyen_mon,
                'bang_cap'        => $request->bang_cap ?? null,
                'nam_kinh_nghiem' => $request->nam_kinh_nghiem ?? 0,
                'ghi_chu'         => $request->ghi_chu ?? null,
                'anh_dai_dien'    => $anhPath,
            ]);

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Tạo tài khoản giảng viên thành công'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ─── Cập nhật thông tin giảng viên ───────────────────────────────────────
    public function capNhatGiangVien(Request $request, $id)
    {
        $giangVien = GiangVien::with('user')->findOrFail($id);

        $request->validate([
            'so_dien_thoai'   => 'nullable|string|regex:/^0\d{9}$/',
            'chuyen_mon'      => 'required|in:ly_thuyet,thuc_hanh,ca_hai',
            'bang_cap'        => 'nullable|string|max:255',
            'nam_kinh_nghiem' => 'nullable|integer|min:0',
            'ghi_chu'         => 'nullable|string',
            'anh_dai_dien'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        // Cập nhật user
        $giangVien->user->update([
            'so_dien_thoai' => $request->so_dien_thoai,
        ]);

        // Xử lý ảnh mới nếu có
        $anhPath = $giangVien->anh_dai_dien;
        if ($request->hasFile('anh_dai_dien')) {
            $file     = $request->file('anh_dai_dien');
            $fileName = 'giangvien_' . preg_replace('/[^a-zA-Z0-9]/', '', $giangVien->user->ho_ten) . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads'), $fileName);
            $anhPath = $fileName;
        }

        // Cập nhật giảng viên
        $giangVien->update([
            'chuyen_mon'      => $request->chuyen_mon,
            'bang_cap'        => $request->bang_cap,
            'nam_kinh_nghiem' => $request->nam_kinh_nghiem ?? 0,
            'ghi_chu'         => $request->ghi_chu,
            'anh_dai_dien'    => $anhPath,
        ]);

        return response()->json(['success' => true, 'message' => 'Cập nhật giảng viên thành công']);
    }

    // ─── Xóa giảng viên ──────────────────────────────────────────────────────
    public function xoaGiangVien($id)
    {
        $giangVien = GiangVien::with('user')->findOrFail($id);

        // Kiểm tra giảng viên có đang dạy lớp nào không
        $lopDangDay = LopHoc::where('giang_vien_ly_thuyet_id', $giangVien->id)
            ->orWhere('giang_vien_thuc_hanh_id', $giangVien->id)
            ->where('trang_thai', 'dang_hoc')
            ->count();

        if ($lopDangDay > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa giảng viên đang phụ trách lớp học',
            ], 400);
        }

        DB::beginTransaction();
        try {
            $userId = $giangVien->user_id;
            $giangVien->delete();
            User::where('id', $userId)->delete();
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Đã xóa giảng viên thành công']);
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
