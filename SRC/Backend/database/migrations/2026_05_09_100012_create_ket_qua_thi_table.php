<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Kết quả từng bài thi của từng học viên
return new class extends Migration {
    public function up(): void
    {
        Schema::create('ket_qua_thi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ho_so_id')->constrained('ho_so_hoc_vien')->onDelete('cascade');
            $table->foreignId('lich_thi_id')->constrained('lich_thi')->onDelete('cascade');
            $table->foreignId('bai_thi_id')->constrained('bai_thi')->onDelete('cascade');
            $table->decimal('diem', 5, 2)->nullable();
            $table->enum('ket_qua', ['dat', 'khong_dat', 'vang_mat'])->nullable();
            $table->integer('lan_thi')->default(1);         // lần thi thứ mấy
            $table->decimal('phi_thi_lai', 10, 2)->default(0); // phí đã thu cho lần thi này
            $table->boolean('da_thu_phi')->default(false);
            $table->text('nhan_xet')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('ket_qua_thi'); }
};
