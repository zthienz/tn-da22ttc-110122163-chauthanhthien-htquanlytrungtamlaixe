<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThanhToanHocPhi extends Model
{
    protected $table = 'thanh_toan_hoc_phi';

    protected $fillable = [
        'ho_so_id', 'so_tien', 'phuong_thuc',
        'ma_giao_dich', 'trang_thai', 'nguoi_thu',
        'ghi_chu', 'ngay_thanh_toan',
    ];

    protected $casts = [
        'so_tien'        => 'decimal:2',
        'ngay_thanh_toan' => 'datetime',
    ];

    public function hoSo() { return $this->belongsTo(HoSoHocVien::class, 'ho_so_id'); }
}
