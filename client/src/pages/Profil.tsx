import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BottomNav } from "@/components/BottomNav";
import type { RecyclingHistory, User } from "@shared/schema";

const typeColorClass: Record<string, string> = {
  Kağıt: "bg-black",
  Plastik: "bg-[#e23737]",
  Metal: "bg-[#2fbfde]",
  Cam: "bg-[#3aa55a]",
  Elektronik: "bg-[#7a4ed3]",
  Pil: "bg-[#f1a73a]",
};

type Badge = {
  id: string;
  name: string;
  description: string;
  threshold: number;
  icon: string;
};

const badges: Badge[] = [
  {
    id: "starter",
    name: "Yeni Başlayan",
    description: "İlk geri dönüşümünü yap",
    threshold: 1,
    icon: "🌱",
  },
  {
    id: "regular",
    name: "Düzenli Geri Dönüştürücü",
    description: "5 geri dönüşüm yap",
    threshold: 5,
    icon: "♻️",
  },
  {
    id: "champion",
    name: "Yeşil Şampiyon",
    description: "15 geri dönüşüm yap",
    threshold: 15,
    icon: "🏆",
  },
  {
    id: "hero",
    name: "Çevre Kahramanı",
    description: "30 geri dönüşüm yap",
    threshold: 30,
    icon: "🦸",
  },
];

function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return d.toLocaleDateString("tr-TR");
}

export const Profil = (): JSX.Element => {
  const [proofPreview, setProofPreview] = useState<RecyclingHistory | null>(
    null,
  );

  const userQuery = useQuery<Omit<User, "password">>({
    queryKey: ["/api/me"],
  });

  const historyQuery = useQuery<RecyclingHistory[]>({
    queryKey: ["/api/history"],
  });

  const totalRecycles = historyQuery.data?.length ?? 0;
  const totalEarned =
    historyQuery.data?.reduce((sum, h) => sum + h.pointsEarned, 0) ?? 0;
  const uniqueTypes = new Set(historyQuery.data?.map((h) => h.pointType)).size;

  const username = userQuery.data?.username ?? "Kullanıcı";
  const initial = username.charAt(0).toUpperCase();

  return (
    <main className="app-shell flex flex-col">
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
            <CardContent className="relative flex min-h-[180px] flex-col items-center justify-end px-5 pb-6 pt-[60px]">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#d3d04e] [font-family:'Nunito',Helvetica] text-3xl font-bold text-[#17594a]">
                {initial}
              </div>
              <h1
                data-testid="text-username"
                className="mt-2 [font-family:'Nunito',Helvetica] text-lg font-bold leading-[22px] text-white"
              >
                {username}
              </h1>
              <div className="mt-2 flex items-center gap-1 rounded-[13px] border border-solid border-white/40 px-2 py-1">
                <img
                  className="h-5 w-5"
                  alt="coins"
                  src="/figmaAssets/coins-stack--accounting-billing-payment-stack-cash-coins-currenc.svg"
                />
                <span
                  data-testid="text-user-points"
                  className="[font-family:'Nunito',Helvetica] text-[13px] font-medium text-white"
                >
                  {userQuery.data?.points ?? 0} puan
                </span>
              </div>
            </CardContent>
          </Card>
        </header>

        <section className="px-6 pt-6">
          <div className="grid grid-cols-3 gap-2">
            <Card className="rounded-[16px] border-0 bg-[#f1f1f1] shadow-none">
              <CardContent className="flex flex-col items-center p-3">
                <span
                  data-testid="text-stat-recycles"
                  className="[font-family:'Nunito',Helvetica] text-xl font-bold text-[#17594a]"
                >
                  {totalRecycles}
                </span>
                <span className="mt-1 [font-family:'Nunito',Helvetica] text-[10px] text-[#4d4d4d]">
                  Dönüşüm
                </span>
              </CardContent>
            </Card>
            <Card className="rounded-[16px] border-0 bg-[#f1f1f1] shadow-none">
              <CardContent className="flex flex-col items-center p-3">
                <span
                  data-testid="text-stat-earned"
                  className="[font-family:'Nunito',Helvetica] text-xl font-bold text-[#17594a]"
                >
                  {totalEarned}
                </span>
                <span className="mt-1 [font-family:'Nunito',Helvetica] text-[10px] text-[#4d4d4d]">
                  Kazanılan
                </span>
              </CardContent>
            </Card>
            <Card className="rounded-[16px] border-0 bg-[#f1f1f1] shadow-none">
              <CardContent className="flex flex-col items-center p-3">
                <span
                  data-testid="text-stat-types"
                  className="[font-family:'Nunito',Helvetica] text-xl font-bold text-[#17594a]"
                >
                  {uniqueTypes}
                </span>
                <span className="mt-1 [font-family:'Nunito',Helvetica] text-[10px] text-[#4d4d4d]">
                  Malzeme
                </span>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="px-6 pt-6">
          <h2 className="[font-family:'Nunito',Helvetica] text-[15px] font-semibold leading-[22px] text-black">
            Rozetler
          </h2>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {badges.map((badge) => {
              const earned = totalRecycles >= badge.threshold;
              return (
                <div
                  key={badge.id}
                  data-testid={`badge-${badge.id}`}
                  className="flex flex-col items-center gap-1"
                  title={badge.description}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
                      earned
                        ? "bg-[#d3d04e]"
                        : "bg-[#f1f1f1] grayscale opacity-50"
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <span className="text-center [font-family:'Nunito',Helvetica] text-[9px] font-semibold leading-[12px] text-black">
                    {badge.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-6 pb-6 pt-6">
          <h2 className="[font-family:'Nunito',Helvetica] text-[15px] font-semibold leading-[22px] text-black">
            Geri Dönüşüm Geçmişi
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {historyQuery.isLoading && (
              <p className="[font-family:'Nunito',Helvetica] text-sm text-[#4d4d4d]">
                Yükleniyor...
              </p>
            )}
            {!historyQuery.isLoading && totalRecycles === 0 && (
              <Card className="rounded-[16px] border-0 bg-[#f1f1f1] shadow-none">
                <CardContent className="p-4 text-center">
                  <p className="[font-family:'Nunito',Helvetica] text-[12px] text-[#4d4d4d]">
                    Henüz geri dönüşüm yapmadın. Anasayfa'dan başla!
                  </p>
                </CardContent>
              </Card>
            )}
            {historyQuery.data?.map((entry) => {
              const dotClass = typeColorClass[entry.pointType] ?? "bg-black";
              return (
                <Card
                  key={entry.id}
                  data-testid={`card-history-${entry.id}`}
                  className="rounded-[16px] border-0 bg-[#f1f1f1] shadow-none"
                >
                  <CardContent className="flex items-center gap-3 p-3">
                    {entry.proofImage ? (
                      <button
                        type="button"
                        data-testid={`button-proof-${entry.id}`}
                        onClick={() => setProofPreview(entry)}
                        className="shrink-0"
                      >
                        <img
                          src={entry.proofImage}
                          alt="Geri dönüşüm kanıtı"
                          className="h-12 w-12 rounded-[12px] object-cover"
                        />
                      </button>
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-white text-xl">
                        ♻️
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h3 className="[font-family:'Nunito',Helvetica] text-[12px] font-semibold leading-[16px] text-black">
                        {entry.pointName}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-1">
                        <span
                          className={`block h-1.5 w-1.5 rounded-[3px] ${dotClass}`}
                          aria-hidden="true"
                        />
                        <span className="[font-family:'Nunito',Helvetica] text-[10px] text-[#4d4d4d]">
                          {entry.pointType} • {formatRelativeTime(entry.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 [font-family:'Nunito',Helvetica] text-[13px] font-bold text-[#17594a]">
                      +{entry.pointsEarned}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <footer>
          <BottomNav />
        </footer>

      <Dialog
        open={!!proofPreview}
        onOpenChange={(open) => {
          if (!open) setProofPreview(null);
        }}
      >
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader>
            <DialogTitle data-testid="text-proof-dialog-title">
              {proofPreview?.pointName}
            </DialogTitle>
          </DialogHeader>
          {proofPreview?.proofImage && (
            <img
              src={proofPreview.proofImage}
              alt="Geri dönüşüm kanıtı"
              data-testid="img-proof-full"
              className="aspect-square w-full rounded-2xl object-cover"
            />
          )}
          <div className="flex items-center justify-between rounded-xl bg-[#f1f1f1] px-3 py-2">
            <span className="[font-family:'Nunito',Helvetica] text-[12px] text-[#4d4d4d]">
              {proofPreview ? formatRelativeTime(proofPreview.createdAt) : ""}
            </span>
            <span className="[font-family:'Nunito',Helvetica] text-[13px] font-bold text-[#17594a]">
              +{proofPreview?.pointsEarned} puan
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};
