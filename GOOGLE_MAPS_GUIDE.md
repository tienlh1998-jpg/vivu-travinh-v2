# 🗺️ HƯỚNG DẪN GOOGLE MAPS LINKS

## ⚠️ VẤN ĐỀ

Các link shortened từ Google Maps (**share.google**, **goo.gl**) không chứa tọa độ trong URL nên không thể hiển thị chính xác trên bản đồ.

**Các link BỊ LỖI:**
- ❌ `https://share.google/EA28v85vlpAazf3HJ`
- ❌ `https://maps.app.goo.gl/hCS86nXM8mQjbxm9`

**Các link HOẠT ĐỘNG TỐT:**
- ✅ `https://www.google.com/maps/@9.9347,106.3449,15z`
- ✅ `https://www.google.com/maps/place/Name/@9.9347,106.3449`
- ✅ `https://www.google.com/maps?q=9.9347,106.3449`

---

## ✅ GIẢI PHÁP ĐÃ IMPLEMENT

### Hàm `extractCoordinates()` đã được cải thiện:

**Hỗ trợ 6 patterns:**
1. ✅ `@lat,lng` - Example: `/@9.9347,106.3449,15z`
2. ✅ `q=lat,lng` - Example: `?q=9.9347,106.3449`
3. ✅ `!3d!4d` - Example: `!3d9.9347!4d106.3449` (embed URLs)
4. ✅ `/place/.../@lat,lng` - Example: `/place/Name/@9.9347,106.3449`
5. ✅ `ll=lat,lng` - Example: `ll=9.9347,106.3449`
6. ✅ `center=lat,lng` - Example: `center=9.9347,106.3449`

**Fallback Strategy:**
- Shortened URLs → Hiển thị ở trung tâm Trà Vinh (9.9347, 106.3449)
- Console warning để debug

---

## 📋 HƯỚNG DẪN LẤY LINK ĐÚNG

### **Cách 1: Copy Link có Tọa Độ (RECOMMENDED)**

1. Mở **Google Maps** trên máy tính
2. Tìm địa điểm
3. **Click chuột phải** vào marker (chấm đỏ)
4. Chọn **"Copy coordinates"** (Sao chép tọa độ)
5. Paste vào Google Sheets theo format:
   ```
   https://www.google.com/maps?q=LAT,LNG
   ```
   Ví dụ: `https://www.google.com/maps?q=9.9347,106.3449`

### **Cách 2: Lấy từ URL Bar**

1. Mở Google Maps
2. Tìm địa điểm
3. Nhìn vào **URL bar** (thanh địa chỉ)
4. URL sẽ có dạng:
   ```
   https://www.google.com/maps/place/Name/@9.9347,106.3449,15z/...
   ```
5. Copy **TOÀN BỘ URL** này

### **Cách 3: Get Coordinates Manually**

1. Mở Google Maps
2. **Click chuột phải** vào địa điểm
3. Click tọa độ đầu tiên (gần đầu menu)
4. Tọa độ sẽ được copy: `9.9347, 106.3449`
5. Paste vào Google Sheets theo format:
   ```
   https://www.google.com/maps?q=9.9347,106.3449
   ```

---

## 🚫 TRÁNH CÁC LINK SAU

### **ĐỪNG dùng Share button:**
```
❌ https://share.google/xxxxx
❌ https://maps.app.goo.gl/xxxxx
❌ https://g.page/xxxxx
```

**Lý do:** Các link này là shortened URLs, không chứa tọa độ thực.

---

## 🔧 CÁCH CHUYỂN ĐỔI LINK CŨ

Nếu bạn đã có link shortened, làm theo:

1. **Mở link** shortened trong browser
2. Đợi redirect đến trang đầy đủ
3. **Copy URL mới** từ address bar
4. URL mới sẽ có tọa độ: `/@9.9347,106.3449`
5. Paste URL mới này vào Google Sheets

---

## 📊 FORMAT CHUẨN TRONG GOOGLE SHEETS

### **Cột "Link Google Maps" nên có:**

**Option 1 - Simple (BEST):**
```
https://www.google.com/maps?q=9.9347,106.3449
```

**Option 2 - Place URL:**
```
https://www.google.com/maps/place/Ten+Dia+Diem/@9.9347,106.3449,15z
```

**Option 3 - Direct Coordinates:**
```
https://www.google.com/maps/@9.9347,106.3449,15z
```

---

## 🧪 CÁCH TEST

### **Kiểm tra link có hợp lệ:**

1. Mở **Developer Console** (F12)
2. Click nút "Bản đồ"
3. Xem console logs:
   ```
   🗺️ Extracting coordinates from: [URL]
   ✅ Found @lat,lng: [9.9347, 106.3449]
   ```

4. Nếu thấy:
   ```
   ⚠️ Shortened URL detected, using Trà Vinh center as fallback
   ```
   → Link cần được thay thế!

---

## 🎯 TEMPLATE GOOGLE FORM

Khi cập nhật Google Form, thêm hướng dẫn:

**Câu hỏi: "Link Google Maps"**

**Placeholder:**
```
https://www.google.com/maps?q=LAT,LNG
```

**Help text:**
```
Hướng dẫn:
1. Mở Google Maps
2. Click chuột phải vào địa điểm
3. Chọn "Copy coordinates"
4. Paste vào đây theo format: 
   https://www.google.com/maps?q=COORDINATES_HERE
```

---

## 📝 VÍ DỤ CỤ THỂ

### **Ao Bà Om:**
```
✅ ĐÚNG:
https://www.google.com/maps/@9.9347,106.3449,15z
https://www.google.com/maps?q=9.9347,106.3449

❌ SAI:
https://maps.app.goo.gl/AoBaOmExample
https://share.google/xxxxx
```

### **Bún Nước Lèo:**
```
✅ ĐÚNG:
https://www.google.com/maps/place/Bun+Nuoc+Leo/@9.9350,106.3450,17z

❌ SAI:
https://goo.gl/maps/xxxxx
```

---

## 🔍 DEBUGGING

### **Nếu địa điểm hiển thị sai:**

1. Check console logs
2. Tìm message: `🗺️ Extracting coordinates from: ...`
3. Xem pattern nào được match:
   - ✅ = Found correctly
   - ⚠️ = Using fallback
   - ❌ = Failed completely

4. Fix bằng cách:
   - Lấy link mới theo hướng dẫn trên
   - Update vào Google Sheets
   - Refresh website

---

## ⚙️ TECHNICAL DETAILS

### **Supported Patterns:**

```javascript
@lat,lng          // /@9.9347,106.3449
q=lat,lng         // ?q=9.9347,106.3449
!3dlat!4dlng      // !3d9.9347!4d106.3449
/place/.../@      // /place/Name/@9.9347,106.3449
ll=lat,lng        // ll=9.9347,106.3449
center=lat,lng    // center=9.9347,106.3449
```

### **Fallback Coordinates:**
```javascript
Trà Vinh Center: [9.9347, 106.3449]
```

---

## 📞 HỖ TRỢ

**Nếu vẫn gặp vấn đề:**
1. Check console logs
2. Copy URL gây lỗi
3. Report qua GitHub Issues
4. Bao gồm: URL gốc + console logs

---

## ✅ CHECKLIST

Update Google Sheets:
- [ ] Kiểm tra tất cả links
- [ ] Thay thế shortened URLs
- [ ] Test trên website
- [ ] Verify trên bản đồ
- [ ] Update form instructions

---

**🎯 Follow hướng dẫn này để đảm bảo tất cả địa điểm hiển thị ĐÚNG vị trí trên bản đồ!**
