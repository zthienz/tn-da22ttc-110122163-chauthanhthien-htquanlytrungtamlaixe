<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiemDanh extends Model
{
    protected $table = 'diem_danh';

    protected $fillable = ['lich_hoc_id', 'hoc_vien_id', 'co_mat', 'ghi_chu'];

    protected $casts = ['co_mat' => 'boolean'];

    public function lichHoc()  { return $this->belongsTo(LichHoc::class, 'lich_hoc_id'); }
    public function hocVien()  { return $this->belongsTo(HocVien::class, 'hoc_vien_id'); }
}
