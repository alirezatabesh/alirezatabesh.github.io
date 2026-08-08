حتماً. مثل جلسه‌های قبلی، این یکی را به شکل یک **جزوه‌ی قابل نگهداری در Markdown** می‌نویسم؛ هم بخش مفهومی، هم نکات عمیق‌تر، هم مثال‌های C# و در انتها **روال پیشنهادی برای تشخیص LSP در پروژه واقعی**.

# جلسه 04 — Liskov Substitution Principle (LSP)

**توجه: این مقاله به کمک نسخه رایگان ChatGPT نوشته شده است.**

> **SOLID — اصل سوم**

---

## 1. مقدمه

تا اینجا دو اصل اول SOLID را بررسی کردیم:

| اصل     | مفهوم اصلی                                            |
| ------- | ----------------------------------------------------- |
| **SRP** | هر ماژول یک دلیل برای تغییر داشته باشد                |
| **OCP** | برای توسعه باز و برای تغییر بسته باشیم                |
| **LSP** | پیاده‌سازی‌های فرزند باید قابل جایگزینی با والد باشند |

LSP در ظاهر درباره‌ی **Inheritance** است، اما در عمق درباره‌ی یک مفهوم مهم‌تر صحبت می‌کند:

> **Contract و Behavior**

---

# 2. تعریف LSP

تعریف Barbara Liskov:

> اگر `S` زیرنوعی از `T` باشد، اشیای نوع `T` باید بتوانند با اشیای نوع `S` جایگزین شوند، بدون اینکه صحت برنامه تغییر کند.

به زبان ساده:

> **اگر یک کلاس را به عنوان فرزند یک کلاس دیگر معرفی کردی، باید بتوانی هر جا والد را انتظار داریم، فرزند را قرار دهی و برنامه همچنان رفتار صحیح داشته باشد.**

مثلاً:

```csharp
Animal animal = new Dog();
```

باید بتوانیم با `animal` همان انتظاری را داشته باشیم که از یک `Animal` داریم.

---

# 3. نکته کلیدی: LSP درباره Behavior است

این کد کاملاً معتبر است:

```csharp
public interface ICache
{
    string Get(string key);
}
```

و:

```csharp
public class MemoryCache : ICache
{
    public string Get(string key)
    {
        return "...";
    }
}
```

اما فرض کن:

```csharp
public class BrokenCache : ICache
{
    public string Get(string key)
    {
        throw new NotSupportedException();
    }
}
```

از نظر compiler:

```text
IContract ✓
Implementation ✓
Compilation ✓
```

اما از نظر LSP:

```text
Behavior ✗
```

چون مصرف‌کننده انتظار دارد:

```csharp
ICache cache = GetCache();

var value = cache.Get("customer");
```

بدون اینکه لازم باشد بداند `cache` دقیقاً چه implementationای است.

---

# 4. Contract چیست؟

برای درک LSP باید مفهوم **Contract** را بشناسیم.

Contract معمولاً سه بخش دارد:

### 4.1 Preconditions

شرایطی که **قبل از اجرای متد** باید برقرار باشند.

مثلاً:

```csharp
Withdraw(amount);
```

و قرارداد می‌گوید:

```text
amount > 0
```

---

### 4.2 Postconditions

شرایطی که **بعد از اجرای متد** باید برقرار باشند.

مثلاً:

```text
بعد از Withdraw، موجودی به اندازه amount کاهش پیدا می‌کند.
```

---

### 4.3 Invariants

شرایطی که **همیشه** باید برقرار باشند.

مثلاً:

```text
Balance >= 0
```

---

# 5. قانون مهم LSP درباره Contract

یک کلاس فرزند:

### نباید Preconditions را سخت‌تر کند.

والد:

```text
amount > 0
```

فرزند:

```text
amount > 100
```

❌ نقض LSP

چون چیزی که قبلاً معتبر بود، دیگر معتبر نیست.

---

### فرزند می‌تواند Preconditions را ضعیف‌تر کند.

والد:

```text
amount > 0
```

فرزند:

```text
amount >= 0
```

این از نظر LSP مشکلی ندارد.

---

### Postcondition نباید ضعیف‌تر شود.

والد:

```text
بعد از عملیات، موجودی کاهش پیدا می‌کند.
```

فرزند باید حداقل همین رفتار را حفظ کند.

---

# 6. مثال کلاسیک Rectangle و Square

```csharp
public class Rectangle
{
    public virtual int Width { get; set; }
    public virtual int Height { get; set; }

    public int Area => Width * Height;
}
```

و:

```csharp
public class Square : Rectangle
{
    public override int Width
    {
        set
        {
            base.Width = value;
            base.Height = value;
        }
    }

    public override int Height
    {
        set
        {
            base.Width = value;
            base.Height = value;
        }
    }
}
```

حالا:

```csharp
Rectangle rectangle = new Square();

rectangle.Width = 5;
rectangle.Height = 10;
```

از دید `Rectangle` انتظار داریم:

```text
Width = 5
Height = 10
Area = 50
```

ولی `Square` می‌گوید:

```text
Width = 10
Height = 10
Area = 100
```

بنابراین:

```text
Rectangle
    ↑
  Square
```

از نظر ریاضی ممکن است درست باشد، اما از نظر **Behavioral Subtyping** مشکل دارد.

---

# 7. نکته مهم: Is-A همیشه کافی نیست

این یکی از مهم‌ترین نکات LSP است.

ممکن است از نظر دنیای واقعی بگوییم:

```text
Square is a Rectangle
```

اما این به تنهایی برای inheritance کافی نیست.

باید بپرسیم:

> آیا `Square` از نظر قرارداد نرم‌افزاری واقعاً می‌تواند جای `Rectangle` قرار بگیرد؟

اگر جواب نه باشد:

```text
Mathematical relationship ≠ Software substitutability
```

این یکی از دلایل مهمی است که نباید صرفاً بر اساس روابط دنیای واقعی کلاس‌ها را از هم مشتق کنیم.

---

# 8. مثال Bird و Penguin

طراحی اشتباه:

```csharp
public class Bird
{
    public virtual void Fly()
    {
    }
}
```

بعد:

```csharp
public class Penguin : Bird
{
    public override void Fly()
    {
        throw new NotSupportedException();
    }
}
```

حالا:

```csharp
void MakeBirdFly(Bird bird)
{
    bird.Fly();
}
```

این کاملاً قانونی است:

```csharp
MakeBirdFly(new Penguin());
```

ولی Runtime می‌گوید:

```text
NotSupportedException
```

پس:

```text
Bird
 ├── Sparrow
 └── Penguin
```

طراحی مناسبی نیست اگر `Bird` ذاتاً قرارداد `Fly()` را داشته باشد.

---

# 9. طراحی بهتر

می‌توانیم قابلیت پرواز را جدا کنیم:

```csharp
public abstract class Bird
{
}
```

و:

```csharp
public interface IFlyable
{
    void Fly();
}
```

حالا:

```csharp
public class Sparrow : Bird, IFlyable
{
    public void Fly()
    {
    }
}
```

ولی:

```csharp
public class Penguin : Bird
{
}
```

حالا قراردادها دقیق‌تر هستند.

---

# 10. یک علامت خطر بسیار مهم

اگر در کد چنین چیزی دیدی:

```csharp
if (obj is SomeDerivedClass)
{
    // special behavior
}
```

یا:

```csharp
switch (obj.GetType())
{
    case ...:
}
```

باید بلافاصله از خودت بپرسی:

> چرا مصرف‌کننده باید بداند implementation واقعی چیست؟

اگر:

```csharp
IShape shape = GetShape();

if (shape is Circle)
{
    ...
}
```

و این شرط برای درست کار کردن abstraction ضروری است، احتمالاً abstraction مشکل دارد.

---

# 11. `NotImplementedException` یک Red Flag است

مثلاً:

```csharp
public interface IPrinter
{
    void Print();
    void Scan();
    void Fax();
}
```

بعد:

```csharp
public class SimplePrinter : IPrinter
{
    public void Print()
    {
    }

    public void Scan()
    {
        throw new NotImplementedException();
    }

    public void Fax()
    {
        throw new NotImplementedException();
    }
}
```

اینجا دو احتمال داریم:

1. طراحی Interface اشتباه است.
2. LSP/ISP نقض شده است.

بهتر است:

```csharp
public interface IPrinter
{
    void Print();
}

public interface IScanner
{
    void Scan();
}

public interface IFax
{
    void Fax();
}
```

حالا هر implementation فقط capabilityهایی را که واقعاً دارد پیاده می‌کند.

---

# 12. ارتباط LSP و ISP

این دو اصل به شکل جالبی به هم مربوط هستند.

### ISP می‌گوید:

> Interfaceهای بزرگ را به قراردادهای کوچک‌تر تقسیم کن.

### LSP می‌گوید:

> کسی که قرارداد را قبول کرده باید واقعاً بتواند به آن عمل کند.

مثلاً:

```text
IPrinter
 ├── Print
 ├── Scan
 └── Fax
```

اگر بعضی implementationها مجبور شوند:

```csharp
throw new NotSupportedException();
```

احتمالاً Interface بیش از حد بزرگ است.

بنابراین گاهی:

```text
LSP violation
        ↓
Bad abstraction
        ↓
ISP violation
```

---

# 13. LSP و OCP

این ارتباط خیلی مهم است.

در OCP گفتیم:

> باید بتوانیم implementation جدید اضافه کنیم بدون اینکه کدهای موجود را تغییر دهیم.

فرض کن:

```csharp
IPayment payment = GetPayment();
payment.Pay();
```

اگر هر implementation واقعاً قابل جایگزینی باشد:

```text
BankPayment
CryptoPayment
WalletPayment
CardPayment
```

می‌توانند بدون تغییر Consumer اضافه شوند.

اما اگر بنویسیم:

```csharp
if (payment is CryptoPayment)
{
    ...
}
```

به مرور abstraction خراب می‌شود.

پس:

```text
OCP
 ↓
Extension through abstraction
 ↓
Requires substitutable implementations
 ↓
LSP
```

بنابراین:

> **LSP یکی از پایه‌های عملی OCP است.**

---

# 14. یک نکته بسیار مهم درباره Exception

فرض کن Parent می‌گوید:

```csharp
public abstract class Storage
{
    public abstract void Save(string data);
}
```

و consumer:

```csharp
void SaveData(Storage storage)
{
    storage.Save("Hello");
}
```

اگر یک implementation بگوید:

```csharp
public override void Save(string data)
{
    throw new NotSupportedException();
}
```

مشکل فقط Exception نیست.

مشکل این است که:

> **این implementation اساساً عضو معتبر abstraction نیست.**

این تفاوت ذهنی بسیار مهم است.

نباید بگویی:

> "خب این کلاس یک edge case دارد."

ممکن است مسئله عمیق‌تر باشد:

> **این کلاس نباید اصلاً زیر آن abstraction قرار می‌گرفت.**

---

# 15. Inheritance برای Code Reuse؟

یکی از اشتباهات رایج:

```text
A و B کد مشترک دارند
        ↓
پس B از A ارث ببرد
```

این استدلال اشتباه است.

داشتن کد مشترک الزاماً به معنی رابطه inheritance نیست.

گاهی:

```text
Inheritance
```

را باید با:

```text
Composition
```

جایگزین کنیم.

مثلاً:

```csharp
public class OrderService
{
    private readonly ILogger _logger;

    public OrderService(ILogger logger)
    {
        _logger = logger;
    }
}
```

به جای اینکه:

```csharp
public class OrderService : BaseService
{
}
```

فقط برای اینکه `BaseService` یک `Logger` یا چند utility method دارد.

---

# 16. Blind Substitution Test

یک تست ذهنی بسیار کاربردی برای LSP:

> **اگر نوع واقعی شیء را ندانم، آیا هنوز می‌توانم با آن کار کنم؟**

مثلاً:

```csharp
IPayment payment = GetPayment();

payment.Pay(100);
```

Consumer نباید نیاز داشته باشد بداند:

```text
BankPayment؟
CryptoPayment؟
WalletPayment؟
```

اگر بدون دانستن implementation بتواند کار کند:

```text
Good abstraction ✓
```

اگر مجبور شود implementation را بشناسد:

```text
Potential LSP violation ⚠️
```

---

# 17. تست عملی LSP در پروژه

هر وقت یک abstraction داری، این پنج سؤال را از خودت بپرس:

### سؤال ۱

آیا تمام implementationها واقعاً می‌توانند این interface/base class را انجام دهند؟

---

### سؤال ۲

آیا implementationای داریم که متدی را این‌طور پیاده کرده باشد؟

```csharp
throw new NotSupportedException();
```

اگر بله، چرا؟

---

### سؤال ۳

آیا Consumer مجبور است بگوید:

```csharp
if (x is ...)
```

یا:

```csharp
switch (x.GetType())
```

؟

---

### سؤال ۴

آیا implementation خاصی رفتار متفاوت و غیرمنتظره دارد؟

مثلاً:

```text
Parent → returns null
Child  → throws exception
```

---

### سؤال ۵

آیا فرزند برای انجام عملیات محدودیت بیشتری نسبت به والد ایجاد کرده است؟

مثلاً:

```text
Parent → amount > 0
Child  → amount > 100
```

اگر جواب این سؤال‌ها مشکل‌دار باشد، باید abstraction را دوباره بررسی کنیم.

---

# 18. نکته خیلی مهم برای Architecture

LSP فقط مربوط به کلاس‌های کوچک نیست.

در Architecture هم وجود دارد.

مثلاً:

```csharp
public interface ICustomerRepository
{
    Task<Customer> GetById(Guid id);
}
```

حالا:

```text
SqlCustomerRepository
MongoCustomerRepository
InMemoryCustomerRepository
```

باید رفتار قراردادی یکسانی داشته باشند.

مثلاً اگر SQL implementation:

```text
Customer not found → null
```

ولی Mongo:

```text
Customer not found → Exception
```

دارند، حتی اگر هر دو Interface را implement کنند، Consumer دیگر abstraction یکسانی ندارد.

بنابراین:

> **LSP در سطح Repository، Service، Gateway و حتی معماری سیستم هم معنا دارد.**

---

# 19. LSP فقط برای Inheritance نیست

این نکته را حتماً به خاطر بسپار.

در آموزش‌های ابتدایی معمولاً می‌گویند:

```text
LSP = Parent / Child
```

ولی مفهوم اصلی گسترده‌تر است:

```text
LSP = Substitutability
```

یعنی هر جا abstraction داری و چند implementation وجود دارد، سؤال LSP مطرح می‌شود.

مثلاً:

```text
Interface
    ↓
Implementations
```

حتی بدون هیچ `class : BaseClass`ای.

---

# 20. یک مثال نزدیک به پروژه‌های واقعی

فرض کن:

```csharp
public interface INotificationSender
{
    Task Send(string message);
}
```

و:

```text
EmailNotificationSender
SmsNotificationSender
PushNotificationSender
```

Consumer:

```csharp
public async Task Notify(
    INotificationSender sender)
{
    await sender.Send("Hello");
}
```

LSP می‌گوید هر سه باید بتوانند:

```csharp
sender.Send(...)
```

را طبق قرارداد انجام دهند.

اگر:

```csharp
PushNotificationSender
```

بگوید:

```csharp
throw new NotSupportedException();
```

آن implementation قابل جایگزینی نیست.

اما اگر واقعاً Push notification ویژگی متفاوتی دارد، ممکن است مسئله این باشد که abstraction اشتباه طراحی شده است.

---

# 21. نکته طلایی جلسه

این جمله را به عنوان **Core Concept** جلسه حفظ کن:

> **LSP نمی‌گوید Child باید شبیه Parent باشد؛ می‌گوید Child باید بتواند قول Parent را حفظ کند.**

و یک جمله حتی مهم‌تر:

> **Inheritance رابطه‌ی کد نیست؛ رابطه‌ی Contract است.**

---

# 22. روال پیشنهادی برای یادگیری LSP

برای اینکه مثل جلسات قبل فقط تئوری یاد نگیریم، این جلسه را این‌طور جلو می‌بریم:

```text
                 LSP
                  │
        ┌─────────┴─────────┐
        │                   │
     مفهوم                  │
        │                   │
   Contract                 │
        │                   │
 ┌──────┼──────┐            │
 │      │      │            │
Pre   Post  Invariant        │
 │      │      │            │
 └──────┼──────┘            │
        │                   │
        ▼                   │
   Substitutability         │
        │                   │
 ┌──────┼────────────┐      │
 │      │            │      │
Square Bird       Repository │
 │      │            │      │
 └──────┴────────────┘      │
        │                   │
        ▼                   │
   Code Smells              │
        │                   │
 ┌──────┼──────────────┐    │
 │      │              │    │
is     GetType    NotSupported
        │
        ▼
   Refactoring
        │
        ▼
Composition / ISP
        │
        ▼
   Real Projects
```

---

# 23. جمع‌بندی نهایی

### LSP می‌گوید:

```text
Parent Contract
      ↓
Child must honor it
      ↓
Consumer should not care
about concrete implementation
```

### نشانه‌های خطر:

```text
❌ NotSupportedException
❌ NotImplementedException
❌ if (x is ConcreteType)
❌ switch (x.GetType())
❌ رفتار متفاوت و غیرمنتظره
❌ Preconditions سخت‌تر
❌ Postconditions ضعیف‌تر
❌ inheritance صرفاً برای reuse
```

### نشانه طراحی سالم:

```text
Interface / Base abstraction
            ↓
     Multiple implementations
            ↓
      Same contract
            ↓
     Same expectations
            ↓
     Consumer doesn't care
```

---

## 🧠 جمله‌ای که باید از این جلسه با خودت ببری

> **"اگر مجبور شدم برای یک فرزند، کد مصرف‌کننده را تغییر بدهم، قبل از اینکه آن `if` را اضافه کنم، باید از خودم بپرسم آیا LSP را شکسته‌ام؟"**

و این دقیقاً همان نقطه‌ای است که **SOLID از یک سری قانون حفظی، تبدیل به ابزار طراحی واقعی می‌شود.**
