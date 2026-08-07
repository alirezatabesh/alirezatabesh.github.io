# جلسه: Open/Closed Principle — OCP

### جایگاه در مسیر SOLID

```text
S → Single Responsibility Principle
O → Open/Closed Principle   ← امروز
L → Liskov Substitution Principle
I → Interface Segregation Principle
D → Dependency Inversion Principle
```

---

## 1. تعریف OCP

اصل Open/Closed Principle می‌گوید:

> **Software entities should be open for extension, but closed for modification.**

یعنی:

> **یک بخش از نرم‌افزار باید برای توسعه قابلیت‌های جدید باز، اما برای تغییر کد موجود تا حد امکان بسته باشد.**

به زبان ساده‌تر:

```text
قابلیت جدید
     ↓
ترجیحاً اضافه کردن کد جدید
     ↓
نه تغییر دادن کدهای قبلی
```

---

# 2. منظور از Open و Closed چیست؟

### Open for Extension

یعنی بتوانیم رفتار جدید اضافه کنیم.

مثلاً:

```text
Payment
 ├── Card
 ├── BankTransfer
 ├── Bitcoin
 └── ApplePay   ← قابلیت جدید
```

### Closed for Modification

یعنی برای اضافه کردن `ApplePay` مجبور نباشیم برویم و منطق اصلی `PaymentService` را دستکاری کنیم.

---

# 3. مثال نقض OCP

فرض کنیم:

```csharp
public class PaymentService
{
    public void Pay(decimal amount, PaymentMethod method)
    {
        switch (method)
        {
            case PaymentMethod.Card:
                PayByCard(amount);
                break;

            case PaymentMethod.BankTransfer:
                PayByBankTransfer(amount);
                break;
        }
    }
}
```

حالا Apple Pay اضافه می‌شود.

باید برویم و این کلاس را تغییر دهیم:

```csharp
case PaymentMethod.ApplePay:
    PayByApplePay(amount);
    break;
```

بعد:

```text
GooglePay
Crypto
PayPal
...
```

هر بار:

```text
New Feature
     ↓
Modify PaymentService
```

این نشانه خوبی نیست.

---

# 4. راه‌حل OCP

رفتار متغیر را جدا می‌کنیم:

```csharp
public interface IPaymentMethod
{
    void Pay(decimal amount);
}
```

حالا:

```csharp
public class CardPayment : IPaymentMethod
{
    public void Pay(decimal amount)
    {
        // Card payment
    }
}
```

```csharp
public class BankTransferPayment : IPaymentMethod
{
    public void Pay(decimal amount)
    {
        // Bank transfer
    }
}
```

و سرویس اصلی:

```csharp
public class PaymentService
{
    public void Pay(IPaymentMethod payment, decimal amount)
    {
        payment.Pay(amount);
    }
}
```

حالا Apple Pay:

```csharp
public class ApplePayPayment : IPaymentMethod
{
    public void Pay(decimal amount)
    {
        // Apple Pay
    }
}
```

نکته مهم:

**PaymentService تغییر نکرد.**

ما فقط یک implementation جدید اضافه کردیم.

```text
                  ┌── CardPayment
                  │
IPaymentMethod ───┼── BankTransferPayment
                  │
                  ├── ApplePayPayment
                  │
                  └── GooglePayPayment
```

این دقیقاً روح OCP است.

---

# 5. نکته بسیار مهم: OCP درباره «تغییر» است

این قسمت را حتماً به خاطر بسپار.

OCP نمی‌گوید:

> «هیچ‌وقت کد قبلی را تغییر نده.»

چنین چیزی عملاً غیرممکن است.

معنای درست:

> **وقتی یک قابلیت جدید از همان خانواده اضافه می‌شود، نباید مجبور باشیم منطق موجود را دائماً تغییر دهیم.**

مثلاً اگر Payment جدید اضافه می‌شود:

```text
❌ تغییر PaymentService
✅ اضافه کردن NewPayment
```

---

# 6. OCP در واقع درباره Change Boundary است

یکی از عمیق‌ترین برداشت‌ها از OCP این است:

> **باید قسمت‌هایی که احتمالاً با هم تغییر می‌کنند را از قسمت‌هایی که مستقل تغییر می‌کنند جدا کنیم.**

فرض کن:

```text
PaymentService
     │
     ├── Card rules
     ├── Bank rules
     ├── Crypto rules
     └── ApplePay rules
```

اگر همه داخل یک کلاس باشند:

```text
New Payment
     ↓
PaymentService تغییر می‌کند
```

اما اگر مرز تغییر ایجاد کنیم:

```text
PaymentService
      │
      ↓
IPaymentMethod
      │
 ┌────┼─────┬──────┐
Card Bank  Crypto ApplePay
```

هر Payment می‌تواند مستقل تغییر کند.

---

# 7. OCP و `if / else`

یک نکته ظریف:

وجود `if` یا `switch` به خودی خود نقض OCP نیست.

مثلاً:

```csharp
if (user == null)
    throw new ArgumentNullException();
```

هیچ مشکلی ندارد.

اما این:

```csharp
if (paymentType == PaymentType.Card)
{
}
else if (paymentType == PaymentType.Bank)
{
}
else if (paymentType == PaymentType.Crypto)
{
}
```

اگر مرتباً PaymentType جدید اضافه شود، تبدیل به **Change Point** می‌شود.

یعنی:

```text
New Payment Type
       ↓
این switch باید تغییر کند
```

این همان جایی است که OCP به ما می‌گوید:

> این قسمت احتمالاً باید قابل توسعه شود.

---

# 8. پس آیا هر `switch` بد است؟

**خیر.**

این یک برداشت اشتباه رایج است.

اگر مجموعه حالت‌ها ثابت باشد:

```csharp
switch (dayOfWeek)
{
    case DayOfWeek.Monday:
    case DayOfWeek.Tuesday:
    ...
}
```

هیچ مشکلی ندارد.

اما اگر:

```text
Payment Types
Notification Types
Export Types
Shipping Providers
Discount Types
```

مدام در حال افزایش هستند، باید به OCP فکر کنیم.

---

# 9. OCP و Interface

یک اشتباه دیگر:

> «اگر Interface داشته باشم، پس OCP رعایت شده.»

خیر.

این:

```csharp
public interface IPayment
{
}
```

به تنهایی هیچ چیزی را ثابت نمی‌کند.

سؤال واقعی این است:

> **آیا برای اضافه کردن implementation جدید مجبورم کد موجود را تغییر بدهم؟**

اگر:

```text
New Payment
      ↓
New Class
      ↓
Existing code untouched
```

آنگاه طراحی به سمت OCP رفته است.

---

# 10. OCP و Polymorphism

یکی از ابزارهای اصلی اجرای OCP:

> **Polymorphism**

به جای اینکه بگوییم:

```csharp
if (type == Card)
    ...
else if (type == Bank)
    ...
```

می‌گوییم:

```csharp
payment.Pay(amount);
```

و polymorphism تصمیم می‌گیرد چه implementationای اجرا شود.

```text
PaymentService
      │
      │ IPaymentMethod
      ↓
     Pay()
      │
 ┌────┼─────┐
 ↓    ↓     ↓
Card Bank  Crypto
```

بنابراین:

> **OCP اغلب با Polymorphism + Composition + DI پیاده‌سازی می‌شود.**

---

# 11. OCP و Design Patterns

خیلی از Design Patternهایی که یاد می‌گیریم در واقع ابزارهایی برای رسیدن به OCP هستند.

|Pattern|ارتباط با OCP|
|---|---|
|Strategy|اضافه کردن الگوریتم جدید|
|Factory Method|اضافه کردن نوع جدید Object|
|Abstract Factory|اضافه کردن Family جدید|
|Decorator|اضافه کردن رفتار جدید|
|Command|اضافه کردن عملیات جدید|
|State|اضافه کردن State جدید|
|Template Method|تغییر رفتار در subclass|

مثلاً Strategy:

```text
IPaymentStrategy
       │
 ┌─────┼─────┐
 ↓     ↓     ↓
Card  Bank  Crypto
```

برای اضافه کردن Crypto:

```text
New class
   ↓
CryptoStrategy
```

نه:

```text
Modify PaymentService
```

---

# 12. OCP و SRP چه ارتباطی دارند؟

این دو اصل خیلی به هم نزدیک‌اند.

### SRP می‌پرسد:

> این کلاس چند دلیل برای تغییر دارد؟

### OCP می‌پرسد:

> وقتی یکی از این قابلیت‌ها توسعه پیدا کرد، آیا مجبورم کد موجود را تغییر بدهم؟

مثلاً:

```text
PaymentService
```

اگر هم مسئول:

```text
Card
Bank
Crypto
ApplePay
```

باشد، احتمالاً SRP مشکل دارد.

اگر برای اضافه شدن هر Payment مجبور شویم همین کلاس را تغییر دهیم، OCP هم مشکل دارد.

پس:

```text
SRP
 ↓
Responsibilities را جدا کن

OCP
 ↓
Change points را قابل توسعه کن
```

---

# 13. یک نکته خیلی مهم: OCP بدون Over Engineering

نباید از این اصل به شکل افراطی استفاده کنیم.

مثلاً:

```csharp
public interface ICustomerNameProvider
{
}
```

برای چیزی که احتمالاً هیچ implementation دیگری نخواهد داشت، احتمالاً بی‌دلیل است.

یا:

```text
IUserFactory
IUserProvider
IUserStrategy
IUserResolver
IUserManager
IUserHandler
```

در حالی که سیستم فقط یک نوع User دارد!

این دیگر OCP نیست.

این:

> **Over Engineering**

است.

---

# 14. OCP و YAGNI

دو مفهوم را کنار هم قرار بده:

### OCP

```text
Change is likely
       ↓
Prepare extension point
```

### YAGNI

```text
Change is imaginary
       ↓
Don't build complexity
```

بنابراین:

> **برای تغییرات واقعی و محتمل طراحی کن، نه برای تمام تغییرات خیالی آینده.**

---

# 15. بهترین سؤال برای تشخیص OCP

در Code Review این سؤال فوق‌العاده کاربردی است:

> **اگر فردا یک نوع جدید از این قابلیت اضافه شود، اولین فایلی که باید تغییر بدهم کجاست؟**

مثلاً:

```text
Add new payment
      ↓
PaymentService.cs باید تغییر کند
```

🚨 احتمالاً Change Point نامناسب داری.

ولی:

```text
Add new payment
      ↓
NewPayment.cs
```

✅ طراحی احتمالاً به سمت OCP خوبی رفته است.

---

# 16. OCP در معماری Plugin

یک مثال بسیار قوی‌تر:

فرض کن سیستم Plugin دارد:

```text
Application
    │
    ├── Plugin A
    ├── Plugin B
    └── Plugin C
```

فردا:

```text
Plugin D
```

اضافه می‌کنی.

Application تغییر نمی‌کند.

فقط:

```text
Plugin D
   ↓
Load
   ↓
Execute
```

این یکی از خالص‌ترین نمونه‌های OCP است.

حتی در معماری‌های بزرگ، **Plugin Architecture** را می‌توان یک نمونه بسیار جدی از Open/Closed Principle دانست.

---

# 17. یک مثال نزدیک به پروژه‌های واقعی تو

فرض کن Customer Registration داریم:

```text
Customer Registration
       │
       ├── National ID validation
       ├── Mobile validation
       ├── Bank validation
       └── KYC validation
```

اگر فردا Provider جدید KYC اضافه شود:

```text
KYCProvider = X
KYCProvider = Y
```

بدترین حالت:

```csharp
if (provider == X)
{
}
else if (provider == Y)
{
}
```

و هر Provider جدید یعنی تغییر سرویس اصلی.

بهتر:

```csharp
public interface IKycProvider
{
    Task<KycResult> Verify(Customer customer);
}
```

و:

```text
IKycProvider
    │
    ├── ProviderX
    ├── ProviderY
    └── ProviderZ
```

حالا Provider جدید:

```text
ProviderZ
   ↓
new implementation
```

و منطق اصلی Registration لازم نیست تغییر کند.

این دقیقاً همان چیزی است که در سیستم‌های Enterprise زیاد با آن مواجه می‌شوی.

---

# 18. اما یک نکته ظریف‌تر

OCP نمی‌گوید:

> «کد موجود را هیچ‌وقت تغییر نده.»

بلکه:

> **کد را طوری طراحی کن که تغییرات در یک بخش، کمترین اثر را روی بخش‌های پایدار سیستم داشته باشند.**

پس هدف واقعی:

```text
❌ Zero Modification

نیست.

بلکه:

✅ Minimize Modification Impact
```

این برداشت خیلی بالغ‌تری از OCP است.

---

# 19. خلاصه نهایی جلسه

اگر بخواهم کل OCP را در یک تصویر ذهنی خلاصه کنم:

```text
                  NEW FEATURE
                       │
                       ↓
              ┌─────────────────┐
              │ Extension Point │
              └────────┬────────┘
                       │
                       ↓
                New Implementation


Existing Code
      │
      │
      └─────────────── دست نخورده
```

و در مقابل:

```text
NEW FEATURE
     │
     ↓
Existing Class
     │
     ├── if
     ├── else
     ├── switch
     ├── another if
     └── another switch
```

یعنی:

> **OCP یعنی طراحی برای اینکه تغییرات جدید، بیشتر به شکل Extension وارد سیستم شوند تا Modification.**

---

## 🧠 سه نکته‌ای که واقعاً ارزش حفظ کردن دارند

### 1.

**OCP درباره Interface ساختن نیست؛ درباره مدیریت Change است.**

### 2.

**هر `if` و `switch` بد نیست؛ مهم این است که آیا آن تصمیم‌گیری یک Change Point متغیر است یا نه.**

### 3.

**OCP را برای تغییرات واقعی اجرا کن، نه برای حدس زدن تمام آینده.**

و شاید مهم‌ترین جمله این جلسه:

> **قبل از اینکه برای آینده abstraction بسازی، ببین واقعاً چه چیزی در سیستم تو مرتب تغییر می‌کند.**

این جمله، مرز بین **Design خوب** و **Over Engineering** در OCP است.