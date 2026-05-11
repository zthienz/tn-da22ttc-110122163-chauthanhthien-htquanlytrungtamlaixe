<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LopHoc extends Model
{
    protected $table = 'lop_hoc';

    protected $fillable = [
        'khoa_hoc_id', 'ten_lop',
        'giang_vien_ly_thuyet_id', 'giang_vien_thuc_hanh_id',
        'ngay_khai_giang', 'ngay_ket_thuc',
        'si_so_toi_da', 'trang_thai', 'ghi_chu',
    ];

    protected $casts = ['ngay_khai_giang' => 'date', 'ngay_ket_thuc' => 'date'];

    public function khoaHoc()          { return $this->belongsTo(KhoaHoc::class, 'khoa_hoc_id'); }
    public function giangVienLyThuyet(){ return $this->belongsTo(GiangVien::class, 'giang_vien_ly_thuyet_id'); }
    public function giangVienThucHanh(){ return $this->belongsTo(GiangVien::class, 'giang_vien_thuc_hanh_id'); }
    public function hocVienLop()       { return $this->hasMany(HocVienLop::class); }
    public function lichHoc()          { return $this->hasMany(LichHoc::class); }
}
