<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DangKy extends Model
{
    protected $table = 'dang_ky';

    protected $fillable = ['hoc_vien_id', 'lop_hoc_id', 'ngay_dang_ky', 'trang_thai', 'ghi_chu'];

    protected $casts = ['ngay_dang_ky' => 'date'];

    public function hocVien() { return $this->belongsTo(HocVien::class, 'hoc_vien_id'); }
    public function lopHoc()  { return $this->belongsTo(LopHoc::class, 'lop_hoc_id'); }
}
