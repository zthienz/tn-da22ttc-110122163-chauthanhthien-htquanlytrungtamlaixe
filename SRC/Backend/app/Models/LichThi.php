<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LichThi extends Model
{
    protected $table = 'lich_thi';

    protected $fillable = [
        'lop_hoc_id', 'ngay_thi', 'gio_thi', 'loai_thi', 'dia_diem', 'so_lan_thi', 'ghi_chu',
    ];

    protected $casts = ['ngay_thi' => 'date'];

    public function lopHoc()    { return $this->belongsTo(LopHoc::class, 'lop_hoc_id'); }
    public function ketQuaThi() { return $this->hasMany(KetQuaThi::class); }
}
