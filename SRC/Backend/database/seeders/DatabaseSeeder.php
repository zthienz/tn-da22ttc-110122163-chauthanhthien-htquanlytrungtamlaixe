<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\GiangVien;
use App\Models\KhoaHoc;
use App\Models\BaiThi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Admin ──────────────────────────────────────────────────────────
        User::create([
            'ho_ten'    => 'Quản Trị Viên',
            'email'     => 'admin@laixe.com',
            'password'  => Hash::make('Admin@123'),
            'role'      => 'admin',
            'is_active' => true,
        ]);

        // ─── Giảng viên ─────────────────────────────────────────────────────
        $gv1 = User::create([
            'ho_ten'        => 'Nguyễn Văn Hùng',
            'email'         => 'gv1@laixe.com',
            'password'      => Hash::make('GiangVien@123'),
            'role'          => 'giang_vien',
            'so_dien_thoai' => '0901234567',
            'is_active'     => true,
        ]);
        GiangVien::create([
            'user_id'         => $gv1->id,
            'chuyen_mon'      => 'ly_thuyet',
            'bang_cap'        => 'Cử nhân Luật giao thông',
            'nam_kinh_nghiem' => 8,
        ]);

        $gv2 = User::create([
            'ho_ten'        => 'Trần Thị Mai',
            'email'         => 'gv2@laixe.com',
            'password'      => Hash::make('GiangVien@123'),
            'role'          => 'giang_vien',
            'so_dien_thoai' => '0912345678',
            'is_active'     => true,
        ]);
        GiangVien::create([
            'user_id'         => $gv2->id,
            'chuyen_mon'      => 'thuc_hanh',
            'bang_cap'        => 'Bằng lái hạng C',
            'nam_kinh_nghiem' => 10,
        ]);

        // ─── Khóa học + Bài thi ─────────────────────────────────────────────
        $khoaB2 = KhoaHoc::create([
            'ten_khoa'                   => 'Bằng lái xe hạng B2',
            'mo_ta'                      => 'Lái xe ô tô số sàn dưới 9 chỗ ngồi',
            'loai_bang'                  => 'B2',
            'hoc_phi'                    => 7500000,
            'so_buoi_ly_thuyet_toi_thieu' => 20,
            'so_km_toi_thieu'            => 810,
            'si_so_toi_da'               => 30,
            'so_hv_mo_lop'               => 15,
            'is_active'                  => true,
        ]);
        // Bài thi tốt nghiệp B2
        BaiThi::insert([
            ['khoa_hoc_id'=>$khoaB2->id,'ten_bai_thi'=>'Lý thuyết','loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB2->id,'ten_bai_thi'=>'Sa hình','loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB2->id,'ten_bai_thi'=>'Đường trường','loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
        ]);
        // Bài thi sát hạch B2
        BaiThi::insert([
            ['khoa_hoc_id'=>$khoaB2->id,'ten_bai_thi'=>'Lý thuyết sát hạch','loai'=>'sat_hanh','diem_dat'=>21,'phi_thi_lai'=>200000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB2->id,'ten_bai_thi'=>'Sa hình sát hạch','loai'=>'sat_hanh','diem_dat'=>80,'phi_thi_lai'=>300000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB2->id,'ten_bai_thi'=>'Đường trường sát hạch','loai'=>'sat_hanh','diem_dat'=>80,'phi_thi_lai'=>300000,'thu_tu'=>3,'created_at'=>now(),'updated_at'=>now()],
        ]);

        $khoaB1 = KhoaHoc::create([
            'ten_khoa'                   => 'Bằng lái xe hạng B1',
            'mo_ta'                      => 'Lái xe ô tô số tự động dưới 9 chỗ ngồi',
            'loai_bang'                  => 'B1',
            'hoc_phi'                    => 6500000,
            'so_buoi_ly_thuyet_toi_thieu' => 18,
            'so_km_toi_thieu'            => 660,
            'si_so_toi_da'               => 30,
            'so_hv_mo_lop'               => 15,
            'is_active'                  => true,
        ]);
        BaiThi::insert([
            ['khoa_hoc_id'=>$khoaB1->id,'ten_bai_thi'=>'Lý thuyết','loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB1->id,'ten_bai_thi'=>'Sa hình','loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB1->id,'ten_bai_thi'=>'Lý thuyết sát hạch','loai'=>'sat_hanh','diem_dat'=>21,'phi_thi_lai'=>200000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaB1->id,'ten_bai_thi'=>'Sa hình sát hạch','loai'=>'sat_hanh','diem_dat'=>80,'phi_thi_lai'=>300000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
        ]);

        $khoaA1 = KhoaHoc::create([
            'ten_khoa'                   => 'Bằng lái xe hạng A1',
            'mo_ta'                      => 'Lái xe mô tô dưới 175cc',
            'loai_bang'                  => 'A1',
            'hoc_phi'                    => 1200000,
            'so_buoi_ly_thuyet_toi_thieu' => 8,
            'so_km_toi_thieu'            => 50,
            'si_so_toi_da'               => 40,
            'so_hv_mo_lop'               => 20,
            'is_active'                  => true,
        ]);
        BaiThi::insert([
            ['khoa_hoc_id'=>$khoaA1->id,'ten_bai_thi'=>'Lý thuyết','loai'=>'tot_nghiep','diem_dat'=>21,'phi_thi_lai'=>100000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaA1->id,'ten_bai_thi'=>'Thực hành','loai'=>'tot_nghiep','diem_dat'=>80,'phi_thi_lai'=>150000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaA1->id,'ten_bai_thi'=>'Lý thuyết sát hạch','loai'=>'sat_hanh','diem_dat'=>21,'phi_thi_lai'=>150000,'thu_tu'=>1,'created_at'=>now(),'updated_at'=>now()],
            ['khoa_hoc_id'=>$khoaA1->id,'ten_bai_thi'=>'Thực hành sát hạch','loai'=>'sat_hanh','diem_dat'=>80,'phi_thi_lai'=>200000,'thu_tu'=>2,'created_at'=>now(),'updated_at'=>now()],
        ]);
    }
}
