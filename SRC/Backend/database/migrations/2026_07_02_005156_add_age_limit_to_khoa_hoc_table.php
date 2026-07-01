<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('khoa_hoc', function (Blueprint $table) {
            $table->unsignedTinyInteger('tuoi_toi_thieu')->nullable()->after('hoc_phi')
                ->comment('Độ tuổi tối thiểu để đăng ký loại bằng này');
            $table->unsignedTinyInteger('tuoi_toi_da')->nullable()->after('tuoi_toi_thieu')
                ->comment('Độ tuổi tối đa để đăng ký loại bằng này (null = không giới hạn)');
        });
    }

    public function down(): void
    {
        Schema::table('khoa_hoc', function (Blueprint $table) {
            $table->dropColumn(['tuoi_toi_thieu', 'tuoi_toi_da']);
        });
    }
};
