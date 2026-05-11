<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('diem_danh', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lich_hoc_id')->constrained('lich_hoc')->onDelete('cascade');
            $table->foreignId('ho_so_id')->constrained('ho_so_hoc_vien')->onDelete('cascade');
            $table->boolean('co_mat')->default(false);
            $table->decimal('km_chay', 6, 2)->nullable();   // chỉ dùng cho buổi thực hành
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
            $table->unique(['lich_hoc_id', 'ho_so_id']);
        });
    }

    public function down(): void { Schema::dropIfExists('diem_danh'); }
};
