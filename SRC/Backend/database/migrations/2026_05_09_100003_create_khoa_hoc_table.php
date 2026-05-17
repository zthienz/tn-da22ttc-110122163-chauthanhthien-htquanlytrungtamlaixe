<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('khoa_hoc', function (Blueprint $table) {
            $table->id();
            $table->string('ten_khoa');
            $table->text('mo_ta')->nullable();
            $table->enum('loai_bang', ['A1', 'A', 'B1', 'B2', 'C1', 'C', 'D', 'E', 'CE']);
            $table->decimal('hoc_phi', 12, 2);                  // học phí 1 lần
            $table->integer('so_buoi_ly_thuyet_toi_thieu');     // điều kiện dự thi
            $table->integer('so_km_toi_thieu');                 // km tối thiểu thực hành
            $table->integer('si_so_toi_da')->default(30);       // sĩ số tối đa mỗi lớp
            $table->integer('so_hv_mo_lop')->default(20);       // số HV tối thiểu để mở lớp
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('khoa_hoc'); }
};
