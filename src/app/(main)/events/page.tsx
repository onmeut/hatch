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
import { Icons, CategoryIcon, CityIcon } from "@/components/icons";

type Event = Tables<"events">;

interface EventsPageProps {
  searchParams: Promise<{ category?: string; city?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  if (params.category) {
    query = query.eq("category", params.category);
  }

  if (params.city) {
    query = query.eq("city", params.city);
  }

  const { data: eventsData } = await query;
  const events = (eventsData || []) as Event[];

  // Get event counts for each category
  const categoryCounts: Record<CategoryType, number> = {} as Record<
    CategoryType,
    number
  >;
  for (const category of Object.keys(CATEGORIES) as CategoryType[]) {
    const { count } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("category", category);
    categoryCounts[category] = count || 0;
  }

  // Get event counts for each city
  const cityCounts: Record<CityType, number> = {} as Record<CityType, number>;
  for (const city of Object.keys(CITIES) as CityType[]) {
    const { count } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("city", city);
    cityCounts[city] = count || 0;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const activeCategory = params.category as CategoryType | undefined;
  const activeCity = params.city as CityType | undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">رویدادها</h1>
        <p className="text-muted-foreground text-base">
          رویدادهای محبوب نزدیک خودت رو ببین، بر اساس دسته‌بندی جستجو کن یا
          تقویم‌های عالی جامعه رو بررسی کن
        </p>
      </div>
      {/* Browse by Category Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">موضوعات</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(CATEGORIES).map(([key, label]) => {
            const category = key as CategoryType;
            const count = categoryCounts[category];
            const isActive = activeCategory === category;

            return (
              <Link
                key={key}
                href={`/events?category=${key}${
                  activeCity ? `&city=${activeCity}` : ""
                }`}
              >
                <Card
                  className={`h-fit py-0 hover:shadow-lg transition-all cursor-pointer ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-[5px]">
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <CategoryIcon category={category} className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-0.5">{label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCount(count)} رویداد
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Events List Header */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">تمام رویدادها</h2>
        {/* Active Filters Display */}
        {(activeCategory || activeCity) && (
          <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">فیلترها:</span>
          {activeCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CategoryIcon category={activeCategory} className="h-3 w-3" />
              {CATEGORIES[activeCategory]}
            </Badge>
          )}
          {activeCity && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CityIcon city={activeCity} className="!p-1.5" />
              {CITIES[activeCity]}
            </Badge>
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
            <Link href={`/${event.slug}`} key={event.id}>
              <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer overflow-hidden gap-0 py-0">
                {event.cover_image && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={event.cover_image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pt-5 pb-5">
                  <div className="flex items-center gap-2">
                    {event.city && (
                      <Badge variant="secondary" className="text-xs">
                        {CITIES[event.city as CityType]}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="text-xs flex items-center gap-1"
                    >
                      <CategoryIcon
                        category={event.category as CategoryType}
                        className="h-3 w-3"
                      />
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

      {/* Cities Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">شهرها</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Object.entries(CITIES).map(([key, label]) => {
            const city = key as CityType;
            const count = cityCounts[city];
            const isActive = activeCity === city;

            return (
              <Link
                key={key}
                href={`/events?city=${key}${
                  activeCategory ? `&category=${activeCategory}` : ""
                }`}
              >
                <Card
                  className={`h-fit py-0 border-0 hover:shadow-lg transition-all cursor-pointer text-right ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                >
                  <CardContent className="p-0 flex flex-row items-center gap-3 text-right">
                    <CityIcon city={city} />
                    <div className="text-right">
                      <h3 className="font-bold text-lg mb-1">{label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCount(count)} رویداد
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
