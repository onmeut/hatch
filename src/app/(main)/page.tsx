import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";

export default async function HomePage() {
  const features = [
    {
      icon: Icons.PlusCircle,
      title: "ساخت آسان رویداد",
      description: "در چند دقیقه رویداد خودت رو بساز و با دوستات به اشتراک بذار",
    },
    {
      icon: Icons.Users,
      title: "مدیریت شرکت‌کنندگان",
      description: "لیست شرکت‌کنندگان رو مدیریت کن و از وضعیت ثبت‌نام‌ها باخبر شو",
    },
    {
      icon: Icons.Ticket,
      title: "صدور بلیط",
      description: "برای هر شرکت‌کننده بلیط منحصربفرد صادر کن با کد QR اختصاصی",
    },
    {
      icon: Icons.LayoutDashboard,
      title: "داشبورد مدیریتی",
      description: "همه رویدادهات رو در یک جا مدیریت کن و آمار کامل دریافت کن",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
          <Icons.Rocket className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold">
          پلتفرم مدیریت رویداد
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          یه پلتفرم ساده برای ساختن رویداد و دعوت کردن دوستات. بدون پیچیدگی،
          فقط رویداد بساز و لینکش رو بفرست!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/events/new">
            <Button size="lg" className="text-lg px-8">
              <Icons.PlusCircle className="mr-2 h-5 w-5" />
              ساخت رویداد
            </Button>
          </Link>
          <Link href="/events">
            <Button size="lg" variant="outline" className="text-lg px-8">
              <Icons.CalendarDays className="mr-2 h-5 w-5" />
              مشاهده رویدادها
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">امکانات</h2>
          <p className="text-muted-foreground">
            همه چیزی که برای مدیریت رویداد نیاز داری
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-4 py-12">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">
              آماده‌ای رویدادت رو بسازی؟
            </CardTitle>
            <CardDescription className="text-lg">
              همین الان شروع کن و اولین رویدادت رو بساز
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/events/new">
              <Button size="lg" className="text-lg px-12">
                شروع کنید
                <Icons.ChevronLeft className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
