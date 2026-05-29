# Reward Hunter – Internal Reward & Feedback Platform

> Kaizen · Loyalty · Gamification Hub cho nhân viên nội bộ.

Reward Hunter là ứng dụng nội bộ giúp xây dựng văn hoá **Kaizen (cải tiến liên tục)**:
nơi mọi người đề xuất ý tưởng cải tiến, ghi nhận đồng đội (Kudos), gửi feedback ẩn danh,
tích điểm/level/badge và đổi quà. Hệ thống hỗ trợ phân quyền nhiều cấp
(Member → Leader/Manager → Admin/HR → Superadmin → System Admin) và quản lý đa tổ chức (multi-org).

### Các luồng nghiệp vụ chính

- **Kudos (peer-to-peer recognition):** tặng lời ghi nhận gắn với giá trị cốt lõi, hiển thị trên "Wow Wall".
- **Kaizen Idea Management:** tạo ticket cải tiến, vote, follow, comment, duyệt và đổi trạng thái.
- **Anonymous Feedback:** gửi feedback ẩn danh theo template (Start/Stop/Continue, NPS, 4L…).
- **Gamification:** missions hằng ngày, level, badge, leaderboard, streak.
- **Rewards & Redemption:** tích điểm → đổi voucher/day-off/quà nội bộ với quy trình duyệt – fulfill.
- **Management & Console:** dashboard quản trị, báo cáo, xuất CSV, quản lý multi-org.
- **AI Polish (tuỳ chọn):** trau chuốt nội dung ý tưởng/kudos bằng Claude API.

---

## 1. Tech Stack

### Frontend (`/`)
| Hạng mục | Công nghệ |
|----------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 3, PostCSS, Autoprefixer |
| Routing | React Router DOM 7 (hash-based) |
| HTTP client | Axios (JWT interceptor, timeout 15s) |
| Charts | Recharts |
| Icons | Lucide React |
| Monitoring | Sentry (`@sentry/react`) |
| Test | Vitest, Testing Library, MSW (mock API) |
| Deploy | Vercel / GitHub Pages |

### Backend (`/backend`)
| Hạng mục | Công nghệ |
|----------|-----------|
| Framework | NestJS 11 (TypeScript) |
| ORM | Prisma 5 |
| Database | MongoDB (Atlas) |
| Auth | JWT (`@nestjs/jwt`, Passport-JWT), bcrypt |
| Bảo mật | Helmet, CORS allow-list, Rate limiting (`@nestjs/throttler`) |
| Email | Nodemailer (Brevo SMTP / Gmail SMTP) |
| Scheduler | `@nestjs/schedule` (cron jobs) |
| AI | Anthropic Claude API (tuỳ chọn) |
| Monitoring | Sentry (`@sentry/node`) |
| Test | Jest, Supertest (e2e) |
| Deploy | Render / Railway / Fly (Docker) |

---

## 2. Yêu cầu môi trường

| Thành phần | Phiên bản đề nghị |
|------------|-------------------|
| Node.js | **>= 20.x** (NestJS 11 yêu cầu Node 20+) |
| npm | >= 10.x |
| MongoDB | MongoDB Atlas hoặc MongoDB local có hỗ trợ replica set (Prisma yêu cầu) |

### Biến môi trường — Frontend (`.env`)
Tham khảo [`.env.example`](.env.example):

| Biến | Bắt buộc | Mô tả |
|------|:--------:|-------|
| `VITE_API_URL` | ✅ | URL backend, **phải có hậu tố `/api`**. Mặc định `http://localhost:3000/api`. |
| `VITE_USE_MOCK_DATA` | ❌ | `true` để bỏ qua API thật (debug). Mặc định `false`. |
| `VITE_APP_ENV` | ❌ | Nhãn môi trường (`development`/`production`). |
| `VITE_SENTRY_DSN` | ❌ | DSN Sentry cho error tracking frontend. |

### Biến môi trường — Backend (`backend/.env`)
Tham khảo [`backend/.env.example`](backend/.env.example):

| Biến | Bắt buộc | Mô tả |
|------|:--------:|-------|
| `NODE_ENV` | ❌ | `development` \| `production` \| `test`. |
| `PORT` | ❌ | Cổng API, mặc định `3000`. |
| `DATABASE_URL` | ✅ | Connection string MongoDB. |
| `JWT_SECRET` | ✅ (prod) | Chuỗi bí mật JWT, **>= 32 ký tự** (prod sẽ từ chối khởi động nếu yếu). Sinh bằng `openssl rand -base64 64`. |
| `JWT_EXPIRES_IN` | ❌ | Thời hạn token, mặc định `24h`. |
| `BREVO_SMTP_USER` / `BREVO_SMTP_KEY` | ❌ | SMTP Brevo (khuyến nghị cho email OTP/notification). |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | ❌ | Gmail SMTP fallback (App Password 16 ký tự). |
| `CORS_ORIGINS` | ❌ | Danh sách origin cho phép, phân tách bằng dấu phẩy. |
| `ANTHROPIC_API_KEY` | ❌ | Bật tính năng **AI Polish**. Không có key → tính năng tự tắt. |
| `SENTRY_DSN` | ❌ | DSN Sentry cho backend. |
| `LOG_LEVEL` | ❌ | Mức log, mặc định `info`. |

> ⚠️ Các file `.env` thật **không** được commit (đã có trong `.gitignore`). Chỉ commit `*.env.example`.

---

## 3. Hướng dẫn cài đặt & chạy local

### Bước 1 — Clone & cài dependencies
```bash
git clone https://github.com/MarcusDMartian/Rewards_Hunter.git
cd Rewards_Hunter

# Frontend
npm install

# Backend
cd backend
npm install      # postinstall sẽ tự chạy `prisma generate`
cd ..
```

### Bước 2 — Cấu hình biến môi trường
```bash
# Frontend
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
# → mở backend/.env và điền DATABASE_URL, JWT_SECRET (>=32 ký tự)
```

### Bước 3 — Chuẩn bị database
```bash
cd backend
npx prisma generate        # sinh Prisma Client
npm run db:seed            # (tuỳ chọn) seed dữ liệu mẫu
cd ..
```

### Bước 4 — Chạy backend (NestJS, cổng 3000)
```bash
cd backend
npm run start:dev          # watch mode
# API: http://localhost:3000/api  | Health: http://localhost:3000/health
```

### Bước 5 — Chạy frontend (Vite, cổng 5173)
```bash
# tại thư mục gốc
npm run dev
# Mở http://localhost:5173
```

### Các lệnh hữu ích
| Lệnh | Vị trí | Mô tả |
|------|--------|-------|
| `npm run dev` | `/` | Chạy frontend dev server |
| `npm run build` | `/` | Type-check + build production |
| `npm run lint` | `/` | ESLint |
| `npm run test` | `/` | Chạy unit test (Vitest) |
| `npm run test:coverage` | `/` | Test + coverage |
| `npm run start:dev` | `backend/` | Backend watch mode |
| `npm run build` | `backend/` | Build NestJS |
| `npm run test` | `backend/` | Unit test (Jest) |
| `npm run test:e2e` | `backend/` | E2E test (Supertest) |
| `npm run db:seed` | `backend/` | Seed dữ liệu mẫu |

---

## 4. Các edge case đã xử lý

### Input & validation
- **Input rỗng / chỉ khoảng trắng:** SearchModal bỏ qua query trống (`!q.trim()`); export CSV thoát sớm khi mảng rỗng (`data.length === 0`).
- **Sai định dạng dữ liệu vào API:** `ValidationPipe` toàn cục với `whitelist` + `forbidNonWhitelisted` + `transform` — loại bỏ và báo lỗi field không hợp lệ. DTO dùng `class-validator` (`@IsEmail`, `@IsNotEmpty`, `@MaxLength`, `@IsInt`…).
- **Email/mật khẩu sai định dạng:** validate ở DTO (email `@MaxLength(254)`, password `@MaxLength(72)` theo giới hạn bcrypt).
- **CSV injection / ký tự đặc biệt:** giá trị chứa `,`, `"`, newline được escape & bọc trong dấu nháy kép.

### Mạng & timeout
- **Timeout request:** Axios cấu hình `timeout: 15000ms`.
- **Network error (AI Polish):** `fetch` được bọc try/catch — lỗi mạng/API trả về `polished: null` kèm message và **fallback dùng text gốc**, không làm sập luồng tạo idea/kudos.
- **API lỗi (non-2xx) khi gọi Claude:** log lỗi, trả `polished: null` với message "API error, using original".
- **AI Polish chưa cấu hình:** không có `ANTHROPIC_API_KEY` → service trả `enabled: false` thay vì lỗi.

### Auth & session
- **Token hết hạn / 401:** response interceptor xoá token và redirect về `#/login`.
- **JWT secret yếu/thiếu ở production:** `assertProductionSecrets()` từ chối khởi động (exit 1); ở dev chỉ cảnh báo.
- **localStorage lỗi/không khả dụng:** toàn bộ `storageService` bọc try/catch, trả giá trị mặc định an toàn.

### Bảo mật & lạm dụng
- **Rate limiting:** Throttler — 60 req/phút (short) và 1000 req/giờ (long).
- **Body quá lớn:** giới hạn `200kb` cho JSON & urlencoded.
- **CORS:** chỉ cho phép origin trong allow-list (env `CORS_ORIGINS`).
- **Helmet:** bật security headers.

### Render & runtime
- **Lỗi render React:** `ErrorBoundary` bắt lỗi, hiển thị fallback thay vì màn hình trắng.
- **DB down:** endpoint `/health` trả `503 degraded` khi Prisma không khoẻ.
- **Graceful shutdown:** bật `enableShutdownHooks()`.

---

## 5. Kê khai thư viện open-source, AI/LLM & API bên thứ ba

### Thư viện open-source chính (kèm license)

**Frontend**
| Thư viện | License |
|----------|---------|
| react, react-dom | MIT |
| react-router-dom | MIT |
| axios | MIT |
| recharts | MIT |
| lucide-react | ISC |
| @sentry/react | MIT |
| vite, @vitejs/plugin-react | MIT |
| tailwindcss, postcss, autoprefixer | MIT |
| typescript | Apache-2.0 |
| eslint, typescript-eslint | MIT |
| vitest, @testing-library/*, msw | MIT |

**Backend**
| Thư viện | License |
|----------|---------|
| @nestjs/* (core, common, jwt, passport, schedule, throttler, config) | MIT |
| prisma, @prisma/client | Apache-2.0 |
| passport, passport-jwt | MIT |
| bcrypt | MIT |
| helmet | MIT |
| nodemailer | MIT-0 |
| class-validator, class-transformer | MIT |
| @sentry/node | MIT |
| rxjs | Apache-2.0 |
| jest, supertest, ts-jest | MIT |

> Danh sách đầy đủ phiên bản xem trong `package.json` và `backend/package.json`.

### AI / LLM
| Dịch vụ | Mô hình | Dùng cho | Trạng thái |
|---------|---------|----------|-----------|
| **Anthropic Claude API** | `claude-haiku-4-5` | AI Polish — trau chuốt nội dung Kaizen idea & Kudos | **Tắt mặc định**, bật khi đặt `ANTHROPIC_API_KEY` |

Endpoint nội bộ: `POST /api/ideas/polish` (body: `{ text, mode: 'idea' | 'kudos' }`). Gọi tới `https://api.anthropic.com/v1/messages`.

### API / dịch vụ bên thứ ba
| Dịch vụ | Mục đích |
|---------|----------|
| MongoDB Atlas | Cơ sở dữ liệu |
| Brevo SMTP | Gửi email OTP / thông báo (khuyến nghị) |
| Gmail SMTP | Gửi email fallback |
| Sentry | Error tracking & monitoring (frontend + backend) |
| Anthropic API | AI Polish (tuỳ chọn) |
| Vercel / GitHub Pages | Hosting frontend |
| Render / Railway / Fly | Hosting backend |

---

## 6. Kịch bản test thủ công cho các luồng chính

> Điều kiện tiên quyết: backend chạy ở `:3000`, frontend ở `:5173`, DB đã seed.

### 6.1. Đăng ký tổ chức & đăng nhập
1. Mở `http://localhost:5173` → vào trang đăng ký/đăng nhập.
2. Nhập email hợp lệ → nhận OTP (kiểm tra hộp thư hoặc log backend nếu SMTP chưa cấu hình).
3. Đăng ký tổ chức mới hoặc gửi join-request.
4. **Kỳ vọng:** đăng nhập thành công, JWT lưu vào localStorage, điều hướng vào dashboard.
5. **Edge:** nhập email sai định dạng → báo lỗi; OTP sai/hết hạn → "Invalid or expired OTP".

### 6.2. Gửi Kudos (ghi nhận đồng đội)
1. Vào mục Kudos → chọn người nhận, giá trị cốt lõi, nhập nội dung.
2. (Nếu bật AI) bấm "Polish" → nội dung được trau chuốt; nếu lỗi mạng vẫn giữ text gốc.
3. Gửi → **Kỳ vọng:** kudos xuất hiện trên Wow Wall, điểm người nhận tăng.
4. **Edge:** để trống nội dung → không gửi được / báo lỗi validate.

### 6.3. Tạo & duyệt Kaizen Idea
1. Vào Ideas → tạo idea (vấn đề / đề xuất / tác động).
2. Vote, follow, comment trên một idea.
3. Đăng nhập tài khoản Leader/Admin → đổi trạng thái idea (approve / implemented).
4. **Kỳ vọng:** trạng thái cập nhật, người tạo được cộng điểm theo point-rule.
5. **Edge:** gửi thừa field lạ → bị `ValidationPipe` từ chối (400).

### 6.4. Gửi Anonymous Feedback
1. Vào Feedback → chọn template (Start/Stop/Continue, NPS…), nhập nội dung, gửi.
2. **Kỳ vọng:** feedback được lưu ẩn danh; người gửi không bị lộ danh tính trong summary.

### 6.5. Gamification & Missions
1. Vào dashboard → xem missions hôm nay, level, badge, leaderboard, streak.
2. Hoàn thành hành vi (gửi kudos/idea) → claim mission.
3. **Kỳ vọng:** điểm/level/streak cập nhật, leaderboard re-rank.

### 6.6. Rewards & Redemption
1. Vào Rewards → chọn quà còn tồn kho → bấm Redeem.
2. **Kỳ vọng:** tạo redemption ở trạng thái chờ duyệt, ví điểm bị trừ.
3. Đăng nhập Admin → duyệt/từ chối redemption.
4. **Edge:** đổi quà khi điểm không đủ hoặc hết tồn kho → bị chặn & báo lỗi.

### 6.7. Quản trị & xuất báo cáo
1. Đăng nhập Admin/Superadmin → vào Management Dashboard.
2. Xem stats, burnout, join-requests; duyệt/từ chối join-request.
3. Bấm export CSV → **Kỳ vọng:** tải file `*_<ngày>.csv`, ký tự đặc biệt được escape đúng.

### 6.8. Edge case hệ thống
- Tắt backend rồi thao tác trên frontend → request timeout sau ~15s, hiển thị lỗi gracefully.
- Sửa token trong localStorage cho sai → request trả 401 → tự logout & redirect `#/login`.
- Truy cập `/health` khi DB ngắt → nhận `503 degraded`.

---

## 7. Tài liệu liên quan
- [`Feature_Document`](Feature_Document) — đặc tả tính năng chi tiết.
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — hướng dẫn triển khai.
- [`PRODUCTION_READINESS_REPORT.md`](PRODUCTION_READINESS_REPORT.md) — báo cáo sẵn sàng production.
- [`backend/README.md`](backend/README.md) — ghi chú backend (NestJS).
