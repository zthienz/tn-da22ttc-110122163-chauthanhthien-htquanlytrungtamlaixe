<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('thanh_toan_hoc_phi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ho_so_id')->constrained('ho_so_hoc_vien')->onDelete('cascade');
            $table->decimal('so_tien', 12, 2);
            $table->enum('phuong_thuc', ['tien_mat', 'chuyen_khoan', 'vnpay', 'momo'])->default('tien_mat');
            $table->string('ma_giao_dich')->nullable();
            $table->enum('trang_thai', ['cho_xu_ly', 'thanh_cong', 'that_bai'])->default('thanh_cong');
            $table->string('nguoi_thu')->nullable();            // admin thu tiền
            $table->text('ghi_chu')->nullable();
            $table->timestamp('ngay_thanh_toan')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('thanh_toan_hoc_phi'); }
};
