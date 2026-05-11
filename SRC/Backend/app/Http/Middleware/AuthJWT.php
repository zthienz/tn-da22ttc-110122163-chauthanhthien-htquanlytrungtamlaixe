<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

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
