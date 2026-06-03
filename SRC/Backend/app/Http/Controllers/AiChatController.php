<?php

namespace App\Http\Controllers;

use App\Models\HoSoHocVien;
use App\Models\LopHoc;
use App\Models\LichHoc;
use App\Models\ThanhToanHocPhi;
use App\Models\BaoLoiXe;
use App\Models\Xe;
use App\Models\GiangVien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiChatController extends Controller
{
    private function getSystemContext(): string
    {
        // Lấy dữ liệu thực từ DB để cung cấp cho AI
        $tongHoSo    = HoSoHocVien::count();
        $dangHoc     = HoSoHocVien::where('trang_thai', 'dang_hoc')->count();
        $choMoLop    = HoSoHocVien::where('trang_thai', 'cho_mo_lop')->count();
        $tongLop     = LopHoc::count();
        $lopDangHoc  = LopHoc::where('trang_thai', 'dang_hoc')->count();
        $lichHomNay  = LichHoc::whereDate('ngay_hoc', today())->count();
        $tongXe      = Xe::count();
        $xeSanSang   = Xe::where('trang_thai', 'san_sang')->count();
        $xeHong      = Xe::where('trang_thai', 'hong')->count();
        $tongGV      = GiangVien::count();
        $baoLoiChuaXuLy = BaoLoiXe::where('trang_thai', 'cho_xu_ly')->count();

        $doanhThuThang = ThanhToanHocPhi::where('trang_thai', 'thanh_cong')
            ->whereMonth('ngay_thanh_toan', now()->month)
            ->whereYear('ngay_thanh_toan', now()->year)
            ->sum('so_tien');

        $doanhThuNam = ThanhToanHocPhi::where('trang_thai', 'thanh_cong')
            ->whereYear('ngay_thanh_toan', now()->year)
            ->sum('so_tien');

        // Học viên vắng nhiều nhất gần đây
        $vangGanDay = \App\Models\DiemDanh::with(['hoSo', 'lichHoc.lopHoc'])
            ->where('co_mat', false)
            ->whereNotNull('ghi_chu')
            ->latest()->limit(5)->get()
            ->map(fn($d) => ($d->hoSo?->ho_ten ?? '—') . ' (' . ($d->lichHoc?->lopHoc?->ten_lop ?? '—') . '): ' . $d->ghi_chu)
            ->join('; ');

        // Xe bị báo lỗi gần đây
        $baoLoiGanDay = BaoLoiXe::with(['xe', 'giangVien.user'])
            ->latest()->limit(3)->get()
            ->map(fn($b) => ($b->xe?->bien_so ?? '—') . ': ' . $b->tieu_de . ' [' . $b->muc_do . ']')
            ->join('; ');

        return "Ngày hiện tại: " . now()->format('d/m/Y') . "
Tháng hiện tại: " . now()->format('m/Y') . "

=== DỮ LIỆU HỆ THỐNG TRUNG TÂM LÁI XE SAO VIỆT ===

HỌC VIÊN:
- Tổng hồ sơ: {$tongHoSo}
- Đang học: {$dangHoc}
- Chờ mở lớp: {$choMoLop}

LỚP HỌC:
- Tổng lớp: {$tongLop}
- Lớp đang hoạt động: {$lopDangHoc}
- Lịch học hôm nay: {$lichHomNay} buổi

XE:
- Tổng xe: {$tongXe}
- Xe sẵn sàng: {$xeSanSang}
- Xe hỏng: {$xeHong}
- Báo lỗi chưa xử lý: {$baoLoiChuaXuLy}
- Báo lỗi gần đây: {$baoLoiGanDay}

GIẢNG VIÊN:
- Tổng giảng viên: {$tongGV}

DOANH THU:
- Tháng " . now()->format('m/Y') . ": " . number_format($doanhThuThang, 0, ',', '.') . "đ
- Năm " . now()->year . ": " . number_format($doanhThuNam, 0, ',', '.') . "đ

HỌC VIÊN VẮNG GẦN ĐÂY: {$vangGanDay}";
    }

    public function chat(Request $request)
    {
        $request->validate([
            'message'  => 'required|string|max:500',
            'history'  => 'nullable|array',
        ]);

        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey || $apiKey === 'your_gemini_api_key_here') {
            return response()->json(['success' => false, 'message' => 'Chưa cấu hình Gemini API Key'], 500);
        }

        $systemContext = $this->getSystemContext();

        $systemPrompt = "Bạn là trợ lý AI của Trung Tâm Lái Xe Sao Việt, hỗ trợ quản trị viên nắm bắt thông tin hệ thống.

{$systemContext}

=== QUY TẮC BẮT BUỘC ===
1. CHỈ trả lời các câu hỏi liên quan đến hệ thống quản lý trung tâm lái xe: học viên, lớp học, giảng viên, xe, lịch học, doanh thu, học phí, thi cử.
2. Nếu người dùng hỏi bất kỳ chủ đề nào NGOÀI hệ thống (thời tiết, tin tức, lập trình, nấu ăn, v.v.), hãy từ chối lịch sự và nhắc họ chỉ hỏi về hệ thống.
3. Trả lời bằng tiếng Việt, ngắn gọn, rõ ràng.
4. Dựa vào dữ liệu thực tế được cung cấp ở trên để trả lời chính xác.
5. Không bịa đặt số liệu ngoài dữ liệu đã cung cấp.";

        // Xây dựng lịch sử hội thoại
        $contents = [];

        // Thêm lịch sử chat trước (nếu có)
        if (!empty($request->history)) {
            foreach ($request->history as $msg) {
                $contents[] = [
                    'role'  => $msg['role'] === 'user' ? 'user' : 'model',
                    'parts' => [['text' => $msg['content']]],
                ];
            }
        }

        // Thêm tin nhắn hiện tại
        $contents[] = [
            'role'  => 'user',
            'parts' => [['text' => $request->message]],
        ];

        $response = Http::timeout(30)->post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}",
            [
                'system_instruction' => [
                    'parts' => [['text' => $systemPrompt]],
                ],
                'contents'           => $contents,
                'generationConfig'   => [
                    'temperature'     => 0.3,
                    'maxOutputTokens' => 1024,
                ],
            ]
        );

        if (!$response->successful()) {
            return response()->json(['success' => false, 'message' => 'Lỗi kết nối Gemini API'], 500);
        }

        $data  = $response->json();
        $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Không có phản hồi từ AI.';

        return response()->json(['success' => true, 'reply' => $reply]);
    }
}
