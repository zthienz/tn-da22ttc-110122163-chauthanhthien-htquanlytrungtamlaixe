<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BangTotNghiep extends Model
{
    protected $table = 'bang_tot_nghiep';

    protected $fillable = [
        'ho_so_id', 'so_bang', 'ngay_cap', 'trang_thai',
        'nguoi_nhan', 'quan_he', 'cccd_nguoi_nhan', 'ngay_nhan', 'nguoi_cap',
        'ghi_chu',
    ];

    protected $casts = ['ngay_cap' => 'date'];

    public function hoSo() { return $this->belongsTo(HoSoHocVien::class, 'ho_so_id'); }
}
