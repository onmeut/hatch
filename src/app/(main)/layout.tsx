import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { Tables } from "@/types/database";

type Profile = Tables<"profiles">;

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    userProfile = data;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar user={user} userProfile={userProfile} />
        <SidebarInset className="flex-1 flex flex-col">
          <header
            className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4"
            dir="rtl"
          >
            <SidebarTrigger className="-mr-1" />
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">هاچ</span>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl w-full">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
