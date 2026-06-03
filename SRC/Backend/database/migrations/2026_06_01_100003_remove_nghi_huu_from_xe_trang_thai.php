<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Xóa trạng thái 'nghi_huu' khỏi cột trang_thai của bảng xe.
 * Các xe đang ở trạng thái 'nghi_huu' sẽ được chuyển sang 'hong'.
 */
return new class extends Migration {
    public function up(): void
    {
        // Chuyển xe đang nghỉ hưu → hỏng trước khi đổi ENUM
        DB::table('xe')->where('trang_thai', 'nghi_huu')->update(['trang_thai' => 'hong']);

        DB::statement("
            ALTER TABLE xe
            MODIFY COLUMN trang_thai ENUM('san_sang','dang_su_dung','bao_tri','hong')
            NOT NULL DEFAULT 'san_sang'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE xe
            MODIFY COLUMN trang_thai ENUM('san_sang','dang_su_dung','bao_tri','hong','nghi_huu')
            NOT NULL DEFAULT 'san_sang'
        ");
    }
};
