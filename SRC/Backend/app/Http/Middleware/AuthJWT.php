<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Models\HoSoHocVien;

class AuthJWT
{
    public function handle(Request $request, Closure $next, string $role = null)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (JWTException $e) {
            return response()->json(['success' => false, 'message' => 'Token không hợp lệ hoặc đã hết hạn'], 401);
        }

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy người dùng'], 401);
        }

        // Học viên: kiểm tra hồ sơ còn tồn tại không (admin có thể đã xóa)
        if ($user->role === 'hoc_vien') {
            $hoSoTonTai = HoSoHocVien::where('user_id', $user->id)->exists();
            if (!$hoSoTonTai) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hồ sơ học viên không còn tồn tại. Vui lòng liên hệ trung tâm.',
                    'code'    => 'HO_SO_DELETED',
                ], 403);
            }
        }

        // Kiểm tra role nếu có yêu cầu
        if ($role) {
            $allowedRoles = explode('|', $role); // hỗ trợ 'admin|giang_vien'
            if (!in_array($user->role, $allowedRoles)) {
                return response()->json(['success' => false, 'message' => 'Không có quyền truy cập'], 403);
            }
        }

        $request->merge(['auth_user' => $user]);
        return $next($request);
    }
}
