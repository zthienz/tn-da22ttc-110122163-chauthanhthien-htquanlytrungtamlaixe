<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bao_loi_xe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('xe_id')->constrained('xe')->onDelete('cascade');
            $table->foreignId('giang_vien_id')->constrained('giang_vien')->onDelete('cascade');
            $table->foreignId('lich_hoc_id')->nullable()->constrained('lich_hoc')->onDelete('set null');
            $table->string('tieu_de', 200);
            $table->text('mo_ta');
            $table->enum('muc_do', ['nhe', 'trung_binh', 'nghiem_trong'])->default('nhe');
            $table->enum('trang_thai', ['cho_xu_ly', 'dang_xu_ly', 'da_xu_ly'])->default('cho_xu_ly');
            $table->text('ghi_chu_xu_ly')->nullable();   // admin ghi chú khi xử lý
            $table->timestamp('ngay_xu_ly')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('bao_loi_xe'); }
};
