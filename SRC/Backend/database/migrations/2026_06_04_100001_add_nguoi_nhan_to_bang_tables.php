<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Thêm thông tin người nhận bằng vào bảng bang_tot_nghiep và bang_lai_xe.
 * - nguoi_nhan:      Họ tên người đến nhận bằng (có thể là học viên hoặc người được ủy quyền)
 * - quan_he:         Quan hệ với học viên (bản thân / cha mẹ / vợ chồng / ủy quyền)
 * - cccd_nguoi_nhan: CCCD người nhận (bắt buộc nếu không phải bản thân)
 * - ngay_nhan:       Ngày nhận bằng thực tế (có thể khác ngày cấp)
 * - nguoi_cap:       Tên admin/nhân viên thực hiện cấp bằng
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('bang_tot_nghiep', function (Blueprint $table) {
            $table->string('nguoi_nhan')->nullable()->after('ngay_cap');
            $table->string('quan_he')->nullable()->after('nguoi_nhan');
            $table->string('cccd_nguoi_nhan', 20)->nullable()->after('quan_he');
            $table->date('ngay_nhan')->nullable()->after('cccd_nguoi_nhan');
            $table->string('nguoi_cap')->nullable()->after('ngay_nhan');
        });

        Schema::table('bang_lai_xe', function (Blueprint $table) {
            $table->string('nguoi_nhan')->nullable()->after('ngay_cap');
            $table->string('quan_he')->nullable()->after('nguoi_nhan');
            $table->string('cccd_nguoi_nhan', 20)->nullable()->after('quan_he');
            $table->date('ngay_nhan')->nullable()->after('cccd_nguoi_nhan');
            $table->string('nguoi_cap')->nullable()->after('ngay_nhan');
        });
    }

    public function down(): void
    {
        Schema::table('bang_tot_nghiep', function (Blueprint $table) {
            $table->dropColumn(['nguoi_nhan', 'quan_he', 'cccd_nguoi_nhan', 'ngay_nhan', 'nguoi_cap']);
        });
        Schema::table('bang_lai_xe', function (Blueprint $table) {
            $table->dropColumn(['nguoi_nhan', 'quan_he', 'cccd_nguoi_nhan', 'ngay_nhan', 'nguoi_cap']);
        });
    }
};
