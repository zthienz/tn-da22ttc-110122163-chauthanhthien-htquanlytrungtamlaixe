<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GiangVien extends Model
{
    protected $table = 'giang_vien';

    protected $fillable = [
        'user_id', 'chuyen_mon', 'bang_cap', 'nam_kinh_nghiem', 'ghi_chu',
    ];

    public function user()   { return $this->belongsTo(User::class); }
    public function lopHocLyThuyet() { return $this->hasMany(LopHoc::class, 'giang_vien_ly_thuyet_id'); }
    public function lopHocThucHanh() { return $this->hasMany(LopHoc::class, 'giang_vien_thuc_hanh_id'); }
}
