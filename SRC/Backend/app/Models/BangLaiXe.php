<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BangLaiXe extends Model
{
    protected $table = 'bang_lai_xe';

    protected $fillable = [
        'ho_so_id', 'so_bang_lai', 'ho_ten_chu_bang', 'ngay_sinh_chu_bang',
        'so_cccd_chu_bang', 'loai_bang', 'ngay_cap', 'ngay_het_han',
        'co_quan_cap', 'dia_chi_co_quan_cap', 'trang_thai', 'ngay_cap_thuc_te',
        'nguoi_nhan', 'quan_he', 'cccd_nguoi_nhan', 'ngay_nhan', 'nguoi_cap',
        'ghi_chu',
    ];

    protected $casts = [
        'ngay_cap'        => 'date',
        'ngay_het_han'    => 'date',
        'ngay_cap_thuc_te'=> 'datetime',
        'ngay_sinh_chu_bang' => 'date',
    ];

    public function hoSo() { return $this->belongsTo(HoSoHocVien::class, 'ho_so_id'); }
}
