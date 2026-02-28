# Báo Cáo Tính Năng Sử Dụng Mock Data / Hardcode

Dưới đây là danh sách kết quả kiểm tra source code đối với các tính năng hiện tại đang sử dụng mock data, `localStorage` để lưu trữ giả lập, hoặc giá trị hardcode không thông qua Backend API.

## 1. Frontend (Ứng dụng React)

🔍 **Reward Catalog (Danh mục Đổi thưởng)** - `src/pages/Rewards.tsx`
- **Tình trạng:** Quản lý và hiển thị danh sách phần thưởng thông qua việc import trực tiếp biến `MOCK_REWARDS` từ file `src/data/mockData.ts`. Chưa gọi API để lấy danh sách từ Backend.

🔍 **Anonymous Feedback (Góp ý Ẩn danh)** - `src/pages/Feedback.tsx`
- **Tình trạng:** Toàn bộ tính năng (Lưu feedback mới, xem lịch sử, tính toán thống kê NPS) đang phụ thuộc 100% vào `localStorage` (biến `FEEDBACK_KEY`). Không có API nào được sử dụng để giao tiếp với Backend.

🔍 **Admin Console Settings (Cài đặt Admin Console)** - `src/pages/Console.tsx`
- **Feature Toggles (Bật/Tắt tính năng):** Đọc và ghi trạng thái các tính năng ẩn/hiện trực tiếp vào `localStorage` (`STORAGE_KEYS.FEATURE_TOGGLES`).
- **Quản lý Rewards dự phòng:** Sử dụng `localStorage` (`STORAGE_KEYS.REWARDS`) như một database tạm để lưu và sửa đổi danh sách phần thưởng.

🔍 **Management Settings (Cài đặt Quản lý)** - `src/pages/management/ManagementSettingsTab.tsx`
- **Point Rules (Quy tắc cộng điểm):** Đọc và cập nhật các quy tắc điểm số trực tiếp vào `localStorage` (`STORAGE_KEYS.POINT_RULES`).

🔍 **Missions Management (Quản lý Nhiệm vụ)** - `src/pages/management/ManagementMissionsTab.tsx` & `src/pages/Console.tsx`
- **Tình trạng:** Có chứa các comment `TODO: API call to create/delete/process on backend`. Điều này cho thấy tính năng xử lý, tạo và xoá Mission chưa được tích hợp hoàn chỉnh với API Backend.

🔍 **Gamification Badges (Huy hiệu Thành tích)** - `src/pages/Badges.tsx`
- **Tình trạng:** Frontend đang import một danh sách huy hiệu tĩnh (hardcode) là `ALL_BADGES` từ file `src/constants.ts` để hiển thị trên trang Bộ sưu tập Huy hiệu cá nhân, thay vì fetch từ Backend (Dù trang Management đã có API xử lý badges).

🔍 **Thành phần tĩnh & Enums Dropdowns** - `src/constants.ts`
- **Tình trạng:** Dữ liệu cho các trường như Phòng ban (`TEAMS`), Giá trị cốt lõi (`CORE_VALUES`), Loại Impact (`IMPACT_TYPES`), và Mẫu Feedback (`FEEDBACK_TEMPLATES`) đang được hardcode cố định thay vì lấy từ database/backend.

---

## 2. Backend (Ứng dụng NestJS/Node)

- Qua quá trình rà soát thư mục `backend/src`, **không tìm thấy** các cấu trúc dữ liệu mock, TODOs liên quan đến việc giả lập dữ liệu hay chữ "dummy", "hardcode" trong các kết quả trả về của API. 
- Mọi dữ liệu giả lập hiện tại đang được xử lý hoặc cô lập hoàn toàn riêng ở tầng Frontend.

---
**Kết luận:** Để ứng dụng kết nối hoàn chỉnh (Production-ready), cần ưu tiên thay thế các luồng `localStorage` (nhất là tính năng Feedback, Feature Toggles) bằng API tương ứng và cung cấp API chuẩn cho danh sách Rewards và Badges.
