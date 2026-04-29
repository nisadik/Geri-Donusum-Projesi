import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BottomNav } from "@/components/BottomNav";
import type { Reward, User } from "@shared/schema";

const categoryColors: Record<string, string> = {
  İndirim: "bg-[#fef3c7] text-[#92400e]",
  Bağış: "bg-[#dcfce7] text-[#166534]",
  Ürün: "bg-[#dbeafe] text-[#1e40af]",
};

export const Donustur = (): JSX.Element => {
  const { toast } = useToast();
  const [pendingReward, setPendingReward] = useState<Reward | null>(null);

  const userQuery = useQuery<Omit<User, "password">>({
    queryKey: ["/api/me"],
  });

  const rewardsQuery = useQuery<Reward[]>({
    queryKey: ["/api/rewards"],
  });

  const redeemMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const res = await apiRequest("POST", "/api/rewards/redeem", { rewardId });
      return (await res.json()) as {
        user: Omit<User, "password">;
        reward: Reward;
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      toast({
        title: "Ödül kazandın!",
        description: `${data.reward.name} ödülün hesabına eklendi.`,
      });
      setPendingReward(null);
    },
    onError: (err: Error) => {
      toast({
        title: "Kullanılamadı",
        description: err.message.replace(/^\d+:\s*/, ""),
        variant: "destructive",
      });
    },
  });

  const userPoints = userQuery.data?.points ?? 0;

  return (
    <main className="w-full bg-white">
      <div className="mx-auto flex w-full max-w-[390px] flex-col bg-white">
        <header className="relative">
          <div className="absolute inset-x-0 top-0 z-20 flex h-[54px] items-center justify-between px-6">
            <div className="[font-family:'SF_Pro-Semibold',Helvetica] text-[17px] font-normal leading-[22px] tracking-[0] text-black">
              9:41
            </div>
            <img
              className="h-[14px] w-[139px]"
              alt="Levels"
              src="/figmaAssets/levels.svg"
            />
          </div>
          <Card className="w-full rounded-b-[16px] rounded-t-none border-0 bg-[#17594a] shadow-none">
            <CardContent className="relative flex min-h-[150px] flex-col items-center justify-end px-5 pb-5 pt-[60px]">
              <h1
                data-testid="text-page-title"
                className="[font-family:'Nunito',Helvetica] text-xl font-bold leading-[22px] tracking-[0] text-white"
              >
                Dönüştür
              </h1>
              <p className="mt-1 [font-family:'Nunito',Helvetica] text-[12px] text-white/80">
                Puanlarını ödüllere dönüştür
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <img
                  className="h-6 w-6"
                  alt="Coins"
                  src="/figmaAssets/coins-stack--accounting-billing-payment-stack-cash-coins-currenc.svg"
                />
                <span
                  data-testid="text-user-points"
                  className="[font-family:'Nunito',Helvetica] text-[15px] font-bold text-white"
                >
                  {userPoints} puan
                </span>
              </div>
            </CardContent>
          </Card>
        </header>

        <section className="px-6 pt-6 pb-6">
          <h2 className="[font-family:'Nunito',Helvetica] text-[15px] font-semibold leading-[22px] text-black">
            Ödüller
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {rewardsQuery.isLoading && (
              <p className="[font-family:'Nunito',Helvetica] text-sm text-[#4d4d4d]">
                Yükleniyor...
              </p>
            )}
            {rewardsQuery.data?.map((reward) => {
              const affordable = userPoints >= reward.cost;
              const categoryClass =
                categoryColors[reward.category] ?? "bg-gray-100 text-gray-700";
              return (
                <Card
                  key={reward.id}
                  data-testid={`card-reward-${reward.id}`}
                  className="w-full rounded-[20px] border-0 bg-[#f1f1f1] shadow-none"
                >
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-white text-3xl">
                      {reward.icon}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="[font-family:'Nunito',Helvetica] text-[13px] font-semibold leading-[18px] text-black">
                          {reward.name}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${categoryClass}`}
                        >
                          {reward.category}
                        </span>
                      </div>
                      <p className="mt-0.5 [font-family:'Nunito',Helvetica] text-[10px] leading-[14px] text-[#4d4d4d]">
                        {reward.description}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <img
                          className="h-4 w-4"
                          alt="coins"
                          src="/figmaAssets/coins-stack--accounting-billing-payment-stack-cash-coins-currenc.svg"
                        />
                        <span
                          data-testid={`text-cost-${reward.id}`}
                          className="[font-family:'Nunito',Helvetica] text-[11px] font-bold text-[#17594a]"
                        >
                          {reward.cost}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      data-testid={`button-redeem-${reward.id}`}
                      disabled={!affordable}
                      onClick={() => setPendingReward(reward)}
                      className="h-9 shrink-0 rounded-full bg-[#17594a] px-4 text-[11px] font-semibold text-white hover:bg-[#17594a]/90 disabled:bg-[#cfcfcf] disabled:text-[#7a7a7a]"
                    >
                      {affordable ? "Kullan" : "Yetersiz"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <footer>
          <BottomNav />
        </footer>
      </div>

      <Dialog
        open={!!pendingReward}
        onOpenChange={(open) => {
          if (!open) setPendingReward(null);
        }}
      >
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader>
            <DialogTitle data-testid="text-redeem-dialog-title">
              Ödülü kullan?
            </DialogTitle>
            <DialogDescription>
              {pendingReward
                ? `${pendingReward.name} ödülü için ${pendingReward.cost} puan harcayacaksın.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              data-testid="button-redeem-cancel"
              onClick={() => setPendingReward(null)}
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              data-testid="button-redeem-confirm"
              disabled={redeemMutation.isPending}
              onClick={() =>
                pendingReward && redeemMutation.mutate(pendingReward.id)
              }
              className="bg-[#17594a] text-white hover:bg-[#17594a]/90"
            >
              {redeemMutation.isPending ? "Kullanılıyor..." : "Evet, kullan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};
