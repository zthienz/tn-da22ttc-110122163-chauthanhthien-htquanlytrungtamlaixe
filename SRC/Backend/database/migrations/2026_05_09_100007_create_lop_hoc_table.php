<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lop_hoc', function (Blueprint $table) {
            $table->id();
            $table->foreignId('khoa_hoc_id')->constrained('khoa_hoc')->onDelete('cascade');
            $table->string('ten_lop');                          // VD: "B2-2025-01"
            $table->foreignId('giang_vien_ly_thuyet_id')
                  ->nullable()
                  ->constrained('giang_vien')->onDelete('set null');
            $table->foreignId('giang_vien_thuc_hanh_id')
                  ->nullable()
                  ->constrained('giang_vien')->onDelete('set null');
            $table->date('ngay_khai_giang')->nullable();
            $table->date('ngay_ket_thuc')->nullable();
            $table->integer('si_so_toi_da')->default(30);
            $table->enum('trang_thai', ['chuan_bi', 'dang_hoc', 'da_ket_thuc'])->default('chuan_bi');
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('lop_hoc'); }
};
