<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HoSoHocVien extends Model
{
    protected $table = 'ho_so_hoc_vien';

    protected $fillable = [
        'user_id', 'khoa_hoc_id', 'ho_ten', 'ngay_sinh', 'so_cccd',
        'dia_chi', 'so_dien_thoai', 'email', 'anh_the',
        'nguon_dang_ky', 'trang_thai_hoc_phi', 'hoc_phi_da_dong',
        'ngay_dong_hoc_phi', 'trang_thai', 'ghi_chu',
    ];

    protected $casts = [
        'ngay_sinh'        => 'date',
        'ngay_dong_hoc_phi' => 'datetime',
        'hoc_phi_da_dong'  => 'decimal:2',
    ];

    public function user()        { return $this->belongsTo(User::class); }
    public function khoaHoc()     { return $this->belongsTo(KhoaHoc::class, 'khoa_hoc_id'); }
    public function thanhToan()   { return $this->hasMany(ThanhToanHocPhi::class, 'ho_so_id'); }
    public function hocVienLop()  { return $this->hasOne(HocVienLop::class, 'ho_so_id'); }
    public function ketQuaThi()   { return $this->hasMany(KetQuaThi::class, 'ho_so_id'); }
    public function bang()        { return $this->hasOne(Bang::class, 'ho_so_id'); }
}
