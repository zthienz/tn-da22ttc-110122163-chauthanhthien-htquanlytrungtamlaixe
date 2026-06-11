<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Xe;

/**
 * XeSampleSeeder — Tạo 30 xe mẫu phân bổ đều cho tất cả các hạng bằng:
 *   A1 (4), A (3), B1 (4), B2 (5), C1 (3), C (4), D (3), E (2), CE (2)
 *
 * Ảnh dùng từ thư mục public/uploads/xe:
 *   xe_wave.jpg           → A1, A  (xe máy)
 *   xe_sh350.jpg          → A      (xe máy phân khối lớn)
 *   xe_vios.jpg           → B1, B2 (ô tô con)
 *   xe_kia.jpg            → B1     (ô tô con số tự động)
 *   xe_hyundai.jpg        → B2, C1 (ô tô / tải nhẹ)
 *   isuzu-bang-lai-ce.png → C, CE  (xe tải nặng / đầu kéo)
 *   xe_hyundai_16_cho.jpg → D      (xe khách 16 chỗ)
 *   thaco-29-cho.webp     → D      (xe khách 29 chỗ)
 *   limousine-30-cho.png  → E      (xe khách 30 chỗ limousine)
 *   thaco-36-cho.webp     → E      (xe khách 36 chỗ)
 */
class XeSampleSeeder extends Seeder
{
    public function run(): void
    {
        $xe = [

            // ══════════════════════════════════════════════
            // HẠNG A1 — Xe mô tô dưới 125cc (4 xe)
            // ══════════════════════════════════════════════
            [
                'bien_so'                    => '51E-11001',
                'hang_xe'                    => 'Honda',
                'dong_xe'                    => 'Wave Alpha',
                'nam_san_xuat'               => 2023,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'A1',
                'mau_xe'                     => 'Đỏ đen',
                'so_km_hien_tai'             => 9500,
                'ngay_dang_kiem'             => '2025-03-10',
                'ngay_dang_kiem_tiep_theo'   => '2027-03-10',
                'ngay_bao_hiem'              => '2027-03-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_wave.jpg',
            ],
            [
                'bien_so'                    => '51E-11002',
                'hang_xe'                    => 'Honda',
                'dong_xe'                    => 'Wave RSX',
                'nam_san_xuat'               => 2022,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'A1',
                'mau_xe'                     => 'Xanh đen',
                'so_km_hien_tai'             => 15200,
                'ngay_dang_kiem'             => '2024-09-05',
                'ngay_dang_kiem_tiep_theo'   => '2026-09-05',
                'ngay_bao_hiem'              => '2026-09-30',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_wave.jpg',
            ],
            [
                'bien_so'                    => '51E-11003',
                'hang_xe'                    => 'Yamaha',
                'dong_xe'                    => 'Sirius FI',
                'nam_san_xuat'               => 2023,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'A1',
                'mau_xe'                     => 'Trắng',
                'so_km_hien_tai'             => 7800,
                'ngay_dang_kiem'             => '2025-01-20',
                'ngay_dang_kiem_tiep_theo'   => '2027-01-20',
                'ngay_bao_hiem'              => '2027-01-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_wave.jpg',
            ],
            [
                'bien_so'                    => '51E-11004',
                'hang_xe'                    => 'Yamaha',
                'dong_xe'                    => 'Jupiter',
                'nam_san_xuat'               => 2021,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'A1',
                'mau_xe'                     => 'Đen',
                'so_km_hien_tai'             => 22000,
                'ngay_dang_kiem'             => '2024-05-15',
                'ngay_dang_kiem_tiep_theo'   => '2026-05-15',
                'ngay_bao_hiem'              => '2026-06-30',
                'trang_thai'                 => 'bao_tri',
                'ghi_chu'                    => 'Đang thay nhớt và kiểm tra động cơ',
                'anh_xe'                     => 'xe/xe_wave.jpg',
            ],

            // ══════════════════════════════════════════════
            // HẠNG A — Xe mô tô trên 125cc (3 xe)
            // ══════════════════════════════════════════════
            [
                'bien_so'                    => '51E-12001',
                'hang_xe'                    => 'Honda',
                'dong_xe'                    => 'SH 350i',
                'nam_san_xuat'               => 2023,
                'loai_xe'                    => 'so_tu_dong',
                'hang_bang'                  => 'A',
                'mau_xe'                     => 'Xám mờ',
                'so_km_hien_tai'             => 11300,
                'ngay_dang_kiem'             => '2025-02-18',
                'ngay_dang_kiem_tiep_theo'   => '2027-02-18',
                'ngay_bao_hiem'              => '2027-02-28',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_sh350.jpg',
            ],
            [
                'bien_so'                    => '51E-12002',
                'hang_xe'                    => 'Honda',
                'dong_xe'                    => 'SH 350i',
                'nam_san_xuat'               => 2022,
                'loai_xe'                    => 'so_tu_dong',
                'hang_bang'                  => 'A',
                'mau_xe'                     => 'Đen bóng',
                'so_km_hien_tai'             => 19500,
                'ngay_dang_kiem'             => '2024-07-22',
                'ngay_dang_kiem_tiep_theo'   => '2026-07-22',
                'ngay_bao_hiem'              => '2026-08-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_sh350.jpg',
            ],
            [
                'bien_so'                    => '51E-12003',
                'hang_xe'                    => 'Yamaha',
                'dong_xe'                    => 'XMax 300',
                'nam_san_xuat'               => 2022,
                'loai_xe'                    => 'so_tu_dong',
                'hang_bang'                  => 'A',
                'mau_xe'                     => 'Xanh navy',
                'so_km_hien_tai'             => 28700,
                'ngay_dang_kiem'             => '2024-11-10',
                'ngay_dang_kiem_tiep_theo'   => '2026-11-10',
                'ngay_bao_hiem'              => '2026-12-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_sh350.jpg',
            ],

            // ══════════════════════════════════════════════
            // HẠNG B1 — Ô tô số tự động dưới 9 chỗ (4 xe)
            // ══════════════════════════════════════════════
            [
                'bien_so'                    => '51F-13001',
                'hang_xe'                    => 'Kia',
                'dong_xe'                    => 'Morning',
                'nam_san_xuat'               => 2024,
                'loai_xe'                    => 'so_tu_dong',
                'hang_bang'                  => 'B1',
                'mau_xe'                     => 'Vàng chanh',
                'so_km_hien_tai'             => 5200,
                'ngay_dang_kiem'             => '2025-05-01',
                'ngay_dang_kiem_tiep_theo'   => '2027-05-01',
                'ngay_bao_hiem'              => '2027-05-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_kia.jpg',
            ],
            [
                'bien_so'                    => '51F-13002',
                'hang_xe'                    => 'Kia',
                'dong_xe'                    => 'Stonic',
                'nam_san_xuat'               => 2023,
                'loai_xe'                    => 'so_tu_dong',
                'hang_bang'                  => 'B1',
                'mau_xe'                     => 'Trắng ngọc',
                'so_km_hien_tai'             => 14700,
                'ngay_dang_kiem'             => '2025-01-12',
                'ngay_dang_kiem_tiep_theo'   => '2027-01-12',
                'ngay_bao_hiem'              => '2027-01-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_kia.jpg',
            ],
            [
                'bien_so'                    => '51F-13003',
                'hang_xe'                    => 'Toyota',
                'dong_xe'                    => 'Vios',
                'nam_san_xuat'               => 2023,
                'loai_xe'                    => 'so_tu_dong',
                'hang_bang'                  => 'B1',
                'mau_xe'                     => 'Bạc',
                'so_km_hien_tai'             => 21000,
                'ngay_dang_kiem'             => '2025-03-25',
                'ngay_dang_kiem_tiep_theo'   => '2027-03-25',
                'ngay_bao_hiem'              => '2027-03-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_vios.jpg',
            ],
            [
                'bien_so'                    => '51F-13004',
                'hang_xe'                    => 'Hyundai',
                'dong_xe'                    => 'Grand i10',
                'nam_san_xuat'               => 2022,
                'loai_xe'                    => 'so_tu_dong',
                'hang_bang'                  => 'B1',
                'mau_xe'                     => 'Đỏ',
                'so_km_hien_tai'             => 33500,
                'ngay_dang_kiem'             => '2024-08-18',
                'ngay_dang_kiem_tiep_theo'   => '2026-08-18',
                'ngay_bao_hiem'              => '2026-09-30',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_hyundai.jpg',
            ],

            // ══════════════════════════════════════════════
            // HẠNG B2 — Ô tô số sàn dưới 9 chỗ (5 xe)
            // ══════════════════════════════════════════════
            [
                'bien_so'                    => '51G-14001',
                'hang_xe'                    => 'Toyota',
                'dong_xe'                    => 'Vios',
                'nam_san_xuat'               => 2024,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'B2',
                'mau_xe'                     => 'Trắng ngọc trai',
                'so_km_hien_tai'             => 8300,
                'ngay_dang_kiem'             => '2025-04-10',
                'ngay_dang_kiem_tiep_theo'   => '2027-04-10',
                'ngay_bao_hiem'              => '2027-04-30',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_vios.jpg',
            ],
            [
                'bien_so'                    => '51G-14002',
                'hang_xe'                    => 'Toyota',
                'dong_xe'                    => 'Corolla Altis',
                'nam_san_xuat'               => 2021,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'B2',
                'mau_xe'                     => 'Đen',
                'so_km_hien_tai'             => 56800,
                'ngay_dang_kiem'             => '2024-02-20',
                'ngay_dang_kiem_tiep_theo'   => '2026-02-20',
                'ngay_bao_hiem'              => '2026-03-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_vios.jpg',
            ],
            [
                'bien_so'                    => '51G-14003',
                'hang_xe'                    => 'Hyundai',
                'dong_xe'                    => 'Accent',
                'nam_san_xuat'               => 2023,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'B2',
                'mau_xe'                     => 'Xanh dương',
                'so_km_hien_tai'             => 18600,
                'ngay_dang_kiem'             => '2025-02-05',
                'ngay_dang_kiem_tiep_theo'   => '2027-02-05',
                'ngay_bao_hiem'              => '2027-02-28',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_hyundai.jpg',
            ],
            [
                'bien_so'                    => '51G-14004',
                'hang_xe'                    => 'Mazda',
                'dong_xe'                    => 'Mazda 3',
                'nam_san_xuat'               => 2022,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'B2',
                'mau_xe'                     => 'Trắng ngọc trai',
                'so_km_hien_tai'             => 41200,
                'ngay_dang_kiem'             => '2024-06-30',
                'ngay_dang_kiem_tiep_theo'   => '2026-06-30',
                'ngay_bao_hiem'              => '2026-07-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_vios.jpg',
            ],
            [
                'bien_so'                    => '51G-14005',
                'hang_xe'                    => 'Honda',
                'dong_xe'                    => 'City',
                'nam_san_xuat'               => 2023,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'B2',
                'mau_xe'                     => 'Đỏ',
                'so_km_hien_tai'             => 27900,
                'ngay_dang_kiem'             => '2025-01-08',
                'ngay_dang_kiem_tiep_theo'   => '2027-01-08',
                'ngay_bao_hiem'              => '2027-01-31',
                'trang_thai'                 => 'bao_tri',
                'ghi_chu'                    => 'Thay bố thắng, kiểm tra hệ thống lái',
                'anh_xe'                     => 'xe/xe_vios.jpg',
            ],

            // ══════════════════════════════════════════════
            // HẠNG C1 — Xe tải dưới 3.5 tấn (3 xe)
            // ══════════════════════════════════════════════
            [
                'bien_so'                    => '51H-15001',
                'hang_xe'                    => 'Hyundai',
                'dong_xe'                    => 'Porter II',
                'nam_san_xuat'               => 2022,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'C1',
                'mau_xe'                     => 'Trắng',
                'so_km_hien_tai'             => 48500,
                'ngay_dang_kiem'             => '2024-10-12',
                'ngay_dang_kiem_tiep_theo'   => '2026-10-12',
                'ngay_bao_hiem'              => '2026-10-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_hyundai.jpg',
            ],
            [
                'bien_so'                    => '51H-15002',
                'hang_xe'                    => 'Hyundai',
                'dong_xe'                    => 'HD35',
                'nam_san_xuat'               => 2023,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'C1',
                'mau_xe'                     => 'Bạc',
                'so_km_hien_tai'             => 29300,
                'ngay_dang_kiem'             => '2025-03-20',
                'ngay_dang_kiem_tiep_theo'   => '2027-03-20',
                'ngay_bao_hiem'              => '2027-03-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_hyundai.jpg',
            ],
            [
                'bien_so'                    => '51H-15003',
                'hang_xe'                    => 'Thaco',
                'dong_xe'                    => 'Towner 990',
                'nam_san_xuat'               => 2022,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'C1',
                'mau_xe'                     => 'Trắng',
                'so_km_hien_tai'             => 61400,
                'ngay_dang_kiem'             => '2024-04-08',
                'ngay_dang_kiem_tiep_theo'   => '2026-04-08',
                'ngay_bao_hiem'              => '2026-04-30',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_hyundai.jpg',
            ],

            // ══════════════════════════════════════════════
            // HẠNG C — Xe tải trên 3.5 tấn (4 xe)
            // ══════════════════════════════════════════════
            [
                'bien_so'                    => '51K-16001',
                'hang_xe'                    => 'Isuzu',
                'dong_xe'                    => 'NQR75M',
                'nam_san_xuat'               => 2022,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'C',
                'mau_xe'                     => 'Trắng',
                'so_km_hien_tai'             => 72100,
                'ngay_dang_kiem'             => '2024-07-15',
                'ngay_dang_kiem_tiep_theo'   => '2026-07-15',
                'ngay_bao_hiem'              => '2026-07-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/isuzu-bang-lai-ce.png',
            ],
            [
                'bien_so'                    => '51K-16002',
                'hang_xe'                    => 'Isuzu',
                'dong_xe'                    => 'FRR90N',
                'nam_san_xuat'               => 2021,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'C',
                'mau_xe'                     => 'Xanh lá',
                'so_km_hien_tai'             => 95600,
                'ngay_dang_kiem'             => '2023-12-10',
                'ngay_dang_kiem_tiep_theo'   => '2025-12-10',
                'ngay_bao_hiem'              => '2025-12-31',
                'trang_thai'                 => 'bao_tri',
                'ghi_chu'                    => 'Đăng kiểm định kỳ, kiểm tra hệ thống phanh',
                'anh_xe'                     => 'xe/isuzu-bang-lai-ce.png',
            ],
            [
                'bien_so'                    => '84A3-98765',
                'hang_xe'                    => 'Hyundai',
                'dong_xe'                    => 'HD120',
                'nam_san_xuat'               => 2022,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'C',
                'mau_xe'                     => 'Trắng',
                'so_km_hien_tai'             => 83200,
                'ngay_dang_kiem'             => '2024-09-25',
                'ngay_dang_kiem_tiep_theo'   => '2026-09-25',
                'ngay_bao_hiem'              => '2026-09-30',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_84A398765_1781157516.jpg',
            ],
            [
                'bien_so'                    => '51K-16004',
                'hang_xe'                    => 'Isuzu',
                'dong_xe'                    => 'NPR85K',
                'nam_san_xuat'               => 2023,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'C',
                'mau_xe'                     => 'Trắng',
                'so_km_hien_tai'             => 41800,
                'ngay_dang_kiem'             => '2025-02-14',
                'ngay_dang_kiem_tiep_theo'   => '2027-02-14',
                'ngay_bao_hiem'              => '2027-02-28',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/isuzu-bang-lai-ce.png',
            ],

            // ══════════════════════════════════════════════
            // HẠNG D — Xe khách 9–30 chỗ (3 xe)
            // ══════════════════════════════════════════════
            [
                'bien_so'                    => '51L-17001',
                'hang_xe'                    => 'Hyundai',
                'dong_xe'                    => 'Solati H350 16 chỗ',
                'nam_san_xuat'               => 2022,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'D',
                'mau_xe'                     => 'Trắng',
                'so_km_hien_tai'             => 67400,
                'ngay_dang_kiem'             => '2024-05-18',
                'ngay_dang_kiem_tiep_theo'   => '2026-05-18',
                'ngay_bao_hiem'              => '2026-05-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_hyundai_16_cho.jpg',
            ],
            [
                'bien_so'                    => '51L-17002',
                'hang_xe'                    => 'Thaco',
                'dong_xe'                    => 'TB79S 29 chỗ',
                'nam_san_xuat'               => 2021,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'D',
                'mau_xe'                     => 'Trắng cam',
                'so_km_hien_tai'             => 112000,
                'ngay_dang_kiem'             => '2024-03-08',
                'ngay_dang_kiem_tiep_theo'   => '2026-03-08',
                'ngay_bao_hiem'              => '2026-03-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/thaco-29-cho.webp',
            ],
            [
                'bien_so'                    => '51L-17003',
                'hang_xe'                    => 'Hyundai',
                'dong_xe'                    => 'County 29 chỗ',
                'nam_san_xuat'               => 2022,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'D',
                'mau_xe'                     => 'Trắng',
                'so_km_hien_tai'             => 88500,
                'ngay_dang_kiem'             => '2024-11-20',
                'ngay_dang_kiem_tiep_theo'   => '2026-11-20',
                'ngay_bao_hiem'              => '2026-11-30',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/xe_hyundai_16_cho.jpg',
            ],

            // ══════════════════════════════════════════════
            // HẠNG E — Xe khách trên 30 chỗ (2 xe)
            // ══════════════════════════════════════════════
            [
                'bien_so'                    => '51M-18001',
                'hang_xe'                    => 'Thaco',
                'dong_xe'                    => 'Meadow 36 chỗ',
                'nam_san_xuat'               => 2021,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'E',
                'mau_xe'                     => 'Trắng xanh',
                'so_km_hien_tai'             => 145000,
                'ngay_dang_kiem'             => '2024-01-28',
                'ngay_dang_kiem_tiep_theo'   => '2026-01-28',
                'ngay_bao_hiem'              => '2026-01-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/thaco-36-cho.webp',
            ],
            [
                'bien_so'                    => '51M-18002',
                'hang_xe'                    => 'Thaco',
                'dong_xe'                    => 'Limousine 30 chỗ',
                'nam_san_xuat'               => 2023,
                'loai_xe'                    => 'so_tu_dong',
                'hang_bang'                  => 'E',
                'mau_xe'                     => 'Đen',
                'so_km_hien_tai'             => 38600,
                'ngay_dang_kiem'             => '2025-04-12',
                'ngay_dang_kiem_tiep_theo'   => '2027-04-12',
                'ngay_bao_hiem'              => '2027-04-30',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/limousine-30-cho.png',
            ],

            // ══════════════════════════════════════════════
            // HẠNG CE — Xe đầu kéo (sơ mi rơ moóc) (2 xe)
            // ══════════════════════════════════════════════
            [
                'bien_so'                    => '51N-19001',
                'hang_xe'                    => 'Isuzu',
                'dong_xe'                    => 'GIGA FVZ34T',
                'nam_san_xuat'               => 2021,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'CE',
                'mau_xe'                     => 'Trắng',
                'so_km_hien_tai'             => 178000,
                'ngay_dang_kiem'             => '2024-08-05',
                'ngay_dang_kiem_tiep_theo'   => '2026-08-05',
                'ngay_bao_hiem'              => '2026-08-31',
                'trang_thai'                 => 'san_sang',
                'anh_xe'                     => 'xe/isuzu-bang-lai-ce.png',
            ],
            [
                'bien_so'                    => '51N-19002',
                'hang_xe'                    => 'Isuzu',
                'dong_xe'                    => 'GIGA CYZ77Q',
                'nam_san_xuat'               => 2022,
                'loai_xe'                    => 'so_san',
                'hang_bang'                  => 'CE',
                'mau_xe'                     => 'Xanh lam',
                'so_km_hien_tai'             => 132500,
                'ngay_dang_kiem'             => '2025-01-15',
                'ngay_dang_kiem_tiep_theo'   => '2027-01-15',
                'ngay_bao_hiem'              => '2027-01-31',
                'trang_thai'                 => 'bao_tri',
                'ghi_chu'                    => 'Kiểm tra khớp nối sơ mi rơ moóc, bảo dưỡng tổng thể',
                'anh_xe'                     => 'xe/isuzu-bang-lai-ce.png',
            ],
        ];

        $inserted = 0;
        foreach ($xe as $data) {
            // Bỏ qua nếu biển số đã tồn tại
            if (!Xe::where('bien_so', $data['bien_so'])->exists()) {
                Xe::create($data);
                $inserted++;
            } else {
                $this->command->warn("Bỏ qua xe đã tồn tại: {$data['bien_so']}");
            }
        }

        $this->command->info("Đã thêm {$inserted} xe mẫu vào cơ sở dữ liệu.");
    }
}
