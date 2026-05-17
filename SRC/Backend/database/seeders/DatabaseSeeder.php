<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\GiangVien;
use App\Models\KhoaHoc;
use App\Models\BaiThi;
use App\Models\HoSoHocVien;
use App\Models\LopHoc;
use App\Models\HocVienLop;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ════════════════════════════════════════════════════
        // ADMIN
        // ════════════════════════════════════════════════════
        User::create([
            'ho_ten'    => 'Quản Trị Viên',
            'email'     => 'admin@laixe.com',
            'password'  => Hash::make('Admin@123'),
            'role'      => 'admin',
            'is_active' => true,
        ]);

        // ════════════════════════════════════════════════════
        // GIẢNG VIÊN (4 người — khớp với ảnh trong public/)
        // ════════════════════════════════════════════════════

        // GV1 — Nguyễn Thành Huy (giangvien_NguyenThanhHuy.jpg)
        $uGV1 = User::create([
            'ho_ten'        => 'Nguyễn Thành Huy',
            'email'         => 'nguyenthanhhuy@laixe.com',
            'password'      => Hash::make('GiangVien@123'),
            'role'          => 'giang_vien',
            'so_dien_thoai' => '0901111222',
            'is_active'     => true,
        ]);
        GiangVien::create([
            'user_id'         => $uGV1->id,
            'chuyen_mon'      => 'ly_thuyet',
            'bang_cap'        => 'Cử nhân Luật giao thông',
            'nam_kinh_nghiem' => 10,
            'ghi_chu'         => 'Giảng viên lý thuyết chính',
        ]);

        // GV2 — Nguyễn Văn Nam (giangvien_NguyenVanNam.jpg)
        $uGV2 = User::create([
            'ho_ten'        => 'Nguyễn Văn Nam',
            'email'         => 'nguyenvannam@laixe.com',
            'password'      => Hash::make('GiangVien@123'),
            'role'          => 'giang_vien',
            'so_dien_thoai' => '0902222333',
            'is_active'     => true,
        ]);
        GiangVien::create([
            'user_id'         => $uGV2->id,
            'chuyen_mon'      => 'thuc_hanh',
            'bang_cap'        => 'Bằng lái hạng C',
            'nam_kinh_nghiem' => 12,
            'ghi_chu'         => 'Giảng viên thực hành hạng B2',
        ]);

        // GV3 — Trần Văn Trung (giangvien_TranVanTrung.jpg)
        $uGV3 = User::create([
            'ho_ten'        => 'Trần Văn Trung',
            'email'         => 'tranvantrung@laixe.com',
            'password'      => Hash::make('GiangVien@123'),
            'role'          => 'giang_vien',
            'so_dien_thoai' => '0903333444',
            'is_active'     => true,
        ]);
        GiangVien::create([
            'user_id'         => $uGV3->id,
            'chuyen_mon'      => 'thuc_hanh',
            'bang_cap'        => 'Bằng lái hạng C',
            'nam_kinh_nghiem' => 8,
            'ghi_chu'         => 'Giảng viên thực hành hạng B1',
        ]);

        // GV4 — Võ Anh Thư (giangvien_VoAnhThu.webp)
        $uGV4 = User::create([
            'ho_ten'        => 'Võ Anh Thư',
            'email'         => 'voanhthu@laixe.com',
            'password'      => Hash::make('GiangVien@123'),
            'role'          => 'giang_vien',
            'so_dien_thoai' => '0904444555',
            'is_active'     => true,
        ]);
        $gv4 = GiangVien::create([
            'user_id'         => $uGV4->id,
            'chuyen_mon'      => 'ly_thuyet',
            'bang_cap'        => 'Cử nhân Luật giao thông',
            'nam_kinh_nghiem' => 6,
            'ghi_chu'         => 'Giảng viên lý thuyết hạng A1, B1',
        ]);

        // Lấy lại object GiangVien để dùng cho lớp học
        $gv1 = GiangVien::where('user_id', $uGV1->id)->first();
        $gv2 = GiangVien::where('user_id', $uGV2->id)->first();
        $gv3 = GiangVien::where('user_id', $uGV3->id)->first();

        // ════════════════════════════════════════════════════
        // KHÓA HỌC + BÀI THI
        // ════════════════════════════════════════════════════

        // ── B2 ──────────────────────────────────────────────
        $khoaB2 = KhoaHoc::create([
            'ten_khoa'                    => 'Bằng lái xe hạng B2',
            'mo_ta'                       => 'Lái xe ô tô số sàn dưới 9 chỗ ngồi',
            'loai_bang'                   => 'B2',
            'hoc_phi'                     => 18000000,
            'so_buoi_ly_thuyet_toi_thieu' => 20,
            'so_km_toi_thieu'             => 810,
            'si_so_toi_da'                => 30,
            'so_hv_mo_lop'                => 15,
            'is_active'                   => true,
        ]);
        BaiThi::insert([
            ['khoa_hoc_id'=>$khoaB2->id,'ten_bai_thi'=>'Lý thuyết',          'loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB2->id,'ten_bai_thi'=>'Sa hình',             'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB2->id,'ten_bai_thi'=>'Đường trường',        'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB2->id,'ten_bai_thi'=>'Lý thuyết sát hạch', 'loai'=>'sat_hanh', 'diem_dat'=>21,'phi_thi_lai'=>200000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB2->id,'ten_bai_thi'=>'Sa hình sát hạch',   'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>300000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB2->id,'ten_bai_thi'=>'Đường trường sát hạch','loai'=>'sat_hanh','diem_dat'=>80,'phi_thi_lai'=>300000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
        ]);

        // ── B1 ──────────────────────────────────────────────
        $khoaB1 = KhoaHoc::create([
            'ten_khoa'                    => 'Bằng lái xe hạng B1',
            'mo_ta'                       => 'Lái xe ô tô số tự động dưới 9 chỗ ngồi',
            'loai_bang'                   => 'B1',
            'hoc_phi'                     => 15000000,
            'so_buoi_ly_thuyet_toi_thieu' => 18,
            'so_km_toi_thieu'             => 660,
            'si_so_toi_da'                => 30,
            'so_hv_mo_lop'                => 15,
            'is_active'                   => true,
        ]);
        BaiThi::insert([
            ['khoa_hoc_id'=>$khoaB1->id,'ten_bai_thi'=>'Lý thuyết',          'loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB1->id,'ten_bai_thi'=>'Sa hình',             'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB1->id,'ten_bai_thi'=>'Lý thuyết sát hạch', 'loai'=>'sat_hanh', 'diem_dat'=>21,'phi_thi_lai'=>200000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB1->id,'ten_bai_thi'=>'Sa hình sát hạch',   'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>300000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
        ]);

        // ── A1 ──────────────────────────────────────────────
        $khoaA1 = KhoaHoc::create([
            'ten_khoa'                    => 'Bằng lái xe hạng A1',
            'mo_ta'                       => 'Lái xe mô tô dưới 125cc. Bao gồm học phí, phí hồ sơ, khám sức khỏe và lệ phí thi sát hạch.',
            'loai_bang'                   => 'A1',
            'hoc_phi'                     => 2000000,
            'so_buoi_ly_thuyet_toi_thieu' => 8,
            'so_km_toi_thieu'             => 50,
            'si_so_toi_da'                => 40,
            'so_hv_mo_lop'                => 20,
            'is_active'                   => true,
        ]);
        BaiThi::insert([
            ['khoa_hoc_id'=>$khoaA1->id,'ten_bai_thi'=>'Lý thuyết',          'loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>100000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaA1->id,'ten_bai_thi'=>'Thực hành',           'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>150000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaA1->id,'ten_bai_thi'=>'Lý thuyết sát hạch', 'loai'=>'sat_hanh', 'diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaA1->id,'ten_bai_thi'=>'Thực hành sát hạch', 'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
        ]);

        // ── A (Xe trên 125cc) ───────────────────────────────
        $khoaA = KhoaHoc::create([
            'ten_khoa'                    => 'Bằng lái xe hạng A (Xe trên 125cc)',
            'mo_ta'                       => 'Lái xe mô tô phân khối lớn trên 125cc. Bao gồm học phí, phí hồ sơ, khám sức khỏe và lệ phí thi sát hạch.',
            'loai_bang'                   => 'A',
            'hoc_phi'                     => 3000000,
            'so_buoi_ly_thuyet_toi_thieu' => 10,
            'so_km_toi_thieu'             => 80,
            'si_so_toi_da'                => 40,
            'so_hv_mo_lop'                => 20,
            'is_active'                   => true,
        ]);
        BaiThi::insert([
            ['khoa_hoc_id'=>$khoaA->id,'ten_bai_thi'=>'Lý thuyết',          'loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>100000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaA->id,'ten_bai_thi'=>'Thực hành',           'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>150000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaA->id,'ten_bai_thi'=>'Lý thuyết sát hạch', 'loai'=>'sat_hanh', 'diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaA->id,'ten_bai_thi'=>'Thực hành sát hạch', 'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
        ]);

        // ── B1 3 bánh ───────────────────────────────────────
        $khoaB1_3banh = KhoaHoc::create([
            'ten_khoa'                    => 'Bằng lái xe hạng B1 (Xe 3 bánh)',
            'mo_ta'                       => 'Lái xe 3 bánh chở người và hàng hóa. Bao gồm học phí, phí hồ sơ, khám sức khỏe và lệ phí thi sát hạch.',
            'loai_bang'                   => 'B1_3BANH',
            'hoc_phi'                     => 3800000,
            'so_buoi_ly_thuyet_toi_thieu' => 12,
            'so_km_toi_thieu'             => 100,
            'si_so_toi_da'                => 30,
            'so_hv_mo_lop'                => 15,
            'is_active'                   => true,
        ]);
        BaiThi::insert([
            ['khoa_hoc_id'=>$khoaB1_3banh->id,'ten_bai_thi'=>'Lý thuyết',          'loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>100000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB1_3banh->id,'ten_bai_thi'=>'Thực hành',           'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>150000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB1_3banh->id,'ten_bai_thi'=>'Lý thuyết sát hạch', 'loai'=>'sat_hanh', 'diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB1_3banh->id,'ten_bai_thi'=>'Thực hành sát hạch', 'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
        ]);

        // ── C1 (Xe tải nhẹ) ─────────────────────────────────
        $khoaC1 = KhoaHoc::create([
            'ten_khoa'                    => 'Bằng lái xe hạng C1 (Xe tải nhẹ)',
            'mo_ta'                       => 'Lái xe tải có trọng tải dưới 3,5 tấn. Yêu cầu đã có bằng B2 tối thiểu 3 năm.',
            'loai_bang'                   => 'C1',
            'hoc_phi'                     => 22000000,
            'so_buoi_ly_thuyet_toi_thieu' => 25,
            'so_km_toi_thieu'             => 1000,
            'si_so_toi_da'                => 20,
            'so_hv_mo_lop'                => 10,
            'is_active'                   => true,
        ]);
        BaiThi::insert([
            ['khoa_hoc_id'=>$khoaC1->id,'ten_bai_thi'=>'Lý thuyết',              'loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaC1->id,'ten_bai_thi'=>'Sa hình',                 'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>250000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaC1->id,'ten_bai_thi'=>'Đường trường',            'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>250000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaC1->id,'ten_bai_thi'=>'Lý thuyết sát hạch',     'loai'=>'sat_hanh', 'diem_dat'=>21,'phi_thi_lai'=>200000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaC1->id,'ten_bai_thi'=>'Mô phỏng sát hạch',      'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaC1->id,'ten_bai_thi'=>'Sa hình sát hạch',        'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>350000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaC1->id,'ten_bai_thi'=>'Đường trường sát hạch',   'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>80000, 'thu_tu'=>4,'created_at'=>now(),'updated_at'=>now()],
        ]);

        // ── C (Xe tải nặng) ──────────────────────────────────
        $khoaC = KhoaHoc::create([
            'ten_khoa'                    => 'Bằng lái xe hạng C (Xe tải nặng)',
            'mo_ta'                       => 'Lái xe tải có trọng tải trên 3,5 tấn. Yêu cầu đã có bằng B2 tối thiểu 3 năm.',
            'loai_bang'                   => 'C',
            'hoc_phi'                     => 26000000,
            'so_buoi_ly_thuyet_toi_thieu' => 30,
            'so_km_toi_thieu'             => 1200,
            'si_so_toi_da'                => 20,
            'so_hv_mo_lop'                => 10,
            'is_active'                   => true,
        ]);
        BaiThi::insert([
            ['khoa_hoc_id'=>$khoaC->id,'ten_bai_thi'=>'Lý thuyết',              'loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaC->id,'ten_bai_thi'=>'Sa hình',                 'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>250000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaC->id,'ten_bai_thi'=>'Đường trường',            'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>250000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaC->id,'ten_bai_thi'=>'Lý thuyết sát hạch',     'loai'=>'sat_hanh', 'diem_dat'=>21,'phi_thi_lai'=>200000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaC->id,'ten_bai_thi'=>'Mô phỏng sát hạch',      'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaC->id,'ten_bai_thi'=>'Sa hình sát hạch',        'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>350000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaC->id,'ten_bai_thi'=>'Đường trường sát hạch',   'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>80000, 'thu_tu'=>4,'created_at'=>now(),'updated_at'=>now()],
        ]);

        // ── D (Nâng hạng từ B) ───────────────────────────────
        $khoaD = KhoaHoc::create([
            'ten_khoa'                    => 'Nâng hạng bằng lái xe hạng D',
            'mo_ta'                       => 'Nâng hạng từ B lên D — lái xe khách từ 9 đến 30 chỗ. Yêu cầu đã có bằng B tối thiểu 3 năm.',
            'loai_bang'                   => 'D',
            'hoc_phi'                     => 10000000,
            'so_buoi_ly_thuyet_toi_thieu' => 20,
            'so_km_toi_thieu'             => 800,
            'si_so_toi_da'                => 20,
            'so_hv_mo_lop'                => 10,
            'is_active'                   => true,
        ]);
        BaiThi::insert([
            ['khoa_hoc_id'=>$khoaD->id,'ten_bai_thi'=>'Lý thuyết',              'loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaD->id,'ten_bai_thi'=>'Sa hình',                 'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>250000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaD->id,'ten_bai_thi'=>'Đường trường',            'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>250000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaD->id,'ten_bai_thi'=>'Lý thuyết sát hạch',     'loai'=>'sat_hanh', 'diem_dat'=>21,'phi_thi_lai'=>200000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaD->id,'ten_bai_thi'=>'Mô phỏng sát hạch',      'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaD->id,'ten_bai_thi'=>'Sa hình sát hạch',        'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>350000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaD->id,'ten_bai_thi'=>'Đường trường sát hạch',   'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>80000, 'thu_tu'=>4,'created_at'=>now(),'updated_at'=>now()],
        ]);

        // ── E (Nâng hạng từ C) ───────────────────────────────
        $khoaE = KhoaHoc::create([
            'ten_khoa'                    => 'Nâng hạng bằng lái xe hạng E',
            'mo_ta'                       => 'Nâng hạng từ C lên E — lái xe khách trên 30 chỗ. Yêu cầu đã có bằng C tối thiểu 3 năm.',
            'loai_bang'                   => 'E',
            'hoc_phi'                     => 11000000,
            'so_buoi_ly_thuyet_toi_thieu' => 20,
            'so_km_toi_thieu'             => 800,
            'si_so_toi_da'                => 20,
            'so_hv_mo_lop'                => 10,
            'is_active'                   => true,
        ]);
        BaiThi::insert([
            ['khoa_hoc_id'=>$khoaE->id,'ten_bai_thi'=>'Lý thuyết',              'loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaE->id,'ten_bai_thi'=>'Sa hình',                 'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>250000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaE->id,'ten_bai_thi'=>'Đường trường',            'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>250000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaE->id,'ten_bai_thi'=>'Lý thuyết sát hạch',     'loai'=>'sat_hanh', 'diem_dat'=>21,'phi_thi_lai'=>200000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaE->id,'ten_bai_thi'=>'Mô phỏng sát hạch',      'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaE->id,'ten_bai_thi'=>'Sa hình sát hạch',        'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>350000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaE->id,'ten_bai_thi'=>'Đường trường sát hạch',   'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>80000, 'thu_tu'=>4,'created_at'=>now(),'updated_at'=>now()],
        ]);

        // ── CE (Xe đầu kéo) ──────────────────────────────────
        $khoaCE = KhoaHoc::create([
            'ten_khoa'                    => 'Nâng hạng bằng lái xe hạng CE (Xe đầu kéo)',
            'mo_ta'                       => 'Nâng hạng lên CE — lái xe đầu kéo, xe container. Yêu cầu đã có bằng C tối thiểu 3 năm.',
            'loai_bang'                   => 'CE',
            'hoc_phi'                     => 19000000,
            'so_buoi_ly_thuyet_toi_thieu' => 25,
            'so_km_toi_thieu'             => 1000,
            'si_so_toi_da'                => 15,
            'so_hv_mo_lop'                => 8,
            'is_active'                   => true,
        ]);
        BaiThi::insert([
            ['khoa_hoc_id'=>$khoaCE->id,'ten_bai_thi'=>'Lý thuyết',              'loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaCE->id,'ten_bai_thi'=>'Sa hình',                 'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>250000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaCE->id,'ten_bai_thi'=>'Đường trường',            'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>250000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaCE->id,'ten_bai_thi'=>'Lý thuyết sát hạch',     'loai'=>'sat_hanh', 'diem_dat'=>21,'phi_thi_lai'=>200000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaCE->id,'ten_bai_thi'=>'Mô phỏng sát hạch',      'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaCE->id,'ten_bai_thi'=>'Sa hình sát hạch',        'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>350000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaCE->id,'ten_bai_thi'=>'Đường trường sát hạch',   'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>80000, 'thu_tu'=>4,'created_at'=>now(),'updated_at'=>now()],
        ]);


        // ════════════════════════════════════════════════════
        // LỚP HỌC MẪU — tối đa 4 học viên/lớp
        // ════════════════════════════════════════════════════

        // ── Lớp B2 — 2 lớp (6 HV → lớp 1: 4HV, lớp 2: 2HV) ──
        $lopB2_1 = LopHoc::create([
            'khoa_hoc_id'             => $khoaB2->id,
            'ten_lop'                 => 'B2-2025-01',
            'giang_vien_ly_thuyet_id' => $gv1->id,
            'giang_vien_thuc_hanh_id' => $gv2->id,
            'ngay_khai_giang'         => '2025-03-01',
            'ngay_ket_thuc'           => '2025-07-30',
            'si_so_toi_da'            => 4,
            'trang_thai'              => 'dang_hoc',
        ]);

        $lopB2_2 = LopHoc::create([
            'khoa_hoc_id'             => $khoaB2->id,
            'ten_lop'                 => 'B2-2025-02',
            'giang_vien_ly_thuyet_id' => $gv1->id,
            'giang_vien_thuc_hanh_id' => $gv2->id,
            'ngay_khai_giang'         => '2025-04-01',
            'ngay_ket_thuc'           => '2025-08-30',
            'si_so_toi_da'            => 4,
            'trang_thai'              => 'dang_hoc',
        ]);

        // ── Lớp B1 — 2 lớp (4 HV → lớp 1: 4HV) ──────────────
        $lopB1_1 = LopHoc::create([
            'khoa_hoc_id'             => $khoaB1->id,
            'ten_lop'                 => 'B1-2025-01',
            'giang_vien_ly_thuyet_id' => $gv1->id,
            'giang_vien_thuc_hanh_id' => $gv3->id,
            'ngay_khai_giang'         => '2025-04-01',
            'ngay_ket_thuc'           => '2025-08-30',
            'si_so_toi_da'            => 4,
            'trang_thai'              => 'dang_hoc',
        ]);

        $lopB1_2 = LopHoc::create([
            'khoa_hoc_id'             => $khoaB1->id,
            'ten_lop'                 => 'B1-2025-02',
            'giang_vien_ly_thuyet_id' => $gv4->id,
            'giang_vien_thuc_hanh_id' => $gv3->id,
            'ngay_khai_giang'         => '2025-05-01',
            'ngay_ket_thuc'           => '2025-09-30',
            'si_so_toi_da'            => 4,
            'trang_thai'              => 'dang_hoc',
        ]);

        // ── Lớp A1 — chuẩn bị khai giảng ─────────────────────
        $lopA1_1 = LopHoc::create([
            'khoa_hoc_id'             => $khoaA1->id,
            'ten_lop'                 => 'A1-2025-01',
            'giang_vien_ly_thuyet_id' => $gv4->id,
            'giang_vien_thuc_hanh_id' => $gv3->id,
            'ngay_khai_giang'         => '2025-06-01',
            'ngay_ket_thuc'           => '2025-07-15',
            'si_so_toi_da'            => 4,
            'trang_thai'              => 'chuan_bi',
        ]);

        // ════════════════════════════════════════════════════
        // HỌC VIÊN (12 người — khớp với ảnh trong public/)
        // Phân bổ: B2-01(4HV) | B2-02(2HV) | B1-01(4HV) | B1-02(2HV)
        // Tài khoản: so_cccd | Mật khẩu: ngay_sinh (DDMMYYYY)
        // ════════════════════════════════════════════════════
        $hocVienData = [
            // [ ho_ten, so_cccd, ngay_sinh, sdt, email, khoa_id, lop_id, hoc_phi, anh ]

            // ── Lớp B2-2025-01 (4 học viên) ──
            ['Huỳnh Bảo Trâm',  '079204001001', '15032004', '0911001001', 'huynhbaotram@gmail.com',  $khoaB2->id, $lopB2_1->id, 18000000, 'hocvien_HuynhBaoTram.jpg'],
            ['Huỳnh Yến Nhi',   '079204001002', '22072004', '0911001002', 'huynhyennhi@gmail.com',   $khoaB2->id, $lopB2_1->id, 18000000, 'hocvien_HuynhYenNhi.jpg'],
            ['Kim Anh Tuyết',   '079204001003', '10052003', '0911001003', 'kimanhthuyet@gmail.com',  $khoaB2->id, $lopB2_1->id, 18000000, 'hocvien_KimAnhTuyet.jpg'],
            ['Lê Hữu Nghĩa',    '079204001004', '05092003', '0911001004', 'lehuunghia@gmail.com',    $khoaB2->id, $lopB2_1->id, 18000000, 'hocvien_LeHuuNghia.jpg'],

            // ── Lớp B2-2025-02 (2 học viên) ──
            ['Trần Tấn Tài',    '079204001010', '12102003', '0911001010', 'trantantai@gmail.com',    $khoaB2->id, $lopB2_2->id, 18000000, 'hocvien_TranTanTai.jpg'],
            ['Trần Minh Hiếu',  '079204001011', '20022004', '0911001011', 'tranminhhieu@gmail.com',  $khoaB2->id, $lopB2_2->id, 18000000, 'họcvien_TranMinhHieu.jpg'],

            // ── Lớp B1-2025-01 (4 học viên) ──
            ['Phạm Tuyết Trân', '079204001006', '30012004', '0911001006', 'phamtuyettran@gmail.com', $khoaB1->id, $lopB1_1->id, 15000000, 'hocvien_PhamTuyetTran.jpg'],
            ['Phạm Văn Khôi',   '079204001007', '14062003', '0911001007', 'phamvankhoi@gmail.com',   $khoaB1->id, $lopB1_1->id, 15000000, 'hocvien_PhamVanKhoi.webp'],
            ['Phan Bảo Khánh',  '079204001008', '25082004', '0911001008', 'phanbaokhanh@gmail.com',  $khoaB1->id, $lopB1_1->id, 15000000, 'hocvien_PhanBaoKhanh.jpg'],
            ['Tô Tuyết Anh',    '079204001009', '07042004', '0911001009', 'totuyetanh@gmail.com',    $khoaB1->id, $lopB1_1->id, 15000000, 'hocvien_ToTuyetAnh.jpg'],

            // ── Lớp B1-2025-02 (2 học viên) ──
            ['Liêu Như Yên',    '079204001005', '18112003', '0911001005', 'lieunhuyen@gmail.com',    $khoaB1->id, $lopB1_2->id, 15000000, 'hocvien_LieuNhuYen.jpg'],
            ['Võ Thành Nam',    '079204001012', '03112003', '0911001012', 'vothanhnam@gmail.com',    $khoaB1->id, $lopB1_2->id, 15000000, 'hocvien_VoThanhNam.jpg'],
        ];

        foreach ($hocVienData as $hv) {
            [$hoTen, $soCccd, $ngaySinh, $sdt, $email, $khoaId, $lopId, $hocPhi, $anh] = $hv;

            // Tạo tài khoản (email lưu dạng cccd_ để đăng nhập bằng CCCD)
            $user = User::create([
                'ho_ten'        => $hoTen,
                'email'         => 'cccd_' . $soCccd,
                'password'      => Hash::make($ngaySinh),
                'role'          => 'hoc_vien',
                'so_dien_thoai' => $sdt,
                'is_active'     => true,
            ]);

            // Chuyển ngày sinh DDMMYYYY → YYYY-MM-DD
            $d = substr($ngaySinh, 0, 2);
            $m = substr($ngaySinh, 2, 2);
            $y = substr($ngaySinh, 4, 4);

            $hoSo = HoSoHocVien::create([
                'user_id'            => $user->id,
                'khoa_hoc_id'        => $khoaId,
                'ho_ten'             => $hoTen,
                'ngay_sinh'          => "$y-$m-$d",
                'so_cccd'            => $soCccd,
                'so_dien_thoai'      => $sdt,
                'email'              => $email,
                'anh_the'            => $anh,
                'nguon_dang_ky'      => 'offline',
                'trang_thai_hoc_phi' => 'da_dong',
                'hoc_phi_da_dong'    => $hocPhi,
                'ngay_dong_hoc_phi'  => now()->subMonths(2),
                'trang_thai'         => 'dang_hoc',
            ]);

            // Xếp vào lớp với tiến độ học ngẫu nhiên thực tế
            $buoiLT  = rand(8, 18);
            $buoiTH  = rand(5, 12);
            $km      = rand(150, 600);
            $khoaObj = KhoaHoc::find($khoaId);
            $duLT    = $buoiLT >= $khoaObj->so_buoi_ly_thuyet_toi_thieu;
            $duKm    = $km     >= $khoaObj->so_km_toi_thieu;

            HocVienLop::create([
                'ho_so_id'                 => $hoSo->id,
                'lop_hoc_id'               => $lopId,
                'ngay_xep_lop'             => '2025-03-01',
                'so_buoi_ly_thuyet_da_hoc' => $buoiLT,
                'so_buoi_thuc_hanh_da_hoc' => $buoiTH,
                'so_km_da_chay'            => $km,
                'du_buoi_ly_thuyet'        => $duLT,
                'du_km_thuc_hanh'          => $duKm,
                'du_dieu_kien_thi_tn'      => $duLT && $duKm,
            ]);
        }
    }
}
