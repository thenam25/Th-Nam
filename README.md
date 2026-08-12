<div align="center">
  <h1>🚜 Nông Cơ Machinery</h1>
  <p><strong>Website Catalog Máy Nông Nghiệp — AI-Powered PPTX Import</strong></p>
</div>

## 📋 Tổng Quan

Nông Cơ Machinery là một ứng dụng web full-stack dành cho cửa hàng/công ty kinh doanh máy nông nghiệp tại Việt Nam. Ứng dụng cung cấp catalog sản phẩm trực tuyến với khả năng import dữ liệu hàng loạt từ file PowerPoint (PPTX) sử dụng AI (Gemini 2.5 Flash).

### Tính Năng Chính

- 📦 **Catalog sản phẩm**: Quản lý sản phẩm, danh mục, thương hiệu với giao diện tiếng Việt
- 🤖 **AI PPTX Import**: Tự động trích xuất tên, giá, model, màu sắc, danh mục từ file PowerPoint bằng AI
- 📊 **Admin Dashboard**: Thống kê tổng quan, quản lý dữ liệu, import/export
- 🖼️ **Quản lý ảnh**: Upload ảnh lên Supabase Storage (hoặc base64 fallback)
- 📝 **Báo giá**: Form yêu cầu báo giá cho khách hàng
- 🎠 **Banner & Tin tức**: Quản lý banner slideshow và tin tức
- 🔒 **Bảo mật**: API key auth, Helmet security headers, CORS, rate limiting, Zod input validation

## 🏗️ Kiến Trúc

```
nông-cơ-machinery/
├── server.ts                  # Express entry point (~110 dòng)
├── server/
│   ├── config.ts              # Quản lý biến môi trường tập trung
│   ├── db.ts                  # File-based JSON database với atomic writes
│   ├── supabase.ts            # Supabase Storage client
│   ├── middleware/
│   │   ├── auth.ts            # requireApiKey, admin session tokens
│   │   ├── security.ts        # Helmet CSP + CORS
│   │   ├── rateLimiter.ts     # In-memory rate limiter (60 req/phút/IP)
│   │   └── errorHandler.ts    # Global error handler với AppError classes
│   ├── routes/
│   │   ├── products.ts        # CRUD sản phẩm + batch category
│   │   ├── categories.ts      # CRUD danh mục
│   │   ├── brands.ts          # CRUD thương hiệu
│   │   ├── banners.ts         # CRUD banner + news
│   │   ├── quotes.ts          # Form yêu cầu báo giá
│   │   ├── admin.ts           # Login, health, stats, reset, backup
│   │   ├── settings.ts        # Cài đặt hệ thống
│   │   ├── upload.ts          # Upload ảnh (Supabase + base64 fallback)
│   │   └── import.ts          # Pipeline import PPTX (14 endpoints)
│   ├── validation/
│   │   ├── schemas.ts         # Zod schemas cho tất cả entity types
│   │   └── middleware.ts      # Validation middleware factory
│   ├── import/
│   │   └── pptxEngine.ts      # AI PPTX parsing engine (Gemini)
│   ├── db/
│   │   ├── cloudSync.ts       # Firestore cloud sync
│   │   ├── seedData.ts        # Dữ liệu mẫu
│   │   └── schema.ts          # Database type schema
│   └── __tests__/             # API integration tests
├── shared/
│   ├── nameUtils.ts           # Trích xuất tên/model/thương hiệu
│   ├── priceUtils.ts          # Chuẩn hóa và trích xuất giá
│   ├── pptParser.ts           # Parse XML PPTX & bipartite matching
│   └── __tests__/             # Unit tests cho shared utilities
├── src/                       # React frontend (Vite SPA)
├── data/                      # File JSON database (local dev)
└── vitest.config.ts           # Vitest configuration
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Express.js (Node.js) |
| **Frontend** | React 19 + Vite + Tailwind CSS |
| **AI** | Google Gemini 2.5 Flash |
| **Storage** | Supabase Storage (hoặc base64 fallback) |
| **Database** | File-based JSON + Firestore Cloud Sync (Vercel) |
| **Validation** | Zod v4 |
| **Testing** | Vitest |
| **Build** | Vite + esbuild |
| **Deploy** | Vercel |

## 🚀 Cài Đặt & Chạy

### Yêu Cầu

- **Node.js** 18+
- **npm** 9+

### Biến Môi Trường

Tạo file `.env` với các biến sau:

```env
# Bắt buộc cho production
API_KEY=            # Khóa bảo vệ admin write endpoints
ADMIN_PASSWORD=     # Mật khẩu đăng nhập trang quản trị

# AI Import (tùy chọn — nếu thiếu sẽ dùng fallback text extraction)
GEMINI_API_KEY=     # Google Gemini API key

# Supabase Storage (tùy chọn — nếu thiếu sẽ dùng base64)
SUPABASE_URL=       # Supabase project URL
SUPABASE_ANON_KEY=  # Supabase anon public key (JWT)

# Firestore Sync cho Vercel (tùy chọn — tránh mất dữ liệu khi cold start)
FIRESTORE_BASE_URL= # Firestore REST API base URL
FIRESTORE_API_KEY=  # Firestore API key

# App
NODE_ENV=production # Mặc định: development
PORT=3000           # Mặc định: 3000
APP_URL=http://localhost:3000
```

### Development

```bash
# Cài đặt dependencies
npm install

# Chạy dev server (Express + Vite HMR)
npm run dev

# Type checking
npm run lint

# Chạy tests
npm run test
npm run test:watch

# Build production
npm run build

# Chạy production
npm start
```

### Deploy lên Vercel

1. Kết nối repository với Vercel
2. Cấu hình build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. Thêm tất cả biến môi trường vào Vercel Environment Variables
4. Đặc biệt: cấu hình `FIRESTORE_BASE_URL` và `FIRESTORE_API_KEY` để dữ liệu không bị mất khi Vercel cold start

## 🧪 Testing

```bash
# Chạy toàn bộ test suite
npm run test

# Chạy test với watch mode
npm run test:watch
```

**Cấu trúc test:**

| File | Phạm vi |
|------|---------|
| `shared/__tests__/nameUtils.test.ts` | Trích xuất tên, model, thương hiệu, màu sắc, danh mục |
| `shared/__tests__/priceUtils.test.ts` | Chuẩn hóa giá VNĐ, trích xuất giá từ text |
| `shared/__tests__/pptParser.test.ts` | Parse XML PPTX, normalize path, bipartite matching |
| `server/__tests__/api.test.ts` | Middleware, validation, route handlers |

## 🔒 Bảo Mật

- **Helmet**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **CORS**: Whitelist origins có thể cấu hình
- **API Key Auth**: Tất cả admin write endpoints yêu cầu API key (qua header `x-api-key` hoặc `Authorization: Bearer`)
- **Admin Session**: Token session 30 phút qua `POST /api/admin/login`
- **Rate Limiting**: 60 requests/phút/IP
- **Zod Validation**: Tất cả input được validate và strip unknown fields
- **Error Handling**: Production mode ẩn stack traces, trả về JSON có cấu trúc

## 📄 License

Private — Bảo Lâm Nông Cơ Machinery
