<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Thêm 2 trạng thái mới vào luồng học viên:
//   chuan_bi_hoc  — đã được xếp lớp, lớp chưa khai giảng (chờ ngày khai giảng)
//   chuan_bi_thi  — đã được xếp lịch thi, chờ đến ngày thi
return new class extends Migration {
    public function up(): void
    {
        // MySQL không hỗ trợ ALTER COLUMN trực tiếp cho ENUM, phải dùng MODIFY
        DB::statement("
            ALTER TABLE ho_so_hoc_vien
            MODIFY COLUMN trang_thai ENUM(
                'cho_dong_hoc_phi',
                'cho_mo_lop',
                'chuan_bi_hoc',
                'dang_hoc',
                'du_dieu_kien_thi_tn',
                'chuan_bi_thi',
                'dang_thi_tn',
                'hoan_thanh_tn',
                'du_dieu_kien_sat_hanh',
                'dang_thi_sat_hanh',
                'da_cap_bang',
                'dinh_chi'
            ) NOT NULL DEFAULT 'cho_dong_hoc_phi'
        ");
    }

    public function down(): void
    {
        // Rollback: bỏ 2 trạng thái mới (các bản ghi đang dùng sẽ cần migrate data trước)
        DB::statement("
            ALTER TABLE ho_so_hoc_vien
            MODIFY COLUMN trang_thai ENUM(
                'cho_dong_hoc_phi',
                'cho_mo_lop',
                'dang_hoc',
                'du_dieu_kien_thi_tn',
                'dang_thi_tn',
                'hoan_thanh_tn',
                'du_dieu_kien_sat_hanh',
                'dang_thi_sat_hanh',
                'da_cap_bang',
                'dinh_chi'
            ) NOT NULL DEFAULT 'cho_dong_hoc_phi'
        ");
    }
};
