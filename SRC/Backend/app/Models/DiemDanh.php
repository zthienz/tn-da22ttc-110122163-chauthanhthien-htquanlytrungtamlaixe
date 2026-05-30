<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiemDanh extends Model
{
    protected $table = 'diem_danh';

    protected $fillable = ['lich_hoc_id', 'ho_so_id', 'co_mat', 'km_chay', 'ghi_chu'];

    protected $casts = [
        'co_mat'   => 'boolean',
        'km_chay'  => 'decimal:2',
    ];

    public function lichHoc() { return $this->belongsTo(LichHoc::class, 'lich_hoc_id'); }
    public function hoSo()    { return $this->belongsTo(HoSoHocVien::class, 'ho_so_id'); }
}
