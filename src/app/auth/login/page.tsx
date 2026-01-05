"use client";

import { Suspense, useState } from "react";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icons } from "@/components/icons";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const supabase = createClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        toast.error("خطا در ارسال کد", {
          description: error.message,
        });
        return;
      }

      toast.success("کد تأیید ارسال شد!", {
        description: "ایمیلت رو چک کن 📧",
      });
      setShowOtpInput(true);
    } catch {
      toast.error("یه مشکلی پیش اومد، دوباره امتحان کن");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        toast.error("کد اشتباهه", {
          description: "دوباره امتحان کن",
        });
        return;
      }

      toast.success("خوش اومدی! 🎉");
      router.push(redirect);
      router.refresh();
    } catch {
      toast.error("یه مشکلی پیش اومد، دوباره امتحان کن");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Icons.Rocket className="mx-auto mb-4 h-10 w-10 text-primary" />
        <CardTitle className="text-2xl">ورود به هچ</CardTitle>
        <CardDescription>
          {showOtpInput
            ? "کدی که بهت ایمیل کردیم رو وارد کن"
            : "با ایمیلت وارد شو یا ثبت‌نام کن"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showOtpInput ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                className="text-left"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "صبر کن..." : "ارسال کد تأیید"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label>کد تأیید</Label>
              <div className="flex justify-center" dir="ltr">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "صبر کن..." : "تأیید و ورود"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setShowOtpInput(false);
                setOtp("");
              }}
            >
              تغییر ایمیل
            </Button>
          </form>
        )}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary underline">
            برگشت به صفحه اصلی
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardContent className="py-20 text-center text-muted-foreground">
              در حال بارگذاری...
            </CardContent>
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
