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

interface EventsPageProps {
  searchParams: Promise<{ category?: string; city?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("events").select("*").order("date", { ascending: true });

  if (params.category) {
    query = query.eq("category", params.category);
  }

  if (params.city) {
    query = query.eq("city", params.city);
  }

  const { data: eventsData } = await query;
  const events = (eventsData || []) as Event[];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const activeCategory = params.category as CategoryType | undefined;
  const activeCity = params.city as CityType | undefined;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">رویدادها</h1>
          <p className="text-muted-foreground">
            رویدادها رو ببین و تو اونایی که دوست داری ثبت‌نام کن
          </p>
        </div>
        <Link href="/events/new">
          <Button>ساخت رویداد</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        {/* Categories */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            موضوعات
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/events">
              <Badge
                variant={!activeCategory ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
              >
                همه
              </Badge>
            </Link>
            {Object.entries(CATEGORIES).map(([key, label]) => (
              <Link key={key} href={`/events?category=${key}${activeCity ? `&city=${activeCity}` : ""}`}>
                <Badge
                  variant={activeCategory === key ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                >
                  {CATEGORY_ICONS[key as CategoryType]} {label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Cities */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            شهرها
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link href={activeCategory ? `/events?category=${activeCategory}` : "/events"}>
              <Badge
                variant={!activeCity ? "secondary" : "outline"}
                className="cursor-pointer"
              >
                همه شهرها
              </Badge>
            </Link>
            {Object.entries(CITIES).map(([key, label]) => (
              <Link
                key={key}
                href={`/events?city=${key}${activeCategory ? `&category=${activeCategory}` : ""}`}
              >
                <Badge
                  variant={activeCity === key ? "secondary" : "outline"}
                  className="cursor-pointer"
                >
                  {label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(activeCategory || activeCity) && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">فیلترها:</span>
          {activeCategory && (
            <Badge variant="secondary">
              {CATEGORY_ICONS[activeCategory]} {CATEGORIES[activeCategory]}
            </Badge>
          )}
          {activeCity && (
            <Badge variant="secondary">🏙️ {CITIES[activeCity]}</Badge>
          )}
          <Link href="/events">
            <Button variant="ghost" size="sm" className="text-destructive">
              پاک کردن فیلترها
            </Button>
          </Link>
        </div>
      )}

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link href={`/events/${event.id}`} key={event.id}>
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
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl font-semibold mb-2">
            {activeCategory || activeCity
              ? "رویدادی با این فیلتر پیدا نشد"
              : "هنوز رویدادی نیست"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {activeCategory || activeCity
              ? "فیلترها رو عوض کن یا اولین رویداد رو بساز!"
              : "اولین نفری باش که یه رویداد می‌سازه!"}
          </p>
          <div className="flex gap-4 justify-center">
            {(activeCategory || activeCity) && (
              <Link href="/events">
                <Button variant="outline">پاک کردن فیلترها</Button>
              </Link>
            )}
            <Link href="/events/new">
              <Button>ساخت رویداد</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
