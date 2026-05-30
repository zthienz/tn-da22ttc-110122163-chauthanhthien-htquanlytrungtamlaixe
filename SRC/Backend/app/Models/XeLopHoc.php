<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class XeLopHoc extends Model
{
    protected $table = 'xe_lop_hoc';

    protected $fillable = ['lop_hoc_id', 'xe_id'];

    public function xe()    { return $this->belongsTo(Xe::class); }
    public function lopHoc(){ return $this->belongsTo(LopHoc::class); }
}
