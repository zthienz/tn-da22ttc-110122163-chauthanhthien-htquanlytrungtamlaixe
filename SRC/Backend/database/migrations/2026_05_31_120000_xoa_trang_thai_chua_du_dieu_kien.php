<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Xóa trạng thái chua_du_dieu_kien_thi khỏi luồng học viên.
// Luồng mới: dang_hoc → du_dieu_kien_thi_tn (khi đủ tiến độ)
return new class extends Migration {
    public function up(): void
    {
        // Chuyển các học viên đang ở chua_du_dieu_kien_thi về dang_hoc
        DB::table('ho_so_hoc_vien')
            ->where('trang_thai', 'chua_du_dieu_kien_thi')
            ->update(['trang_thai' => 'dang_hoc']);

        // Xóa chua_du_dieu_kien_thi khỏi enum
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
        DB::statement("
            ALTER TABLE ho_so_hoc_vien
            MODIFY COLUMN trang_thai ENUM(
                'cho_dong_hoc_phi',
                'cho_mo_lop',
                'chuan_bi_hoc',
                'dang_hoc',
                'chua_du_dieu_kien_thi',
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
};
