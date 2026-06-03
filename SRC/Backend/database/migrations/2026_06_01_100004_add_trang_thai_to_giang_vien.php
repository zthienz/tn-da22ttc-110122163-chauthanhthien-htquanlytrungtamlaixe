<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Thêm cột trang_thai vào bảng giang_vien.
 * - san_sang:   Sẵn sàng dạy, admin có thể xếp lịch.
 * - nghi_phep:  Đang nghỉ phép, không thể xếp lịch.
 * - dinh_chi:   Bị đình chỉ, không thể xếp lịch.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('giang_vien', function (Blueprint $table) {
            $table->enum('trang_thai', ['san_sang', 'nghi_phep', 'dinh_chi'])
                  ->default('san_sang')
                  ->after('anh_dai_dien');
        });
    }

    public function down(): void
    {
        Schema::table('giang_vien', function (Blueprint $table) {
            $table->dropColumn('trang_thai');
        });
    }
};
