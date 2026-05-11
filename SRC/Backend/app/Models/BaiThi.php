<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BaiThi extends Model
{
    protected $table = 'bai_thi';

    protected $fillable = [
        'khoa_hoc_id', 'ten_bai_thi', 'loai', 'diem_dat', 'phi_thi_lai', 'thu_tu',
    ];

    protected $casts = ['diem_dat' => 'decimal:2', 'phi_thi_lai' => 'decimal:2'];

    public function khoaHoc() { return $this->belongsTo(KhoaHoc::class, 'khoa_hoc_id'); }
}
