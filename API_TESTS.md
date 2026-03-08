# 🧪 اختبار API بـ Thunder Client

## 📌 ملاحظات أساسية:
- **Base URL**: `http://localhost:3000/api/v1`
- **Language Header**: أضفن `Accept-Language: ar` إذا كنت تريد الرسائل بالعربية
- **Bearer Token**: بعد Login، استخدم التوكن في رسائلك

---

## 🔐 المرحلة 1: AUTH (العمليات 1-8)

### 1️⃣ REGISTER — التسجيل
```http
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json
Accept-Language: ar

{
  "fullName": "أحمد علي",
  "email": "ahmed@example.com",
  "password": "Password123"
}
```

**الاستجابة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "ahmed@example.com",
      "fullName": "أحمد علي",
      "role": "owner"
    },
    "message": "تم التسجيل. تحقق من بريدك."
  }
}
```

**ملاحظة:** رابط التحقق سيظهر في Terminal:
```
🔗 Verify: http://localhost:3000/api/v1/auth/verify-email?token=xxxxx
```

---

### 2️⃣ VERIFY EMAIL — تأكيد الإيميل
انسخ الرمز من Terminal وضعه هنا:

```http
GET http://localhost:3000/api/v1/auth/verify-email?token=xxxxxxxxxxxxxx
Accept-Language: ar
```

**الاستجابة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "message": "تم تأكيد الإيميل ✅"
  }
}
```

---

### 3️⃣ LOGIN — تسجيل الدخول
```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json
Accept-Language: ar

{
  "email": "ahmed@example.com",
  "password": "Password123"
}
```

**الاستجابة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "ahmed@example.com",
      "fullName": "أحمد علي",
      "role": "owner"
    }
  }
}
```

**⚠️ مهم:** احفظ الـ `accessToken` - ستحتاجه لكل الطلبات التالية!

---

### 4️⃣ GET ME — بيانات الملف الشخصي
```http
GET http://localhost:3000/api/v1/auth/me
Authorization: Bearer PASTE_YOUR_ACCESS_TOKEN_HERE
Accept-Language: ar
```

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "ahmed@example.com",
      "fullName": "أحمد علي",
      "role": "owner",
      "createdAt": "2026-03-08T10:00:00.000Z"
    }
  }
}
```

---

### 5️⃣ REFRESH — تجديد الجلسة
عندما ينتهي الـ Access Token (15 دقيقة):

```http
POST http://localhost:3000/api/v1/auth/refresh
Accept-Language: ar
```

(الـ Refresh Token يأتي تلقائياً من Cookie بعد Login)

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 6️⃣ LOGOUT — الخروج
```http
POST http://localhost:3000/api/v1/auth/logout
Authorization: Bearer YOUR_TOKEN
Accept-Language: ar
```

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "message": "تم الخروج بنجاح"
  }
}
```

---

## 🚀 المرحلة 2: STARTUP (العمليات 9-12)

### 7️⃣ CREATE STARTUP — إنشاء شركة ناشئة
```http
POST http://localhost:3000/api/v1/startups
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
Accept-Language: ar

{
  "name": "تطبيق الطلبات",
  "description": "تطبيق توصيل الطعام والمشروبات"
}
```

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "startup": {
      "id": 1,
      "userId": 1,
      "name": "تطبيق الطلبات",
      "slug": "tatabiq-al-talibat",
      "description": "تطبيق توصيل الطعام والمشروبات",
      "approvalStatus": "pending",
      "createdAt": "2026-03-08T10:05:00.000Z"
    }
  }
}
```

---

### 8️⃣ GET MY STARTUP — جلب بيانات شركتي
```http
GET http://localhost:3000/api/v1/startups/my
Authorization: Bearer YOUR_TOKEN
Accept-Language: ar
```

**الاستجابة تتضمن:**
- بيانات الـ Startup
- الموقع (Website)
- الأقسام (Sections)

---

### 9️⃣ GET ALL STARTUPS — قائمة الشركات للجمهور
```http
GET http://localhost:3000/api/v1/startups?page=1&limit=10&search=طعام
Accept-Language: ar
```

**الاستجابة:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "تطبيق الطلبات",
      "slug": "tatabiq-al-talibat",
      "description": "...",
      "createdAt": "2026-03-08T10:05:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 24,
    "pages": 3
  }
}
```

---

### 🔟 APPROVE STARTUP — موافقة الأدمن
```http
PATCH http://localhost:3000/api/v1/startups/1/approve
Authorization: Bearer ADMIN_TOKEN
Accept-Language: ar
```

**ملاحظة:** فقط مستخدم بدور `admin` يمكنه الموافقة

---

## ✅ الملخص

| العملية | الطريقة | النقطة |
|--------|--------|--------|
| 1. Register | POST | `/auth/register` |
| 2. Verify | GET | `/auth/verify-email?token=...` |
| 3. Login | POST | `/auth/login` |
| 4. Get Me | GET | `/auth/me` |
| 5. Refresh | POST | `/auth/refresh` |
| 6. Logout | POST | `/auth/logout` |
| 7. Create Startup | POST | `/startups` |
| 8. Get My Startup | GET | `/startups/my` |
| 9. Get All Startups | GET | `/startups` |
| 10. Approve Startup | PATCH | `/startups/:id/approve` |

---

## 🧑‍💻 نصائح مهمة:

1. **اختبر الترتيب**: سجّل أولاً → تحقق من الإيميل → ادخل → إنشاء startup
2. **احفظ التوكن**: لا تنسَ نسخ `accessToken` من Login
3. **استخدم Accept-Language**: لتحصل على الرسائل بالعربية
4. **معالجة الأخطاء**: كل خطأ رح يرجع `success: false`

---

## 🐛 استكشاف الأخطاء:

### خطأ: "يجب تسجيل الدخول أولاً"
**الحل:** تأكد من:
- إضافة `Authorization: Bearer TOKEN` في Headers
- التوكن صحيح وليس منتهي الصلاحية

### خطأ: "هذا الإيميل مسجل مسبقاً"
**الحل:** استخدم إيميل جديد

### خطأ: "الشركة الناشئة غير موجودة"
**الحل:** تأكد من استخدام Startup ID الصحيح

---

**آخر تحديث:** 2026-03-08
**حالة المشروع:** ✅ المرحلة 1 محدّثة وجاهزة للاختبار
