import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default async function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 flex items-center justify-center gap-2">
            پلتفرم مدیریت ایونت
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            یه پلتفرم ساده برای ساختن رویداد و دعوت کردن دوستات. بدون پیچیدگی،
            فقط رویداد بساز و لینکش رو بفرست!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events/new">
              <Button size="lg" className="text-lg px-8">
                ساخت رویداد
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
    </div>
  );
}
