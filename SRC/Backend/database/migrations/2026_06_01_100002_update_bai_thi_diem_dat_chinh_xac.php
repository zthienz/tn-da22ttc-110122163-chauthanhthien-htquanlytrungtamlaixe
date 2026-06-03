<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Cập nhật bảng bai_thi theo đúng quy định điểm đậu thực tế:
 *
 * A1 : LT 25 câu ≥21, Sa hình ≥80
 * A  : LT 25 câu ≥23, Sa hình ≥80
 * B1/B2: LT 30 câu ≥27, Mô phỏng 50đ ≥35, Sa hình ≥80, Đường trường ≥80
 * C1 : LT 35 câu ≥32, Mô phỏng ≥35, Sa hình ≥80, Đường trường ≥80
 * C  : LT 40 câu ≥36, Mô phỏng ≥35, Sa hình ≥80, Đường trường ≥80
 * D/E: LT 45 câu ≥42, Mô phỏng ≥35, Sa hình ≥80, Đường trường ≥80
 * CE : LT 45 câu ≥42, Mô phỏng ≥35, Sa hình ≥80, Đường trường ≥80
 *
 * Đồng thời xóa bài thi cũ sai và tạo lại đúng cấu trúc.
 */
return new class extends Migration {

    // Cấu hình bài thi theo loai_bang
    private function cauHinhBaiThi(): array
    {
        return [
            'A1' => [
                'tot_nghiep' => [
                    ['ten_bai_thi' => 'Lý thuyết',  'diem_dat' => 21, 'phi_thi_lai' => 100000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Sa hình',     'diem_dat' => 80, 'phi_thi_lai' => 150000, 'thu_tu' => 2],
                ],
                'sat_hanh' => [
                    ['ten_bai_thi' => 'Lý thuyết',  'diem_dat' => 21, 'phi_thi_lai' => 150000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Sa hình',     'diem_dat' => 80, 'phi_thi_lai' => 200000, 'thu_tu' => 2],
                ],
            ],
            'A' => [
                'tot_nghiep' => [
                    ['ten_bai_thi' => 'Lý thuyết',  'diem_dat' => 23, 'phi_thi_lai' => 100000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Sa hình',     'diem_dat' => 80, 'phi_thi_lai' => 150000, 'thu_tu' => 2],
                ],
                'sat_hanh' => [
                    ['ten_bai_thi' => 'Lý thuyết',  'diem_dat' => 23, 'phi_thi_lai' => 150000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Sa hình',     'diem_dat' => 80, 'phi_thi_lai' => 200000, 'thu_tu' => 2],
                ],
            ],
            'B1' => [
                'tot_nghiep' => [
                    ['ten_bai_thi' => 'Lý thuyết',    'diem_dat' => 27, 'phi_thi_lai' => 150000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Mô phỏng',     'diem_dat' => 35, 'phi_thi_lai' => 150000, 'thu_tu' => 2],
                    ['ten_bai_thi' => 'Sa hình',       'diem_dat' => 80, 'phi_thi_lai' => 200000, 'thu_tu' => 3],
                    ['ten_bai_thi' => 'Đường trường',  'diem_dat' => 80, 'phi_thi_lai' => 200000, 'thu_tu' => 4],
                ],
                'sat_hanh' => [
                    ['ten_bai_thi' => 'Lý thuyết',    'diem_dat' => 27, 'phi_thi_lai' => 200000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Mô phỏng',     'diem_dat' => 35, 'phi_thi_lai' => 200000, 'thu_tu' => 2],
                    ['ten_bai_thi' => 'Sa hình',       'diem_dat' => 80, 'phi_thi_lai' => 300000, 'thu_tu' => 3],
                    ['ten_bai_thi' => 'Đường trường',  'diem_dat' => 80, 'phi_thi_lai' => 300000, 'thu_tu' => 4],
                ],
            ],
            'B2' => [
                'tot_nghiep' => [
                    ['ten_bai_thi' => 'Lý thuyết',    'diem_dat' => 27, 'phi_thi_lai' => 150000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Mô phỏng',     'diem_dat' => 35, 'phi_thi_lai' => 150000, 'thu_tu' => 2],
                    ['ten_bai_thi' => 'Sa hình',       'diem_dat' => 80, 'phi_thi_lai' => 200000, 'thu_tu' => 3],
                    ['ten_bai_thi' => 'Đường trường',  'diem_dat' => 80, 'phi_thi_lai' => 200000, 'thu_tu' => 4],
                ],
                'sat_hanh' => [
                    ['ten_bai_thi' => 'Lý thuyết',    'diem_dat' => 27, 'phi_thi_lai' => 200000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Mô phỏng',     'diem_dat' => 35, 'phi_thi_lai' => 200000, 'thu_tu' => 2],
                    ['ten_bai_thi' => 'Sa hình',       'diem_dat' => 80, 'phi_thi_lai' => 300000, 'thu_tu' => 3],
                    ['ten_bai_thi' => 'Đường trường',  'diem_dat' => 80, 'phi_thi_lai' => 300000, 'thu_tu' => 4],
                ],
            ],
            'C1' => [
                'tot_nghiep' => [
                    ['ten_bai_thi' => 'Lý thuyết',    'diem_dat' => 32, 'phi_thi_lai' => 150000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Mô phỏng',     'diem_dat' => 35, 'phi_thi_lai' => 200000, 'thu_tu' => 2],
                    ['ten_bai_thi' => 'Sa hình',       'diem_dat' => 80, 'phi_thi_lai' => 250000, 'thu_tu' => 3],
                    ['ten_bai_thi' => 'Đường trường',  'diem_dat' => 80, 'phi_thi_lai' => 250000, 'thu_tu' => 4],
                ],
                'sat_hanh' => [
                    ['ten_bai_thi' => 'Lý thuyết',    'diem_dat' => 32, 'phi_thi_lai' => 200000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Mô phỏng',     'diem_dat' => 35, 'phi_thi_lai' => 200000, 'thu_tu' => 2],
                    ['ten_bai_thi' => 'Sa hình',       'diem_dat' => 80, 'phi_thi_lai' => 350000, 'thu_tu' => 3],
                    ['ten_bai_thi' => 'Đường trường',  'diem_dat' => 80, 'phi_thi_lai' => 350000, 'thu_tu' => 4],
                ],
            ],
            'C' => [
                'tot_nghiep' => [
                    ['ten_bai_thi' => 'Lý thuyết',    'diem_dat' => 36, 'phi_thi_lai' => 150000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Mô phỏng',     'diem_dat' => 35, 'phi_thi_lai' => 200000, 'thu_tu' => 2],
                    ['ten_bai_thi' => 'Sa hình',       'diem_dat' => 80, 'phi_thi_lai' => 250000, 'thu_tu' => 3],
                    ['ten_bai_thi' => 'Đường trường',  'diem_dat' => 80, 'phi_thi_lai' => 250000, 'thu_tu' => 4],
                ],
                'sat_hanh' => [
                    ['ten_bai_thi' => 'Lý thuyết',    'diem_dat' => 36, 'phi_thi_lai' => 200000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Mô phỏng',     'diem_dat' => 35, 'phi_thi_lai' => 200000, 'thu_tu' => 2],
                    ['ten_bai_thi' => 'Sa hình',       'diem_dat' => 80, 'phi_thi_lai' => 350000, 'thu_tu' => 3],
                    ['ten_bai_thi' => 'Đường trường',  'diem_dat' => 80, 'phi_thi_lai' => 350000, 'thu_tu' => 4],
                ],
            ],
            'D' => [
                'tot_nghiep' => [
                    ['ten_bai_thi' => 'Lý thuyết',    'diem_dat' => 42, 'phi_thi_lai' => 150000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Mô phỏng',     'diem_dat' => 35, 'phi_thi_lai' => 200000, 'thu_tu' => 2],
                    ['ten_bai_thi' => 'Sa hình',       'diem_dat' => 80, 'phi_thi_lai' => 250000, 'thu_tu' => 3],
                    ['ten_bai_thi' => 'Đường trường',  'diem_dat' => 80, 'phi_thi_lai' => 250000, 'thu_tu' => 4],
                ],
                'sat_hanh' => [
                    ['ten_bai_thi' => 'Lý thuyết',    'diem_dat' => 42, 'phi_thi_lai' => 200000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Mô phỏng',     'diem_dat' => 35, 'phi_thi_lai' => 200000, 'thu_tu' => 2],
                    ['ten_bai_thi' => 'Sa hình',       'diem_dat' => 80, 'phi_thi_lai' => 350000, 'thu_tu' => 3],
                    ['ten_bai_thi' => 'Đường trường',  'diem_dat' => 80, 'phi_thi_lai' => 350000, 'thu_tu' => 4],
                ],
            ],
            'E' => [
                'tot_nghiep' => [
                    ['ten_bai_thi' => 'Lý thuyết',    'diem_dat' => 42, 'phi_thi_lai' => 150000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Mô phỏng',     'diem_dat' => 35, 'phi_thi_lai' => 200000, 'thu_tu' => 2],
                    ['ten_bai_thi' => 'Sa hình',       'diem_dat' => 80, 'phi_thi_lai' => 250000, 'thu_tu' => 3],
                    ['ten_bai_thi' => 'Đường trường',  'diem_dat' => 80, 'phi_thi_lai' => 250000, 'thu_tu' => 4],
                ],
                'sat_hanh' => [
                    ['ten_bai_thi' => 'Lý thuyết',    'diem_dat' => 42, 'phi_thi_lai' => 200000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Mô phỏng',     'diem_dat' => 35, 'phi_thi_lai' => 200000, 'thu_tu' => 2],
                    ['ten_bai_thi' => 'Sa hình',       'diem_dat' => 80, 'phi_thi_lai' => 350000, 'thu_tu' => 3],
                    ['ten_bai_thi' => 'Đường trường',  'diem_dat' => 80, 'phi_thi_lai' => 350000, 'thu_tu' => 4],
                ],
            ],
            'CE' => [
                'tot_nghiep' => [
                    ['ten_bai_thi' => 'Lý thuyết',    'diem_dat' => 42, 'phi_thi_lai' => 150000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Mô phỏng',     'diem_dat' => 35, 'phi_thi_lai' => 200000, 'thu_tu' => 2],
                    ['ten_bai_thi' => 'Sa hình',       'diem_dat' => 80, 'phi_thi_lai' => 250000, 'thu_tu' => 3],
                    ['ten_bai_thi' => 'Đường trường',  'diem_dat' => 80, 'phi_thi_lai' => 250000, 'thu_tu' => 4],
                ],
                'sat_hanh' => [
                    ['ten_bai_thi' => 'Lý thuyết',    'diem_dat' => 42, 'phi_thi_lai' => 200000, 'thu_tu' => 1],
                    ['ten_bai_thi' => 'Mô phỏng',     'diem_dat' => 35, 'phi_thi_lai' => 200000, 'thu_tu' => 2],
                    ['ten_bai_thi' => 'Sa hình',       'diem_dat' => 80, 'phi_thi_lai' => 350000, 'thu_tu' => 3],
                    ['ten_bai_thi' => 'Đường trường',  'diem_dat' => 80, 'phi_thi_lai' => 350000, 'thu_tu' => 4],
                ],
            ],
        ];
    }

    public function up(): void
    {
        $cauHinh = $this->cauHinhBaiThi();

        // Lấy tất cả khóa học danh mục (không có ma_khoa)
        $khoaList = DB::table('khoa_hoc')
            ->whereNull('ma_khoa')
            ->whereIn('loai_bang', array_keys($cauHinh))
            ->get();

        foreach ($khoaList as $khoa) {
            $config = $cauHinh[$khoa->loai_bang] ?? null;
            if (!$config) continue;

            // Xóa bài thi cũ của khóa này
            DB::table('bai_thi')->where('khoa_hoc_id', $khoa->id)->delete();

            // Tạo lại đúng cấu trúc
            $rows = [];
            foreach (['tot_nghiep', 'sat_hanh'] as $loai) {
                foreach ($config[$loai] as $bai) {
                    $rows[] = [
                        'khoa_hoc_id' => $khoa->id,
                        'ten_bai_thi' => $bai['ten_bai_thi'],
                        'loai'        => $loai,
                        'diem_dat'    => $bai['diem_dat'],
                        'phi_thi_lai' => $bai['phi_thi_lai'],
                        'thu_tu'      => $bai['thu_tu'],
                        'created_at'  => now(),
                        'updated_at'  => now(),
                    ];
                }
            }
            DB::table('bai_thi')->insert($rows);
        }

        // Thêm khóa CE nếu chưa có
        $ceExists = DB::table('khoa_hoc')
            ->where('loai_bang', 'CE')
            ->whereNull('ma_khoa')
            ->exists();

        if (!$ceExists) {
            $ceId = DB::table('khoa_hoc')->insertGetId([
                'ten_khoa'                    => 'Nâng hạng bằng lái xe hạng CE',
                'mo_ta'                       => 'Lái xe đầu kéo (sơ mi rơ moóc)',
                'loai_bang'                   => 'CE',
                'hoc_phi'                     => 12000000,
                'so_buoi_ly_thuyet_toi_thieu' => 20,
                'so_km_toi_thieu'             => 800,
                'si_so_toi_da'                => 20,
                'so_hv_mo_lop'                => 10,
                'is_active'                   => true,
                'created_at'                  => now(),
                'updated_at'                  => now(),
            ]);

            $rows = [];
            foreach (['tot_nghiep', 'sat_hanh'] as $loai) {
                foreach ($cauHinh['CE'][$loai] as $bai) {
                    $rows[] = [
                        'khoa_hoc_id' => $ceId,
                        'ten_bai_thi' => $bai['ten_bai_thi'],
                        'loai'        => $loai,
                        'diem_dat'    => $bai['diem_dat'],
                        'phi_thi_lai' => $bai['phi_thi_lai'],
                        'thu_tu'      => $bai['thu_tu'],
                        'created_at'  => now(),
                        'updated_at'  => now(),
                    ];
                }
            }
            DB::table('bai_thi')->insert($rows);
        }
    }

    public function down(): void
    {
        // Không rollback dữ liệu bài thi — chỉ ghi chú
    }
};
