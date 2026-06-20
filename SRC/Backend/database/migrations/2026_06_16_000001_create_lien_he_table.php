<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lien_he', function (Blueprint $table) {
            $table->id();
            $table->string('ho_ten');
            $table->string('so_dien_thoai', 15)->nullable();
            $table->string('email')->nullable();
            $table->text('noi_dung');
            $table->enum('trang_thai', ['chua_xu_ly', 'da_xu_ly'])->default('chua_xu_ly');
            $table->text('ghi_chu')->nullable(); // ghi chú nội bộ của admin
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('lien_he'); }
};
