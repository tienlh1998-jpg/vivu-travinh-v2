# 📋 GOOGLE SHEETS TEMPLATE - PHASE 1

## 🎯 **CÁC CỘT CẦN THÊM**

Thêm 3 cột mới vào cuối bảng Google Sheets hiện tại:

---

## **Column K: Opening Time**

**Header:** `Opening Time`

**Data Validation:**
```
Criteria: Text contains
Pattern: ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$
Or use: Custom formula
Formula: =REGEXMATCH(K2, "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")

Show validation help text: ✅
Help text: "Format: HH:MM (ví dụ: 06:00, 09:30, 14:00)"

On invalid data: Reject input
```

**Example values:**
```
06:00
07:30
09:00
10:00
14:00
18:00
22:00
```

---

## **Column L: Closing Time**

**Header:** `Closing Time`

**Data Validation:**
```
Same as Opening Time:
Criteria: Text contains
Pattern: ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$

Help text: "Format: HH:MM. Nếu đóng cửa qua đêm, nhập giờ ngày hôm sau (ví dụ: 02:00)"

On invalid data: Reject input
```

**Example values:**
```
22:00
23:00
23:30
02:00 (overnight)
14:00
18:00
```

---

## **Column M: Operating Status**

**Header:** `Operating Status`

**Data Validation:**
```
Criteria: List from a range
Or: List of items

Items:
- Open
- 24/7
- Closed
- Seasonal

Show dropdown list in cell: ✅

On invalid data: Reject input
```

**Example values:**
```
Open
24/7
Closed
Seasonal
```

---

## 📊 **SAMPLE DATA ROWS**

Copy-paste examples để test:

```csv
Opening Time,Closing Time,Operating Status
06:00,22:00,Open
07:00,23:00,Open
09:00,22:00,Open
10:00,14:00,Open
10:00,23:00,Open
00:00,23:59,24/7
18:00,02:00,Open
00:00,00:00,Closed
08:00,20:00,Seasonal
```

---

## 🔧 **SETUP INSTRUCTIONS**

### Step 1: Thêm Headers
1. Scroll đến cột cuối cùng của bảng hiện tại
2. Thêm 3 headers mới:
   - Column K: `Opening Time`
   - Column L: `Closing Time`  
   - Column M: `Operating Status`

### Step 2: Format Headers
- Font: Bold
- Background: Light gray (#F3F3F3)
- Text align: Center
- Border: All borders

### Step 3: Setup Data Validation

**For Opening Time (Column K):**
1. Select entire column K (except header)
2. Data → Data validation
3. Criteria: Custom formula
4. Formula: `=REGEXMATCH(K2, "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")`
5. Help text: "Format: HH:MM (ví dụ: 06:00)"
6. Reject input on invalid

**For Closing Time (Column L):**
1. Select entire column L (except header)
2. Data → Data validation
3. Same formula as Opening Time
4. Help text: "Format: HH:MM (ví dụ: 22:00)"
5. Reject input on invalid

**For Operating Status (Column M):**
1. Select entire column M (except header)
2. Data → Data validation
3. Criteria: List of items
4. Items: `Open, 24/7, Closed, Seasonal`
5. Show dropdown: ✅
6. Reject input on invalid

### Step 4: Set Default Values (Optional)

Add formula to auto-fill default if empty:
```
=IF(ISBLANK(K2), "09:00", K2)  // Default opening: 09:00
=IF(ISBLANK(L2), "22:00", L2)  // Default closing: 22:00
=IF(ISBLANK(M2), "Open", M2)   // Default status: Open
```

---

## 📝 **CATEGORY-SPECIFIC DEFAULTS**

Recommended default hours by category:

```csv
Category,Default Opening,Default Closing,Default Status
Quán cafe,06:00,22:00,Open
Quán ăn,09:00,22:00,Open
Nhà hàng,10:00,23:00,Open
Khách sạn,00:00,23:59,24/7
Du lịch,07:00,18:00,Open
Mua sắm,08:00,20:00,Open
Giải trí,14:00,23:00,Open
ATM,00:00,23:59,24/7
```

---

## ✅ **VERIFICATION CHECKLIST**

After setup, verify:

- [ ] 3 new columns added: K, L, M
- [ ] Headers formatted (bold, gray background)
- [ ] Data validation set for all 3 columns
- [ ] Test data validation (try entering invalid format)
- [ ] Test dropdown for Operating Status
- [ ] Sample data (5-10 rows) entered for testing

---

## 🎯 **QUICK TEST**

Enter these test rows:

| Name | Category | Opening Time | Closing Time | Operating Status |
|------|----------|--------------|--------------|------------------|
| Test Cafe 1 | Quán cafe | 06:00 | 22:00 | Open |
| Test 24/7 Store | Khách sạn | 00:00 | 23:59 | 24/7 |
| Test Overnight | Quán ăn | 18:00 | 02:00 | Open |
| Test Closed | Quán cafe | 00:00 | 00:00 | Closed |

If validation works correctly:
- ✅ `06:00` accepted
- ✅ `22:00` accepted
- ❌ `6:00` rejected
- ❌ `25:00` rejected
- ❌ `2PM` rejected

---

## 🔄 **COLUMN MAPPING REFERENCE**

After adding new columns, update your code parsing:

```javascript
// OLD
const location = {
    id: row[0],
    name: row[1],
    category: row[2],
    // ... row[6-9]: existing fields
    mapLink: row[10],
    imageLink: row[11]
};

// NEW
const location = {
    id: row[0],
    name: row[1],
    category: row[2],
    area: row[3],
    description: row[4],
    price: row[5],
    phone: row[6],
    openingTime: row[7],      // ⬅️ NEW Column K
    closingTime: row[8],       // ⬅️ NEW Column L
    operatingStatus: row[9],   // ⬅️ NEW Column M
    mapLink: row[10],
    imageLink: row[11]
};
```

**⚠️ Important**: Cập nhật index nếu cột không khớp!

---

## 💾 **BACKUP BEFORE CHANGES**

Before making changes:

1. **File → Download → CSV (.csv)**
   - Save as: `vivu-travinh-backup-YYYY-MM-DD.csv`

2. **File → Make a copy**
   - Name: `[BACKUP] ViVuTraVinh Data YYYY-MM-DD`

This way you can rollback if needed!

---

**Template Version**: 1.0  
**Last Updated**: 2026-01-30
