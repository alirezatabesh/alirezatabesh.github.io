# جلسه چهارم: Interface Segregation Principle (ISP)

> **SOLID — اصل چهارم**

**توجه: این مقاله به کمک نسخه رایگان ChatGPT نوشته شده است.**

---

## 1. مقدمه

تا اینجا در SOLID با سه اصل آشنا شدیم:

- **SRP — Single Responsibility Principle**
- **OCP — Open/Closed Principle**
- **LSP — Liskov Substitution Principle**
- **ISP — Interface Segregation Principle** ← موضوع این جلسه

ISP یکی از اصولی است که در ابتدا ساده به نظر می‌رسد، اما در طراحی Interface، API، سرویس‌ها، Dependency Injection و معماری سیستم اهمیت زیادی پیدا می‌کند.

---

# 2. تعریف ISP

تعریف معروف Robert C. Martin:

> **Clients should not be forced to depend upon interfaces that they do not use.**

ترجمه مفهومی:

> هیچ Clientای نباید مجبور شود به Interfaceهایی وابسته باشد که از آن‌ها استفاده نمی‌کند.

یا ساده‌تر:

> **Interfaceها را بر اساس نیاز مصرف‌کننده طراحی کن، نه بر اساس تمام قابلیت‌های ارائه‌دهنده.**

---

# 3. مثال ساده

فرض کنیم چنین Interfaceای داریم:

```csharp
public interface IWorker
{
    void Work();
    void Eat();
    void Sleep();
}
```

برای انسان مشکلی وجود ندارد:

```csharp
public class Human : IWorker
{
    public void Work()
    {
    }

    public void Eat()
    {
    }

    public void Sleep()
    {
    }
}
```

اما Robot چه؟

```csharp
public class Robot : IWorker
{
    public void Work()
    {
    }

    public void Eat()
    {
        throw new NotImplementedException();
    }

    public void Sleep()
    {
        throw new NotImplementedException();
    }
}
```

از نظر Compiler مشکلی وجود ندارد، اما از نظر طراحی مشکل داریم.

Robot به متدهایی وابسته شده که اصلاً به آن‌ها نیاز ندارد.

این یک نمونه کلاسیک از نقض ISP است.

---

# 4. راه‌حل: Segregation

Interface بزرگ را به چند Interface کوچک‌تر تقسیم می‌کنیم:

```csharp
public interface IWorkable
{
    void Work();
}

public interface IEatable
{
    void Eat();
}

public interface ISleepable
{
    void Sleep();
}
```

حالا:

```csharp
public class Human :
    IWorkable,
    IEatable,
    ISleepable
{
    public void Work()
    {
    }

    public void Eat()
    {
    }

    public void Sleep()
    {
    }
}
```

و Robot فقط چیزی را پیاده می‌کند که واقعاً لازم دارد:

```csharp
public class Robot : IWorkable
{
    public void Work()
    {
    }
}
```

---

# 5. Fat Interface

به Interfaceهای بزرگی که قابلیت‌های نامرتبط زیادی را در خود جمع کرده‌اند، معمولاً **Fat Interface** گفته می‌شود.

مثلاً:

```csharp
public interface IRepository
{
    void Add();

    void Update();

    void Delete();

    IEnumerable GetAll();

    void ExportExcel();

    void ExportPdf();

    void SendEmail();

    void Print();

    void Archive();

    void Compress();
}
```

مشکل این Interface این است که هر Client مجبور است به مجموعه بزرگی از قابلیت‌ها وابسته باشد.

بهتر است مسئولیت‌ها و نیازهای Clientها را بررسی کنیم و Interfaceهای کوچک‌تر بسازیم.

---

# 6. Interface را برای Consumer طراحی کن

یکی از مهم‌ترین نکات حرفه‌ای ISP این است:

> Interface را برای Producer طراحی نکن؛ برای Consumer طراحی کن.

اشتباه رایج:

```csharp
public interface IRepository
{
    Add();
    Update();
    Delete();
    Get();
    Export();
}
```

سؤال اشتباه:

> Repository چه کارهایی می‌تواند انجام دهد؟

سؤال بهتر:

> Client من دقیقاً چه چیزی از Repository نیاز دارد؟

مثلاً LoginService فقط به خواندن User نیاز دارد:

```csharp
public interface IUserReader
{
    User GetById(int id);
}
```

و:

```csharp
public class LoginService
{
    private readonly IUserReader _reader;

    public LoginService(IUserReader reader)
    {
        _reader = reader;
    }
}
```

حالا LoginService هیچ اطلاعی از قابلیت‌هایی مانند Delete یا Update ندارد.

---

# 7. ISP فقط درباره keyword `interface` نیست

گاهی تصور می‌شود ISP فقط درباره Interfaceهای زبان است.

اما مفهوم عمیق‌تر است.

مثلاً:

```csharp
public class CustomerService
{
    public void Create()
    {
    }

    public void Delete()
    {
    }

    public void Export()
    {
    }

    public void Print()
    {
    }

    public void SendSms()
    {
    }
}
```

حتی اگر Interface وجود نداشته باشد، Client ممکن است به یک Contract بسیار بزرگ وابسته شود.

بنابراین ISP را بهتر است یک اصل درباره **Contract و Dependency** بدانیم، نه صرفاً keyword `interface`.

---

# 8. ISP و Dependency Injection

ISP ارتباط نزدیکی با Dependency Injection دارد.

فرض کنیم:

```csharp
public class CustomerService
{
    public CustomerService(IRepository repository)
    {
    }
}
```

اگر IRepository شامل 20 متد باشد ولی CustomerService فقط به `GetById` نیاز داشته باشد، CustomerService به قراردادی بزرگ‌تر از نیاز واقعی خود وابسته شده است.

بهتر:

```csharp
public interface ICustomerReader
{
    Customer GetById(int id);
}
```

و:

```csharp
public class CustomerService
{
    public CustomerService(ICustomerReader reader)
    {
    }
}
```

Dependency اکنون دقیق‌تر است.

---

# 9. ISP و Unit Testing

Interface کوچک، Mock کوچک‌تر و تست ساده‌تر ایجاد می‌کند.

Interface بزرگ:

```csharp
public interface IUserService
{
    void Create();
    void Delete();
    void Update();
    User Get();
    void SendEmail();
    void ExportPdf();
    void Print();
}
```

اگر فقط `Get()` را تست کنیم، باز هم Mock ما به یک Interface بزرگ وابسته است.

اما:

```csharp
public interface IUserReader
{
    User Get();
}
```

هم وابستگی کمتر است و هم تست خواناتر می‌شود.

---

# 10. ISP و Change Isolation

Interface بزرگ باعث می‌شود تغییرات در قسمت‌های مختلف Contract، Clientهای بیشتری را تحت تأثیر قرار دهد.

مثلاً:

```text
IRepository
├── Add
├── Update
├── Delete
└── Get
```

اگر Client فقط `Get` را استفاده کند، تغییرات مربوط به Delete نباید روی آن Client تأثیر بگذارد.

با تفکیک:

```text
IReader
IWriter
IDeleter
```

تغییرات بهتر ایزوله می‌شوند.

این مفهوم را می‌توان **Change Isolation** دانست.

---

# 11. ISP و LSP

ISP و LSP ارتباط مهمی دارند.

وقتی Interface بیش از حد بزرگ باشد، بعضی کلاس‌ها مجبور می‌شوند قابلیت‌هایی را پیاده‌سازی کنند که واقعاً ندارند.

در نتیجه به چیزهایی مثل:

```csharp
throw new NotImplementedException();
```

یا:

```csharp
throw new NotSupportedException();
```

می‌رسیم.

این وضعیت می‌تواند زمینه‌ساز نقض LSP نیز بشود؛ چون Client انتظار دارد قرارداد Interface قابل استفاده باشد، اما بعضی پیاده‌سازی‌ها بخشی از آن را پشتیبانی نمی‌کنند.

---

# 12. ISP و SRP

SRP و ISP مکمل یکدیگرند.

### SRP

تمرکز روی **Class** دارد:

> یک Class نباید چند دلیل برای تغییر داشته باشد.

### ISP

تمرکز روی **Contract و Client Dependency** دارد:

> Client نباید مجبور به وابستگی به قابلیت‌هایی باشد که استفاده نمی‌کند.

پس:

```text
SRP → مسئولیت Class
ISP → اندازه و شکل Contract برای Client
```

---

# 13. ISP و CQRS

یکی از نمونه‌های جالب تفکیک Contract، CQRS است.

به جای یک Service بزرگ:

```text
IOrderService
```

می‌توانیم عملیات خواندن و نوشتن را جدا کنیم:

```text
IOrderQuery
IOrderCommand
```

و حتی در طراحی‌های خاص‌تر:

```text
ICreateOrder
ICancelOrder
IGetOrder
IUpdateOrder
```

هر Client فقط به Capability مورد نیاز خودش وابسته می‌شود.

---

# 14. ISP و Repository

یک Generic Repository رایج:

```csharp
public interface IRepository<T>
{
    void Add(T entity);
    void Update(T entity);
    void Delete(T entity);
    T GetById(int id);
    IEnumerable<T> GetAll();
    bool Exists(int id);
    int Count();
}
```

در نگاه اول خوب به نظر می‌رسد، اما فرض کنیم یک Entity فقط Read-Only است.

در این صورت:

```text
Add
Update
Delete
```

برای آن معنا ندارند.

یک گزینه:

```csharp
public interface IReadRepository<T>
{
    T GetById(int id);
    IEnumerable<T> GetAll();
}
```

و:

```csharp
public interface IWriteRepository<T>
{
    void Add(T entity);
    void Update(T entity);
    void Delete(T entity);
}
```

اما نکته مهم:

> این به معنی آن نیست که هر Repository حتماً باید به ده‌ها Interface تقسیم شود.

تفکیک باید بر اساس نیاز واقعی Clientها انجام شود.

---

# 15. ISP به معنی «هرچه Interface کوچک‌تر، بهتر» نیست

این یک سوءبرداشت مهم است.

ISP نمی‌گوید:

> برای هر متد یک Interface بساز.

مثلاً این طراحی:

```text
IAdd
IUpdate
IDelete
IGet
IPrint
ISendEmail
```

لزومـاً طراحی خوبی نیست.

هدف ISP این است که Interface **Cohesive** باشد؛ یعنی اعضای آن از دید Clientها و یک مفهوم مشخص، به هم مرتبط باشند.

پس:

```text
Small + Cohesive
```

بهتر از:

```text
Tiny + Random
```

است.

---

# 16. Interface کوچک ≠ همیشه طراحی بهتر

گاهی یک Interface نسبتاً بزرگ کاملاً منطقی است.

اگر یک گروه مشخص از Clientها واقعاً به تمام اعضای Interface نیاز دارند، شکستن آن ممکن است فقط پیچیدگی اضافه ایجاد کند.

پس سؤال اصلی:

> آیا Clientها مجبورند به چیزهایی وابسته شوند که استفاده نمی‌کنند؟

اگر جواب «خیر» است، احتمالاً Interface فعلی مشکلی از منظر ISP ندارد.

---

# 17. `NotImplementedException` یک Code Smell مهم است

اگر در چند implementation چنین چیزی می‌بینیم:

```csharp
throw new NotImplementedException();
```

یا:

```csharp
throw new NotSupportedException();
```

باید بررسی کنیم:

> آیا Interface بیش از حد بزرگ است؟

البته هر `NotSupportedException` الزاماً به معنی نقض ISP نیست؛ اما تکرار آن در چند implementation یک علامت هشدار جدی است.

---

# 18. Constructor بزرگ و ISP

گاهی بعد از یادگیری ISP، توسعه‌دهنده برای هر قابلیت یک Interface می‌سازد:

```csharp
public OrderService(
    IUserReader userReader,
    IUserWriter userWriter,
    IOrderReader orderReader,
    IOrderWriter orderWriter,
    IProductReader productReader,
    IProductWriter productWriter,
    IAudit audit,
    ILogger logger,
    IClock clock)
{
}
```

این لزوماً نشانه ISP خوب نیست.

اگر Constructor بیش از حد بزرگ شده، ممکن است مشکل اصلی **SRP** باشد.

یعنی OrderService احتمالاً کارهای زیادی انجام می‌دهد.

بنابراین هنگام مشاهده Dependencyهای زیاد:

```text
اول SRP را بررسی کن
بعد ISP را بررسی کن
```

---

# 19. ISP و API Design

ISP را می‌توان در سطح API نیز مشاهده کرد.

فرض کنیم یک Contract بسیار بزرگ داریم:

```text
CustomerService
├── Register
├── Login
├── ChangePassword
├── UploadAvatar
├── ManageAddress
├── Wallet
├── Notification
└── Reports
```

حتی اگر همه این قابلیت‌ها در یک سیستم منطقی باشند، ممکن است Clientهای مختلف فقط بخش کوچکی از آن را نیاز داشته باشند.

طراحی Contractهای هدفمند می‌تواند Dependency و Coupling را کاهش دهد.

---

# 20. ISP و Microservices

در معماری Microservice نیز مفهوم مشابهی وجود دارد.

یک سرویس بزرگ با API بسیار گسترده ممکن است به یک **Fat Contract** تبدیل شود.

در مقابل، Contractهای هدفمندتر باعث می‌شوند Clientها به Capabilityهای مشخص وابسته باشند.

البته:

> ISP به تنهایی دلیل کافی برای تبدیل یک Service به چند Microservice نیست.

تفکیک Microserviceها تصمیم معماری بسیار بزرگ‌تری است و باید Domain، استقلال Deployment، Data Ownership و سایر عوامل را نیز در نظر گرفت.

---

# 21. ISP و YAGNI

لازم نیست از روز اول برای هر Class یک Interface بسازیم.

مثلاً اگر:

```csharp
public class EmailSender
{
}
```

تنها یک implementation دارد و هیچ نیاز واقعی برای abstraction وجود ندارد، ساختن:

```csharp
IEmailSender
```

فقط به خاطر «SOLID بودن» ممکن است Over Engineering باشد.

ISP درباره طراحی درست Contract است، نه افزایش تعداد Interfaceها.

---

# 22. نشانه‌های رایج نقض ISP

اگر یکی از موارد زیر را زیاد دیدی، بررسی ISP ارزش دارد:

### 1. `NotImplementedException`

```csharp
throw new NotImplementedException();
```

### 2. `NotSupportedException`

```csharp
throw new NotSupportedException();
```

### 3. متدهای بی‌معنی

یک Class متدی دارد که هیچ معنایی برای آن Class ندارد.

### 4. Interface بسیار بزرگ

Interface ده‌ها قابلیت نامرتبط دارد.

### 5. Clientهای مختلف فقط بخش‌های متفاوتی از Interface را استفاده می‌کنند.

### 6. تغییر در یک Capability باعث Recompile یا تغییر تعداد زیادی Client می‌شود.

---

# 23. یک تست ذهنی بسیار مفید

وقتی Interface طراحی می‌کنی، این سؤال را بپرس:

> **اگر این Client فقط دو متد از این Interface را لازم داشته باشد، چرا باید هشت متد دیگر را هم بشناسد؟**

اگر جواب خوبی نداری، احتمالاً Interface باید تفکیک شود.

---

# 24. نکته حرفه‌ای: Interfaceها Intent را منتقل می‌کنند

این:

```csharp
public OrderService(IOrderRepository repository)
```

اطلاعات محدودی به خواننده می‌دهد.

اما:

```csharp
public OrderService(IOrderReader reader)
```

بلافاصله Intent را منتقل می‌کند:

> این Service قرار است Order بخواند.

این یعنی Interface کوچک فقط Coupling را کم نمی‌کند؛ **کد را Self-Documenting** نیز می‌کند.

---

# 25. جمع‌بندی مفهومی

ISP را می‌توان در چند لایه دید:

```text
                  ISP
                   │
        ┌──────────┼──────────┐
        │          │          │
     Contract   Dependency   Client
        │          │          │
     کوچک‌تر     کمتر       دقیق‌تر
        │          │          │
        └──────────┼──────────┘
                   │
             Change Isolation
```

---

# 26. قانون طلایی ISP

به جای اینکه بپرسی:

> این Provider چه قابلیت‌هایی دارد؟

بپرس:

> این Consumer دقیقاً به چه قابلیت‌هایی نیاز دارد؟

این تغییر زاویه دید، قلب ISP است.

---

# 27. جمله‌ای برای به خاطر سپردن

> **ISP یعنی وابستگی‌ها را بر اساس نیاز واقعی مصرف‌کننده طراحی کن، نه بر اساس تمام توانایی‌های ارائه‌دهنده.**

---

# 28. چک‌لیست عملی در پروژه واقعی

قبل از نهایی کردن یک Interface:

- [ ] آیا تمام متدهای آن از نظر مفهومی به هم مرتبط هستند؟
- [ ] آیا همه Clientها واقعاً به همه اعضا نیاز دارند؟
- [ ] آیا implementationها مجبور به `NotImplementedException` شده‌اند؟
- [ ] آیا `NotSupportedException` در چند implementation تکرار شده؟
- [ ] آیا Interface قابلیت‌های نامرتبط زیادی دارد؟
- [ ] آیا Interface را بر اساس نیاز Consumer طراحی کرده‌ام؟
- [ ] آیا شکستن Interface واقعاً ارزش دارد یا فقط پیچیدگی ایجاد می‌کند؟
- [ ] آیا مشکل اصلی در واقع SRP است؟
- [ ] آیا Interface صرفاً به خاطر «داشتن abstraction» ساخته شده است؟

---

# 29. مسیر یادگیری این جلسه

```text
Fat Interface
      ↓
Client مجبور به Dependency می‌شود
      ↓
Interface Segregation
      ↓
Interfaceهای کوچک و Cohesive
      ↓
Dependency کمتر
      ↓
Coupling کمتر
      ↓
Testing ساده‌تر
      ↓
Change Isolation بهتر
```

---

# 30. خلاصه نهایی جلسه

**Interface Segregation Principle** می‌گوید:

> Client نباید مجبور باشد به Interfaceهایی وابسته شود که از آن‌ها استفاده نمی‌کند.

اما برداشت حرفه‌ای‌تر:

> **Contract را از دید Consumer طراحی کن.**

ISP به ما کمک می‌کند:

- Interfaceهای Fat را شناسایی کنیم.
- Dependencyهای غیرضروری را حذف کنیم.
- Mock و Test ساده‌تری داشته باشیم.
- تغییرات را بهتر ایزوله کنیم.
- Intent کد را واضح‌تر کنیم.
- از پیاده‌سازی متدهای بی‌معنی جلوگیری کنیم.
- Contractهای مناسب‌تری در API و معماری ایجاد کنیم.

و مهم‌تر از همه:

> **ISP درباره تعداد Interfaceها نیست؛ درباره کیفیت Dependency بین Client و Contract است.**

---

## ارتباط ISP با اصول قبلی SOLID

| اصل | سؤال اصلی |
|---|---|
| SRP | این Class چند مسئولیت دارد؟ |
| OCP | آیا برای تغییر باید کد موجود را دستکاری کنم؟ |
| LSP | آیا Subtype واقعاً می‌تواند جای Base Type قرار بگیرد؟ |
| ISP | آیا Client به چیزهایی وابسته است که استفاده نمی‌کند؟ |
| DIP | وابستگی‌های سطح بالا به چه چیزی وابسته‌اند؟ |

---

## تمرین پیشنهادی

این Interface را بررسی کن:

```csharp
public interface ICustomerService
{
    Customer GetById(int id);

    void Register(Customer customer);

    void Update(Customer customer);

    void Delete(int id);

    void SendSms(string message);

    void SendEmail(string message);

    byte[] ExportToExcel();

    void GenerateReport();
}
```

سؤالات:

1. آیا این Interface احتمالاً ISP را نقض می‌کند؟
2. چه Clientهایی ممکن است فقط بخشی از آن را استفاده کنند؟
3. چگونه آن را Segregate می‌کنی؟
4. آیا همه متدها واقعاً باید در Interface باشند؟
5. آیا مشکل دیگری مثل SRP نیز وجود دارد؟

این تمرین نقطه خوبی برای تثبیت ISP است.
