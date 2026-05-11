<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Xe extends Model
{
    protected $table = 'xe';

    protected $fillable = [
        'bien_so', 'hang_xe', 'dong_xe', 'nam_san_xuat',
        'loai_xe', 'hang_bang', 'mau_xe', 'so_km_hien_tai',
        'ngay_dang_kiem', 'ngay_dang_kiem_tiep_theo',
        'ngay_bao_hiem', 'trang_thai', 'ghi_chu',
    ];

    protected $casts = [
        'ngay_dang_kiem'            => 'date',
        'ngay_dang_kiem_tiep_theo'  => 'date',
        'ngay_bao_hiem'             => 'date',
    ];

    public function lichHoc()  { return $this->hasMany(LichHoc::class, 'xe_id'); }
    public function baoLoi()   { return $this->hasMany(BaoLoiXe::class, 'xe_id'); }
}
