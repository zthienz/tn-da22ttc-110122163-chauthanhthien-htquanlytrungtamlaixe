<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\HoSoHocVien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * ĐĂNG NHẬP HỌC VIÊN
     * Tài khoản: Số CCCD
     * Mật khẩu: Ngày sinh định dạng DDMMYYYY (VD: 16052004)
     */
    public function loginHocVien(Request $request)
    {
        $request->validate([
            'so_cccd'   => 'required|string',
            'ngay_sinh' => 'required|string', // DDMMYYYY
        ]);

        // Tìm user theo CCCD (lưu trong cột email với prefix 'cccd_')
        $user = User::where('email', 'cccd_' . $request->so_cccd)
                    ->where('role', 'hoc_vien')
                    ->first();

        if (!$user || !Hash::check($request->ngay_sinh, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Số CCCD hoặc ngày sinh không đúng',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản chưa được kích hoạt. Vui lòng liên hệ trung tâm.',
            ], 403);
        }

        $token = JWTAuth::fromUser($user);

        // Lấy hồ sơ học viên
        $hoSo = HoSoHocVien::with('khoaHoc', 'hocVienLop.lopHoc')
            ->where('user_id', $user->id)
            ->first();

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => $this->formatUser($user),
            'ho_so'   => $hoSo,
        ]);
    }

    /**
     * ĐĂNG NHẬP ADMIN / GIẢNG VIÊN
     * Tài khoản: Email
     * Mật khẩu: Mật khẩu thông thường
     */
    public function adminLogin(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)
                    ->whereIn('role', ['admin', 'giang_vien'])
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email hoặc mật khẩu không đúng',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản bị vô hiệu hóa',
            ], 403);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'token'   => $token,
            'admin'   => $this->formatUser($user),
        ]);
    }

    /**
     * ĐỔI MẬT KHẨU (học viên đổi sau lần đầu đăng nhập)
     */
    public function doiMatKhau(Request $request)
    {
        $request->validate([
            'mat_khau_cu'  => 'required',
            'mat_khau_moi' => 'required|min:6',
        ]);

        $user = $request->auth_user;

        if (!Hash::check($request->mat_khau_cu, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mật khẩu cũ không đúng',
            ], 400);
        }

        $user->update(['password' => Hash::make($request->mat_khau_moi)]);

        return response()->json([
            'success' => true,
            'message' => 'Đổi mật khẩu thành công!',
        ]);
    }

    /**
     * LẤY THÔNG TIN USER HIỆN TẠI
     */
    public function me(Request $request)
    {
        $user = $request->auth_user;
        $hoSo = HoSoHocVien::with(['khoaHoc', 'hocVienLop.lopHoc.giangVienLyThuyet.user', 'hocVienLop.lopHoc.giangVienThucHanh.user'])
            ->where('user_id', $user->id)
            ->first();

        return response()->json([
            'success' => true,
            'user'    => $this->formatUser($user),
            'ho_so'   => $hoSo,
        ]);
    }

    // ─── Helper ─────────────────────────────────────────────────────────────
    private function formatUser(User $user): array
    {
        $chuyenMon = null;
        if ($user->role === 'giang_vien') {
            $gv = \App\Models\GiangVien::where('user_id', $user->id)->first();
            $chuyenMon = $gv?->chuyen_mon;
        }

        return [
            'id'            => $user->id,
            'ho_ten'        => $user->ho_ten,
            'email'         => $user->email,
            'role'          => $user->role,
            'so_dien_thoai' => $user->so_dien_thoai,
            'is_active'     => $user->is_active,
            'chuyen_mon'    => $chuyenMon,
        ];
    }
}
