<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Xe;

class XeResetSeeder extends Seeder
{
    public function run(): void
    {
        $reset = [
            '51A-12345' => ['so_km_hien_tai' => 0, 'trang_thai' => 'san_sang', 'ghi_chu' => null, 'ngay_dang_kiem' => null, 'ngay_dang_kiem_tiep_theo' => null, 'ngay_bao_hiem' => null],
            '51A-23456' => ['so_km_hien_tai' => 0, 'trang_thai' => 'san_sang', 'ghi_chu' => null, 'ngay_dang_kiem' => null, 'ngay_dang_kiem_tiep_theo' => null, 'ngay_bao_hiem' => null],
            '51B-34567' => ['so_km_hien_tai' => 0, 'trang_thai' => 'san_sang', 'ghi_chu' => null, 'ngay_dang_kiem' => null, 'ngay_dang_kiem_tiep_theo' => null, 'ngay_bao_hiem' => null],
            '51B-45678' => ['so_km_hien_tai' => 0, 'trang_thai' => 'san_sang', 'ghi_chu' => null, 'ngay_dang_kiem' => null, 'ngay_dang_kiem_tiep_theo' => null, 'ngay_bao_hiem' => null],
            '51C-56789' => ['so_km_hien_tai' => 0, 'trang_thai' => 'san_sang', 'ghi_chu' => null, 'ngay_dang_kiem' => null, 'ngay_dang_kiem_tiep_theo' => null, 'ngay_bao_hiem' => null],
            '51C-67890' => ['so_km_hien_tai' => 0, 'trang_thai' => 'san_sang', 'ghi_chu' => null, 'ngay_dang_kiem' => null, 'ngay_dang_kiem_tiep_theo' => null, 'ngay_bao_hiem' => null],
            '51D-78901' => ['so_km_hien_tai' => 0, 'trang_thai' => 'san_sang', 'ghi_chu' => null, 'ngay_dang_kiem' => null, 'ngay_dang_kiem_tiep_theo' => null, 'ngay_bao_hiem' => null],
            '51D-89012' => ['so_km_hien_tai' => 0, 'trang_thai' => 'san_sang', 'ghi_chu' => null, 'ngay_dang_kiem' => null, 'ngay_dang_kiem_tiep_theo' => null, 'ngay_bao_hiem' => null],
        ];

        foreach ($reset as $bien_so => $data) {
            Xe::where('bien_so', $bien_so)->update($data);
        }

        $this->command->info('Đã reset ' . count($reset) . ' xe về trạng thái mới.');
    }
}
