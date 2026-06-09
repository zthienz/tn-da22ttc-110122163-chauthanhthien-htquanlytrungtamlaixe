<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\GiangVien;
use App\Models\KhoaHoc;
use App\Models\HoSoHocVien;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder tạo 100 học viên mẫu + 15 giảng viên mẫu
 * Ảnh dùng xoay vòng từ hocvien_sample_001..100.jpg và giangvien_sample_01..15.jpg
 */
class HocVienGiangVienSampleSeeder extends Seeder
{
    // ── Dữ liệu họ/tên mẫu tiếng Việt ───────────────────────────────────────

    private array $ho = [
        'Nguyễn','Trần','Lê','Phạm','Hoàng','Huỳnh','Phan','Vũ','Võ','Đặng',
        'Bùi','Đỗ','Hồ','Ngô','Dương','Lý','Đinh','Tô','Đoàn','Trịnh',
    ];

    private array $tenDem = [
        'Văn','Thị','Hữu','Đức','Minh','Thanh','Quang','Ngọc','Anh','Bảo',
        'Thành','Tấn','Kim','Xuân','Phương','Hồng','Nhật','Việt','Tuấn','Mỹ',
    ];

    private array $ten = [
        'An','Bình','Chi','Dũng','Em','Giang','Hà','Hùng','Khoa','Lan',
        'Mai','Nam','Oanh','Phúc','Quân','Sang','Tâm','Uyên','Vinh','Yên',
        'Hiếu','Khánh','Long','Nhân','Sơn','Thắng','Toàn','Trung','Vân','Xuân',
    ];

    private array $chuyenMon = ['ly_thuyet','thuc_hanh','ca_hai'];

    private array $bangCap = [
        'Cử nhân Luật giao thông','Bằng lái hạng C','Bằng lái hạng B2',
        'Kỹ sư Cơ khí Ô tô','Cử nhân Công nghệ Kỹ thuật','Bằng lái hạng D',
    ];

    private function genHoTen(int $idx): string
    {
        return $this->ho[$idx % 20] . ' '
             . $this->tenDem[$idx % 20] . ' '
             . $this->ten[$idx % 30];
    }

    private function genCccd(int $base): string
    {
        // CCCD 12 số duy nhất, bắt đầu từ 0799900001001
        return str_pad('0799900001' . str_pad($base, 3, '0', STR_PAD_LEFT), 12, '0', STR_PAD_LEFT);
    }

    private function genNgaySinh(int $idx): string
    {
        $year  = 1990 + ($idx % 12);
        $month = ($idx % 12) + 1;
        $day   = ($idx % 28) + 1;
        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }

    public function run(): void
    {
        $this->createGiangVien();
        $this->createHocVien();
    }

    // ── 15 Giảng viên ────────────────────────────────────────────────────────
    private function createGiangVien(): void
    {
        $this->command?->info('Tạo 15 giảng viên mẫu...');

        for ($i = 1; $i <= 15; $i++) {
            $hoTen    = $this->genHoTen($i + 40);
            $email    = 'gv.sample' . str_pad($i, 2, '0', STR_PAD_LEFT) . '@laixe.com';
            $ngaySinh = $this->genNgaySinh($i + 10);
            $ext      = 'jpg';
            // Ảnh giảng viên mẫu — xoay vòng, giữ đúng ext
            $anhSrc   = "giangvien_sample_{$i}.jpg";
            if ($i % 5 === 0) $anhSrc = "giangvien_sample_{$i}.webp";
            // Dùng file .jpg cho tất cả (đã copy)
            $anhPath  = 'giang_vien/giangvien_sample_' . str_pad($i, 2, '0', STR_PAD_LEFT) . '.jpg';
            // webp cho index 5,10,15
            if (in_array($i, [5, 10, 15])) {
                $anhPath = 'giang_vien/giangvien_sample_' . str_pad($i, 2, '0', STR_PAD_LEFT) . '.webp';
            }

            if (User::where('email', $email)->exists()) continue;

            $user = User::create([
                'ho_ten'        => $hoTen,
                'email'         => $email,
                'password'      => Hash::make('GiangVien@123'),
                'role'          => 'giang_vien',
                'so_dien_thoai' => '09' . str_pad(mt_rand(0, 99999999), 8, '0', STR_PAD_LEFT),
                'is_active'     => true,
            ]);

            GiangVien::create([
                'user_id'         => $user->id,
                'chuyen_mon'      => $this->chuyenMon[$i % 3],
                'bang_cap'        => $this->bangCap[$i % 6],
                'nam_kinh_nghiem' => ($i % 10) + 1,
                'trang_thai'      => 'san_sang',
                'anh_dai_dien'    => $anhPath,
                'ghi_chu'         => 'Giảng viên mẫu số ' . $i,
            ]);
        }

        $this->command?->info('✅ Đã tạo 15 giảng viên mẫu');
    }

    // ── 100 Học viên ─────────────────────────────────────────────────────────
    private function createHocVien(): void
    {
        $this->command?->info('Tạo 100 học viên mẫu...');

        // Lấy danh sách khóa học để phân bổ
        $khoaHocIds = KhoaHoc::whereNotNull('ma_khoa')->pluck('id')->toArray();
        if (empty($khoaHocIds)) {
            $khoaHocIds = KhoaHoc::pluck('id')->toArray();
        }

        $trangThaiList = [
            'cho_dong_hoc_phi',
            'cho_mo_lop',
            'cho_mo_lop',
            'dang_hoc',
            'dang_hoc',
            'dang_hoc',
            'du_dieu_kien_thi_tn',
            'hoan_thanh_tn',
        ];

        for ($i = 1; $i <= 100; $i++) {
            $hoTen    = $this->genHoTen($i);
            $cccd     = $this->genCccd($i);
            $ngaySinh = $this->genNgaySinh($i);
            $email    = 'hv.sample' . str_pad($i, 3, '0', STR_PAD_LEFT) . '@gmail.com';

            // Ảnh: xoay vòng 100 ảnh mẫu
            $anhIdx  = str_pad($i, 3, '0', STR_PAD_LEFT);
            // ext: webp cho index chia hết cho 5
            $ext = ($i % 5 === 0) ? 'webp' : 'jpg';
            $anhPath = "hoc_vien/hocvien_sample_{$anhIdx}.{$ext}";

            if (HoSoHocVien::where('so_cccd', $cccd)->exists()) continue;

            $khoaId   = $khoaHocIds[$i % count($khoaHocIds)];
            $trangThai = $trangThaiList[$i % count($trangThaiList)];

            $hocPhiDaDong = in_array($trangThai, ['cho_dong_hoc_phi']) ? 0 : 15000000;
            $ttHocPhi     = $hocPhiDaDong > 0 ? 'da_dong' : 'chua_dong';

            // Tạo user
            $d = substr($ngaySinh, 8, 2);
            $m = substr($ngaySinh, 5, 2);
            $y = substr($ngaySinh, 0, 4);
            $matKhau = $d . $m . $y;

            $user = User::create([
                'ho_ten'        => $hoTen,
                'email'         => 'cccd_' . $cccd,
                'password'      => Hash::make($matKhau),
                'role'          => 'hoc_vien',
                'so_dien_thoai' => '09' . str_pad($i + 10000000, 8, '0', STR_PAD_LEFT),
                'is_active'     => true,
            ]);

            HoSoHocVien::create([
                'user_id'            => $user->id,
                'khoa_hoc_id'        => $khoaId,
                'ho_ten'             => $hoTen,
                'ngay_sinh'          => $ngaySinh,
                'so_cccd'            => $cccd,
                'so_dien_thoai'      => $user->so_dien_thoai,
                'email'              => $email,
                'anh_the'            => $anhPath,
                'nguon_dang_ky'      => $i % 3 === 0 ? 'online' : 'offline',
                'trang_thai_hoc_phi' => $ttHocPhi,
                'hoc_phi_da_dong'    => $hocPhiDaDong,
                'ngay_dong_hoc_phi'  => $hocPhiDaDong > 0 ? now()->subDays($i % 60 + 1) : null,
                'trang_thai'         => $trangThai,
                'ghi_chu'            => 'Học viên mẫu số ' . $i,
            ]);
        }

        $this->command?->info('✅ Đã tạo 100 học viên mẫu');
    }
}
