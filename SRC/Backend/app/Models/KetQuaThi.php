<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KetQuaThi extends Model
{
    protected $table = 'ket_qua_thi';

    protected $fillable = [
        'ho_so_id', 'lich_thi_id', 'bai_thi_id',
        'diem', 'ket_qua', 'lan_thi', 'phi_thi_lai', 'da_thu_phi', 'nhan_xet',
    ];

    protected $casts = [
        'diem'       => 'decimal:2',
        'da_thu_phi' => 'boolean',
    ];

    public function hoSo()   { return $this->belongsTo(HoSoHocVien::class, 'ho_so_id'); }
    public function lichThi(){ return $this->belongsTo(LichThi::class, 'lich_thi_id'); }
    public function baiThi() { return $this->belongsTo(BaiThi::class, 'bai_thi_id'); }
}
