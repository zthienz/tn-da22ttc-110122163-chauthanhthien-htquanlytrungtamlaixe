<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThanhToan extends Model
{
    protected $table = 'thanh_toan';

    protected $fillable = [
        'hoc_phi_id', 'so_tien', 'phuong_thuc', 'ma_giao_dich', 'trang_thai', 'ghi_chu', 'ngay_thanh_toan',
    ];

    protected $casts = [
        'so_tien'        => 'decimal:2',
        'ngay_thanh_toan' => 'datetime',
    ];

    public function hocPhi() { return $this->belongsTo(HocPhi::class, 'hoc_phi_id'); }
}
