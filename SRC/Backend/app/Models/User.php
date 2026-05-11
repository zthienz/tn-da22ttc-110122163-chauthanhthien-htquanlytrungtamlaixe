<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'ho_ten', 'email', 'password', 'role',
        'so_dien_thoai', 'is_active', 'otp', 'otp_expires_at',
    ];

    protected $hidden = ['password', 'remember_token', 'otp'];

    protected $casts = [
        'is_active'      => 'boolean',
        'otp_expires_at' => 'datetime',
    ];

    // JWT
    public function getJWTIdentifier() { return $this->getKey(); }
    public function getJWTCustomClaims() { return []; }

    // Relations
    public function hocVien()  { return $this->hasOne(HocVien::class); }
    public function giaoVien() { return $this->hasOne(GiaoVien::class); }
}
