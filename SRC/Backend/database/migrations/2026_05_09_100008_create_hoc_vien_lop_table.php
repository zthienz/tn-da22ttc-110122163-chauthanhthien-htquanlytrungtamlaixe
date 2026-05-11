<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Bảng trung gian: học viên được xếp vào lớp nào
return new class extends Migration {
    public function up(): void
    {
        Schema::create('hoc_vien_lop', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ho_so_id')->constrained('ho_so_hoc_vien')->onDelete('cascade');
            $table->foreignId('lop_hoc_id')->constrained('lop_hoc')->onDelete('cascade');
            $table->date('ngay_xep_lop');

            // Theo dõi tiến độ học
            $table->integer('so_buoi_ly_thuyet_da_hoc')->default(0);
            $table->integer('so_buoi_thuc_hanh_da_hoc')->default(0);
            $table->decimal('so_km_da_chay', 8, 2)->default(0);

            // Điều kiện thi tốt nghiệp (hệ thống tự tính)
            $table->boolean('du_buoi_ly_thuyet')->default(false);
            $table->boolean('du_km_thuc_hanh')->default(false);
            $table->boolean('du_dieu_kien_thi_tn')->default(false);  // tự động cập nhật

            $table->timestamps();
            $table->unique(['ho_so_id', 'lop_hoc_id']);
        });
    }

    public function down(): void { Schema::dropIfExists('hoc_vien_lop'); }
};
