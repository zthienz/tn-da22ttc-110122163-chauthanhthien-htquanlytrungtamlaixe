<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Đổi cột loai_bang từ enum sang varchar(10) để hỗ trợ mã hạng tự do
        DB::statement('ALTER TABLE khoa_hoc MODIFY loai_bang VARCHAR(10) NOT NULL');
    }

    public function down(): void
    {
        // Rollback về enum với các giá trị cũ
        DB::statement("ALTER TABLE khoa_hoc MODIFY loai_bang ENUM('A1','A','B1','B2','C1','C','D','E','CE') NOT NULL");
    }
};
