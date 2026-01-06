"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "./icons";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/types/database";

type Profile = Tables<"profiles">;

interface AppSidebarProps {
  user: User | null;
  userProfile?: Profile | null;
}

const navigationItems = [
  {
    title: "صفحه اصلی",
    icon: Icons.Rocket,
    href: "/",
  },
  {
    title: "رویدادها",
    icon: Icons.CalendarDays,
    href: "/events",
  },
];

const userNavigationItems = [
  {
    title: "داشبورد",
    icon: Icons.LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "ساخت رویداد",
    icon: Icons.PlusCircle,
    href: "/events/new",
  },
  {
    title: "پروفایل",
    icon: Icons.User,
    href: "/profile",
  },
];

export function AppSidebar({ user, userProfile }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("خداحافظ! 👋");
    router.push("/");
    router.refresh();
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const nameParts = name.split(" ");
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getDisplayName = (name: string | null, email: string) => {
    if (name) {
      return name.length > 20 ? name.slice(0, 20) + "..." : name;
    }
    const username = email.split("@")[0];
    return username.length > 15 ? username.slice(0, 15) + "..." : username;
  };

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" dir="rtl">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Icons.Rocket className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none text-right">
                  <span className="font-semibold">هاچ</span>
                  <span className="text-xs text-muted-foreground">
                    پلتفرم مدیریت رویداد
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>منو اصلی</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Navigation - Only show if user is logged in */}
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>حساب کاربری</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userNavigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                      >
                        <Link href={item.href} className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    dir="rtl"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                        {getInitials(userProfile?.full_name || null, user.email || "کا")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-right text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {getDisplayName(userProfile?.full_name || null, user.email || "")}
                      </span>
                      <span className="truncate text-xs text-muted-foreground" dir="ltr">
                        {user.email}
                      </span>
                    </div>
                    <Icons.ChevronsUpDown className="mr-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="top"
                  align="end"
                  sideOffset={4}
                  dir="rtl"
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-right" dir="rtl">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                          {getInitials(userProfile?.full_name || null, user.email || "کا")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-right text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {userProfile?.full_name || user.email?.split("@")[0] || "کاربر"}
                        </span>
                        <span className="truncate text-xs text-muted-foreground" dir="ltr">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer flex items-center gap-2">
                        <Icons.LayoutDashboard className="ml-auto" />
                        <span>داشبورد</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/events/new" className="cursor-pointer flex items-center gap-2">
                        <Icons.PlusCircle className="ml-auto" />
                        <span>ساخت رویداد</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer flex items-center gap-2">
                        <Icons.User className="ml-auto" />
                        <span>پروفایل من</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    variant="destructive"
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <Icons.LogOut className="ml-auto" />
                    <span>خروج از حساب</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton asChild>
                <Link href="/auth/login">
                  <Icons.User className="h-4 w-4" />
                  <span>ورود / ثبت‌نام</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
