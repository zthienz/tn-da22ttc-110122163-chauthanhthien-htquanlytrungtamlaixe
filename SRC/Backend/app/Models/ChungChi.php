<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChungChi extends Model
{
    protected $table = 'chung_chi';

    protected $fillable = [
        'hoc_vien_id', 'khoa_hoc_id', 'so_chung_chi', 'ngay_cap', 'ngay_het_han', 'trang_thai',
    ];

    protected $casts = ['ngay_cap' => 'date', 'ngay_het_han' => 'date'];

    public function hocVien() { return $this->belongsTo(HocVien::class, 'hoc_vien_id'); }
    public function khoaHoc() { return $this->belongsTo(KhoaHoc::class, 'khoa_hoc_id'); }
}
