<?php

namespace App\Console\Commands;

use App\Models\HoSoHocVien;
use App\Models\LopHoc;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class KhaiGiangLopHoc extends Command
{
    protected $signature   = 'lophoc:khai-giang';
    protected $description = 'Tự động chuyển lớp học sang "đang học" khi đến ngày khai giảng (có ít nhất 1 học viên)';

    public function handle(): int
    {
        $homNay = today();

        // Lấy tất cả lớp: trạng thái chuẩn bị, ngày khai giảng = hôm nay, có ít nhất 1 học viên
        $lopChuyen = LopHoc::where('trang_thai', 'chuan_bi')
            ->whereDate('ngay_khai_giang', $homNay)
            ->withCount('hocVienLop')
            ->having('hoc_vien_lop_count', '>=', 1)
            ->get();

        if ($lopChuyen->isEmpty()) {
            $this->info("[$homNay] Không có lớp nào cần khai giảng hôm nay.");
            return self::SUCCESS;
        }

        $tongLop = 0;
        $tongHV  = 0;

        foreach ($lopChuyen as $lop) {
            DB::beginTransaction();
            try {
                // Chuyển trạng thái lớp
                $lop->update(['trang_thai' => 'dang_hoc']);

                // Chuyển học viên trong lớp: chuan_bi_hoc → dang_hoc
                $soHV = HoSoHocVien::whereHas('hocVienLop', fn($q) => $q->where('lop_hoc_id', $lop->id))
                    ->where('trang_thai', 'chuan_bi_hoc')
                    ->update(['trang_thai' => 'dang_hoc']);

                DB::commit();

                $tongLop++;
                $tongHV += $soHV;

                $this->info("✅ Lớp [{$lop->ten_lop}] → đang học | {$soHV} học viên cập nhật");
                Log::info("KhaiGiang: Lớp {$lop->ten_lop} (id={$lop->id}) khai giảng, {$soHV} HV chuyển sang dang_hoc");

            } catch (\Throwable $e) {
                DB::rollBack();
                $this->error("❌ Lỗi lớp [{$lop->ten_lop}]: {$e->getMessage()}");
                Log::error("KhaiGiang lỗi lớp {$lop->ten_lop}: {$e->getMessage()}");
            }
        }

        $this->info("[$homNay] Hoàn tất: {$tongLop} lớp khai giảng, {$tongHV} học viên chuyển trạng thái.");
        return self::SUCCESS;
    }
}
