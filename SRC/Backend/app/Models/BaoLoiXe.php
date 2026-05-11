<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BaoLoiXe extends Model
{
    protected $table = 'bao_loi_xe';

    protected $fillable = [
        'xe_id', 'giang_vien_id', 'lich_hoc_id',
        'tieu_de', 'mo_ta', 'muc_do', 'trang_thai',
        'ghi_chu_xu_ly', 'ngay_xu_ly',
    ];

    protected $casts = [
        'ngay_xu_ly' => 'datetime',
    ];

    public function xe()         { return $this->belongsTo(Xe::class, 'xe_id'); }
    public function giangVien()  { return $this->belongsTo(GiangVien::class, 'giang_vien_id'); }
    public function lichHoc()    { return $this->belongsTo(LichHoc::class, 'lich_hoc_id'); }
}
