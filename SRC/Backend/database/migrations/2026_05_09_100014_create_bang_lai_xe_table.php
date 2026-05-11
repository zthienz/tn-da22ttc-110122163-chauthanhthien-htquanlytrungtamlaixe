<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Bằng lái chính thức — lưu đầy đủ thông tin theo yêu cầu
return new class extends Migration {
    public function up(): void
    {
        Schema::create('bang_lai_xe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ho_so_id')->constrained('ho_so_hoc_vien')->onDelete('cascade');

            // Thông tin bằng lái
            $table->string('so_bang_lai')->unique();
            $table->string('ho_ten_chu_bang');              // tên chủ bằng
            $table->date('ngay_sinh_chu_bang');
            $table->string('so_cccd_chu_bang', 20);
            $table->enum('loai_bang', ['A1','A2','B1','B2','C','D','E']);
            $table->date('ngay_cap');
            $table->date('ngay_het_han')->nullable();       // null = không thời hạn (A1)
            $table->string('co_quan_cap');                  // BCA nào cấp
            $table->string('dia_chi_co_quan_cap')->nullable();

            // Trạng thái
            $table->enum('trang_thai', [
                'cho_cap',      // đủ điều kiện, chờ cấp bằng vật lý
                'da_cap',       // đã cấp bằng
                'cap_lai',      // cấp lại (mất/hỏng)
                'thu_hoi',      // bị thu hồi
            ])->default('cho_cap');

            $table->timestamp('ngay_cap_thuc_te')->nullable(); // ngày trao bằng thực tế
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('bang_lai_xe'); }
};
