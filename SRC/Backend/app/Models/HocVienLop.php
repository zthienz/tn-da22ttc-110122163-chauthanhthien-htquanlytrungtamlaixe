<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HocVienLop extends Model
{
    protected $table = 'hoc_vien_lop';

    protected $fillable = [
        'ho_so_id', 'lop_hoc_id', 'ngay_xep_lop',
        'so_buoi_ly_thuyet_da_hoc', 'so_buoi_thuc_hanh_da_hoc', 'so_km_da_chay',
        'du_buoi_ly_thuyet', 'du_km_thuc_hanh', 'du_dieu_kien_thi_tn',
    ];

    protected $casts = [
        'ngay_xep_lop'         => 'date',
        'so_km_da_chay'        => 'decimal:2',
        'du_buoi_ly_thuyet'    => 'boolean',
        'du_km_thuc_hanh'      => 'boolean',
        'du_dieu_kien_thi_tn'  => 'boolean',
    ];

    public function hoSo()   { return $this->belongsTo(HoSoHocVien::class, 'ho_so_id'); }
    public function lopHoc() { return $this->belongsTo(LopHoc::class, 'lop_hoc_id'); }

    // Tự động kiểm tra điều kiện thi sau khi cập nhật
    public function kiemTraDieuKien(): void
    {
        $khoa = $this->lopHoc->khoaHoc;
        $duLyThuyet = $this->so_buoi_ly_thuyet_da_hoc >= $khoa->so_buoi_ly_thuyet_toi_thieu;
        $duKm       = $this->so_km_da_chay >= $khoa->so_km_toi_thieu;
        $duDieuKien = $duLyThuyet && $duKm;

        $this->update([
            'du_buoi_ly_thuyet'   => $duLyThuyet,
            'du_km_thuc_hanh'     => $duKm,
            'du_dieu_kien_thi_tn' => $duDieuKien,
        ]);

        // Cập nhật trạng thái hồ sơ
        $hoSo = $this->hoSo;
        if (in_array($hoSo->trang_thai, ['dang_hoc', 'chua_du_dieu_kien_thi']) && $duDieuKien) {
            $hoSo->update(['trang_thai' => 'du_dieu_kien_thi_tn']);
        }
        // Chưa đủ điều kiện → giữ nguyên dang_hoc, không đổi
    }
}
