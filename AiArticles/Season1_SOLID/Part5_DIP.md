# جلسه پنجم: Dependency Inversion Principle (DIP)

> **SOLID — اصل پنجم**

**توجه: این مقاله با کمک ChatGPT نوشته شده و برای انتشار ویرایش شده است.**

---

## 1. مقدمه

در چهار جلسه قبل، مسئولیت کلاس‌ها، توسعه‌پذیری، جایگزینی پیاده‌سازی‌ها و طراحی Interfaceهای کوچک را بررسی کردیم. اصل پنجم به یک سؤال معماری می‌پردازد:

**منطق اصلی سیستم به چه چیزی وابسته است و چه کسی قرارداد این وابستگی را تعریف می‌کند؟**

DIP کمک می‌کند سیاست‌های کسب‌وکار از جزئیات فنی مانند پایگاه داده، ارسال ایمیل و سرویس‌های خارجی جدا بمانند.

---

## 2. تعریف DIP

تعریف مفهومی اصل وارونگی وابستگی:

- ماژول‌های سطح بالا نباید به ماژول‌های سطح پایین وابسته باشند؛ هر دو باید به انتزاع‌ها وابسته باشند.
- انتزاع‌ها نباید به جزئیات وابسته باشند؛ جزئیات باید قرارداد انتزاع‌ها را پیاده‌سازی کنند.

انتزاع می‌تواند یک Interface، کلاس انتزاعی یا قرارداد مناسب دیگری باشد. هدف، افزایش تعداد Interfaceها نیست؛ هدف، کنترل جهت وابستگی است.

## 3. سطح بالا و سطح پایین یعنی چه؟

در یک سیستم سفارش، تصمیم درباره ثبت سفارش و قواعد اعتبارسنجی در سطح بالاتر قرار دارد. ذخیره‌سازی در SQL Server یا ارسال ایمیل با SMTP جزئیات فنی اجرای این تصمیم‌ها هستند.

```text
High-level policy: OrderService

Low-level details:
    SqlServerOrderRepository
    SmtpEmailSender
    RedisCache
```

این تقسیم‌بندی نسبی است؛ «سطح پایین» به معنی کم‌اهمیت بودن نیست. مسئله این است که تغییر یک جزئیات فنی نباید بی‌دلیل منطق اصلی را مجبور به تغییر کند.

---

## 4. مثال وابستگی مستقیم

در این نمونه آموزشی، `OrderService` خودش پیاده‌سازی ذخیره‌سازی را انتخاب و ایجاد می‌کند:

```csharp
public class OrderService
{
    private readonly SqlServerOrderRepository repository = new();

    public void Save(Order order)
    {
        repository.Save(order);
    }
}
```

```text
OrderService ----depends on----> SqlServerOrderRepository
```

جایگزینی ذخیره‌ساز یا تست منطق سرویس بدون SQL Server دشوار می‌شود، چون انتخاب فناوری داخل مصرف‌کننده قرار گرفته است.

## 5. طراحی با یک قرارداد

قرارداد زیر در لایه Application تعریف می‌شود؛ یعنی جایی که به ذخیره‌سازی سفارش نیاز دارد:

```csharp
public interface IOrderRepository
{
    void Save(Order order);
}

public class OrderService
{
    private readonly IOrderRepository repository;

    public OrderService(IOrderRepository repository)
    {
        this.repository = repository;
    }

    public void Save(Order order)
    {
        repository.Save(order);
    }
}
```

پیاده‌سازی SQL در Infrastructure قرار می‌گیرد:

```csharp
public class SqlServerOrderRepository : IOrderRepository
{
    public void Save(Order order)
    {
        // اجرای عملیات ذخیره‌سازی با دسترسی واقعی به پایگاه داده
    }
}
```

بدنه ذخیره‌سازی در این مثال عمداً حذف شده تا جهت وابستگی روشن بماند؛ این قطعه به‌تنهایی داده‌ای ذخیره نمی‌کند.

```text
OrderService ----> IOrderRepository <---- SqlServerOrderRepository
```

اکنون قرارداد نیاز مصرف‌کننده را بیان می‌کند و پیاده‌سازی باید با آن سازگار شود.

## 6. چرا Inversion؟

در طراحی اولیه، منطق سفارش مستقیماً پیاده‌سازی ذخیره‌سازی را می‌شناخت. اکنون Infrastructure قرارداد تعریف‌شده در لایه داخلی را می‌شناسد. وارونگی مربوط به **وابستگی کد و پروژه‌ها** است؛ در زمان اجرا هنوز متد پیاده‌سازی ذخیره‌سازی فراخوانی می‌شود.

---

## 7. تفاوت DIP، DI و DI Container

**DIP یک اصل طراحی است:** جهت وابستگی‌ها را به سمت قراردادهای مناسب هدایت می‌کند.

**Dependency Injection یک تکنیک است:** وابستگی از بیرون به شیء داده می‌شود.

**DI Container یک ابزار است:** ایجاد اشیا و اتصال وابستگی‌ها را مدیریت می‌کند.

اتصال دستی در محل راه‌اندازی برنامه:

```csharp
var repository = new SqlServerOrderRepository();
var service = new OrderService(repository);
```

این مثال بدون Container است، اما همچنان **Constructor Injection** دارد. بنابراین عبارت دقیق «DIP بدون DI Container» است، نه «بدون DI».

در ASP.NET Core می‌توان همین اتصال را با Container انجام داد:

```csharp
builder.Services.AddScoped<IOrderRepository, SqlServerOrderRepository>();
builder.Services.AddScoped<OrderService>();
```

از طرف دیگر، تزریق یک کلاس concrete به سازنده به‌تنهایی اثبات نمی‌کند که DIP رعایت شده است. انتخاب قرارداد و محل تعریف آن همچنان اهمیت دارد.

## 8. مالک قرارداد کیست؟

اگر `IOrderRepository` داخل پروژه Infrastructure باشد و Application برای استفاده از آن به Infrastructure ارجاع بدهد، صرف وجود Interface جهت وابستگی را اصلاح نکرده است.

```text
Application
    IOrderRepository
    OrderService

Infrastructure
    SqlServerOrderRepository : IOrderRepository
```

در این طراحی، قرارداد از نیاز مصرف‌کننده می‌آید. بعضی قراردادهای دامنه می‌توانند در Domain قرار بگیرند؛ محل دقیق به مسئولیت قرارداد بستگی دارد.

قرارداد نیز باید زبان نیاز را بیان کند. مثلاً `IOrderStore` معمولاً مرز مناسب‌تری از قراردادی است که `SqlConnection` یا نوع اختصاصی SDK را به منطق اصلی تحویل می‌دهد.

---

## 9. جهت وابستگی با جریان اجرا فرق دارد

در یک درخواست ممکن است چنین فراخوانی‌هایی رخ دهند:

```text
API -> OrderService -> repository implementation -> database
```

اما ارجاع پروژه‌ها می‌تواند این‌گونه باشد:

```text
Api ------------> Application
Api ------------> Infrastructure   (composition root)
Infrastructure -> Application
Infrastructure -> Domain
Application ----> Domain
```

**فلش در این نمودار یعنی «به آن پروژه وابسته است».**

Domain به Application یا Infrastructure ارجاع ندارد. API در محل اتصال اجزا، پیاده‌سازی Infrastructure را می‌شناسد تا آن را به قرارداد Application متصل کند.

پس فراخوانی یک پیاده‌سازی بیرونی در زمان اجرا با وابستگی کد به قرارداد داخلی تناقض ندارد. این تمایز در توضیح معماری بسیار مهم است.

## 10. ارتباط با Clean، Onion و Hexagonal Architecture

این معماری‌ها با تفاوت‌هایی در اصطلاحات و سازمان‌دهی، بر محافظت از منطق اصلی در برابر جزئیات بیرونی تأکید می‌کنند.

در Hexagonal Architecture، قرارداد تعامل با بیرون را Port و اتصال آن به فناوری مشخص را Adapter می‌نامیم:

```text
OrderService ----> IOrderRepository (Port)
                          ^
                          |
              SqlServerOrderRepository (Adapter)
```

یک بررسی مفید این است که پروژه Domain بدون پروژه Infrastructure قابل کامپایل باشد. این به معنی اجرای کامل برنامه بدون هیچ پیاده‌سازی نیست؛ برای اجرای واقعی همچنان باید وابستگی‌ها را در محل راه‌اندازی متصل کنیم.

---

## 11. تست‌پذیری

برای تست منطق سفارش می‌توان یک Fake ساده به سرویس داد:

```csharp
public class FakeOrderRepository : IOrderRepository
{
    public Order? SavedOrder { get; private set; }

    public void Save(Order order)
    {
        SavedOrder = order;
    }
}
```

در تست، پس از فراخوانی `Save` می‌توان بررسی کرد سفارش مورد انتظار به Repository داده شده است. برای چنین آزمونی نیازی به SQL Server نیست.

اما Fake صحت Query، Mapping، تراکنش یا رفتار واقعی پایگاه داده را ثابت نمی‌کند. این موارد به تست Integration نیاز دارند. نیاز به پایگاه داده در یک تست Integration نشانه نقض DIP نیست.

## 12. کاربرد در ایمیل، پرداخت و AI

DIP محدود به Database نیست. ارسال پیام، درگاه پرداخت و ارائه‌دهنده مدل زبانی نیز می‌توانند پشت قرارداد قرار بگیرند:

```csharp
public interface IChatModel
{
    Task<string> GenerateAsync(
        string prompt,
        CancellationToken cancellationToken = default);
}
```

Adapterهای مختلف می‌توانند این قرارداد را پیاده کنند، بدون اینکه مصرف‌کننده مستقیماً به SDK آن‌ها وابسته شود.

این مرزبندی هزینه تغییر ارائه‌دهنده را کاهش می‌دهد، ولی تضمین نمی‌کند مهاجرت فقط با تعویض یک کلاس تمام شود. تفاوت کیفیت پاسخ، محدودیت‌ها، streaming و قابلیت ابزارها ممکن است تغییر قرارداد یا آزمون‌های رفتاری را ضروری کند. قرارداد باید نیاز واقعی برنامه را پوشش دهد.

---

## 13. Domain Model و Attributeهای EF

در گفت‌وگوی این جلسه، سؤال مهم دیگری مطرح شد: آیا قرار دادن Attributeهای ذخیره‌سازی روی Domain Model مناسب است؟

نمونه معتبر از نظر محل Attributeها:

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("Customer")]
public class Customer
{
    [Key]
    public int Id { get; set; }
}
```

`Table` روی کلاس و `Key` روی property قرار می‌گیرد. این دو از فضای نام‌های DataAnnotations هستند و لزوماً وابستگی مستقیم به اسمبلی EF ایجاد نمی‌کنند. با این حال، اطلاعات Persistence را وارد مدل کرده‌اند.

در طراحی‌ای که Domain باید از نگاشت پایگاه داده بی‌خبر بماند، می‌توان این اطلاعات را با Fluent API به Infrastructure برد:

```csharp
// Domain
public class Customer
{
    public int Id { get; private set; }
    public string Name { get; private set; }

    public Customer(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        Name = name;
    }
}
```

```csharp
// Infrastructure
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customer");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
    }
}
```

Configuration باید در DbContext نیز اعمال شود:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);
    modelBuilder.ApplyConfiguration(new CustomerConfiguration());
}
```

این جداسازی برای حفظ استقلال Domain مفید است. در یک CRUD ساده، DataAnnotations می‌تواند انتخاب قابل قبولی باشد؛ استفاده از آن را نباید بدون توجه به هدف معماری، همیشه اشتباه دانست. همچنین اگر محدودیت طول نام یک قاعده کسب‌وکار است، باید در منطق Domain هم اعمال شود؛ تنظیم Mapping جای اعتبارسنجی دامنه را نمی‌گیرد.

توضیح منشأ Attributeها و روش‌های پیکربندی در [مستندات Mapping Attributes](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/mapping-attributes) و [پیکربندی مدل EF Core](https://learn.microsoft.com/en-us/ef/core/modeling/) آمده است.

---

## 14. اشتباه‌های رایج

### ساخت Interface برای تمام کلاس‌ها

داشتن تنها یک پیاده‌سازی، Interface را بی‌فایده نمی‌کند؛ ممکن است مرز معماری یا تست را حفظ کند. اما ساخت خودکار Interface برای هر کلاس نیز تضمین DIP نیست. هر انتزاع باید دلیل مشخصی داشته باشد.

### پنهان کردن وابستگی با Service Locator

```csharp
var repository = serviceProvider.GetRequiredService<IOrderRepository>();
```

اگر این کد داخل منطق سرویس پخش شود، نیازهای کلاس از سازنده مشخص نیستند. تزریق از طریق سازنده معمولاً وابستگی‌های ضروری را شفاف‌تر می‌کند. استفاده از Container در محل اتصال اجزا موضوع متفاوتی است.

### سازنده با وابستگی‌های فراوان

تعداد زیاد وابستگی‌ها می‌تواند نشانه مسئولیت‌های زیاد باشد. قبل از پنهان کردن آن‌ها در یک wrapper یا Service Locator، مسئولیت کلاس را بررسی کن. [راهنمای DI در .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines) نیز به این نشانه اشاره می‌کند.

### انتزاعی که جزئیات را نشت می‌دهد

اگر قرارداد به نوع اختصاصی Database یا SDK وابسته باشد، مصرف‌کننده همچنان آن فناوری را می‌شناسد. نام Interface به‌تنهایی مرز ایجاد نمی‌کند.

### تعمیم بیش از حد

هر چیزی که تغییر می‌کند الزاماً «جزئیات سطح پایین» نیست؛ قواعد کسب‌وکار هم تغییر می‌کنند. معیار اصلی، نقش آن بخش در سیاست و سازوکار سیستم است. انتزاع را در مرزی بساز که استقلال، تست‌پذیری یا جایگزینی ارزش مشخصی ایجاد می‌کند.

---

## 15. ارتباط LSP، ISP و DIP

- **LSP:** پیاده‌سازی‌ها باید قرارداد رفتاری را رعایت کنند تا قابل جایگزینی باشند.
- **ISP:** قرارداد باید متناسب با نیاز مصرف‌کننده باشد.
- **DIP:** وابستگی منطق اصلی باید به این قرارداد مناسب باشد، نه به جزئیات پیاده‌سازی.

اگر Adapter جدید از نظر امضا سازگار باشد ولی معنای عملیات را عوض کند، صرف رعایت شکل Interface کافی نیست.

## 16. پرسش‌هایی برای بازبینی طراحی

- آیا منطق اصلی مستقیماً به فناوری بیرونی وابسته است؟
- آیا قرارداد زبان نیاز مصرف‌کننده را بیان می‌کند؟
- آیا قرار دادن Interface در پروژه فعلی، جهت وابستگی را درست نگه می‌دارد؟
- آیا منطق کسب‌وکار را می‌توان با Fake مناسب تست کرد؟
- آیا اتصال پیاده‌سازی‌ها در محل راه‌اندازی متمرکز است؟
- آیا این انتزاع منفعت مشخصی دارد یا فقط فایل جدید ایجاد کرده است؟

## 17. جمع‌بندی SOLID

**SRP:** یک دلیل منسجم برای تغییر.

**OCP:** امکان توسعه رفتار از مرزهای مناسب.

**LSP:** جایگزینی بدون شکستن قرارداد رفتاری.

**ISP:** قرارداد متناسب با نیاز مصرف‌کننده.

**DIP:** وابستگی سیاست‌ها به انتزاع و وابستگی جزئیات به همان قرارداد.

سه نکته مهم این جلسه:

1. جریان فراخوانی در زمان اجرا با جهت وابستگی کد یکسان نیست.
2. DI Container ابزار اتصال است؛ معماری از محل و معنای قراردادها می‌آید.
3. هدف SOLID مدیریت تغییر و وابستگی است؛ پیچیدگی بدون منفعت، نشانه اجرای موفق این اصول نیست.

برای مطالعه بیشتر درباره جهت وابستگی‌ها، [اصول معماری در مستندات .NET](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles) را ببینید.
