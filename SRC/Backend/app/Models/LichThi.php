<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LichThi extends Model
{
    protected $table = 'lich_thi';

    protected $fillable = [
        'khoa_hoc_id', 'ngay_thi', 'gio_thi', 'loai_thi', 'dia_diem', 'don_vi_to_chuc', 'ghi_chu',
    ];

    protected $casts = ['ngay_thi' => 'date'];

    public function khoaHoc()      { return $this->belongsTo(KhoaHoc::class, 'khoa_hoc_id'); }
    public function ketQuaThi()    { return $this->hasMany(KetQuaThi::class); }
    public function hocVienDuThi() { return $this->hasMany(LichThiHocVien::class); }
}
