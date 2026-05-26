# Google Sheets Template

Tài liệu này mô tả cấu trúc dữ liệu khuyến nghị cho Google Sheets dùng bởi ViVuTraVinh.

Dữ liệu được đọc trong `js/data.js`. Code hiện tại hỗ trợ nhiều biến thể tên cột tiếng Việt và tiếng Anh, nhưng nên dùng một bộ tên cột thống nhất để dễ bảo trì.

## Cột khuyến nghị

| Cột | Tên cột khuyến nghị | Bắt buộc | Ghi chú |
|---|---|---:|---|
| A | `Tên địa điểm` | Có | Tên hiển thị của địa điểm. |
| B | `Phân loại` | Có | Một trong các nhóm danh mục đang dùng. |
| C | `Khu vực` | Không | Huyện/thị xã/khu vực hoặc mô tả ngắn. |
| D | `Địa chỉ` | Không | Địa chỉ chi tiết. |
| E | `Mức Giá` | Không | Ví dụ `20.000đ - 50.000đ`, `Miễn phí`, `Liên hệ`. |
| F | `Giờ Mở Cửa` | Không | Định dạng `HH:MM`, ví dụ `07:00`. |
| G | `Giờ Đóng Cửa` | Không | Định dạng `HH:MM`, ví dụ `22:00`. |
| H | `Trạng Thái Hoạt Động` | Không | `Normal`, `24/7`, `Tạm Đóng` hoặc `Closed`. |
| I | `Link Google Maps` | Không | Nên dùng link có tọa độ. Xem `GOOGLE_MAPS_GUIDE.md`. |
| J | `Tọa Độ GPS (Latitude và Longitude)` | Không | Ví dụ `9.9347,106.3449`. |
| K | `Link Hình Ảnh` | Không | Có thể nhập nhiều link, phân cách bằng xuống dòng hoặc dấu phẩy. |
| L | `Mô Tả` | Không | Mô tả địa điểm. |
| M | `Ghi Chú Thêm` | Không | Kinh nghiệm, tiện ích, lưu ý. |
| N | `Số Điện Thoại / Fanpage / Website` | Không | Số điện thoại hoặc URL liên hệ. |
| O | `Người Đóng Góp` | Không | Nếu trống sẽ hiển thị `Ẩn danh`. |
| P | `Chấm Điểm` | Không | Số từ 0 đến 5. |
| Q | `Slug` | Không | Nếu trống, code tự tạo từ tên địa điểm. |
| R | `Trạng Thái` | Có | Phải là `Duyệt`, `Duyet` hoặc `approved` để hiển thị. |

## Danh mục khuyến nghị

Các danh mục mới nên đi theo cấu trúc hiện tại của website:

### Thiên Đường Ẩm Thực

- `Món Ngon / Đặc Sản`
- `Ăn Vặt Vỉa Hè`
- `Nhậu & Lai Rai`

### Cà Phê & Chill

- `Cafe & Trà Sữa`

### Khám Phá & Du Lịch

- `Điểm Check-in / Sống Ảo`
- `Du Lịch Tâm Linh`
- `Mua Sắm & Quà Tặng`

### Tiện Ích & Giải Trí

- `Lưu Trú`
- `Giải Trí`
- `Dịch Vụ`

Code vẫn có fallback cho một số tên cũ như `Quán cafe`, `Quán ăn`, `Điểm du lịch`, `Khách sạn`, nhưng nên chuẩn hóa dần về danh mục mới để Smart Suggestions và section mapping ổn định hơn.

## Giờ hoạt động

Nên dùng định dạng 24 giờ:

```text
07:00
14:30
22:00
```

Không nên dùng:

```text
7:00
2:30 PM
14h30
```

Ví dụ qua đêm:

| Giờ Mở Cửa | Giờ Đóng Cửa | Ý nghĩa |
|---|---|---|
| `18:00` | `02:00` | Mở từ 18h hôm nay đến 2h sáng hôm sau. |

Trạng thái đặc biệt:

| Trạng Thái Hoạt Động | Ý nghĩa |
|---|---|
| `Normal` | Hoạt động theo giờ mở/đóng. |
| `24/7` | Luôn mở cửa. |
| `Tạm Đóng` | Không hiển thị là đang mở. |
| `Closed` | Không hiển thị là đang mở. |

## Trạng thái duyệt

Chỉ các dòng có `Trạng Thái` là một trong các giá trị sau mới được hiển thị:

```text
Duyệt
Duyet
approved
```

Các dòng trống, `Chờ duyệt`, `Từ chối`, `Ẩn` sẽ không hiển thị trên website.

## Hình ảnh

`js/data.js` hỗ trợ:

- URL ảnh trực tiếp.
- Link Google Drive file, code sẽ chuyển sang dạng `lh3.googleusercontent.com` khi có thể.
- Nhiều ảnh trong một ô, phân cách bằng xuống dòng hoặc dấu phẩy.

Không nên dùng link Google Drive folder vì không trỏ tới một ảnh cụ thể.

Nếu không có ảnh hợp lệ, website dùng ảnh placeholder.

## Google Maps và GPS

Ưu tiên nhập một trong hai cách:

```text
https://www.google.com/maps?q=9.9347,106.3449
```

hoặc:

```text
9.9347,106.3449
```

Tránh link rút gọn như:

```text
https://maps.app.goo.gl/...
https://share.google/...
```

Xem chi tiết trong `GOOGLE_MAPS_GUIDE.md`.

## Dữ liệu mẫu

```csv
Tên địa điểm,Phân loại,Khu vực,Địa chỉ,Mức Giá,Giờ Mở Cửa,Giờ Đóng Cửa,Trạng Thái Hoạt Động,Link Google Maps,Tọa Độ GPS (Latitude và Longitude),Link Hình Ảnh,Mô Tả,Ghi Chú Thêm,Số Điện Thoại / Fanpage / Website,Người Đóng Góp,Chấm Điểm,Slug,Trạng Thái
Ao Bà Om,Điểm Check-in / Sống Ảo,TP Trà Vinh,Phường 8,Miễn phí,07:00,18:00,Normal,https://www.google.com/maps?q=9.9347,106.3449,"9.9347,106.3449",https://example.com/image.jpg,Không gian xanh nổi tiếng tại Trà Vinh.,Nên đi buổi sáng hoặc chiều mát.,,Admin,4.8,ao-ba-om,Duyệt
Cafe Trung Tâm,Cafe & Trà Sữa,TP Trà Vinh,Đường trung tâm,"25.000đ - 60.000đ",06:00,22:00,Normal,https://www.google.com/maps?q=9.9350,106.3450,"9.9350,106.3450",https://example.com/cafe.jpg,Quán cà phê phù hợp để gặp bạn bè.,Có wifi và chỗ ngồi ngoài trời.,,Admin,4.5,cafe-trung-tam,Duyệt
Khách Sạn 24h,Lưu Trú,TP Trà Vinh,Đường chính,Liên hệ,00:00,23:59,24/7,https://www.google.com/maps?q=9.9360,106.3460,"9.9360,106.3460",https://example.com/hotel.jpg,Lưu trú tiện lợi gần trung tâm.,Nên gọi trước để kiểm tra phòng.,,Admin,4.3,khach-san-24h,Duyệt
```

## Khi thay đổi cấu trúc sheet

Nếu thêm, xoá hoặc đổi tên cột:

1. Cập nhật Google Form nếu form đang đổ dữ liệu vào sheet.
2. Cập nhật `js/data.js` nếu tên cột mới chưa được hỗ trợ trong `findValue()`.
3. Cập nhật `data/data-fallback.json` để fallback có cùng cấu trúc dữ liệu.
4. Kiểm tra local bằng `npm run dev`.
