<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lich_thi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('khoa_hoc_id')->constrained('khoa_hoc')->onDelete('cascade');
            $table->enum('loai_thi', ['tot_nghiep', 'sat_hanh']);
            $table->date('ngay_thi');
            $table->time('gio_thi');
            $table->string('dia_diem')->nullable();
            $table->string('don_vi_to_chuc')->nullable();   // BCA nào tổ chức (sát hạch)
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('lich_thi'); }
};
