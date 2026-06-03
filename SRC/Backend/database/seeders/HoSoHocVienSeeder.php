<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\HoSoHocVien;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Tạo lại hồ sơ học viên (không cần khóa đào tạo / lớp học).
 * Tất cả ở trạng thái cho_dong_hoc_phi, gắn vào khóa học loại bằng lái còn tồn tại.
 *
 * Khóa học hiện có:
 *   id=1 A1 | id=2 A | id=3 B1 | id=4 B2 | id=5 C1 | id=6 C | id=7 D | id=8 E
 */
class HoSoHocVienSeeder extends Seeder
{
    // [hoTen, soCccd, ngaySinh(dmY), sdt, email, khoaHocId, nguon]
    private array $hocVien = [
        // Chờ đóng HP — online
        ['Huỳnh Bảo Trâm',  '079204001001', '15032004', '0911001001', 'huynhbaotram@gmail.com',   3, 'online',  'hocvien_HuynhBaoTram.jpg'],
        ['Huỳnh Yến Nhi',   '079204001002', '22072004', '0911001002', 'huynhyennhi@gmail.com',    3, 'online',  'hocvien_HuynhYenNhi.jpg'],
        ['Kim Anh Tuyết',   '079204001003', '10052003', '0911001003', 'kimanhthuyet@gmail.com',   3, 'online',  'hocvien_KimAnhTuyet.jpg'],
        ['Lê Hữu Nghĩa',    '079204001004', '05092003', '0911001004', 'lehuunghia@gmail.com',     3, 'online',  'hocvien_LeHuuNghia.jpg'],
        ['Liêu Như Yên',    '079204001005', '18112003', '0911001005', 'lieunhuyen@gmail.com',     3, 'online',  'hocvien_LieuNhuYen.jpg'],
        // Chờ đóng HP — offline
        ['Phạm Tuyết Trân', '079204001006', '30012004', '0911001006', 'phamtuyettran@gmail.com',  4, 'offline', 'hocvien_PhamTuyetTran.jpg'],
        ['Phạm Văn Khôi',   '079204001007', '14062003', '0911001007', 'phamvankhoi@gmail.com',    4, 'offline', 'hocvien_PhamVanKhoi.webp'],
        ['Phan Bảo Khánh',  '079204001008', '25082004', '0911001008', 'phanbaokhanh@gmail.com',   4, 'offline', 'hocvien_PhanBaoKhanh.jpg'],
        ['Tô Tuyết Anh',    '079204001009', '07042004', '0911001009', 'totuyetanh@gmail.com',     3, 'offline', 'hocvien_ToTuyetAnh.jpg'],
        ['Trần Tấn Tài',    '079204001010', '12102003', '0911001010', 'trantantai@gmail.com',     3, 'offline', 'hocvien_TranTanTai.jpg'],
        ['Trần Minh Hiếu',  '079204001011', '20022004', '0911001011', 'tranminhhieu@gmail.com',   3, 'online',  'họcvien_TranMinhHieu.jpg'],
        ['Võ Thành Nam',    '079204001012', '03112003', '0911001012', 'vothanhnam@gmail.com',     4, 'online',  'hocvien_VoThanhNam.jpg'],
        ['Nguyễn Thị Lan',  '079204001013', '25061999', '0911001013', 'nguyenthilan@gmail.com',   4, 'offline', null],
        ['Trần Văn Bình',   '079204001014', '08031998', '0911001014', 'tranvanbinh@gmail.com',    4, 'offline', null],
        ['Lê Thị Hoa',      '079204001015', '14091997', '0911001015', 'lethihoa@gmail.com',       3, 'online',  null],
        ['Nguyễn Văn An',   '079204001016', '30072000', '0911001016', 'nguyenvanan@gmail.com',    3, 'online',  null],
        ['Phạm Thị Mai',    '079204001017', '19052001', '0911001017', 'phamthimai@gmail.com',     1, 'online',  null],
        ['Đỗ Minh Tuấn',    '079204001018', '22112002', '0911001018', 'dominhtuan@gmail.com',     1, 'offline', null],
        ['Trần Mỹ Hà',      '079204001019', '15081995', '0911001019', 'tranmyha@gmail.com',       4, 'offline', null],
        ['Nguyễn Thị Bích', '079204001020', '09031996', '0911001020', 'nguyenthibich@gmail.com',  6, 'online',  null],
    ];

    public function run(): void
    {
        foreach ($this->hocVien as $hv) {
            [$hoTen, $soCccd, $ngaySinhStr, $sdt, $email, $khoaId, $nguon, $anh] = $hv;

            // Bỏ qua nếu CCCD đã tồn tại
            if (HoSoHocVien::where('so_cccd', $soCccd)->exists()) continue;

            // Tạo tài khoản học viên
            $emailNb = 'cccd_' . $soCccd;
            $user = User::firstOrCreate(
                ['email' => $emailNb],
                [
                    'ho_ten'        => $hoTen,
                    'password'      => Hash::make($ngaySinhStr),
                    'role'          => 'hoc_vien',
                    'so_dien_thoai' => $sdt,
                    'is_active'     => true,
                ]
            );

            $d = substr($ngaySinhStr, 0, 2);
            $m = substr($ngaySinhStr, 2, 2);
            $y = substr($ngaySinhStr, 4, 4);

            HoSoHocVien::create([
                'user_id'            => $user->id,
                'khoa_hoc_id'        => $khoaId,
                'ho_ten'             => $hoTen,
                'ngay_sinh'          => "$y-$m-$d",
                'so_cccd'            => $soCccd,
                'so_dien_thoai'      => $sdt,
                'email'              => $email,
                'anh_the'            => $anh,
                'nguon_dang_ky'      => $nguon,
                'trang_thai_hoc_phi' => 'chua_dong',
                'hoc_phi_da_dong'    => 0,
                'trang_thai'         => 'cho_dong_hoc_phi',
            ]);
        }

        $this->command->info('✅ Đã tạo ' . count($this->hocVien) . ' hồ sơ học viên (trạng thái: Chờ đóng học phí)');
    }
}
