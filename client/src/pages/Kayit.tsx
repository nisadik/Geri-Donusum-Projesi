import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { refreshAuth } from "@/hooks/use-auth";
import type { PublicUser, RegisterInput } from "@shared/schema";

export const Kayit = (): JSX.Element => {
  const { toast } = useToast();
  const [form, setForm] = useState<RegisterInput>({
    email: "",
    password: "",
    displayName: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/register", form);
      return (await res.json()) as PublicUser;
    },
    onSuccess: async (user) => {
      await refreshAuth();
      toast({
        title: "Hoş geldin!",
        description: `${user.displayName}, YeşilCepte ailesine katıldın.`,
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Kayıt yapılamadı",
        description: err.message.replace(/^\d+:\s*/, ""),
        variant: "destructive",
      });
    },
  });

  return (
    <main className="app-shell flex flex-col">
      <header className="bg-[#17594a] px-6 pb-8 pt-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d3d04e] text-3xl">
          ♻️
        </div>
        <h1 className="mt-3 [font-family:'Nunito',Helvetica] text-2xl font-bold text-white">
          YeşilCepte'ye Kayıt
        </h1>
        <p className="mt-1 [font-family:'Nunito',Helvetica] text-[12px] text-white/80">
          Birkaç saniyede hesabını oluştur.
        </p>
      </header>

      <section className="flex-1 px-6 py-6">
        <Card className="rounded-2xl border-0 shadow-none">
          <CardContent className="p-4">
            <h2 className="[font-family:'Nunito',Helvetica] text-lg font-bold text-black">
              Kayıt Ol
            </h2>
            <form
              className="mt-4 flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
            >
              <div className="flex flex-col gap-1">
                <Label htmlFor="displayName" className="text-[12px]">
                  Adın
                </Label>
                <Input
                  id="displayName"
                  data-testid="input-display-name"
                  required
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayName: e.target.value }))
                  }
                  placeholder="Ahmet Yılmaz"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="email" className="text-[12px]">
                  E-posta
                </Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="input-email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="ornek@yesilcepte.com"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="password" className="text-[12px]">
                  Şifre
                </Label>
                <Input
                  id="password"
                  type="password"
                  data-testid="input-password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="En az 6 karakter"
                />
              </div>
              <Button
                type="submit"
                data-testid="button-register"
                disabled={mutation.isPending}
                className="mt-2 h-11 rounded-full bg-[#17594a] text-white hover:bg-[#17594a]/90"
              >
                {mutation.isPending ? "Oluşturuluyor..." : "Kayıt Ol"}
              </Button>
            </form>
            <p className="mt-4 text-center [font-family:'Nunito',Helvetica] text-[12px] text-[#4d4d4d]">
              Zaten hesabın var mı?{" "}
              <Link
                href="/giris"
                data-testid="link-to-login"
                className="font-bold text-[#17594a]"
              >
                Giriş Yap
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};
