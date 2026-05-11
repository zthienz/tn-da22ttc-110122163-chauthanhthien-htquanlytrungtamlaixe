<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GiaoVien extends Model
{
    protected $table = 'giao_vien';

    protected $fillable = [
        'user_id', 'bang_cap', 'chuyen_mon', 'nam_kinh_nghiem', 'mo_ta',
    ];

    public function user()    { return $this->belongsTo(User::class); }
    public function lopHoc()  { return $this->hasMany(LopHoc::class); }
}
