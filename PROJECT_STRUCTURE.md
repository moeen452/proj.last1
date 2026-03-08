# 📊 Project Structure Guide

## 🎯 الهرمية الجديدة للمشروع

```
src/
├── app.js                    # تطبيق Express الرئيسي
├── server.js                 # نقطة البداية (entry point)
├── modules/                  # جميع مودولات الأعمال
│   ├── auth/                 # مودول المصادقة
│   │   ├── auth.router.js    # التوجيهات (Routes)
│   │   ├── auth.controller.js# معالج الطلبات
│   │   ├── auth.service.js   # منطق الأعمال
│   │   └── auth.model.js     # (اختياري) نموذج البيانات
│   │
│   ├── startup/              # مودول الشركات الناشئة
│   │   ├── startup.router.js
│   │   ├── startup.controller.js
│   │   ├── startup.service.js
│   │   └── startup.model.js
│   │
│   ├── brands/               # مودول العلامات التجارية
│   │   └── ... (مساحة للتطوير)
│   │
│   └── index.js              # تصدير جميع المودولات
│
├── common/                   # مكتبات مشتركة
│   ├── asyncHandler.js       # معالج الأخطاء غير المتزامنة
│   ├── auth.middleware.js    # middleware للمصادقة والصلاحيات
│   ├── i18n.js               # رسائل التعريب (AR/EN)
│   ├── errors/               # فئات الأخطاء المخصصة
│   ├── responses/            # نماذج الاستجابات
│   └── validators/           # دوال التحقق من البيانات
│
├── config/                   # ملفات الإعدادات
│   ├── database.config.js    # إعدادات قاعدة البيانات
│   └── env.config.js         # المتغيرات البيئية
│
├── events/                   # معالجات الأحداث
│   └── (مساحة للتطوير)
│
├── jobs/                     # المهام المجدولة
│   └── (مساحة للتطوير)
│
├── queues/                   # طوابير الرسائل (Bull)
│   └── (مساحة للتطوير)
│
├── services/                 # خدمات عامة
│   └── (مساحة للتطوير)
│
├── socket/                   # اتصالات WebSocket
│   └── (مساحة للتطوير)
│
└── types/                    # أنواع البيانات (JsDoc/TypeScript)
    └── (مساحة للتطوير)

prisma/
├── schema.prisma             # نموذج قاعدة البيانات
└── migrations/               # سجل التعديلات

tests/
├── auth.test.http            # اختبارات مودول Auth
├── startup.test.http         # اختبارات مودول Startup
└── (مساحة لاختبارات إضافية)

.env                          # المتغيرات البيئية
package.json                  # المكتبات والـ scripts
```

---

## 🏗️ معايير البنية

### 📂 Modules Pattern
كل مودول ينقسم إلى 3 طبقات:

```javascript
// 1️⃣ Router - يستقبل الطلبات
router.post('/auth/register', controller.register);

// 2️⃣ Controller - يعالج الطلبات
const register = async (req, res, next) => {
  const user = await service.register(req.body);
  res.json({ success: true, data: user });
};

// 3️⃣ Service - ينفذ منطق الأعمال
const register = async (userData) => {
  return await prisma.user.create({ data: userData });
};
```

### 🔄 Flow
```
Request
  ↓
app.js (Router)
  ↓
controller (معالج)
  ↓
service (منطق)
  ↓
database (Prisma)
  ↓
Response
```

---

## 🚀 البدء السريع

### تشغيل المشروع
```bash
# التطوير (مع hot reload)
npm run dev

# الإنتاج
npm run start
```

### اختبار الـ API
1. في VS Code: استخدم `tests/auth.test.http`
2. استبدل الـ tokens بالقيم الحقيقية
3. اضغط على "Send Request"

---

## 📝 إضافة مودول جديد

### 1️⃣ إنشاء المجلد
```bash
mkdir src/modules/products
```

### 2️⃣ إنشاء الملفات الأساسية
```javascript
// products.router.js
const express = require('express');
const router = express.Router();
const controller = require('./products.controller');
const asyncHandler = require('../../common/asyncHandler');

router.post('/', asyncHandler(controller.create));
router.get('/', asyncHandler(controller.getAll));
module.exports = router;

// products.controller.js
const service = require('./products.service');
const create = async (req, res, next) => {
  const product = await service.create(req.body);
  res.status(201).json({ success: true, data: { product } });
};
module.exports = { create, getAll };

// products.service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const create = async (data) => {
  return await prisma.product.create({ data });
};
module.exports = { create, getAll };
```

### 3️⃣ تسجيل المودول
```javascript
// src/modules/index.js
module.exports = {
  auth:     require('./auth/auth.router'),
  startup:  require('./startup/startup.router'),
  products: require('./products/products.router'),  // ✨ جديد
};
```

### 4️⃣ تحديث الـ routes
```javascript
// src/app.js
const modules = require('./modules');
app.use('/api/v1/products', modules.products);
```

---

## 🔐 قواعد أمان مهمة

1. **دائماً استخدم `asyncHandler`** لمعالجة الأخطاء
2. **التحقق من الصلاحيات** قبل تنفيذ العملية
3. **تشفير كلمات المرور** باستخدام bcrypt
4. **التحقق من المدخلات** باستخدام express-validator
5. **عدم كشف معلومات حساسة** في رسائل الخطأ

---

## 📚 مراجع مهمة

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express Best Practices](https://expressjs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [REST API Design](https://restfulapi.net/)

---

## ✅ المهام المتبقية

- [ ] إضافة مودول Products
- [ ] إضافة مودول Orders
- [ ] إعداد WebSocket للإشعارات
- [ ] تكوين Bull Queue للمهام المجدولة
- [ ] كتابة اختبارات كاملة (Jest/Mocha)
- [ ] إعداد Docker للـ deployment

---

**آخر تحديث:** 9 مارس 2026
**الن سخة:** 1.0.0
