# 📖 API Documentation

## 🔍 نقطة البداية المرجعية

**Base URL:** `http://localhost:3000/api/v1`

**Timeout:** 30 ثانية

---

## 🔐 Authentication (المصادقة)

### 1. Register (التسجيل)
```http
POST /auth/register
Content-Type: application/json
Accept-Language: ar

{
  "fullName": "محمد أحمد",
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "محمد أحمد",
      "role": "user"
    },
    "message": "تم التسجيل. تحقق من بريدك."
  }
}
```

**Errors:**
- `409` - البريد مسجل بالفعل
- `400` - بيانات غير صحيحة

---

### 2. Verify Email (تأكيد البريد)
```http
GET /auth/verify-email?token=xxx_TOKEN_xxx
Accept-Language: ar
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "تم تأكيد الإيميل ✅"
  }
}
```

---

### 3. Login (تسجيل الدخول)
```http
POST /auth/login
Content-Type: application/json
Accept-Language: ar

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "محمد أحمد",
      "role": "user"
    }
  }
}
```

**Cookies:**
- `refreshToken` - httpOnly, Secure, SameSite=Strict

---

### 4. Get Current User (بيانات المستخدم)
```http
GET /auth/me
Authorization: Bearer {accessToken}
Accept-Language: ar
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "محمد أحمد",
      "role": "user",
      "createdAt": "2026-03-09T10:30:00Z"
    }
  }
}
```

---

### 5. Refresh Token (تجديد التوكن)
```http
POST /auth/refresh
Accept-Language: ar
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

---

### 6. Logout (تسجيل الخروج)
```http
POST /auth/logout
Authorization: Bearer {accessToken}
Accept-Language: ar
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "تم الخروج بنجاح"
  }
}
```

---

## 🏢 Startups (الشركات الناشئة)

### 1. Create Startup (إنشاء شركة)
```http
POST /startups
Authorization: Bearer {accessToken}
Content-Type: application/json
Accept-Language: ar

{
  "name": "تطبيق الذكاء الاصطناعي",
  "description": "منصة تعليمية ذكية"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "startup": {
      "id": 1,
      "name": "تطبيق الذكاء الاصطناعي",
      "slug": "تطبيق-الذكاء-الاصطناعي",
      "description": "منصة تعليمية ذكية",
      "userId": 1,
      "approvalStatus": "pending",
      "createdAt": "2026-03-09T10:30:00Z"
    }
  }
}
```

---

### 2. Get My Startup (شركتي)
```http
GET /startups/my
Authorization: Bearer {accessToken}
Accept-Language: ar
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "startup": {
      "id": 1,
      "name": "تطبيق الذكاء الاصطناعي",
      "slug": "تطبيق-الذكاء-الاصطناعي",
      "website": {
        "id": 1,
        "sections": [...]
      }
    }
  }
}
```

---

### 3. Get All Startups (قائمة الشركات)
```http
GET /startups?page=1&limit=10&search=tech
Accept-Language: ar
```

**Query Parameters:**
- `page` (default: 1) - رقم الصفحة
- `limit` (default: 10) - عدد النتائج لكل صفحة
- `search` - البحث في الاسم والوصف

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "تطبيق الذكاء الاصطناعي",
      "slug": "تطبيق-الذكاء-الاصطناعي",
      "description": "منصة تعليمية ذكية",
      "createdAt": "2026-03-09T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 4. Approve Startup (موافقة الأدمن)
```http
PATCH /startups/:id/approve
Authorization: Bearer {adminToken}
Accept-Language: ar
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "startup": {
      "id": 1,
      "approvalStatus": "approved",
      "approvedAt": "2026-03-09T10:35:00Z"
    }
  }
}
```

---

## 🛠️ Status Codes

| Code | المعنى |
|------|--------|
| `200` | ✅ طلب ناجح |
| `201` | ✅ تم الإنشاء بنجاح |
| `400` | ❌ طلب غير صحيح (بيانات مفقودة) |
| `401` | 🔐 غير مصرح (need login) |
| `403` | 🚫 ممنوع (insufficient permissions) |
| `404` | 🔍 غير موجود |
| `409` | ⚠️ تضارب (duplicate data) |
| `500` | 💥 خطأ في السيرفر |

---

## 🌐 Headers المطلوبة

```
Accept-Language: ar          # للرسائل بالعربية (افتراضي: en)
Authorization: Bearer TOKEN  # للطلبات التي تحتاج تسجيل دخول
Content-Type: application/json
```

---

## 🧪 أمثلة باستخدام cURL

### Register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept-Language: ar" \
  -d '{
    "fullName": "محمد",
    "email": "test@example.com",
    "password": "Pass123!"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer {token}" \
  -H "Accept-Language: ar"
```

---

**آخر تحديث:** 9 مارس 2026
