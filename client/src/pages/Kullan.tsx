import { useMutation, useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Redemption } from "@shared/schema";

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const Kullan = (): JSX.Element => {
  const { toast } = useToast();
  const [, params] = useRoute("/kullan/:code");
  const code = params?.code ?? "";

  const redemptionQuery = useQuery<Redemption>({
    queryKey: ["/api/redemptions", code],
    enabled: !!code,
  });

  const useMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST",
        `/api/redemptions/${code}/use`,
        {},
      );
      return (await res.json()) as Redemption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/redemptions", code],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/redemptions"] });
      toast({
        title: "Kod kullanıldı",
        description: "Müşteriye ödülü teslim edebilirsin.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Kullanılamadı",
        description: err.message.replace(/^\d+:\s*/, ""),
        variant: "destructive",
      });
    },
  });

  const redemption = redemptionQuery.data;

  return (
    <main className="app-shell flex flex-col">
      <header className="relative">
        <div className="absolute inset-x-0 top-0 z-20 flex h-[54px] items-center justify-between px-6">
          <div className="[font-family:'SF_Pro-Semibold',Helvetica] text-[17px] font-normal leading-[22px] tracking-[0] text-white">
            9:41
          </div>
          <img
            className="h-[14px] w-[139px] invert"
            alt="Levels"
            src="/figmaAssets/levels.svg"
          />
        </div>
        <Card className="w-full rounded-b-[16px] rounded-t-none border-0 bg-[#17594a] shadow-none">
          <CardContent className="relative flex min-h-[150px] flex-col items-center justify-end px-5 pb-5 pt-[60px]">
            <ShieldAlert className="h-8 w-8 text-[#d3d04e]" />
            <h1
              data-testid="text-merchant-title"
              className="mt-2 [font-family:'Nunito',Helvetica] text-xl font-bold leading-[22px] text-white"
            >
              Kasiyer Doğrulama
            </h1>
            <p className="mt-1 [font-family:'Nunito',Helvetica] text-[12px] text-white/80">
              Atık Yeri ödül kodu
            </p>
          </CardContent>
        </Card>
      </header>

      <section className="flex flex-1 flex-col gap-4 px-6 py-6">
        {redemptionQuery.isLoading && (
          <p
            data-testid="text-loading"
            className="[font-family:'Nunito',Helvetica] text-sm text-[#4d4d4d]"
          >
            Kod kontrol ediliyor...
          </p>
        )}

        {redemptionQuery.isError && (
          <Card className="rounded-2xl border-0 bg-[#fee2e2] shadow-none">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <XCircle className="h-12 w-12 text-[#991b1b]" />
              <h2
                data-testid="text-not-found"
                className="[font-family:'Nunito',Helvetica] text-base font-bold text-[#991b1b]"
              >
                Geçersiz kod
              </h2>
              <p className="[font-family:'Nunito',Helvetica] text-[12px] text-[#7f1d1d]">
                "{code}" sistemde bulunamadı.
              </p>
            </CardContent>
          </Card>
        )}

        {redemption && (
          <>
            <Card className="rounded-2xl border-0 bg-[#f1f1f1] shadow-none">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl">
                  {redemption.rewardIcon}
                </div>
                <div className="flex flex-col">
                  <h2
                    data-testid="text-reward-name"
                    className="[font-family:'Nunito',Helvetica] text-base font-bold text-black"
                  >
                    {redemption.rewardName}
                  </h2>
                  <p className="[font-family:'Nunito',Helvetica] text-[11px] text-[#4d4d4d]">
                    {redemption.rewardDescription}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-2xl bg-[#0b1f1a] p-4 text-center">
              <div className="[font-family:'Nunito',Helvetica] text-[10px] uppercase tracking-widest text-white/60">
                Kod
              </div>
              <div
                data-testid="text-code"
                className="mt-1 [font-family:'Nunito',Helvetica] text-2xl font-bold tracking-widest text-[#d3d04e]"
              >
                {redemption.code}
              </div>
              <div className="mt-2 [font-family:'Nunito',Helvetica] text-[10px] text-white/60">
                Oluşturuldu: {formatDate(redemption.redeemedAt)}
              </div>
            </div>

            {redemption.usedAt ? (
              <Card className="rounded-2xl border-0 bg-[#fee2e2] shadow-none">
                <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                  <XCircle className="h-12 w-12 text-[#991b1b]" />
                  <h3
                    data-testid="text-already-used"
                    className="[font-family:'Nunito',Helvetica] text-base font-bold text-[#991b1b]"
                  >
                    Zaten Kullanıldı
                  </h3>
                  <p className="[font-family:'Nunito',Helvetica] text-[11px] text-[#7f1d1d]">
                    {formatDate(redemption.usedAt)}
                  </p>
                </CardContent>
              </Card>
            ) : useMut.isSuccess ? (
              <Card className="rounded-2xl border-0 bg-[#dcfce7] shadow-none">
                <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-[#166534]" />
                  <h3
                    data-testid="text-success"
                    className="[font-family:'Nunito',Helvetica] text-base font-bold text-[#166534]"
                  >
                    Onaylandı
                  </h3>
                  <p className="[font-family:'Nunito',Helvetica] text-[11px] text-[#14532d]">
                    Müşteriye ödülü teslim edebilirsin.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Button
                type="button"
                data-testid="button-confirm-use"
                disabled={useMut.isPending}
                onClick={() => useMut.mutate()}
                className="h-12 rounded-full bg-[#17594a] text-base font-bold text-white hover:bg-[#17594a]/90"
              >
                {useMut.isPending ? "İşleniyor..." : "Kullanıldı Olarak İşaretle"}
              </Button>
            )}

            <p className="text-center [font-family:'Nunito',Helvetica] text-[10px] text-[#4d4d4d]">
              Bu sayfa kasiyer içindir. Kodu yalnızca müşteriye ödül teslim edildiğinde işaretle.
            </p>
          </>
        )}
      </section>
    </main>
  );
};
