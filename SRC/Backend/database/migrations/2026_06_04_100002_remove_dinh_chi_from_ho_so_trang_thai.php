<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Xóa trạng thái 'dinh_chi' khỏi ENUM trang_thai của bảng ho_so_hoc_vien.
 * Học viên đang ở trạng thái này (nếu có) sẽ được chuyển về 'cho_dong_hoc_phi'.
 */
return new class extends Migration {
    public function up(): void
    {
        // Chuyển học viên đang đình chỉ về chờ đóng học phí
        DB::table('ho_so_hoc_vien')
            ->where('trang_thai', 'dinh_chi')
            ->update(['trang_thai' => 'cho_dong_hoc_phi']);

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
                'da_cap_bang'
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
