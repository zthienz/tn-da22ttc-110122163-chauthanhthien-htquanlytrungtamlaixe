<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KetQuaThi extends Model
{
    protected $table = 'ket_qua_thi';

    protected $fillable = ['hoc_vien_id', 'lich_thi_id', 'diem', 'ket_qua', 'nhan_xet'];

    protected $casts = ['diem' => 'decimal:2'];

    public function hocVien() { return $this->belongsTo(HocVien::class, 'hoc_vien_id'); }
    public function lichThi() { return $this->belongsTo(LichThi::class, 'lich_thi_id'); }
}
