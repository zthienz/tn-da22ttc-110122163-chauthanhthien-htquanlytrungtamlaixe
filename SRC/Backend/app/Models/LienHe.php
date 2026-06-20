<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LienHe extends Model
{
    protected $table = 'lien_he';

    protected $fillable = [
        'ho_ten',
        'so_dien_thoai',
        'email',
        'noi_dung',
        'trang_thai',
        'ghi_chu',
    ];
}
