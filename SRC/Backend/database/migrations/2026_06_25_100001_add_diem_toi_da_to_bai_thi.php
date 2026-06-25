<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Thêm cột diem_toi_da vào bảng bai_thi.
 * Điền giá trị mặc định theo quy định thực tế:
 *   - Lý thuyết A1/A: 25 câu
 *   - Lý thuyết B1/B2: 30 câu
 *   - Lý thuyết C1: 35 câu
 *   - Lý thuyết C: 40 câu
 *   - Lý thuyết D/E/CE: 45 câu
 *   - Mô phỏng: 50 điểm
 *   - Sa hình / Đường trường: 100 điểm
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('bai_thi', function (Blueprint $table) {
            $table->decimal('diem_toi_da', 5, 2)->default(100)->after('diem_dat');
        });

        // Cập nhật diem_toi_da theo từng loại bài thi dựa trên ten_bai_thi + loai_bang của khóa học
        $baiThiList = DB::table('bai_thi')
            ->join('khoa_hoc', 'bai_thi.khoa_hoc_id', '=', 'khoa_hoc.id')
            ->select('bai_thi.*', 'khoa_hoc.loai_bang')
            ->whereNull('khoa_hoc.ma_khoa') // chỉ khóa danh mục
            ->get();

        foreach ($baiThiList as $bai) {
            $diemToiDa = match (true) {
                // Mô phỏng: 50 điểm
                str_contains($bai->ten_bai_thi, 'Mô phỏng') => 50,

                // Sa hình, Đường trường: 100 điểm
                str_contains($bai->ten_bai_thi, 'Sa hình') ||
                str_contains($bai->ten_bai_thi, 'Đường trường') => 100,

                // Lý thuyết theo hạng bằng
                str_contains($bai->ten_bai_thi, 'Lý thuyết') => match ($bai->loai_bang) {
                    'A1', 'A'   => 25,
                    'B1', 'B2'  => 30,
                    'C1'        => 35,
                    'C'         => 40,
                    'D', 'E', 'CE' => 45,
                    default     => 100,
                },

                default => 100,
            };

            DB::table('bai_thi')->where('id', $bai->id)->update(['diem_toi_da' => $diemToiDa]);
        }
    }

    public function down(): void
    {
        Schema::table('bai_thi', function (Blueprint $table) {
            $table->dropColumn('diem_toi_da');
        });
    }
};
