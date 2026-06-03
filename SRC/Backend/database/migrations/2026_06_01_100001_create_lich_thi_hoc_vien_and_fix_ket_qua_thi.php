<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tạo bảng lich_thi_hoc_vien để lưu danh sách học viên được xếp vào lịch thi.
 * Tách biệt với ket_qua_thi (chỉ tạo khi nhập điểm thực sự).
 * Đồng thời cho bai_thi_id nullable trong ket_qua_thi.
 */
return new class extends Migration {
    public function up(): void
    {
        // Bảng trung gian: học viên được xếp vào lịch thi
        Schema::create('lich_thi_hoc_vien', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lich_thi_id')->constrained('lich_thi')->onDelete('cascade');
            $table->foreignId('ho_so_id')->constrained('ho_so_hoc_vien')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['lich_thi_id', 'ho_so_id']);
        });

        // Cho bai_thi_id nullable trong ket_qua_thi
        // (bai_thi_id chỉ cần khi nhập điểm từng bài, không cần khi mới xếp lịch)
        Schema::table('ket_qua_thi', function (Blueprint $table) {
            $table->unsignedBigInteger('bai_thi_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lich_thi_hoc_vien');

        Schema::table('ket_qua_thi', function (Blueprint $table) {
            $table->unsignedBigInteger('bai_thi_id')->nullable(false)->change();
        });
    }
};
