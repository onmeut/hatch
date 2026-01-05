"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Tables } from "@/types/database";

type Profile = Tables<"profiles">;

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [profile, setProfile] = useState({
    email: "",
    full_name: "",
    avatar_url: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        const data = profileData as Profile;
        setProfile({
          email: data.email,
          full_name: data.full_name || "",
          avatar_url: data.avatar_url || "",
        });
      } else {
        setProfile({
          email: user.email || "",
          full_name: "",
          avatar_url: "",
        });
      }
      setIsFetching(false);
    };

    fetchProfile();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name || null,
          avatar_url: profile.avatar_url || null,
        } as never)
        .eq("id", user.id);

      if (error) {
        toast.error("یه مشکلی پیش اومد");
        return;
      }

      toast.success("پروفایلت بروز شد! ✨");
      router.refresh();
    } catch {
      toast.error("یه مشکلی پیش اومد");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (isFetching) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-20 text-center text-muted-foreground">
            در حال بارگذاری...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials(profile.full_name, profile.email)}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">پروفایل</CardTitle>
          <CardDescription>اطلاعات حسابت رو ویرایش کن</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                dir="ltr"
                className="text-left bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                ایمیل قابل تغییر نیست
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">نام کامل</Label>
              <Input
                id="full_name"
                placeholder="اسمت رو وارد کن"
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar_url">لینک عکس پروفایل</Label>
              <Input
                id="avatar_url"
                type="url"
                placeholder="https://..."
                value={profile.avatar_url}
                onChange={(e) =>
                  setProfile({ ...profile, avatar_url: e.target.value })
                }
                dir="ltr"
                className="text-left"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "صبر کن..." : "ذخیره تغییرات"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

