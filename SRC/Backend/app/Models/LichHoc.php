<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LichHoc extends Model
{
    protected $table = 'lich_hoc';

    protected $fillable = [
        'lop_hoc_id', 'xe_id', 'ngay_hoc', 'gio_bat_dau', 'gio_ket_thuc',
        'loai_buoi', 'dia_diem', 'noi_dung', 'ghi_chu',
    ];

    protected $casts = ['ngay_hoc' => 'date'];

    public function lopHoc()   { return $this->belongsTo(LopHoc::class, 'lop_hoc_id'); }
    public function xe()       { return $this->belongsTo(Xe::class, 'xe_id'); }
    public function diemDanh() { return $this->hasMany(DiemDanh::class); }
}
