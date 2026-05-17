<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('xe', function (Blueprint $table) {
            $table->id();
            $table->string('bien_so', 20)->unique();          // Biển số xe
            $table->string('hang_xe', 50);                    // Toyota, Kia, ...
            $table->string('dong_xe', 50)->nullable();        // Vios, Morning, ...
            $table->year('nam_san_xuat')->nullable();
            $table->enum('loai_xe', ['so_san', 'so_tu_dong'])->default('so_san');
            $table->enum('hang_bang', ['A1', 'A', 'B1', 'B2', 'C1', 'C', 'D', 'E', 'CE'])->default('B2');
            $table->string('mau_xe', 30)->nullable();
            $table->integer('so_km_hien_tai')->default(0);    // Odometer hiện tại
            $table->date('ngay_dang_kiem')->nullable();       // Ngày đăng kiểm
            $table->date('ngay_dang_kiem_tiep_theo')->nullable();
            $table->date('ngay_bao_hiem')->nullable();
            $table->enum('trang_thai', [
                'san_sang',     // sẵn sàng sử dụng
                'dang_su_dung', // đang trong buổi học
                'bao_tri',      // đang bảo trì / sửa chữa
                'hong',         // hỏng, chờ sửa
                'nghi_huu',     // không còn sử dụng
            ])->default('san_sang');
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('xe'); }
};
