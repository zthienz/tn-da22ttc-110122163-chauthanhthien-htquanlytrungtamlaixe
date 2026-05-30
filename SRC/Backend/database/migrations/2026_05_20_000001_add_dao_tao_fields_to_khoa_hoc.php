<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('khoa_hoc', function (Blueprint $table) {
            // Thêm các trường cho khóa học đào tạo theo tháng
            $table->string('ma_khoa', 20)->nullable()->unique()->after('id');
            $table->tinyInteger('thang')->nullable()->after('ma_khoa');
            $table->smallInteger('nam')->nullable()->after('thang');
            $table->string('hang_bang', 5)->nullable()->after('nam');
            $table->string('ten_khoa_dao_tao')->nullable()->after('hang_bang');
            $table->enum('trang_thai_khoa', ['chuan_bi', 'dang_hoc', 'da_ket_thuc'])->default('chuan_bi')->after('ten_khoa_dao_tao');

            // Thêm các trường nội dung frontend
            $table->text('doi_tuong')->nullable();
            $table->text('loai_xe_mo_ta')->nullable();
            $table->string('thoi_han_bang')->nullable();
            $table->string('yeu_cau_truoc')->nullable();
            $table->text('quyen_lai_xe')->nullable();
            $table->text('quy_trinh_dao_tao')->nullable();
            $table->text('le_phi_sat_hach')->nullable();
        });

        // Bảng pivot xe - lớp học
        Schema::create('xe_lop_hoc', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lop_hoc_id')->constrained('lop_hoc')->onDelete('cascade');
            $table->foreignId('xe_id')->constrained('xe')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['lop_hoc_id', 'xe_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('xe_lop_hoc');
        Schema::table('khoa_hoc', function (Blueprint $table) {
            $table->dropColumn([
                'ma_khoa', 'thang', 'nam', 'hang_bang', 'ten_khoa_dao_tao', 'trang_thai_khoa',
                'doi_tuong', 'loai_xe_mo_ta', 'thoi_han_bang', 'yeu_cau_truoc',
                'quyen_lai_xe', 'quy_trinh_dao_tao', 'le_phi_sat_hach',
            ]);
        });
    }
};
