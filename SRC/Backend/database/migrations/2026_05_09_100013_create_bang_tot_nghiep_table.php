<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bang_tot_nghiep', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ho_so_id')->constrained('ho_so_hoc_vien')->onDelete('cascade');
            $table->string('so_bang')->unique();
            $table->date('ngay_cap');
            $table->enum('trang_thai', ['da_cap', 'cap_lai'])->default('da_cap');
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('bang_tot_nghiep'); }
};
