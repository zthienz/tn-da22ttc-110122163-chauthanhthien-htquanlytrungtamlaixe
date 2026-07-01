<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Thêm trạng thái 'dau_sat_hanh' vào ENUM trang_thai của bảng ho_so_hoc_vien.
 * Trạng thái này dùng cho học viên đã đậu kỳ thi sát hạch, đang chờ cấp bằng lái.
 *
 * Luồng đầy đủ:
 *   du_dieu_kien_sat_hanh → (đăng ký thi) → dang_thi_sat_hanh
 *       → (nhập KQ đậu) → dau_sat_hanh
 *       → (cấp bằng lái) → da_cap_bang
 */
return new class extends Migration {
    public function up(): void
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
                'dau_sat_hanh',
                'da_cap_bang'
            ) NOT NULL DEFAULT 'cho_dong_hoc_phi'
        ");
    }

    public function down(): void
    {
        // Chuyển học viên đang ở trạng thái dau_sat_hanh về du_dieu_kien_sat_hanh trước khi xóa
        DB::table('ho_so_hoc_vien')
            ->where('trang_thai', 'dau_sat_hanh')
            ->update(['trang_thai' => 'du_dieu_kien_sat_hanh']);

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
};
