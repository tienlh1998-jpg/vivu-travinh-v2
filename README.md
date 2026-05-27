# ViVuTraVinh

ViVuTraVinh là website/PWA khám phá địa điểm ăn uống, cà phê, du lịch và dịch vụ tại Trà Vinh. Dự án dùng HTML, CSS và JavaScript thuần, dữ liệu địa điểm lấy từ Supabase `places`, có fallback JSON khi nguồn dữ liệu chính không khả dụng.

## Tính năng chính

- Tìm kiếm, lọc và chia địa điểm theo nhóm: ẩm thực, cà phê, du lịch, dịch vụ.
- Khu vực nổi bật và mới cập nhật.
- Gợi ý thông minh theo thời gian và giờ hoạt động của địa điểm.
- Modal chi tiết địa điểm với hình ảnh, giá, giờ mở cửa, địa chỉ, liên hệ, GPS, bản đồ và chia sẻ.
- Bản đồ tương tác bằng Leaflet.
- Bình luận và đánh giá địa điểm qua Supabase.
- Trang quản trị bình luận tại `admin.html`.
- PWA: manifest, service worker, cache offline, nút cài đặt app.
- SEO cơ bản: meta tags, structured data, sitemap và robots.txt.

## Chạy local

```bash
npm install
npm run dev
```

Sau đó mở:

```text
http://localhost:8000
```

Có thể chạy thay thế bằng:

```bash
python -m http.server 8000
# hoặc
npx http-server -p 8000
```

Nên chạy qua HTTP/HTTPS, không mở trực tiếp bằng `file://`, vì ES modules, service worker và PWA cần browser security context phù hợp.

## Scripts

```bash
npm run dev
```

Hiện chưa có script build, lint hoặc test tự động trong `package.json`.

## Cấu trúc dự án

```text
.
├── index.html              # Giao diện chính và phần lớn logic UI
├── admin.html              # Dashboard quản trị địa điểm và bình luận
├── api/
│   ├── admin-comments.js   # Vercel serverless API cho moderation bình luận
│   └── admin-places.js     # Vercel serverless API quản trị địa điểm
├── js/
│   ├── config.js           # Cấu hình Supabase và Google Sheets legacy
│   ├── data.js             # Load/normalize/cache dữ liệu địa điểm
│   └── comments.js         # Load/gửi/tổng hợp bình luận Supabase
├── data/
│   └── data-fallback.json  # Dữ liệu fallback khi Google Sheets lỗi
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline cache
├── sitemap.xml             # Sitemap SEO
├── robots.txt              # Robots directives
├── vercel.json             # Cấu hình deploy Vercel/static fallback
├── supabase/
│   └── places.sql          # SQL schema/RLS cho bảng places
├── GOOGLE_MAPS_GUIDE.md    # Hướng dẫn nhập Google Maps link đúng
├── GOOGLE_SHEETS_TEMPLATE.md
└── CLAUDE.md               # Hướng dẫn cho Claude Code
```

## Nguồn dữ liệu

Luồng dữ liệu chính nằm trong `js/data.js`:

1. Đọc cấu hình từ `js/config.js` và `window.VIVUTRAVINH_CONFIG` nếu có.
2. Gọi Supabase REST table `places` bằng anon key.
3. Chỉ lấy địa điểm có `status = approved` theo RLS/policy Supabase.
4. Chuẩn hoá field snake_case trong Supabase về shape camelCase mà UI sử dụng.
5. Cache vào `localStorage` trong 5 phút bằng key `vivutravinh-places-v2`.
6. Nếu Supabase lỗi hoặc chưa có dữ liệu approved, dùng `data/data-fallback.json`.

Schema Supabase cho bảng `places` nằm ở `supabase/places.sql`. Google Sheets hiện chỉ còn là nguồn legacy/tham khảo dữ liệu; xem thêm `GOOGLE_SHEETS_TEMPLATE.md` và `GOOGLE_MAPS_GUIDE.md` nếu cần nhập hoặc migrate dữ liệu thủ công.

## Bình luận và quản trị

Public comment flow:

- `index.html` import `js/comments.js`.
- `js/comments.js` gọi Supabase REST table `place_comments` bằng anon key.
- Bình luận được validate client-side, có cooldown theo từng địa điểm bằng `localStorage`.
- Chỉ bình luận `is_hidden = false` được hiển thị công khai.

Admin moderation flow:

- Mở `admin.html` qua local server hoặc deployment.
- Nhập `ADMIN_SECRET` đã cấu hình trong môi trường deploy.
- Dashboard có tab `Địa điểm` và `Bình luận`.
- API cần các biến môi trường:
  - `ADMIN_SECRET`
  - `IMPORT_SECRET`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

API hỗ trợ:

- `POST /api/import-place` để nhận địa điểm mới từ Google Apps Script và tạo Supabase draft.
- `GET /api/admin-places` để liệt kê địa điểm.
- `PATCH /api/admin-places` để sửa thông tin/trạng thái cơ bản của địa điểm.
- `GET /api/admin-comments` để liệt kê bình luận.
- `PATCH /api/admin-comments` để ẩn/hiện bình luận.
- `DELETE /api/admin-comments?id=...` để xoá bình luận.

## Quy trình đóng góp địa điểm

Luồng đóng góp khuyến nghị:

```text
Google Form → Google Sheets → Apps Script → /api/import-place → Supabase places draft → Admin duyệt → Trang chính
```

Thiết lập Apps Script:

1. Vào Google Sheet nhận form responses.
2. Mở Extensions → Apps Script.
3. Copy nội dung `google-apps-script/import-place.gs` vào script editor.
4. Đổi `IMPORT_SECRET` trong script cho khớp biến môi trường Vercel.
5. Chạy `testImportPlace()` để test thủ công.
6. Tạo trigger cho hàm `onFormSubmit`: event source `From spreadsheet`, event type `On form submit`.
7. Gửi thử Google Form, rồi vào admin tab `Địa điểm` lọc `Nháp` để duyệt.

## PWA và cache

`service-worker.js` precache app shell, module JS, fallback JSON và ảnh local. Khi thay đổi file cache quan trọng, nên tăng `CACHE_NAME` để trình duyệt nhận bản mới.

Kiểm tra PWA:

1. Chạy app qua HTTP server.
2. Mở Chrome DevTools > Application.
3. Kiểm tra Manifest và Service Worker.
4. Bật Network > Offline để kiểm tra offline mode.

## Kiểm thử thủ công

Sau thay đổi frontend, nên kiểm tra:

- Trang chủ load được dữ liệu từ Supabase `places` hoặc fallback JSON.
- Search/filter hoạt động.
- Các section Featured, Latest, Food, Cafe, Travel, Service hiển thị đúng.
- Smart suggestions cuộn tới section đúng.
- Modal địa điểm mở/đóng đúng và hiển thị đủ thông tin.
- Bản đồ Leaflet hiển thị marker đúng.
- Share buttons và copy link hoạt động.
- Gửi bình luận, hiển thị rating trung bình và danh sách bình luận.
- Admin có thể list/sửa trạng thái địa điểm và ẩn/hiện/xoá bình luận.
- Dark mode và responsive mobile.
- Service worker/PWA không gây lỗi console.

## Deploy

Repo có `vercel.json` cho Vercel/static routing và ưu tiên `/api/*` trước SPA fallback. Nếu deploy bằng GitHub Pages, các API serverless như `/api/admin-places` và `/api/admin-comments` sẽ không chạy; phần admin cần môi trường hỗ trợ serverless function như Vercel.

## Ghi chú bảo trì

- Không commit Supabase service role key vào frontend.
- Supabase anon key trong frontend phải đi kèm RLS/policy phù hợp.
- Service role key chỉ dùng trong biến môi trường serverless.
- `IMPORT_SECRET` dùng cho Apps Script, không dùng service role key trong Google Apps Script.
- Trước khi dùng production, chạy `supabase/places.sql` trong Supabase SQL Editor và migrate dữ liệu địa điểm sang bảng `places`.
- Khi đổi schema `places`, cập nhật `js/data.js`, `api/admin-places.js`, `data/data-fallback.json` và tài liệu liên quan cùng lúc.
