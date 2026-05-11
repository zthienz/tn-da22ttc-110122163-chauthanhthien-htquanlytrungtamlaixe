<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('giang_vien', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('chuyen_mon', ['ly_thuyet', 'thuc_hanh', 'ca_hai'])->default('ca_hai');
            $table->string('bang_cap')->nullable();
            $table->integer('nam_kinh_nghiem')->default(0);
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('giang_vien'); }
};
