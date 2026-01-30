# ✅ PHASE 1 QUICK CHECKLIST

## 📋 **BỔ SUNG GOOGLE SHEETS**

### Thêm 3 cột mới (vào cuối bảng):

```
Column K: Opening Time     (Format: HH:MM, ví dụ: 06:00)
Column L: Closing Time     (Format: HH:MM, ví dụ: 22:00)
Column M: Operating Status (Open / 24/7 / Closed)
```

### Ví dụ data:
```
| Opening Time | Closing Time | Operating Status |
|--------------|--------------|------------------|
| 06:00        | 22:00        | Open             |
| 09:00        | 23:00        | Open             |
| 00:00        | 23:59        | 24/7             |
| 18:00        | 02:00        | Open             | (overnight)
```

---

## 📝 **BỔ SUNG GOOGLE FORM**

### Thêm 3 câu hỏi mới (sau câu hỏi "Số điện thoại"):

**Câu 1: Giờ mở cửa**
- Type: Short Answer
- Title: `⏰ Giờ mở cửa`
- Placeholder: `Ví dụ: 06:00, 09:30`
- Validation: Text format `HH:MM`
- Required: ✅ Yes

**Câu 2: Giờ đóng cửa**
- Type: Short Answer
- Title: `⏰ Giờ đóng cửa`
- Placeholder: `Ví dụ: 22:00, 23:30`
- Validation: Text format `HH:MM`
- Required: ✅ Yes

**Câu 3: Trạng thái hoạt động**
- Type: Multiple choice
- Title: `🏪 Trạng thái hoạt động`
- Options:
  - ○ Mở cửa bình thường
  - ○ Mở cửa 24/7
  - ○ Tạm đóng cửa
- Required: ✅ Yes
- Default: "Mở cửa bình thường"

---

## 🔧 **LƯU Ý KHI ĐIỀN DATA**

### Format giờ chuẩn:
- ✅ `06:00` - Đúng
- ✅ `09:30` - Đúng
- ✅ `14:00` - Đúng (2 giờ chiều)
- ❌ `6:00` - Sai (thiếu số 0)
- ❌ `2:00 PM` - Sai (không dùng AM/PM)
- ❌ `14h00` - Sai (không có chữ)

### Quán mở cửa qua đêm:
```
Ví dụ: Quán ăn đêm mở từ 6PM đến 2AM
Opening Time: 18:00
Closing Time: 02:00  ← Giờ của ngày hôm sau
```

### Default values (nếu không biết chính xác):

| Loại địa điểm | Giờ mở | Giờ đóng |
|---------------|--------|----------|
| Quán cafe | 06:00 | 22:00 |
| Quán ăn | 09:00 | 22:00 |
| Nhà hàng | 10:00 | 23:00 |
| Khách sạn | (chọn 24/7) | |
| Du lịch | 07:00 | 18:00 |

---

## 🎯 **NHỮNG GÌ SẼ THAY ĐỔI**

### Trước (Hard-coded):
```
Buổi sáng → Gợi ý: Cafe, Điểm tâm
(Không quan tâm quán có mở hay không)
```

### Sau (Dynamic):
```
Buổi sáng → Gợi ý: CHỈ các quán ĐANG MỞ CỬA
+ Hiển thị: "12 quán cafe đang mở"
+ Filter tự động theo giờ
```

---

## 📊 **CÔNG VIỆC CẦN LÀM**

### Bước 1: Chuẩn bị (5-10 phút)
- [ ] Backup Google Sheets hiện tại (Export to CSV)
- [ ] Backup code hiện tại (git commit)

### Bước 2: Google Sheets (10-15 phút)
- [ ] Thêm 3 cột mới: Opening Time, Closing Time, Operating Status
- [ ] Thêm Data Validation cho format HH:MM
- [ ] Điền giờ cho 5-10 địa điểm đầu để test

### Bước 3: Google Form (10 phút)
- [ ] Thêm câu hỏi "Giờ mở cửa"
- [ ] Thêm câu hỏi "Giờ đóng cửa"
- [ ] Thêm câu hỏi "Trạng thái hoạt động"
- [ ] Test submit form mới 1 lần

### Bước 4: Code Update (sẽ làm sau khi Sheets sẵn sàng)
- [ ] Parse 3 cột mới từ Google Sheets
- [ ] Implement logic check giờ mở cửa
- [ ] Update Smart Suggestions logic
- [ ] Test local
- [ ] Deploy to GitHub Pages

### Bước 5: Hoàn thiện data (có thể làm dần)
- [ ] Điền giờ cho 50% địa điểm
- [ ] Điền giờ cho 100% địa điểm
- [ ] Review và sửa data sai (nếu có)

---

## 🧪 **TEST NHANH**

Sau khi setup xong, test scenario này:

1. ✅ Mở trang lúc 8:00 sáng → Thấy gợi ý Cafe
2. ✅ Click vào "Cafe" → Chỉ hiện quán mở từ 6-8AM
3. ✅ Mở trang lúc 23:00 → Thấy "Ăn đêm" nếu có quán mở
4. ✅ Quán 24/7 → Luôn xuất hiện bất kể giờ nào

---

## ⏱️ **THỜI GIAN ƯỚC TÍNH**

- **Setup Sheets + Form**: 30 phút
- **Điền data mẫu (10 địa điểm)**: 15 phút
- **Code implementation**: 2-3 giờ (do dev làm)
- **Testing**: 1 giờ
- **Điền data đầy đủ**: 2-4 giờ (có thể làm dần)

**Tổng**: ~3-4 giờ cho MVP có thể test được

---

## 🆘 **CẦN GIÚP ĐỠ?**

Nếu gặp vấn đề, check lại:

1. ❓ **Format giờ sai** → Đảm bảo dùng `HH:MM` (ví dụ: `06:00` không phải `6:00`)
2. ❓ **Data validation lỗi** → Tắt validation để test, bật lại sau
3. ❓ **Form không vào đúng cột** → Check responses mapping
4. ❓ **Code không parse được** → Đảm bảo column index đúng

---

## 🎉 **KẾT QUẢ MONG ĐỢI**

Sau khi hoàn thành Phase 1:
- ✅ Smart Suggestions chính xác 95%+
- ✅ User chỉ thấy quán ĐANG MỞ
- ✅ Tăng click-through rate
- ✅ Giảm bounce rate (user thấy quán đóng cửa)
- ✅ Dễ maintain (chỉ cần update Sheets)

---

**Ready? Let's go! 🚀**
