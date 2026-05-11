<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Cấu hình các bài thi theo từng loại bằng (VD: B2 có: lý thuyết, sa hình, đường trường)
return new class extends Migration {
    public function up(): void
    {
        Schema::create('bai_thi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('khoa_hoc_id')->constrained('khoa_hoc')->onDelete('cascade');
            $table->string('ten_bai_thi');                          // VD: "Lý thuyết", "Sa hình", "Đường trường"
            $table->enum('loai', ['tot_nghiep', 'sat_hanh']);       // thi tốt nghiệp hay sát hạch
            $table->decimal('diem_dat', 5, 2);                      // điểm đạt tối thiểu
            $table->decimal('phi_thi_lai', 10, 2)->default(0);      // phí thi lại bài này
            $table->integer('thu_tu')->default(1);                  // thứ tự bài thi
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('bai_thi'); }
};
