import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import {
  Tables,
  CITIES,
  CATEGORIES,
  CATEGORY_ICONS,
  CityType,
  CategoryType,
} from "@/types/database";
import { Icons } from "@/components/icons";

type Event = Tables<"events">;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: eventsData } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true })
    .limit(6);

  const events = (eventsData || []) as Event[];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 flex items-center justify-center gap-2">
            <Icons.Rocket className="h-8 w-8 text-primary" />
            رویدادت رو با <span className="text-primary">هاچ</span> بساز
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            یه پلتفرم ساده برای ساختن رویداد و دعوت کردن دوستات. بدون پیچیدگی،
            فقط رویداد بساز و لینکش رو بفرست!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events/new">
              <Button size="lg" className="text-lg px-8">
                ساخت رویداد جدید
              </Button>
            </Link>
            <Link href="/events">
              <Button size="lg" variant="outline" className="text-lg px-8">
                مشاهده رویدادها
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">
            دنبال چه نوع رویدادی هستی؟
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(CATEGORIES).map(([key, label]) => (
              <Link key={key} href={`/events?category=${key}`}>
                <Badge
                  variant="outline"
                  className="text-base py-2 px-4 cursor-pointer hover:bg-secondary transition-colors"
                >
                  {CATEGORY_ICONS[key as CategoryType]} {label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-12">
            چرا هاچ؟ <Icons.Sparkles className="inline h-5 w-5 text-primary" />
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Icons.Sparkles className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h3 className="text-lg font-semibold mb-2">سریع و ساده</h3>
              <p className="text-muted-foreground">
                تو چند ثانیه رویدادت رو بساز و لینکش رو با بقیه به اشتراک بذار
              </p>
            </div>
            <div className="text-center p-6">
              <Icons.Ticket className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h3 className="text-lg font-semibold mb-2">بلیط‌های متنوع</h3>
              <p className="text-muted-foreground">
                بلیط رایگان، پولی یا VIP بساز و ظرفیت هر کدوم رو جدا مشخص کن
              </p>
            </div>
            <div className="text-center p-6">
              <Icons.Users className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h3 className="text-lg font-semibold mb-2">مدیریت آسان</h3>
              <p className="text-muted-foreground">
                ببین چند نفر ثبت‌نام کردن و رویدادت رو راحت مدیریت کن
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Events Section */}
      {events.length > 0 && (
        <section className="py-16 px-4">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">رویدادهای اخیر</h2>
              <Link href="/events">
                <Button variant="ghost">مشاهده همه ←</Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link href={`/${event.slug}`} key={event.id}>
                  <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer overflow-hidden">
                    {event.cover_image && (
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img
                          src={event.cover_image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        {event.city && (
                          <Badge variant="secondary" className="text-xs">
                            {CITIES[event.city as CityType]}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {CATEGORY_ICONS[event.category as CategoryType]}{" "}
                          {CATEGORIES[event.category as CategoryType]}
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-2 text-lg">
                        {event.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Icons.CalendarDays className="h-4 w-4" />
                        <span>{formatDate(event.date)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {event.location_type === "online" ? (
                            <>
                              <Icons.Globe className="h-4 w-4" />
                              آنلاین
                            </>
                          ) : (
                            <>
                              <Icons.MapPin className="h-4 w-4" />
                              حضوری
                            </>
                          )}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    {event.description && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 text-center bg-secondary/30">
        <div className="container">
          <h2 className="text-3xl font-bold mb-4">
            آماده‌ای شروع کنی؟ <Icons.Rocket className="inline h-6 w-6" />
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            همین الان اولین رویدادت رو بساز و لینکش رو با دوستات به اشتراک بذار
          </p>
          <Link href="/events/new">
            <Button size="lg" className="text-lg px-10">
              شروع کن
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
