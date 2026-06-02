# 📖 دليل استخدام Postman Collection

## كيفية استيراد واستخدام مجموعة الاختبارات

---

## 1️⃣ استيراد Collection

### الخطوة 1: فتح Postman
1. حمّل وشغّل [Postman](https://www.postman.com/downloads/)
2. أنشئ حساب أو سجّل دخول

### الخطوة 2: استيراد المجموعة
1. انقر على **Import** (يسار العلوي)
2. اختر **Upload Files**
3. حمّل الملف: `postman_collection.json`

أو **يدوياً**:
1. انسخ محتوى `postman_collection.json`
2. اذهب إلى Import → Raw text
3. الصق المحتوى واضغط Import

### الخطوة 3: تعيين بيئة الاختبار
1. انقر على **Environments** (أيسر الشاشة)
2. اختر **Create New Environment**
3. أضف المتغيرات:

```json
{
  "name": "Development",
  "variables": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/v1"
    },
    {
      "key": "authToken",
      "value": ""
    },
    {
      "key": "refreshToken",
      "value": ""
    },
    {
      "key": "startupId",
      "value": "1"
    },
    {
      "key": "newsId",
      "value": "1"
    },
    {
      "key": "eventId",
      "value": "1"
    },
    {
      "key": "jobId",
      "value": "1"
    },
    {
      "key": "trainingId",
      "value": "1"
    }
  ]
}
```

---

## 2️⃣ البدء بالاختبار

### 1. تشغيل السيرفر (في terminal منفصل)

```bash
cd path/to/projec.last1
npm run dev
```

الخادم سيعمل على `http://localhost:3000`

### 2. التسجيل (Sign Up)

1. افتح الـ Collection → **Auth** → **Sign Up**
2. غيّر البريد الإلكتروني كل مرة (أضف timestamp مثلاً)
3. اضغط **Send**
4. نسخ قيمة `token` من الاستجابة

### 3. تعيين التوكن التلقائي

**الطريقة الأولى (يدوي)**:
1. انسخ قيمة `token` من استجابة Sign Up
2. اذهب إلى Environment Variables
3. عيّن `authToken` = قيمة التوكن

**الطريقة الثانية (أوتوماتيكي - مستقبل)**:
يمكن إضافة test script تلقائي على طلب Login:

```javascript
const j = pm.response.json();
if (j && j.data && j.data.token) {
  pm.environment.set("authToken", j.data.token);
  if (j.data.refreshToken) pm.environment.set("refreshToken", j.data.refreshToken);
}
```

---

## 3️⃣ تنظيم الطلبات

المجموعة منقسمة إلى 8 أقسام رئيسية:

### 📋 الأقسام المتاحة

```
✅ Auth (المصادقة)
   ├── Sign Up
   ├── Login
   └── Refresh Token

✅ Startups (الشركات الناشئة)
   ├── List Startups
   ├── Featured Startups
   ├── Latest Startups
   ├── Startup Details (by slug)
   ├── Startup Details (by id)
   ├── Startup Contacts
   ├── Search Startups
   └── Categories

✅ News (الأخبار)
   ├── List News
   ├── News Details
   ├── Like News
   ├── Comment on News
   └── Share News

✅ Hub (الأحداث والوظائف والتدريبات)
   ├── Events List
   ├── Register For Event
   ├── Jobs List
   ├── Apply For Job
   ├── Trainings List
   └── Register For Training

✅ User Actions (تفاعلات المستخدم)
   ├── Follow Startup
   ├── Add to Favorites
   ├── Remove from Favorites
   ├── Invest In Startup
   ├── Get Available Equity
   └── Get Stock Price Growth

✅ Consultations & Profile (الاستشارات والملف الشخصي)
   ├── Available Slots
   ├── Book Consultation
   ├── Upcoming Bookings
   ├── Get Profile
   └── Update Profile

✅ Favorites / Following / Notifications
   ├── Get Favorites
   ├── Get Following
   ├── Get Notifications
   ├── Mark All Notifications Read
   └── Delete Notification

✅ Support & Funding (الدعم والتمويل)
   ├── Send Support Message
   └── Get Funding Rounds
```

---

## 4️⃣ ترتيب الاختبار الموصى به

### المسار الأول: الاختبار الكامل للمستخدم الجديد

```
1️⃣  Auth → Sign Up
2️⃣  Auth → Login
3️⃣  Consultations → Get Profile
4️⃣  Startups → List Startups
5️⃣  Startups → Featured Startups
6️⃣  Startups → Categories
7️⃣  News → List News
8️⃣  Hub → Events List
9️⃣  Hub → Jobs List
🔟  Hub → Trainings List
```

### المسار الثاني: اختبار العمليات المحمية

```
1️⃣  (بعد الحصول على authToken)
2️⃣  User Actions → Follow Startup (id=1)
3️⃣  User Actions → Add to Favorites (id=1)
4️⃣  User Actions → Get Favorites
5️⃣  Favorites → Get Following
6️⃣  Consultations → Get Notifications
```

---

## 5️⃣ مثال عملي خطوة بخطوة

### تسجيل مستخدم جديد واختبار المميزات

**1. Sign Up (إنشاء حساب)**
```
POST http://localhost:3000/api/v1/auth/signup

Body:
{
  "email": "myemail@test.com",
  "password": "MyPass123!",
  "passwordConfirm": "MyPass123!",
  "fullName": "My Full Name"
}

Response:
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "token": "eyJhbGciOi...",
    "refreshToken": "a1b2c3...",
    "user": {...}
  }
}
```

**2. انسخ التوكن**
- انسخ قيمة `data.token`
- الصقها في Environment Variable `authToken`

**3. Get Profile (الملف الشخصي)**
```
GET http://localhost:3000/api/v1/audience/profile
Header: Authorization: Bearer {{authToken}}

Response:
{
  "success": true,
  "data": {
    "id": 2,
    "email": "myemail@test.com",
    "fullName": "My Full Name",
    ...
  }
}
```

**4. اختبر عملية محمية أخرى**
```
GET http://localhost:3000/api/v1/audience/startups?page=1&limit=10

Header: Authorization: Bearer {{authToken}}
```

---

## 6️⃣ اختبار الأخطار والحالات الاستثنائية

### ❌ خطأ: عدم وجود التوكن

```
GET http://localhost:3000/api/v1/audience/profile

Response (401):
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "code": "UNAUTHORIZED"
  }
}
```

### ❌ خطأ: بيانات login خاطئة

```
POST http://localhost:3000/api/v1/auth/login

Body:
{
  "email": "nonexist@test.com",
  "password": "wrongpass"
}

Response (401):
{
  "success": false,
  "error": {
    "message": "Invalid email or password",
    "code": "INVALID_CREDENTIALS"
  }
}
```

---

## 7️⃣ متغيرات ديناميكية مهمة

### تعيين المتغيرات يدوياً

```javascript
// في تبويب "Tests" لأي طلب:
pm.environment.set("authToken", pm.response.json().data.token);
pm.environment.set("startupId", "5");  // من استجابة list
pm.environment.set("newsId", "10");    // من استجابة news list
```

---

## 8️⃣ الفلاتر والخيارات المتقدمة

### فلترة الشركات الناشئة

```
GET http://localhost:3000/api/v1/audience/startups?
  page=1&
  limit=10&
  search=tech&
  category=technology&
  stage=seed&
  location=dubai&
  minRating=4&
  minInvestment=10000&
  maxInvestment=100000
```

### Pagination

```
GET http://localhost:3000/api/v1/audience/startups?page=2&limit=5

Response:
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 5,
    "total": 25,
    "pages": 5
  }
}
```

---

## 9️⃣ تصدير النتائج

### Export Results
1. اضغط على Collection name
2. اختر **Export**
3. حفظ الملف (سيحتوي على جميع الاستجابات)

### Run Collection (تشغيل تلقائي)
1. انقر على أيقونة **Run** بجانب اسم الـ Collection
2. اختر **Environment**: Development
3. اضغط **Run**

---

## 🔟 استخدام Newman (CLI)

### تشغيل Postman من Terminal

```bash
# تثبيت Newman
npm install -g newman

# تشغيل المجموعة
newman run postman_collection.json -e environment.json

# التقرير بصيغة HTML
newman run postman_collection.json -e environment.json -r html
```

---

## 1️⃣1️⃣ استكشاف الأخطاء

### الخادم لا يستجيب
```bash
# تحقق من تشغيل السيرفر
curl http://localhost:3000

# إذا لم يعمل:
npm run dev
```

### خطأ: Token Invalid
- تأكد من نسخ التوكن بشكل صحيح
- تحقق من عدم انتهاء صلاحية التوكن (عادة 1 ساعة)
- استخدم **Refresh Token** للحصول على توكن جديد

### خطأ: Startup Not Found
- تأكد من وجود startups في البيانات
- استخدم startupId من استجابة list

---

## 1️⃣2️⃣ ملاحظات مهمة

✅ **جميع الطلبات مُعدّة وجاهزة**
- فقط غيّر baseUrl و authToken

✅ **متغيرات ديناميكية**
- استخدم `{{متغير}}` للوصول إلى القيم

✅ **Headers تلقائية**
- Authorization تُضاف تلقائياً للعمليات المحمية

✅ **Body جاهزة**
- عدّل القيم حسب احتياجاتك

---

## 🎯 الخلاصة

| الخطوة | الإجراء |
|-------|--------|
| 1 | استيراد `postman_collection.json` |
| 2 | تعيين `baseUrl` = `http://localhost:3000/api/v1` |
| 3 | تشغيل السيرفر: `npm run dev` |
| 4 | تشغيل Sign Up واحصل على token |
| 5 | تعيين `authToken` في البيئة |
| 6 | ابدأ الاختبار! 🚀 |

---

**✨ اختبر بكل سهولة!**
