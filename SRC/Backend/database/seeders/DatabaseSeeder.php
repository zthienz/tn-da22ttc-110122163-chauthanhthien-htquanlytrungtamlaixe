<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\GiangVien;
use App\Models\KhoaHoc;
use App\Models\BaiThi;
use App\Models\HoSoHocVien;
use App\Models\LopHoc;
use App\Models\HocVienLop;
use App\Models\Xe;
use App\Models\XeLopHoc;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ════════════════════════════════════════════════════
        // 1. ADMIN
        // ════════════════════════════════════════════════════
        User::create([
            'ho_ten'    => 'Quản Trị Viên',
            'email'     => 'admin@laixe.com',
            'password'  => Hash::make('Admin@123'),
            'role'      => 'admin',
            'is_active' => true,
        ]);

        // ════════════════════════════════════════════════════
        // 2. GIẢNG VIÊN (4 người)
        // ════════════════════════════════════════════════════
        $uGV1 = User::create(['ho_ten'=>'Nguyễn Thành Huy','email'=>'nguyenthanhhuy@laixe.com','password'=>Hash::make('GiangVien@123'),'role'=>'giang_vien','so_dien_thoai'=>'0901111222','is_active'=>true]);
        $gv1  = GiangVien::create(['user_id'=>$uGV1->id,'chuyen_mon'=>'ly_thuyet','bang_cap'=>'Cử nhân Luật giao thông','nam_kinh_nghiem'=>10,'ghi_chu'=>'Giảng viên lý thuyết chính']);

        $uGV2 = User::create(['ho_ten'=>'Nguyễn Văn Nam','email'=>'nguyenvannam@laixe.com','password'=>Hash::make('GiangVien@123'),'role'=>'giang_vien','so_dien_thoai'=>'0902222333','is_active'=>true]);
        $gv2  = GiangVien::create(['user_id'=>$uGV2->id,'chuyen_mon'=>'thuc_hanh','bang_cap'=>'Bằng lái hạng C','nam_kinh_nghiem'=>12,'ghi_chu'=>'Giảng viên thực hành hạng B2']);

        $uGV3 = User::create(['ho_ten'=>'Trần Văn Trung','email'=>'tranvantrung@laixe.com','password'=>Hash::make('GiangVien@123'),'role'=>'giang_vien','so_dien_thoai'=>'0903333444','is_active'=>true]);
        $gv3  = GiangVien::create(['user_id'=>$uGV3->id,'chuyen_mon'=>'thuc_hanh','bang_cap'=>'Bằng lái hạng C','nam_kinh_nghiem'=>8,'ghi_chu'=>'Giảng viên thực hành hạng B1']);

        $uGV4 = User::create(['ho_ten'=>'Võ Anh Thư','email'=>'voanhthu@laixe.com','password'=>Hash::make('GiangVien@123'),'role'=>'giang_vien','so_dien_thoai'=>'0904444555','is_active'=>true]);
        $gv4  = GiangVien::create(['user_id'=>$uGV4->id,'chuyen_mon'=>'ly_thuyet','bang_cap'=>'Cử nhân Luật giao thông','nam_kinh_nghiem'=>6,'ghi_chu'=>'Giảng viên lý thuyết hạng A1, B1']);

        // ════════════════════════════════════════════════════
        // 3. KHÓA HỌC (loại bằng lái — dùng cho trang BangLai)
        //    Đây là "danh mục" bằng lái, không phải khóa theo tháng
        // ════════════════════════════════════════════════════
        $khoaA1 = KhoaHoc::create(['ten_khoa'=>'Bằng lái xe hạng A1','mo_ta'=>'Lái xe mô tô dưới 125cc','loai_bang'=>'A1','hoc_phi'=>2000000,'so_buoi_ly_thuyet_toi_thieu'=>8,'so_km_toi_thieu'=>50,'si_so_toi_da'=>40,'so_hv_mo_lop'=>20,'is_active'=>true]);
        $khoaA  = KhoaHoc::create(['ten_khoa'=>'Bằng lái xe hạng A (Xe trên 125cc)','mo_ta'=>'Lái xe mô tô phân khối lớn trên 125cc','loai_bang'=>'A','hoc_phi'=>3000000,'so_buoi_ly_thuyet_toi_thieu'=>10,'so_km_toi_thieu'=>80,'si_so_toi_da'=>40,'so_hv_mo_lop'=>20,'is_active'=>true]);
        $khoaB1 = KhoaHoc::create(['ten_khoa'=>'Bằng lái xe hạng B1','mo_ta'=>'Lái xe ô tô số tự động dưới 9 chỗ ngồi','loai_bang'=>'B1','hoc_phi'=>15000000,'so_buoi_ly_thuyet_toi_thieu'=>18,'so_km_toi_thieu'=>660,'si_so_toi_da'=>30,'so_hv_mo_lop'=>15,'is_active'=>true]);
        $khoaB2 = KhoaHoc::create(['ten_khoa'=>'Bằng lái xe hạng B2','mo_ta'=>'Lái xe ô tô số sàn dưới 9 chỗ ngồi','loai_bang'=>'B2','hoc_phi'=>18000000,'so_buoi_ly_thuyet_toi_thieu'=>20,'so_km_toi_thieu'=>810,'si_so_toi_da'=>30,'so_hv_mo_lop'=>15,'is_active'=>true]);
        $khoaC1 = KhoaHoc::create(['ten_khoa'=>'Bằng lái xe hạng C1 (Xe tải nhẹ)','mo_ta'=>'Lái xe tải dưới 3,5 tấn','loai_bang'=>'C1','hoc_phi'=>22000000,'so_buoi_ly_thuyet_toi_thieu'=>25,'so_km_toi_thieu'=>1000,'si_so_toi_da'=>20,'so_hv_mo_lop'=>10,'is_active'=>true]);
        $khoaC  = KhoaHoc::create(['ten_khoa'=>'Bằng lái xe hạng C (Xe tải nặng)','mo_ta'=>'Lái xe tải trên 3,5 tấn','loai_bang'=>'C','hoc_phi'=>26000000,'so_buoi_ly_thuyet_toi_thieu'=>30,'so_km_toi_thieu'=>1200,'si_so_toi_da'=>20,'so_hv_mo_lop'=>10,'is_active'=>true]);
        $khoaD  = KhoaHoc::create(['ten_khoa'=>'Nâng hạng bằng lái xe hạng D','mo_ta'=>'Lái xe khách từ 9 đến 30 chỗ','loai_bang'=>'D','hoc_phi'=>10000000,'so_buoi_ly_thuyet_toi_thieu'=>20,'so_km_toi_thieu'=>800,'si_so_toi_da'=>20,'so_hv_mo_lop'=>10,'is_active'=>true]);
        $khoaE  = KhoaHoc::create(['ten_khoa'=>'Nâng hạng bằng lái xe hạng E','mo_ta'=>'Lái xe khách trên 30 chỗ','loai_bang'=>'E','hoc_phi'=>11000000,'so_buoi_ly_thuyet_toi_thieu'=>20,'so_km_toi_thieu'=>800,'si_so_toi_da'=>20,'so_hv_mo_lop'=>10,'is_active'=>true]);

        // Bài thi cho từng khóa
        $this->seedBaiThi($khoaA1->id, $khoaA->id, $khoaB1->id, $khoaB2->id, $khoaC1->id, $khoaC->id, $khoaD->id, $khoaE->id);

        // ════════════════════════════════════════════════════
        // 4. XE THỰC HÀNH (8 xe)
        // ════════════════════════════════════════════════════
        $xe1 = Xe::create(['bien_so'=>'51A-12345','hang_xe'=>'Toyota','dong_xe'=>'Vios','nam_san_xuat'=>2022,'loai_xe'=>'so_san','hang_bang'=>'B2','mau_xe'=>'Trắng','so_km_hien_tai'=>45000,'ngay_dang_kiem'=>'2024-01-15','ngay_dang_kiem_tiep_theo'=>'2026-01-15','ngay_bao_hiem'=>'2026-06-30','trang_thai'=>'san_sang']);
        $xe2 = Xe::create(['bien_so'=>'51A-23456','hang_xe'=>'Toyota','dong_xe'=>'Vios','nam_san_xuat'=>2022,'loai_xe'=>'so_san','hang_bang'=>'B2','mau_xe'=>'Bạc','so_km_hien_tai'=>38000,'ngay_dang_kiem'=>'2024-03-20','ngay_dang_kiem_tiep_theo'=>'2026-03-20','ngay_bao_hiem'=>'2026-08-31','trang_thai'=>'san_sang']);
        $xe3 = Xe::create(['bien_so'=>'51B-34567','hang_xe'=>'Kia','dong_xe'=>'Morning','nam_san_xuat'=>2021,'loai_xe'=>'so_tu_dong','hang_bang'=>'B1','mau_xe'=>'Đỏ','so_km_hien_tai'=>52000,'ngay_dang_kiem'=>'2024-06-10','ngay_dang_kiem_tiep_theo'=>'2026-06-10','ngay_bao_hiem'=>'2026-09-30','trang_thai'=>'san_sang']);
        $xe4 = Xe::create(['bien_so'=>'51B-45678','hang_xe'=>'Kia','dong_xe'=>'Morning','nam_san_xuat'=>2023,'loai_xe'=>'so_tu_dong','hang_bang'=>'B1','mau_xe'=>'Xanh','so_km_hien_tai'=>18000,'ngay_dang_kiem'=>'2025-01-05','ngay_dang_kiem_tiep_theo'=>'2027-01-05','ngay_bao_hiem'=>'2027-01-31','trang_thai'=>'san_sang']);
        $xe5 = Xe::create(['bien_so'=>'51C-56789','hang_xe'=>'Honda','dong_xe'=>'Wave Alpha','nam_san_xuat'=>2023,'loai_xe'=>'so_san','hang_bang'=>'A1','mau_xe'=>'Đen','so_km_hien_tai'=>8000,'ngay_dang_kiem'=>'2025-02-01','ngay_dang_kiem_tiep_theo'=>'2027-02-01','ngay_bao_hiem'=>'2027-02-28','trang_thai'=>'san_sang']);
        $xe6 = Xe::create(['bien_so'=>'51C-67890','hang_xe'=>'Yamaha','dong_xe'=>'Sirius','nam_san_xuat'=>2022,'loai_xe'=>'so_san','hang_bang'=>'A1','mau_xe'=>'Xanh','so_km_hien_tai'=>12000,'ngay_dang_kiem'=>'2024-11-15','ngay_dang_kiem_tiep_theo'=>'2026-11-15','ngay_bao_hiem'=>'2026-12-31','trang_thai'=>'san_sang']);
        $xe7 = Xe::create(['bien_so'=>'51D-78901','hang_xe'=>'Toyota','dong_xe'=>'Camry','nam_san_xuat'=>2020,'loai_xe'=>'so_tu_dong','hang_bang'=>'B2','mau_xe'=>'Đen','so_km_hien_tai'=>78000,'ngay_dang_kiem'=>'2023-08-20','ngay_dang_kiem_tiep_theo'=>'2025-08-20','ngay_bao_hiem'=>'2025-09-30','trang_thai'=>'bao_tri','ghi_chu'=>'Đang bảo dưỡng định kỳ']);
        $xe8 = Xe::create(['bien_so'=>'51D-89012','hang_xe'=>'Hyundai','dong_xe'=>'Accent','nam_san_xuat'=>2021,'loai_xe'=>'so_san','hang_bang'=>'B2','mau_xe'=>'Trắng','so_km_hien_tai'=>61000,'ngay_dang_kiem'=>'2024-04-10','ngay_dang_kiem_tiep_theo'=>'2026-04-10','ngay_bao_hiem'=>'2026-05-31','trang_thai'=>'san_sang']);


        // ════════════════════════════════════════════════════
        // 5. KHÓA HỌC ĐÀO TẠO THEO THÁNG (năm 2026)
        //    Mã: MMYYYYHANG — VD: 012026B1
        // ════════════════════════════════════════════════════

        // ── Tháng 1/2026 ────────────────────────────────────
        $dt_01_B1 = KhoaHoc::create([
            'ma_khoa'=>'012026B1','ten_khoa_dao_tao'=>'Khóa học bằng lái B1 tháng 1/2026',
            'ten_khoa'=>'Khóa học bằng lái B1 tháng 1/2026',
            'thang'=>1,'nam'=>2026,'hang_bang'=>'B1','loai_bang'=>'B1',
            'trang_thai_khoa'=>'da_ket_thuc','hoc_phi'=>15000000,
            'so_buoi_ly_thuyet_toi_thieu'=>18,'so_km_toi_thieu'=>660,'si_so_toi_da'=>30,'so_hv_mo_lop'=>15,'is_active'=>true,
        ]);
        $dt_01_B2 = KhoaHoc::create([
            'ma_khoa'=>'012026B2','ten_khoa_dao_tao'=>'Khóa học bằng lái B2 tháng 1/2026',
            'ten_khoa'=>'Khóa học bằng lái B2 tháng 1/2026',
            'thang'=>1,'nam'=>2026,'hang_bang'=>'B2','loai_bang'=>'B2',
            'trang_thai_khoa'=>'da_ket_thuc','hoc_phi'=>18000000,
            'so_buoi_ly_thuyet_toi_thieu'=>20,'so_km_toi_thieu'=>810,'si_so_toi_da'=>30,'so_hv_mo_lop'=>15,'is_active'=>true,
        ]);

        // ── Tháng 3/2026 ────────────────────────────────────
        $dt_03_A1 = KhoaHoc::create([
            'ma_khoa'=>'032026A1','ten_khoa_dao_tao'=>'Khóa học bằng lái A1 tháng 3/2026',
            'ten_khoa'=>'Khóa học bằng lái A1 tháng 3/2026',
            'thang'=>3,'nam'=>2026,'hang_bang'=>'A1','loai_bang'=>'A1',
            'trang_thai_khoa'=>'da_ket_thuc','hoc_phi'=>2000000,
            'so_buoi_ly_thuyet_toi_thieu'=>8,'so_km_toi_thieu'=>50,'si_so_toi_da'=>40,'so_hv_mo_lop'=>20,'is_active'=>true,
        ]);
        $dt_03_B1 = KhoaHoc::create([
            'ma_khoa'=>'032026B1','ten_khoa_dao_tao'=>'Khóa học bằng lái B1 tháng 3/2026',
            'ten_khoa'=>'Khóa học bằng lái B1 tháng 3/2026',
            'thang'=>3,'nam'=>2026,'hang_bang'=>'B1','loai_bang'=>'B1',
            'trang_thai_khoa'=>'dang_hoc','hoc_phi'=>15000000,
            'so_buoi_ly_thuyet_toi_thieu'=>18,'so_km_toi_thieu'=>660,'si_so_toi_da'=>30,'so_hv_mo_lop'=>15,'is_active'=>true,
        ]);
        $dt_03_B2 = KhoaHoc::create([
            'ma_khoa'=>'032026B2','ten_khoa_dao_tao'=>'Khóa học bằng lái B2 tháng 3/2026',
            'ten_khoa'=>'Khóa học bằng lái B2 tháng 3/2026',
            'thang'=>3,'nam'=>2026,'hang_bang'=>'B2','loai_bang'=>'B2',
            'trang_thai_khoa'=>'dang_hoc','hoc_phi'=>18000000,
            'so_buoi_ly_thuyet_toi_thieu'=>20,'so_km_toi_thieu'=>810,'si_so_toi_da'=>30,'so_hv_mo_lop'=>15,'is_active'=>true,
        ]);

        // ── Tháng 5/2026 (hiện tại — đang chuẩn bị) ────────
        $dt_05_B1 = KhoaHoc::create([
            'ma_khoa'=>'052026B1','ten_khoa_dao_tao'=>'Khóa học bằng lái B1 tháng 5/2026',
            'ten_khoa'=>'Khóa học bằng lái B1 tháng 5/2026',
            'thang'=>5,'nam'=>2026,'hang_bang'=>'B1','loai_bang'=>'B1',
            'trang_thai_khoa'=>'chuan_bi','hoc_phi'=>15000000,
            'so_buoi_ly_thuyet_toi_thieu'=>18,'so_km_toi_thieu'=>660,'si_so_toi_da'=>30,'so_hv_mo_lop'=>15,'is_active'=>true,
        ]);
        $dt_05_B2 = KhoaHoc::create([
            'ma_khoa'=>'052026B2','ten_khoa_dao_tao'=>'Khóa học bằng lái B2 tháng 5/2026',
            'ten_khoa'=>'Khóa học bằng lái B2 tháng 5/2026',
            'thang'=>5,'nam'=>2026,'hang_bang'=>'B2','loai_bang'=>'B2',
            'trang_thai_khoa'=>'chuan_bi','hoc_phi'=>18000000,
            'so_buoi_ly_thuyet_toi_thieu'=>20,'so_km_toi_thieu'=>810,'si_so_toi_da'=>30,'so_hv_mo_lop'=>15,'is_active'=>true,
        ]);
        $dt_05_A1 = KhoaHoc::create([
            'ma_khoa'=>'052026A1','ten_khoa_dao_tao'=>'Khóa học bằng lái A1 tháng 5/2026',
            'ten_khoa'=>'Khóa học bằng lái A1 tháng 5/2026',
            'thang'=>5,'nam'=>2026,'hang_bang'=>'A1','loai_bang'=>'A1',
            'trang_thai_khoa'=>'chuan_bi','hoc_phi'=>2000000,
            'so_buoi_ly_thuyet_toi_thieu'=>8,'so_km_toi_thieu'=>50,'si_so_toi_da'=>40,'so_hv_mo_lop'=>20,'is_active'=>true,
        ]);


        // ════════════════════════════════════════════════════
        // 6. LỚP HỌC trong các khóa đào tạo
        // ════════════════════════════════════════════════════

        // ── Khóa 01/2026 B1 — đã kết thúc ──────────────────
        $lop_01_B1_A = LopHoc::create(['khoa_hoc_id'=>$dt_01_B1->id,'ten_lop'=>'B1-01/2026-A','giang_vien_ly_thuyet_id'=>$gv1->id,'giang_vien_thuc_hanh_id'=>$gv3->id,'ngay_khai_giang'=>'2026-01-05','ngay_ket_thuc'=>'2026-03-20','si_so_toi_da'=>15,'trang_thai'=>'da_ket_thuc']);
        $lop_01_B1_B = LopHoc::create(['khoa_hoc_id'=>$dt_01_B1->id,'ten_lop'=>'B1-01/2026-B','giang_vien_ly_thuyet_id'=>$gv4->id,'giang_vien_thuc_hanh_id'=>$gv3->id,'ngay_khai_giang'=>'2026-01-10','ngay_ket_thuc'=>'2026-03-25','si_so_toi_da'=>15,'trang_thai'=>'da_ket_thuc']);

        // ── Khóa 01/2026 B2 — đã kết thúc ──────────────────
        $lop_01_B2_A = LopHoc::create(['khoa_hoc_id'=>$dt_01_B2->id,'ten_lop'=>'B2-01/2026-A','giang_vien_ly_thuyet_id'=>$gv1->id,'giang_vien_thuc_hanh_id'=>$gv2->id,'ngay_khai_giang'=>'2026-01-06','ngay_ket_thuc'=>'2026-04-10','si_so_toi_da'=>15,'trang_thai'=>'da_ket_thuc']);

        // ── Khóa 03/2026 A1 — đã kết thúc ──────────────────
        $lop_03_A1_A = LopHoc::create(['khoa_hoc_id'=>$dt_03_A1->id,'ten_lop'=>'A1-03/2026-A','giang_vien_ly_thuyet_id'=>$gv4->id,'giang_vien_thuc_hanh_id'=>$gv3->id,'ngay_khai_giang'=>'2026-03-03','ngay_ket_thuc'=>'2026-04-15','si_so_toi_da'=>20,'trang_thai'=>'da_ket_thuc']);

        // ── Khóa 03/2026 B1 — đang học ──────────────────────
        $lop_03_B1_A = LopHoc::create(['khoa_hoc_id'=>$dt_03_B1->id,'ten_lop'=>'B1-03/2026-A','giang_vien_ly_thuyet_id'=>$gv1->id,'giang_vien_thuc_hanh_id'=>$gv3->id,'ngay_khai_giang'=>'2026-03-10','si_so_toi_da'=>15,'trang_thai'=>'dang_hoc']);
        $lop_03_B1_B = LopHoc::create(['khoa_hoc_id'=>$dt_03_B1->id,'ten_lop'=>'B1-03/2026-B','giang_vien_ly_thuyet_id'=>$gv4->id,'giang_vien_thuc_hanh_id'=>$gv3->id,'ngay_khai_giang'=>'2026-03-15','si_so_toi_da'=>15,'trang_thai'=>'dang_hoc']);

        // ── Khóa 03/2026 B2 — đang học ──────────────────────
        $lop_03_B2_A = LopHoc::create(['khoa_hoc_id'=>$dt_03_B2->id,'ten_lop'=>'B2-03/2026-A','giang_vien_ly_thuyet_id'=>$gv1->id,'giang_vien_thuc_hanh_id'=>$gv2->id,'ngay_khai_giang'=>'2026-03-08','si_so_toi_da'=>15,'trang_thai'=>'dang_hoc']);
        $lop_03_B2_B = LopHoc::create(['khoa_hoc_id'=>$dt_03_B2->id,'ten_lop'=>'B2-03/2026-B','giang_vien_ly_thuyet_id'=>$gv1->id,'giang_vien_thuc_hanh_id'=>$gv2->id,'ngay_khai_giang'=>'2026-03-12','si_so_toi_da'=>15,'trang_thai'=>'dang_hoc']);

        // ── Khóa 05/2026 — chuẩn bị (chưa có lớp, admin sẽ tạo) ──
        // Không tạo lớp để admin thực hành tạo mới

        // Phân xe cho các lớp đang học
        XeLopHoc::insert([
            ['lop_hoc_id'=>$lop_03_B1_A->id,'xe_id'=>$xe3->id,'created_at'=>now(),'updated_at'=>now()],
            ['lop_hoc_id'=>$lop_03_B1_B->id,'xe_id'=>$xe4->id,'created_at'=>now(),'updated_at'=>now()],
            ['lop_hoc_id'=>$lop_03_B2_A->id,'xe_id'=>$xe1->id,'created_at'=>now(),'updated_at'=>now()],
            ['lop_hoc_id'=>$lop_03_B2_B->id,'xe_id'=>$xe2->id,'created_at'=>now(),'updated_at'=>now()],
            ['lop_hoc_id'=>$lop_03_B2_B->id,'xe_id'=>$xe8->id,'created_at'=>now(),'updated_at'=>now()],
        ]);


        // ════════════════════════════════════════════════════
        // 7. HỌC VIÊN
        //    Phân bổ trạng thái:
        //    A) Đang học trong lớp (dang_hoc) — 8 HV
        //    B) Chờ mở lớp, đã đóng HP (cho_mo_lop) — 6 HV → dành cho khóa 05/2026
        //    C) Chờ đóng học phí (cho_dong_hoc_phi) — 4 HV
        // ════════════════════════════════════════════════════

        // ── A) Đang học — khóa 03/2026 ──────────────────────

        // Lớp B1-03/2026-A (3 HV)
        $this->taoHocVienDangHoc('Huỳnh Bảo Trâm', '079204001001','15032004','0911001001','huynhbaotram@gmail.com', $dt_03_B1->id, $lop_03_B1_A->id, 15000000, 'hocvien_HuynhBaoTram.jpg',    '2026-03-10', 12, 8, 280);
        $this->taoHocVienDangHoc('Huỳnh Yến Nhi',  '079204001002','22072004','0911001002','huynhyennhi@gmail.com',  $dt_03_B1->id, $lop_03_B1_A->id, 15000000, 'hocvien_HuynhYenNhi.jpg',     '2026-03-10', 10, 6, 210);
        $this->taoHocVienDangHoc('Kim Anh Tuyết',  '079204001003','10052003','0911001003','kimanhthuyet@gmail.com', $dt_03_B1->id, $lop_03_B1_A->id, 15000000, 'hocvien_KimAnhTuyet.jpg',     '2026-03-10', 14, 9, 320);

        // Lớp B1-03/2026-B (2 HV)
        $this->taoHocVienDangHoc('Lê Hữu Nghĩa',   '079204001004','05092003','0911001004','lehuunghia@gmail.com',   $dt_03_B1->id, $lop_03_B1_B->id, 15000000, 'hocvien_LeHuuNghia.jpg',      '2026-03-15', 11, 7, 240);
        $this->taoHocVienDangHoc('Liêu Như Yên',   '079204001005','18112003','0911001005','lieunhuyen@gmail.com',   $dt_03_B1->id, $lop_03_B1_B->id, 15000000, 'hocvien_LieuNhuYen.jpg',      '2026-03-15', 9,  5, 190);

        // Lớp B2-03/2026-A (2 HV)
        $this->taoHocVienDangHoc('Phạm Tuyết Trân','079204001006','30012004','0911001006','phamtuyettran@gmail.com',$dt_03_B2->id, $lop_03_B2_A->id, 18000000, 'hocvien_PhamTuyetTran.jpg',   '2026-03-08', 13, 8, 350);
        $this->taoHocVienDangHoc('Phạm Văn Khôi',  '079204001007','14062003','0911001007','phamvankhoi@gmail.com',  $dt_03_B2->id, $lop_03_B2_A->id, 18000000, 'hocvien_PhamVanKhoi.webp',    '2026-03-08', 15, 10, 420);

        // Lớp B2-03/2026-B (1 HV)
        $this->taoHocVienDangHoc('Phan Bảo Khánh', '079204001008','25082004','0911001008','phanbaokhanh@gmail.com', $dt_03_B2->id, $lop_03_B2_B->id, 18000000, 'hocvien_PhanBaoKhanh.jpg',    '2026-03-12', 16, 11, 480);

        // ── B) Chờ mở lớp, đã đóng HP — dành cho khóa 05/2026 ──

        // 3 HV chờ lớp B1 tháng 5/2026
        $this->taoHocVienChoMoLop('Tô Tuyết Anh',   '079204001009','07042004','0911001009','totuyetanh@gmail.com',   $dt_05_B1->id, 15000000, 'hocvien_ToTuyetAnh.jpg');
        $this->taoHocVienChoMoLop('Trần Tấn Tài',   '079204001010','12102003','0911001010','trantantai@gmail.com',   $dt_05_B1->id, 15000000, 'hocvien_TranTanTai.jpg');
        $this->taoHocVienChoMoLop('Trần Minh Hiếu', '079204001011','20022004','0911001011','tranminhhieu@gmail.com', $dt_05_B1->id, 15000000, 'họcvien_TranMinhHieu.jpg');

        // 3 HV chờ lớp B2 tháng 5/2026
        $this->taoHocVienChoMoLop('Võ Thành Nam',   '079204001012','03112003','0911001012','vothanhnam@gmail.com',   $dt_05_B2->id, 18000000, 'hocvien_VoThanhNam.jpg');
        $this->taoHocVienChoMoLop('Nguyễn Thị Lan', '079204001013','25061999','0911001013','nguyenthilan@gmail.com', $dt_05_B2->id, 18000000, null);
        $this->taoHocVienChoMoLop('Trần Văn Bình',  '079204001014','08031998','0911001014','tranvanbinh@gmail.com',  $dt_05_B2->id, 18000000, null);

        // ── C) Chờ đóng học phí — hàng chờ ──────────────────

        // 2 HV chờ đóng HP cho B1 tháng 5/2026
        $this->taoHocVienChoDongHP('Lê Thị Hoa',    '079204001015','14091997','0911001015','lethihoa@gmail.com',    $dt_05_B1->id);
        $this->taoHocVienChoDongHP('Nguyễn Văn An', '079204001016','30072000','0911001016','nguyenvanan@gmail.com', $dt_05_B1->id);

        // 2 HV chờ đóng HP cho A1 tháng 5/2026
        $this->taoHocVienChoDongHP('Phạm Thị Mai',  '079204001017','19052001','0911001017','phamthimai@gmail.com',  $dt_05_A1->id);
        $this->taoHocVienChoDongHP('Đỗ Minh Tuấn',  '079204001018','22112002','0911001018','dominhtuan@gmail.com',  $dt_05_A1->id);
    }


    // ════════════════════════════════════════════════════
    // HELPER METHODS
    // ════════════════════════════════════════════════════

    /** Tạo học viên đang học trong lớp */
    private function taoHocVienDangHoc(
        string $hoTen, string $soCccd, string $ngaySinhStr, string $sdt, string $email,
        int $khoaId, int $lopId, float $hocPhi, ?string $anh,
        string $ngayXepLop, int $buoiLT, int $buoiTH, float $km
    ): void {
        $user = User::create([
            'ho_ten'        => $hoTen,
            'email'         => 'cccd_' . $soCccd,
            'password'      => Hash::make($ngaySinhStr),
            'role'          => 'hoc_vien',
            'so_dien_thoai' => $sdt,
            'is_active'     => true,
        ]);

        $d = substr($ngaySinhStr,0,2); $m = substr($ngaySinhStr,2,2); $y = substr($ngaySinhStr,4,4);

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

        $khoa = KhoaHoc::find($khoaId);
        $duLT = $buoiLT >= $khoa->so_buoi_ly_thuyet_toi_thieu;
        $duKm = $km     >= $khoa->so_km_toi_thieu;

        HocVienLop::create([
            'ho_so_id'                 => $hoSo->id,
            'lop_hoc_id'               => $lopId,
            'ngay_xep_lop'             => $ngayXepLop,
            'so_buoi_ly_thuyet_da_hoc' => $buoiLT,
            'so_buoi_thuc_hanh_da_hoc' => $buoiTH,
            'so_km_da_chay'            => $km,
            'du_buoi_ly_thuyet'        => $duLT,
            'du_km_thuc_hanh'          => $duKm,
            'du_dieu_kien_thi_tn'      => $duLT && $duKm,
        ]);
    }

    /** Tạo học viên đã đóng HP, chờ mở lớp */
    private function taoHocVienChoMoLop(
        string $hoTen, string $soCccd, string $ngaySinhStr, string $sdt, string $email,
        int $khoaId, float $hocPhi, ?string $anh
    ): void {
        $user = User::create([
            'ho_ten'        => $hoTen,
            'email'         => 'cccd_' . $soCccd,
            'password'      => Hash::make($ngaySinhStr),
            'role'          => 'hoc_vien',
            'so_dien_thoai' => $sdt,
            'is_active'     => true,
        ]);

        $d = substr($ngaySinhStr,0,2); $m = substr($ngaySinhStr,2,2); $y = substr($ngaySinhStr,4,4);

        HoSoHocVien::create([
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
            'ngay_dong_hoc_phi'  => now()->subWeeks(2),
            'trang_thai'         => 'cho_mo_lop',
        ]);
    }

    /** Tạo học viên chưa đóng HP, đang chờ */
    private function taoHocVienChoDongHP(
        string $hoTen, string $soCccd, string $ngaySinhStr, string $sdt, string $email,
        int $khoaId
    ): void {
        $user = User::create([
            'ho_ten'        => $hoTen,
            'email'         => 'cccd_' . $soCccd,
            'password'      => Hash::make($ngaySinhStr),
            'role'          => 'hoc_vien',
            'so_dien_thoai' => $sdt,
            'is_active'     => true,
        ]);

        $d = substr($ngaySinhStr,0,2); $m = substr($ngaySinhStr,2,2); $y = substr($ngaySinhStr,4,4);

        HoSoHocVien::create([
            'user_id'            => $user->id,
            'khoa_hoc_id'        => $khoaId,
            'ho_ten'             => $hoTen,
            'ngay_sinh'          => "$y-$m-$d",
            'so_cccd'            => $soCccd,
            'so_dien_thoai'      => $sdt,
            'email'              => $email,
            'nguon_dang_ky'      => 'online',
            'trang_thai_hoc_phi' => 'chua_dong',
            'hoc_phi_da_dong'    => 0,
            'trang_thai'         => 'cho_dong_hoc_phi',
        ]);
    }

    /** Seed bài thi cho tất cả khóa học */
    private function seedBaiThi(int $a1Id, int $aId, int $b1Id, int $b2Id, int $c1Id, int $cId, int $dId, int $eId): void
    {
        // A1, A — 4 bài thi
        foreach ([$a1Id, $aId] as $id) {
            BaiThi::insert([
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Lý thuyết',          'loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>100000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Thực hành',           'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>150000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Lý thuyết sát hạch', 'loai'=>'sat_hanh', 'diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Thực hành sát hạch', 'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ]);
        }
        // B1, B2 — 4 bài thi
        foreach ([$b1Id, $b2Id] as $id) {
            BaiThi::insert([
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Lý thuyết',              'loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Sa hình',                 'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Đường trường',            'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Lý thuyết sát hạch',     'loai'=>'sat_hanh', 'diem_dat'=>21,'phi_thi_lai'=>200000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Sa hình sát hạch',        'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>300000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Đường trường sát hạch',   'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>300000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
            ]);
        }
        // C1, C, D, E — 7 bài thi
        foreach ([$c1Id, $cId, $dId, $eId] as $id) {
            BaiThi::insert([
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Lý thuyết',              'loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Sa hình',                 'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>250000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Đường trường',            'loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>250000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Lý thuyết sát hạch',     'loai'=>'sat_hanh', 'diem_dat'=>21,'phi_thi_lai'=>200000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Mô phỏng sát hạch',      'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Sa hình sát hạch',        'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>350000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
                ['khoa_hoc_id'=>$id,'ten_bai_thi'=>'Đường trường sát hạch',   'loai'=>'sat_hanh', 'diem_dat'=>80,'phi_thi_lai'=>80000, 'thu_tu'=>4,'created_at'=>now(),'updated_at'=>now()],
            ]);
        }
    }
}
