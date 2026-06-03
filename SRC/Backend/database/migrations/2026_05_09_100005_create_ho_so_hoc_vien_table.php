<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Hồ sơ đăng ký học — trung tâm của toàn bộ quy trình
return new class extends Migration {
    public function up(): void
    {
        Schema::create('ho_so_hoc_vien', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('khoa_hoc_id')->constrained('khoa_hoc')->onDelete('cascade');

            // Thông tin cá nhân
            $table->string('ho_ten');
            $table->date('ngay_sinh');
            $table->string('so_cccd', 20)->unique();
            $table->string('dia_chi')->nullable();
            $table->string('so_dien_thoai', 15)->nullable();
            $table->string('email')->nullable();
            $table->string('anh_the')->nullable();              // ảnh thẻ học viên

            // Nguồn đăng ký
            $table->enum('nguon_dang_ky', ['online', 'offline'])->default('online');

            // Trạng thái học phí
            $table->enum('trang_thai_hoc_phi', [
                'chua_dong',        // mới đăng ký, chưa đóng tiền
                'da_dong',          // đã đóng đủ học phí
            ])->default('chua_dong');
            $table->decimal('hoc_phi_da_dong', 12, 2)->default(0);
            $table->timestamp('ngay_dong_hoc_phi')->nullable();

            // Trạng thái tổng thể của học viên trong quy trình
            $table->enum('trang_thai', [
                'cho_dong_hoc_phi',         // hàng chờ, chưa đóng tiền
                'cho_mo_lop',               // đã đóng tiền, chờ đủ số lượng mở lớp
                'dang_hoc',                 // đang học trong lớp
                'du_dieu_kien_thi_tn',      // đủ điều kiện thi tốt nghiệp
                'dang_thi_tn',              // đang trong quá trình thi tốt nghiệp
                'hoan_thanh_tn',            // đậu tốt nghiệp, chờ sát hạch
                'du_dieu_kien_sat_hanh',    // đủ điều kiện thi sát hạch
                'dang_thi_sat_hanh',        // đang thi sát hạch
                'da_cap_bang',              // đã cấp bằng lái chính thức
                'dinh_chi',                 // bị đình chỉ
            ])->default('cho_dong_hoc_phi');

            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('ho_so_hoc_vien'); }
};
