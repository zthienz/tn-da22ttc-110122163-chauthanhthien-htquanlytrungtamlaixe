<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Xe;

class XeAnhSeeder extends Seeder
{
    /**
     * Gán ảnh đại diện cho từng xe dựa theo hãng xe và dòng xe
     */
    public function run(): void
    {
        $mapping = [
            // Toyota Vios (B2 số sàn)
            '51A-12345' => 'xe_vios.jpg',
            '51A-23456' => 'xe_vios.jpg',
            // Kia Morning (B1 số tự động)
            '51B-34567' => 'xe_kia.jpg',
            '51B-45678' => 'xe_kia.jpg',
            // Honda Wave Alpha (A1)
            '51C-56789' => 'xe_wave.jpg',
            // Yamaha Sirius (A1) — dùng ảnh xe máy
            '51C-67890' => 'xe_wave.jpg',
            // Toyota Camry (B2 số tự động)
            '51D-78901' => 'xe_vios.jpg',
            // Hyundai Accent (B2 số sàn)
            '51D-89012' => 'xe_hyundai.jpg',
        ];

        foreach ($mapping as $bien_so => $anh) {
            Xe::where('bien_so', $bien_so)->update(['anh_xe' => $anh]);
        }

        $this->command->info('Đã gán ảnh cho ' . count($mapping) . ' xe.');
    }
}
