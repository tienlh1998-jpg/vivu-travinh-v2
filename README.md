# ViVuTraVinh

ViVuTraVinh là website/PWA khám phá địa điểm ăn uống, cà phê, du lịch và dịch vụ tại Trà Vinh. Dự án dùng HTML, CSS và JavaScript thuần, dữ liệu lấy từ Google Sheets API v4, có fallback JSON khi nguồn dữ liệu chính không khả dụng.

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
├── admin.html              # Trang quản trị bình luận
├── api/
│   └── admin-comments.js   # Vercel serverless API cho moderation
├── js/
│   ├── config.js           # Cấu hình Google Sheets và Supabase
│   ├── data.js             # Load/normalize/cache dữ liệu địa điểm
│   └── comments.js         # Load/gửi/tổng hợp bình luận Supabase
├── data/
│   └── data-fallback.json  # Dữ liệu fallback khi Google Sheets lỗi
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline cache
├── sitemap.xml             # Sitemap SEO
├── robots.txt              # Robots directives
├── vercel.json             # Cấu hình deploy Vercel/static fallback
├── GOOGLE_MAPS_GUIDE.md    # Hướng dẫn nhập Google Maps link đúng
├── GOOGLE_SHEETS_TEMPLATE.md
└── CLAUDE.md               # Hướng dẫn cho Claude Code
```

## Nguồn dữ liệu

Luồng dữ liệu chính nằm trong `js/data.js`:

1. Đọc cấu hình từ `js/config.js` và `window.VIVUTRAVINH_CONFIG` nếu có.
2. Gọi Google Sheets API v4.
3. Chuyển các dòng sheet thành object địa điểm.
4. Chỉ hiển thị địa điểm có trạng thái `Duyệt`, `Duyet` hoặc `approved`.
5. Chuẩn hoá tên cột tiếng Việt/tiếng Anh về shape mà UI sử dụng.
6. Cache vào `localStorage` trong 5 phút.
7. Nếu Google Sheets lỗi, dùng `data/data-fallback.json`.

Các trường quan trọng trong sheet:

- Tên địa điểm.
- Phân loại/loại hình.
- Khu vực/địa chỉ.
- Mức giá.
- Giờ mở cửa/giờ đóng cửa/trạng thái hoạt động.
- Link Google Maps hoặc tọa độ GPS.
- Link hình ảnh.
- Mô tả, ghi chú, liên hệ.
- Trạng thái duyệt.

Xem thêm `GOOGLE_SHEETS_TEMPLATE.md` và `GOOGLE_MAPS_GUIDE.md`.

## Bình luận và quản trị

Public comment flow:

- `index.html` import `js/comments.js`.
- `js/comments.js` gọi Supabase REST table `place_comments` bằng anon key.
- Bình luận được validate client-side, có cooldown theo từng địa điểm bằng `localStorage`.
- Chỉ bình luận `is_hidden = false` được hiển thị công khai.

Admin moderation flow:

- Mở `admin.html` qua local server hoặc deployment.
- Nhập `ADMIN_SECRET` đã cấu hình trong môi trường deploy.
- Trang admin gọi `/api/admin-comments`.
- API cần các biến môi trường:
  - `ADMIN_SECRET`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

API hỗ trợ:

- `GET /api/admin-comments` để liệt kê bình luận.
- `PATCH /api/admin-comments` để ẩn/hiện bình luận.
- `DELETE /api/admin-comments?id=...` để xoá bình luận.

## PWA và cache

`service-worker.js` precache app shell, module JS, fallback JSON và ảnh local. Khi thay đổi file cache quan trọng, nên tăng `CACHE_NAME` để trình duyệt nhận bản mới.

Kiểm tra PWA:

1. Chạy app qua HTTP server.
2. Mở Chrome DevTools > Application.
3. Kiểm tra Manifest và Service Worker.
4. Bật Network > Offline để kiểm tra offline mode.

## Kiểm thử thủ công

Sau thay đổi frontend, nên kiểm tra:

- Trang chủ load được dữ liệu từ Google Sheets hoặc fallback JSON.
- Search/filter hoạt động.
- Các section Featured, Latest, Food, Cafe, Travel, Service hiển thị đúng.
- Smart suggestions cuộn tới section đúng.
- Modal địa điểm mở/đóng đúng và hiển thị đủ thông tin.
- Bản đồ Leaflet hiển thị marker đúng.
- Share buttons và copy link hoạt động.
- Gửi bình luận, hiển thị rating trung bình và danh sách bình luận.
- Admin có thể ẩn/hiện/xoá bình luận.
- Dark mode và responsive mobile.
- Service worker/PWA không gây lỗi console.

## Deploy

Repo có `vercel.json` cho Vercel/static routing. Nếu deploy bằng GitHub Pages, đảm bảo các API serverless như `/api/admin-comments` sẽ không chạy trên GitHub Pages; phần admin moderation cần môi trường hỗ trợ serverless function như Vercel.

## Ghi chú bảo trì

- Không commit Google API key private hoặc Supabase service role key vào frontend.
- Google Sheets chỉ nên public dữ liệu được phép hiển thị.
- Supabase anon key trong frontend phải đi kèm RLS/policy phù hợp.
- Service role key chỉ dùng trong biến môi trường serverless.
- Khi đổi cấu trúc sheet, cập nhật `js/data.js`, `data/data-fallback.json` và `GOOGLE_SHEETS_TEMPLATE.md` cùng lúc.
