<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LichThiHocVien extends Model
{
    protected $table = 'lich_thi_hoc_vien';

    protected $fillable = ['lich_thi_id', 'ho_so_id'];

    public function lichThi() { return $this->belongsTo(LichThi::class, 'lich_thi_id'); }
    public function hoSo()    { return $this->belongsTo(HoSoHocVien::class, 'ho_so_id'); }
}
