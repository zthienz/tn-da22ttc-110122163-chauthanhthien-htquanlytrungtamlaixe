<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Thêm field loai_phi vào bảng thanh_toan_hoc_phi để phân biệt:
 *   - hoc_phi:   Học phí đăng ký ban đầu
 *   - phi_thi_lai: Phí thi lại từng bài thi rớt
 *
 * Đồng thời thêm bai_thi_id (nullable) để liên kết với bài thi cụ thể khi thu phí thi lại.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('thanh_toan_hoc_phi', function (Blueprint $table) {
            $table->enum('loai_phi', ['hoc_phi', 'phi_thi_lai'])
                  ->default('hoc_phi')
                  ->after('ho_so_id');
            $table->unsignedBigInteger('bai_thi_id')
                  ->nullable()
                  ->after('loai_phi')
                  ->comment('Bài thi cần nộp phí lại (chỉ dùng khi loai_phi = phi_thi_lai)');
            $table->unsignedBigInteger('lich_thi_id')
                  ->nullable()
                  ->after('bai_thi_id')
                  ->comment('Lịch thi liên quan (khi thu phí thi lại)');
        });
    }

    public function down(): void
    {
        Schema::table('thanh_toan_hoc_phi', function (Blueprint $table) {
            $table->dropColumn(['loai_phi', 'bai_thi_id', 'lich_thi_id']);
        });
    }
};
