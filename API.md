# API Reference — Nông Cơ Machinery

Base URL: `http://localhost:3000` (dev) hoặc domain Vercel của bạn.

## Authentication

Có 2 phương thức xác thực:

1. **API Key**: Gửi qua header `x-api-key` hoặc `Authorization: Bearer <key>`
2. **Admin Session Token**: Lấy từ `POST /api/admin/login`, gửi qua header `x-admin-token`

Các endpoint yêu cầu auth được đánh dấu 🔒.

## Response Format

Tất cả responses đều là JSON:

```json
// Thành công
{ "success": true, "data": { ... } }

// Lỗi
{ "success": false, "message": "Mô tả lỗi", "errors": [...] }
```

---

## Products

### `GET /api/products`

Lấy danh sách sản phẩm (có filter).

**Query params (tùy chọn):**

| Param | Type | Mô tả |
|-------|------|-------|
| `search` | string | Tìm kiếm theo tên |
| `categoryId` | string | Lọc theo danh mục |
| `brandId` | string | Lọc theo thương hiệu |
| `featured` | boolean | Sản phẩm nổi bật |
| `isHot` | boolean | Sản phẩm hot |
| `isNew` | boolean | Sản phẩm mới |
| `limit` | number | Giới hạn số lượng |

```
GET /api/products?categoryId=cat-1&featured=true&limit=10
```

### `GET /api/products/:id`

Lấy chi tiết một sản phẩm.

### `POST /api/products` 🔒

Tạo sản phẩm mới.

```json
{
  "name": "Máy cày Yanmar EF393T",
  "price": 420000000,
  "categoryId": "cat-cay",
  "categoryName": "MÁY CÀY",
  "brandName": "Yanmar",
  "images": ["data:image/png;base64,..."],
  "specs": {
    "Công suất": "39HP",
    "Động cơ": "Diesel"
  },
  "description": "Máy cày nhập khẩu Nhật Bản",
  "featured": true
}
```

### `POST /api/products/batch` 🔒

Thêm nhiều sản phẩm cùng lúc.

```json
[
  { "name": "...", "price": 1000000, ... },
  { "name": "...", "price": 2000000, ... }
]
```

### `POST /api/products/batch-category` 🔒

Gán danh mục cho nhiều sản phẩm.

```json
{
  "productIds": ["id-1", "id-2"],
  "categoryId": "cat-cay",
  "categoryName": "MÁY CÀY"
}
```

### `PUT /api/products/:id` 🔒

Cập nhật sản phẩm.

### `DELETE /api/products/:id` 🔒

Xóa một sản phẩm.

### `DELETE /api/products/all` 🔒

Xóa tất cả sản phẩm.

---

## Categories

### `GET /api/categories`

Lấy danh sách danh mục.

### `POST /api/categories` 🔒

Tạo danh mục mới.

```json
{
  "name": "MÁY CÀY",
  "slug": "may-cay",
  "description": "Các loại máy cày",
  "image": "https://..."
}
```

### `PUT /api/categories/:id` 🔒

Cập nhật danh mục.

### `DELETE /api/categories/:id` 🔒

Xóa danh mục.

---

## Brands

### `GET /api/brands`

Lấy danh sách thương hiệu.

### `POST /api/brands` 🔒

Tạo thương hiệu mới.

```json
{
  "name": "Yanmar",
  "logo": "https://...",
  "description": "Thương hiệu máy nông nghiệp Nhật Bản"
}
```

---

## Banners

### `GET /api/banners`

Lấy danh sách banner slideshow.

### `POST /api/banners` 🔒

Thêm banner mới.

```json
{
  "title": "Khuyến mãi tháng 8",
  "image": "https://...",
  "link": "/products?featured=true",
  "order": 1
}
```

### `POST /api/banners/save-all` 🔒

Lưu toàn bộ danh sách banner (thay thế).

```json
{
  "banners": [
    { "title": "...", "image": "...", "order": 1 },
    { "title": "...", "image": "...", "order": 2 }
  ]
}
```

### `DELETE /api/banners/:id` 🔒

Xóa một banner.

---

## News

### `GET /api/news`

Lấy danh sách tin tức.

---

## Quotes (Báo Giá)

### `GET /api/quotes`

Lấy danh sách yêu cầu báo giá (không cần auth để đọc).

### `POST /api/quotes`

Gửi yêu cầu báo giá mới (public endpoint).

```json
{
  "customerName": "Nguyễn Văn A",
  "phone": "0912345678",
  "email": "a@gmail.com",
  "productId": "prod-xxx",
  "productName": "Máy cày Yanmar",
  "quantity": 2,
  "message": "Cần báo giá sỉ"
}
```

---

## Admin

### `POST /api/admin/login`

Đăng nhập admin.

```json
{
  "password": "your-admin-password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "adm_1712345678_abc12345"
}
```

### `GET /api/health`

Health check endpoint.

```json
{ "status": "ok", "timestamp": "2026-08-12T..." }
```

### `GET /api/stats`

Thống kê dashboard.

```json
{
  "success": true,
  "data": {
    "totalProducts": 150,
    "totalCategories": 8,
    "totalBrands": 12,
    "totalQuoteRequests": 5,
    "pendingQuotes": 2,
    "totalImportJobs": 3,
    "pendingReviewItems": 10
  }
}
```

### `POST /api/reset-data` 🔒

Khôi phục dữ liệu về trạng thái seed mặc định.

### `GET /api/backup/export`

Export toàn bộ database ra file JSON (download).

### `POST /api/backup/import` 🔒

Import database từ file backup.

```json
{
  "data": { "products": [...], "categories": [...], ... }
}
```

---

## Settings

### `GET /api/settings`

Lấy cài đặt hệ thống hiện tại.

### `POST /api/settings` 🔒

Cập nhật cài đặt.

```json
{
  "supabaseUrl": "https://xxx.supabase.co",
  "supabaseAnonKey": "eyJ...",
  "isSupabaseStorageEnabled": true,
  "adminPassword": "new-password",
  "wholesalePasscode": "1234"
}
```

---

## Upload & Storage

### `POST /api/upload/image`

Upload ảnh (multipart/form-data). Field name: `image`.

- Nếu Supabase được cấu hình → upload lên Supabase Storage
- Nếu không → trả về base64 data URI

**Response (Supabase thành công):**
```json
{
  "success": true,
  "url": "https://xxx.supabase.co/storage/v1/object/public/images/abc.png"
}
```

**Response (base64 fallback):**
```json
{
  "success": true,
  "url": "data:image/png;base64,iVBOR...",
  "warning": "Chưa cấu hình Supabase Storage, đã lưu dưới dạng Base64 tạm thời."
}
```

### `POST /api/supabase/test`

Kiểm tra kết nối Supabase Storage. Tự động lưu cài đặt nếu kết nối thành công.

```json
{
  "url": "https://xxx.supabase.co",
  "key": "eyJ..."
}
```

---

## PPTX Import

### `POST /api/import/pptx` 🔒

Upload file PPTX và chạy AI parsing pipeline.

- Content-Type: `multipart/form-data`
- Field name: `file`
- Max file size: 100MB

### `POST /api/import/pptx-chunk` 🔒

Upload file PPTX theo từng chunk (cho file lớn).

- Field: `chunk` (file chunk), `uploadId`, `chunkIndex`, `totalChunks`, `fileName`, `slideMode`, `fileSize`

### `POST /api/import/sample` 🔒

Tạo dữ liệu import mẫu để test (không cần file PPTX).

### `GET /api/import/jobs`

Lấy danh sách tất cả import jobs.

### `GET /api/import/jobs/:id`

Lấy chi tiết một import job.

### `POST /api/import/save-job` 🔒

Lưu/thay đổi trạng thái một import job.

### `POST /api/import/jobs/:id/append-items` 🔒

Thêm items vào job hiện có.

### `POST /api/import/items/batch-category` 🔒

Gán danh mục cho nhiều import items.

```json
{
  "jobId": "job-xxx",
  "itemIds": ["item-1", "item-2"],
  "categoryName": "MÁY CÀY"
}
```

### `POST /api/import/items/batch-approve` 🔒

Phê duyệt nhiều import items.

```json
{
  "jobId": "job-xxx",
  "itemIds": ["item-1", "item-2"]
}
```

### `POST /api/import/items/batch-delete` 🔒

Xóa nhiều import items.

```json
{
  "jobId": "job-xxx",
  "itemIds": ["item-1", "item-2"]
}
```

### `DELETE /api/import/jobs/:id/clear` 🔒

Xóa tất cả items trong một job.

### `POST /api/import/items/:id/review` 🔒

Cập nhật trạng thái review của một item.

```json
{
  "jobId": "job-xxx",
  "action": "approve",
  "updatedData": { "name": "...", "price": 1000000 }
}
```

### `DELETE /api/import/items/:jobId/:itemId` 🔒

Xóa một import item cụ thể.

### `POST /api/import/jobs/:id/commit` 🔒

Commit các items đã được phê duyệt vào catalog sản phẩm chính.

---

## Rate Limiting

Tất cả endpoint giới hạn **60 requests/phút/IP**. Khi vượt quá:

```json
{
  "success": false,
  "message": "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
  "retryAfter": 30
}
```

## Mã Lỗi HTTP

| Code | Ý nghĩa |
|------|---------|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Dữ liệu không hợp lệ (validation error) |
| 401 | Chưa xác thực / API key không hợp lệ |
| 404 | Không tìm thấy tài nguyên |
| 429 | Rate limit exceeded |
| 500 | Lỗi hệ thống |
