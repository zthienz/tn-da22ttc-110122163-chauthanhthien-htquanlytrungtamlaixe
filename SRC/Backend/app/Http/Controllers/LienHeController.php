<?php

namespace App\Http\Controllers;

use App\Models\LienHe;
use Illuminate\Http\Request;

class LienHeController extends Controller
{
    // POST /api/lien-he — học viên gửi form (public, không cần đăng nhập)
    public function store(Request $request)
    {
        $request->validate([
            'ho_ten'        => 'required|string|max:100',
            'so_dien_thoai' => ['nullable', 'string', 'regex:/^0\d{9}$/'],
            'email'         => ['nullable', 'string', 'max:100', 'regex:/^[^\s@]+@gmail\.com$/i'],
            'noi_dung'      => 'required|string|max:2000',
        ], [
            'so_dien_thoai.regex' => 'Số điện thoại phải gồm 10 số và bắt đầu bằng số 0.',
            'email.regex'         => 'Email phải có dạng @gmail.com.',
        ]);

        $lienHe = LienHe::create([
            'ho_ten'        => $request->ho_ten,
            'so_dien_thoai' => $request->so_dien_thoai,
            'email'         => $request->email,
            'noi_dung'      => $request->noi_dung,
            'trang_thai'    => 'chua_xu_ly',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Gửi tin nhắn thành công. Chúng tôi sẽ liên hệ lại sớm nhất!',
            'data'    => $lienHe,
        ], 201);
    }

    // GET /api/admin/lien-he — admin xem danh sách
    public function index(Request $request)
    {
        $query = LienHe::latest();

        if ($request->trang_thai) {
            $query->where('trang_thai', $request->trang_thai);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('ho_ten', 'like', '%' . $request->search . '%')
                  ->orWhere('so_dien_thoai', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $list = $query->get();

        return response()->json(['success' => true, 'data' => $list]);
    }

    // PATCH /api/admin/lien-he/{id}/xu-ly — đánh dấu đã xử lý
    public function xuLy(Request $request, $id)
    {
        $lienHe = LienHe::findOrFail($id);
        $lienHe->update([
            'trang_thai' => 'da_xu_ly',
            'ghi_chu'    => $request->ghi_chu ?? $lienHe->ghi_chu,
        ]);

        return response()->json(['success' => true, 'message' => 'Đã đánh dấu xử lý']);
    }

    // DELETE /api/admin/lien-he/{id} — xóa
    public function destroy($id)
    {
        LienHe::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa tin nhắn']);
    }
}
