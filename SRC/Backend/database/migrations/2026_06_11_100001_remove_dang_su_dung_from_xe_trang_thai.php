<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Xóa trạng thái 'dang_su_dung' khỏi cột trang_thai của bảng xe.
 * Các xe đang ở trạng thái 'dang_su_dung' sẽ được chuyển về 'san_sang'.
 */
return new class extends Migration {
    public function up(): void
    {
        // Chuyển xe đang ở dang_su_dung → san_sang trước khi đổi ENUM
        DB::table('xe')->where('trang_thai', 'dang_su_dung')->update(['trang_thai' => 'san_sang']);

        DB::statement("
            ALTER TABLE xe
            MODIFY COLUMN trang_thai ENUM('san_sang','bao_tri','hong')
            NOT NULL DEFAULT 'san_sang'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE xe
            MODIFY COLUMN trang_thai ENUM('san_sang','dang_su_dung','bao_tri','hong')
            NOT NULL DEFAULT 'san_sang'
        ");
    }
};
