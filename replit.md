# نظام جدولة الحصص المدرسية

## نظرة عامة
تطبيق ويب عربي لإدارة جداول الحصص المدرسية. يسمح للمعلمين بإنشاء جداولهم الفردية، ويولد النظام تلقائياً جداول الصفوف بناءً على مدخلات المعلمين.

## الميزات الرئيسية
- **إدارة المعلمين**: إضافة، تعديل، وحذف المعلمين (مع حذف تلقائي للحصص)
  - ترتيب المعلمين حسب المادة مع عناوين واضحة لكل مادة
  - المعلم الجديد يظهر تحت آخر معلم في نفس المادة
- **جدولة الحصص**: 7 حصص × 5 أيام (الأحد-الخميس)
- **الصفوف**: الصفوف 10-12
- **الشعب الديناميكية**: إدارة مرنة للشعب (إضافة/حذف) لكل صف على حدة
  - التحقق التلقائي من وجود الشعب قبل حفظ الجدول
  - رسائل خطأ واضحة تحدد الشعب المفقودة وتوجه المستخدم لإضافتها
- **المواد**: 10 مواد دراسية (عربي، إنجليزي، رياضيات، كيمياء، فيزياء، أحياء، إسلامية وقرآن، اجتماعيات، جيولوجيا، دستور)
- **التحقق من التعارضات**: منع وضع حصتين لمدرسين مختلفين في نفس الوقت والصف
- **حذف الحصص الفردية**: إمكانية حذف أي حصة من جدول المدرس مع تحديث فوري للواجهة
- **تصدير PDF**: 
  - جدول معلم فردي
  - جميع جداول المعلمين (من صفحة المعلمين والجدول الرئيسي)
  - جدول صف فردي
  - جميع جداول الصفوف (مع دعم الشعب الديناميكية)
  - تصميم موحد مع عمود أيام أعرض وخطوط عربية محسّنة
  - حوار تخصيص لاختيار الخطوط والألوان
- **عرض الجداول**: مع/بدون أسماء المعلمين
- **الواجهة**: RTL كامل، ثيم داكن، رسوم متحركة سلسة، خطوط عربية متعددة
  - تصميم جدول محسّن بمسافات واضحة بين الخلايا (4px)
  - تأثيرات hover ناعمة بدون حواف غامقة

## البنية التقنية

### Backend
- **Framework**: Express.js
- **التخزين**: In-memory (MemStorage)
- **API**: RESTful endpoints لجميع عمليات CRUD
- **المنفذ**: 5000 (frontend و backend على نفس المنفذ)
- **المضيف**: 0.0.0.0

### Frontend
- **Framework**: React + TypeScript + Vite
- **Routing**: Wouter
- **State Management**: TanStack Query (v5)
- **UI Components**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **PDF**: jsPDF + jsPDF-autotable
- **Dev Server**: Vite integrated with Express

### الملفات الرئيسية
- `shared/schema.ts`: تعريفات الأنواع والثوابت وجداول Drizzle
- `server/storage.ts`: واجهة التخزين وتنفيذ MemStorage
- `server/routes.ts`: API routes
- `server/index.ts`: Express server setup
- `server/vite.ts`: Vite dev server integration
- `client/src/lib/pdfGenerator.ts`: منطق تصدير PDF
- `client/src/pages/Home.tsx`: الصفحة الرئيسية
- `client/src/pages/Teachers.tsx`: إدارة المعلمين (مع ترتيب حسب المادة)
- `client/src/pages/TeacherSchedule.tsx`: تعديل جدول معلم
- `client/src/pages/MasterSchedule.tsx`: الجدول الرئيسي لجميع المعلمين (مع التحقق من الشعب)
- `client/src/pages/Classes.tsx`: عرض جداول الصفوف
- `client/src/components/ScheduleGrid.tsx`: شبكة الجدول (مع مسافات محسّنة)
- `client/src/components/ScheduleCell.tsx`: خلية الجدول (مع تأثيرات hover ناعمة)
- `vite.config.ts`: إعدادات Vite مع دعم Replit proxy

## API Endpoints

### المعلمون
- `GET /api/teachers` - جميع المعلمين
- `GET /api/teachers/:id` - معلم واحد
- `POST /api/teachers` - إنشاء معلم
- `PUT /api/teachers/:id` - تحديث معلم
- `DELETE /api/teachers/:id` - حذف معلم

### الحصص
- `GET /api/schedule-slots` - جميع الحصص
- `GET /api/teachers/:id/schedule-slots` - حصص معلم
- `POST /api/teachers/:id/schedule-slots/batch` - حفظ جدول معلم كامل (مع التحقق من التعارضات)
- `GET /api/class-schedules/:grade/:section` - جدول صف محدد

### الشعب
- `GET /api/grade-sections` - جميع الشعب لجميع الصفوف
- `PUT /api/grade-sections` - تحديث شعب صف محدد

## معلومات مهمة
- **staleTime**: Infinity في queryClient - يتطلب invalidation يدوي دقيق للذاكرة المؤقتة
- **Cache Invalidation**: عند حفظ/حذف جدول معلم، يتم invalidate جميع جداول الصفوف التي تعتمد عليه
- **التحديثات التلقائية**: جداول الصفوف تتولد تلقائياً من جداول المعلمين
- **Cascade Delete**: عند حذف معلم، يتم حذف جميع حصصه تلقائياً من جميع الجداول
- **Conflict Detection**: API يمنع حفظ جدول يحتوي على تعارضات (حصتان في نفس الوقت والصف)
- **Section Validation**: المعلم والجدول الرئيسي يتحققان من وجود الشعب قبل الحفظ
  - رسائل الخطأ التفصيلية تظهر للمستخدم عبر error.message في toast
- **React State Management**: handleDeleteSlot ينشئ object جديد بالكامل لضمان re-render فوري
- **Teacher Sorting**: المعلمون يُعرضون مرتبين حسب المادة ثم الاسم، مع عناوين واضحة لكل مادة

## التشغيل

### بيئة التطوير
```bash
npm install  # تثبيت المكتبات
npm run dev  # تشغيل الخادم
```
الخادم يعمل على المنفذ 5000 (يشمل API و Frontend)

### بيئة الإنتاج
```bash
npm run build  # بناء المشروع
npm run start  # تشغيل النسخة المنتجة
```

### النشر (Deployment)
تم إعداد التطبيق للنشر على Replit:
- **نوع النشر**: Autoscale (للتطبيقات الثابتة stateless)
- **البناء**: `npm run build`
- **التشغيل**: `npm run start`

## إعدادات Replit المهمة
- تم تكوين Vite لقبول جميع المضيفين (allowedHosts: true) للعمل مع Replit proxy
- HMR (Hot Module Replacement) يعمل عبر منفذ 443
- الخادم يعمل على 0.0.0.0:5000
