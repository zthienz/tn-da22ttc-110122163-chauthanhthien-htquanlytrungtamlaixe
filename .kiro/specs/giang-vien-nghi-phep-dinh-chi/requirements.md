# Requirements Document

## Introduction

Tính năng này xử lý các ràng buộc nghiệp vụ khi giảng viên đang được phân công vào một lớp học bị admin chuyển trạng thái sang **"Nghỉ phép"** hoặc **"Đình chỉ"**. Hệ thống phải phản ánh ngay lập tức trạng thái không hợp lệ của giảng viên trên giao diện lớp học, ngăn chặn việc xếp lịch học khi lớp chưa có giảng viên hợp lệ, và thông báo cho admin để phân công lại giảng viên mới.

Hệ thống hiện tại (React + Node.js/Express + MySQL) bao gồm ba trang liên quan:
- **Trang Giảng Viên** (`GiangVienManagement`): Admin thay đổi trạng thái giảng viên qua dropdown (Sẵn sàng / Nghỉ phép / Đình chỉ).
- **Trang Lớp Học** (`LopHocManagement`): Hiển thị danh sách lớp với cột GV Lý thuyết và GV Thực hành.
- **Trang Lịch Học** (`LichHocManagement`): Admin tạo buổi học cho từng lớp.

## Glossary

- **Hệ_Thống**: Toàn bộ ứng dụng quản lý đào tạo lái xe.
- **Admin**: Người dùng có vai trò quản trị, có quyền thay đổi trạng thái giảng viên, phân công giảng viên và xếp lịch học.
- **Giảng_Viên**: Giảng viên dạy lý thuyết hoặc thực hành, có trạng thái công việc: `san_sang`, `nghi_phep`, hoặc `dinh_chi`.
- **Lớp_Học**: Lớp đào tạo lái xe, liên kết với GV Lý thuyết (`giang_vien_ly_thuyet_id`) và GV Thực hành (`giang_vien_thuc_hanh_id`).
- **Giảng_Viên_Không_Hợp_Lệ**: Giảng viên có trạng thái `nghi_phep` hoặc `dinh_chi`.
- **Giảng_Viên_Hợp_Lệ**: Giảng viên có trạng thái `san_sang` và tài khoản đang hoạt động (`is_active = true`).
- **Lớp_Thiếu_Giảng_Viên**: Lớp học có ít nhất một trong hai vị trí GV (lý thuyết hoặc thực hành) trống hoặc được đảm nhiệm bởi Giảng_Viên_Không_Hợp_Lệ.
- **Lịch_Học**: Buổi học được tạo cho một lớp cụ thể, bao gồm ngày, giờ, loại buổi (lý thuyết/thực hành).
- **Trang_Lớp_Học**: Giao diện `LopHocManagement` hiển thị danh sách và chi tiết lớp học.
- **Trang_Lịch_Học**: Giao diện `LichHocManagement` dùng để xếp lịch học.

## Requirements

### Requirement 1: Hiển thị trạng thái giảng viên không hợp lệ trên danh sách lớp học

**User Story:** Là admin, tôi muốn thấy ngay khi giảng viên của một lớp đang ở trạng thái nghỉ phép hoặc đình chỉ trên danh sách lớp học, để tôi biết những lớp nào cần được phân công lại giảng viên.

#### Acceptance Criteria

1. WHEN Admin truy cập Trang_Lớp_Học, THE Hệ_Thống SHALL hiển thị tên của mỗi Giảng_Viên_Không_Hợp_Lệ (trạng thái "Nghỉ phép" hoặc "Đình chỉ") kèm theo icon ⚠️ và nhãn trạng thái tương ứng ("Nghỉ phép" hoặc "Đình chỉ") ở cột GV Lý thuyết hoặc GV Thực hành, thay vì chỉ hiển thị tên thuần túy.

2. WHEN Admin truy cập Trang_Lớp_Học, THE Hệ_Thống SHALL hiển thị icon ⚠️ trên hàng của từng Lớp_Thiếu_Giảng_Viên — tức là lớp có ít nhất một vị trí GV được phân công cho Giảng_Viên_Không_Hợp_Lệ — để phân biệt trực quan với các hàng bình thường.

3. WHEN Admin mở modal "Chi Tiết Lớp Học" của một Lớp_Thiếu_Giảng_Viên, THE Hệ_Thống SHALL hiển thị thông báo cảnh báo trong phần giảng viên chứa tối thiểu: (a) tên vị trí bị ảnh hưởng (GV Lý thuyết, GV Thực hành, hoặc cả hai) và (b) trạng thái hiện tại của giảng viên đó (Nghỉ phép hoặc Đình chỉ).

4. IF có ít nhất một Lớp_Thiếu_Giảng_Viên tồn tại khi Admin truy cập Trang_Lớp_Học, THEN THE Hệ_Thống SHALL hiển thị số lượng lớp bị ảnh hưởng ở đầu trang dưới dạng thông báo nổi bật (ví dụ: "Có X lớp học chưa có giảng viên hợp lệ").

5. IF không có Lớp_Thiếu_Giảng_Viên nào tồn tại khi Admin truy cập Trang_Lớp_Học, THEN THE Hệ_Thống SHALL không hiển thị bất kỳ thông báo cảnh báo nào liên quan đến thiếu giảng viên ở đầu trang.

---

### Requirement 2: Ngăn chặn xếp lịch học khi lớp thiếu giảng viên hợp lệ

**User Story:** Là admin, tôi muốn hệ thống ngăn tôi xếp lịch học cho một lớp chưa có giảng viên hợp lệ, để tránh tạo ra các buổi học không có người dạy.

#### Acceptance Criteria

1. WHEN Admin mở form tạo lịch học và chọn một Lớp_Thiếu_Giảng_Viên, THE Hệ_Thống SHALL vô hiệu hóa nút xác nhận tạo lịch và hiển thị thông báo lỗi ngay trong form, nêu rõ lớp học này chưa có giảng viên hợp lệ.

2. WHEN Admin chọn một Lớp_Thiếu_Giảng_Viên từ dropdown "Lớp học" trong form tạo lịch, THE Hệ_Thống SHALL hiển thị thông báo cảnh báo ngay lập tức bên dưới dropdown với nội dung chỉ rõ vị trí GV nào (Lý thuyết, Thực hành, hoặc cả hai) đang thiếu giảng viên hợp lệ.

3. IF Admin gửi yêu cầu POST/PUT tạo hoặc cập nhật Lịch_Học cho Lớp_Thiếu_Giảng_Viên thông qua API, THEN THE Hệ_Thống SHALL từ chối yêu cầu với HTTP status 422 và body JSON chứa trường `error` mô tả rõ vị trí giảng viên bị thiếu (ví dụ: `{"error": "GV Lý thuyết của lớp này đang nghỉ phép"}`).

4. WHEN Admin cố gắng tạo Lịch_Học loại "Lý thuyết" cho một lớp có GV Lý thuyết là Giảng_Viên_Không_Hợp_Lệ (dù GV Thực hành vẫn hợp lệ), THE Hệ_Thống SHALL chặn việc tạo lịch đó và hiển thị thông báo lỗi chỉ rõ "GV Lý thuyết hiện không khả dụng" kèm trạng thái của giảng viên đó.

5. WHEN Admin cố gắng tạo Lịch_Học loại "Thực hành" cho một lớp có GV Thực hành là Giảng_Viên_Không_Hợp_Lệ (dù GV Lý thuyết vẫn hợp lệ), THE Hệ_Thống SHALL chặn việc tạo lịch đó và hiển thị thông báo lỗi chỉ rõ "GV Thực hành hiện không khả dụng" kèm trạng thái của giảng viên đó.

---

### Requirement 3: Thông báo yêu cầu phân công lại giảng viên

**User Story:** Là admin, tôi muốn nhận được thông báo rõ ràng khi một giảng viên bị chuyển sang trạng thái không hợp lệ và lớp học nào bị ảnh hưởng, để tôi có thể xử lý kịp thời.

#### Acceptance Criteria

1. WHEN Admin thay đổi trạng thái của một Giảng_Viên từ `san_sang` sang `nghi_phep` hoặc `dinh_chi` và giảng viên đó đang được phân công vào ít nhất một lớp học, THE Hệ_Thống SHALL hiển thị modal xác nhận liệt kê tên tất cả các lớp học bị ảnh hưởng và yêu cầu admin xác nhận trước khi lưu thay đổi trạng thái.

2. IF Admin thay đổi trạng thái của một Giảng_Viên sang `nghi_phep` hoặc `dinh_chi` và giảng viên đó không được phân công vào lớp học nào, THEN THE Hệ_Thống SHALL lưu thay đổi trạng thái mà không hiển thị modal cảnh báo về lớp học.

3. WHILE Admin đang ở Trang_Lớp_Học và có ít nhất một Lớp_Thiếu_Giảng_Viên tồn tại, THE Hệ_Thống SHALL hiển thị banner cảnh báo cố định ở đầu trang với nội dung tối thiểu: số lượng lớp bị ảnh hưởng và nút "Xem danh sách" để lọc nhanh các lớp đó.

4. IF Admin nhấn vào nút "Phân công GV" hoặc "Sửa" từ cảnh báo của một Lớp_Thiếu_Giảng_Viên, THEN THE Hệ_Thống SHALL mở modal sửa lớp học đó và tự động đặt focus vào trường chọn giảng viên đang thiếu (GV Lý thuyết hoặc GV Thực hành), được đo bằng việc trường đó có thuộc tính `autofocus` hoặc được scroll vào view.

---

### Requirement 4: Cho phép xếp lịch học bình thường sau khi phân công giảng viên hợp lệ

**User Story:** Là admin, tôi muốn có thể xếp lịch học bình thường cho một lớp ngay sau khi đã phân công giảng viên mới hợp lệ, để quá trình đào tạo không bị gián đoạn lâu.

#### Acceptance Criteria

1. WHEN Admin phân công một Giảng_Viên_Hợp_Lệ vào vị trí còn thiếu của một Lớp_Thiếu_Giảng_Viên và lưu thành công, THE Hệ_Thống SHALL cập nhật trạng thái hiển thị của lớp đó trong vòng 2 giây, xóa icon ⚠️ và tất cả thông báo cảnh báo liên quan đến vị trí vừa được điền.

2. IF một lớp học không còn vị trí GV nào ở trạng thái thiếu hoặc chưa phân công (tức là cả GV Lý thuyết và GV Thực hành đều là Giảng_Viên_Hợp_Lệ), THEN THE Hệ_Thống SHALL cho phép Admin tạo Lịch_Học cho lớp đó mà không vô hiệu hóa nút tạo lịch hay hiển thị thông báo cảnh báo từ tính năng này.

3. WHEN Admin tạo Lịch_Học cho một lớp đã có đủ Giảng_Viên_Hợp_Lệ, THE Hệ_Thống SHALL lưu lịch học thành công và hiển thị thông báo xác nhận tạo lịch thành công trong vòng 3 giây sau khi Admin nhấn xác nhận.

4. IF quá trình lưu Lịch_Học thất bại (lỗi server, mất kết nối), THEN THE Hệ_Thống SHALL hiển thị thông báo lỗi mô tả nguyên nhân và bảo toàn toàn bộ thông tin phân công giảng viên đã được lưu trước đó.

5. WHEN Admin thay đổi trạng thái Giảng_Viên từ `nghi_phep` hoặc `dinh_chi` trở lại `san_sang`, THE Hệ_Thống SHALL cập nhật trạng thái hiển thị của tất cả các lớp học mà giảng viên đó được phân công trong vòng 2 giây; IF sau khi cập nhật một lớp vẫn còn vị trí GV khác thiếu, THEN Hệ_Thống SHALL giữ nguyên cảnh báo thiếu giảng viên cho lớp đó.

---

### Requirement 5: Lọc giảng viên hợp lệ trong form phân công

**User Story:** Là admin, tôi muốn dropdown chọn giảng viên trong form lớp học chỉ hiển thị các giảng viên đang sẵn sàng, để tôi không vô tình phân công một giảng viên đang nghỉ phép hoặc đình chỉ.

#### Acceptance Criteria

1. WHEN Admin mở form tạo lớp học mới, THE Hệ_Thống SHALL chỉ hiển thị các Giảng_Viên_Hợp_Lệ (trạng thái `san_sang` và `is_active = true`) trong dropdown chọn GV Lý thuyết và GV Thực hành; Giảng_Viên_Không_Hợp_Lệ SHALL không xuất hiện trong danh sách tùy chọn.

2. WHEN Admin mở form sửa một lớp học hiện có và lớp đó là Lớp_Thiếu_Giảng_Viên, THE Hệ_Thống SHALL hiển thị tên giảng viên hiện tại kèm nhãn "(Không khả dụng - [trạng thái])" trong dropdown, và chỉ các Giảng_Viên_Hợp_Lệ mới có thể được chọn để thay thế.

3. WHEN Admin mở form sửa một lớp học hiện có và lớp đó không phải Lớp_Thiếu_Giảng_Viên, THE Hệ_Thống SHALL hiển thị dropdown chọn giảng viên chỉ chứa các Giảng_Viên_Hợp_Lệ, bao gồm giảng viên đang được phân công hiện tại (vì họ đang ở trạng thái `san_sang`).

4. IF Admin gửi yêu cầu tạo hoặc cập nhật lớp học với `giang_vien_ly_thuyet_id` hoặc `giang_vien_thuc_hanh_id` là ID của Giảng_Viên_Không_Hợp_Lệ thông qua API, THEN THE Hệ_Thống SHALL từ chối yêu cầu với HTTP status 422 và body JSON chứa trường `error` mô tả giảng viên không ở trạng thái `san_sang` (ví dụ: `{"error": "Giảng viên [tên] hiện đang ở trạng thái Nghỉ phép và không thể được phân công"}`).
