<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HocVien extends Model
{
    protected $table = 'hoc_vien';

    protected $fillable = [
        'user_id', 'so_cmnd', 'ngay_sinh', 'dia_chi', 'anh_dai_dien', 'trang_thai',
    ];

    protected $casts = ['ngay_sinh' => 'date'];

    public function user()      { return $this->belongsTo(User::class); }
    public function dangKy()    { return $this->hasMany(DangKy::class); }
    public function hocPhi()    { return $this->hasMany(HocPhi::class); }
    public function ketQuaThi() { return $this->hasMany(KetQuaThi::class); }
    public function chungChi()  { return $this->hasMany(ChungChi::class); }
    public function diemDanh()  { return $this->hasMany(DiemDanh::class); }
}
