<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HocPhi extends Model
{
    protected $table = 'hoc_phi';

    protected $fillable = [
        'hoc_vien_id', 'khoa_hoc_id', 'so_tien', 'da_thanh_toan', 'trang_thai', 'han_thanh_toan',
    ];

    protected $casts = [
        'so_tien'       => 'decimal:2',
        'da_thanh_toan' => 'decimal:2',
        'han_thanh_toan' => 'date',
    ];

    public function hocVien()   { return $this->belongsTo(HocVien::class, 'hoc_vien_id'); }
    public function khoaHoc()   { return $this->belongsTo(KhoaHoc::class, 'khoa_hoc_id'); }
    public function thanhToan() { return $this->hasMany(ThanhToan::class); }
}
