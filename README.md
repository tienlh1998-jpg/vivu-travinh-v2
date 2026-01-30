# ViVuTraVinh - Ứng dụng Khám Phá Địa Điểm Trà Vinh

Nền tảng chia sẻ địa điểm ăn uống, du lịch, cafe miễn phí cho cộng đồng Trà Vinh.
Khám phá những địa điểm đẹp, món ăn ngon và trải nghiệm độc đáo nhất vùng đất Chùa Vàng.

## 🚀 Tính năng nổi bật

### ✨ Mới cập nhật (v2.0)
- 📱 **PWA Support**: Cài đặt như ứng dụng native trên điện thoại
- 🔌 **Offline Mode**: Hoạt động ngay cả khi không có internet
- 📤 **Share Buttons**: Chia sẻ dễ dàng lên Facebook, Zalo, WhatsApp, Twitter
- ⚡ **Lazy Loading**: Tải ảnh thông minh, tăng tốc độ trang
- 🎨 **Toast Notifications**: Thông báo trực quan khi thực hiện hành động
- 🔍 **SEO Optimized**: Meta tags đầy đủ cho Facebook, Twitter

### 🎯 Tính năng cơ bản
- 🔍 Tìm kiếm và lọc địa điểm
- 🗺️ Bản đồ tương tác với Leaflet
- 🌙 Dark Mode
- ⭐ Đánh giá địa điểm
- 📝 Đóng góp địa điểm qua Google Form
- 📱 Responsive design hoàn hảo

## 🛠️ Cách sử dụng

### Cách 1: Mở trực tiếp (Static Web App)
1. Vào thư mục dự án
2. Click đúp vào file `index.html` để mở trên trình duyệt

### Cách 2: Cài đặt như App (PWA)
1. Mở website trên Chrome/Edge
2. Click nút **Download** ở góc phải header
3. Chọn "Cài đặt"
4. Mở từ màn hình chính điện thoại/máy tính

### Cách 3: Chạy với Live Server (Recommended)
```bash
# Nếu có Python
python -m http.server 8000

# Nếu có Node.js với http-server
npx http-server -p 8000

# Sau đó mở: http://localhost:8000
```

## ⚙️ Cấu hình Dữ liệu
- **Nguồn dữ liệu**: [Google Sheet](https://docs.google.com/spreadsheets/d/e/2PACX-1vShzpU4sQYUzYJV1TNGbH5O3Ucnczdd1tspWVd3uhsoNO29t6ozYDCNn2J79dMQoYg3B7HktdqUNjTk/pubhtml)
- **Form đóng góp**: [Google Form](https://forms.gle/8Jw9BvgJEXn7AiWr5)
- **Fallback**: Tự động dùng dữ liệu mẫu nếu Google Sheets không khả dụng

## 🛠️ Công nghệ sử dụng
- **HTML5 & JavaScript (Vanilla)**: Không cần framework nặng nề
- **Tailwind CSS (CDN)**: Thiết kế giao diện hiện đại, mobile-first
- **PWA**: Manifest + Service Worker cho offline support
- **PapaParse**: Xử lý file CSV từ Google Sheet
- **Swiper**: Hero image slider
- **AOS**: Scroll animations
- **Leaflet**: Interactive maps
- **FontAwesome**: Icons đẹp mắt
- **Google Fonts**: Nunito & Playfair Display

## 📁 Cấu trúc dự án
```
web_plugin_demo/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline
├── README.md               # This file
├── PRIORITY_2_IMPROVEMENTS.md  # Documentation
├── aobaom-8-1024x588.jpg  # Hero image
├── Thoi-gian-dep-de-di-du-lich-bien-ba-dong.webp
└── bun-nuoc-leo-tra-vinh-1-1739012793.jpeg
```

## 📝 Lưu ý quan trọng
- Dữ liệu trên Google Sheet cần có cột **"Trạng Thái"** là **"Duyệt"** thì mới hiển thị
- Hình ảnh từ Google Drive sẽ được tự động chuyển đổi để hiển thị trực tiếp
- Website tự động fallback về dữ liệu mẫu nếu không kết nối được Google Sheets
- PWA chỉ hoạt động khi chạy qua HTTP/HTTPS (không phải file://)

## 🧪 Testing

### Test PWA Installation:
1. Chạy website qua HTTP server (không phải file://)
2. Mở Chrome DevTools > Application > Manifest
3. Click nút install trong header
4. Kiểm tra offline: DevTools > Network > Offline

### Test Share Buttons:
1. Click vào 1 địa điểm
2. Cuộn xuống phần "Chia sẻ địa điểm"
3. Thử các nút share
4. Kiểm tra toast notifications

### Test Lazy Loading:
1. Mở DevTools > Network > Img
2. Cuộn trang xuống
3. Xem ảnh chỉ load khi cần

## 🎯 Roadmap

### Priority 3 (Coming Soon):
- [ ] Google Analytics integration
- [ ] Comment/Review system
- [ ] Advanced filters (price range, rating)
- [ ] User accounts & favorites sync
- [ ] Push notifications
- [ ] Admin dashboard

## 📊 Performance
- ⚡ Lighthouse Score: 90+ (Performance)
- 📱 Mobile-friendly: 100%
- 🔌 Offline capable: Yes
- 📤 Shareable: 5+ platforms

## 🤝 Đóng góp
Bạn có thể đóng góp địa điểm mới qua [Google Form](https://forms.gle/8Jw9BvgJEXn7AiWr5)

## 📄 License
Free to use for Trà Vinh community

## 📞 Contact
- Website: [ViVuTraVinh](https://tienlh1998-jpg.github.io/vivu-travinh-v2/)
- Issues: Tạo issue trên GitHub
- Email: Contact via GitHub

---

**Version:** 2.0.0  
**Last Updated:** 2026-01-29  
**Status:** ✅ Production Ready
