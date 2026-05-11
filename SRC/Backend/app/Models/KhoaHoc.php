<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KhoaHoc extends Model
{
    protected $table = 'khoa_hoc';

    protected $fillable = [
        'ten_khoa', 'mo_ta', 'loai_bang', 'hoc_phi',
        'so_buoi_ly_thuyet_toi_thieu', 'so_km_toi_thieu',
        'si_so_toi_da', 'so_hv_mo_lop', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean', 'hoc_phi' => 'decimal:2'];

    public function lopHoc()   { return $this->hasMany(LopHoc::class); }
    public function baiThi()   { return $this->hasMany(BaiThi::class); }
    public function hoSo()     { return $this->hasMany(HoSoHocVien::class); }
}
