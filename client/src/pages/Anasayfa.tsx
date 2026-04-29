import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Camera, X } from "lucide-react";
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
import type {
  RecyclingPoint,
  SavedLocation,
  User,
} from "@shared/schema";

type LatLng = { lat: number; lng: number };

type ActiveLocation = {
  id: string;
  name: string;
  coords: LatLng;
};

const typeColorClass: Record<string, string> = {
  Kağıt: "bg-black",
  Plastik: "bg-[#e23737]",
  Metal: "bg-[#2fbfde]",
  Cam: "bg-[#3aa55a]",
  Elektronik: "bg-[#7a4ed3]",
  Pil: "bg-[#f1a73a]",
};

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

async function fileToResizedDataUrl(
  file: File,
  maxSize = 800,
  quality = 0.7,
): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export const Anasayfa = (): JSX.Element => {
  const { toast } = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeLocation, setActiveLocation] = useState<ActiveLocation | null>(
    null,
  );
  const [pendingPoint, setPendingPoint] = useState<RecyclingPoint | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const userQuery = useQuery<Omit<User, "password">>({
    queryKey: ["/api/me"],
  });

  const pointsQuery = useQuery<RecyclingPoint[]>({
    queryKey: ["/api/recycling-points"],
  });

  const savedLocationsQuery = useQuery<SavedLocation[]>({
    queryKey: ["/api/saved-locations"],
  });

  useEffect(() => {
    if (!activeLocation && savedLocationsQuery.data?.length) {
      const ev = savedLocationsQuery.data.find((loc) => loc.name === "Ev");
      const fallback = ev ?? savedLocationsQuery.data[0];
      setActiveLocation({
        id: fallback.id,
        name: fallback.name,
        coords: { lat: fallback.latitude, lng: fallback.longitude },
      });
    }
  }, [savedLocationsQuery.data, activeLocation]);

  const recycleMutation = useMutation({
    mutationFn: async (params: {
      recyclingPointId: string;
      proofImage: string;
    }) => {
      const res = await apiRequest("POST", "/api/recycle", params);
      return (await res.json()) as {
        user: Omit<User, "password">;
        earnedPoints: number;
        recyclingPoint: RecyclingPoint;
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "Tebrikler!",
        description: `${data.recyclingPoint.name} noktasında geri dönüştürdün. +${data.earnedPoints} puan kazandın.`,
      });
      closeRecycleDialog();
    },
    onError: (err: Error) => {
      toast({
        title: "Hata",
        description: err.message.replace(/^\d+:\s*/, ""),
        variant: "destructive",
      });
    },
  });

  const sortedPoints = useMemo(() => {
    const points = pointsQuery.data ?? [];
    if (!activeLocation) return points.map((p) => ({ point: p, km: null }));
    return points
      .map((point) => ({
        point,
        km: haversineKm(activeLocation.coords, {
          lat: point.latitude,
          lng: point.longitude,
        }),
      }))
      .sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
  }, [pointsQuery.data, activeLocation]);

  const closeRecycleDialog = () => {
    setPendingPoint(null);
    setProofImage(null);
  };

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      toast({
        title: "Konum desteklenmiyor",
        description: "Tarayıcın konum servisini desteklemiyor.",
        variant: "destructive",
      });
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setActiveLocation({
          id: "current",
          name: "Mevcut Konum",
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
        setGeoLoading(false);
        setPickerOpen(false);
      },
      () => {
        toast({
          title: "Konum alınamadı",
          description: "Konum izni verilmedi veya alınamadı.",
          variant: "destructive",
        });
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handlePickSavedLocation = (loc: SavedLocation) => {
    setActiveLocation({
      id: loc.id,
      name: loc.name,
      coords: { lat: loc.latitude, lng: loc.longitude },
    });
    setPickerOpen(false);
  };

  const handleOpenDirections = (point: RecyclingPoint) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessingImage(true);
    try {
      const resized = await fileToResizedDataUrl(file);
      setProofImage(resized);
    } catch {
      toast({
        title: "Fotoğraf okunamadı",
        description: "Lütfen tekrar dene.",
        variant: "destructive",
      });
    } finally {
      setProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
          <CardContent className="relative flex min-h-[136px] flex-col items-center px-5 pb-0 pt-[73px]">
            <h1
              data-testid="text-app-title"
              className="[font-family:'Nunito',Helvetica] text-xl font-bold leading-[22px] tracking-[0] text-white"
            >
              Atık Yeri
            </h1>
            <div className="absolute right-[25px] top-[84px] flex items-center gap-1 rounded-[13px] border border-solid border-[#d9d9d9] px-[5px] py-[5px]">
              <img
                className="h-7 w-7 shrink-0"
                alt="Coins stack"
                src="/figmaAssets/coins-stack--accounting-billing-payment-stack-cash-coins-currenc.svg"
              />
              <span
                data-testid="text-user-points"
                className="[font-family:'Nunito',Helvetica] text-[15px] font-medium leading-[22px] tracking-[0] text-[#d9d9d9]"
              >
                {userQuery.data?.points ?? "—"}
              </span>
            </div>
            <div className="relative mb-[-36px] mt-[9px] h-[71px] w-[71px] overflow-hidden bg-[url(/figmaAssets/vector.svg)] bg-[100%_100%]">
              <img
                className="absolute left-[15.37%] top-[17.60%] h-[66.76%] w-[66.77%]"
                alt="Group"
                src="/figmaAssets/group.png"
              />
            </div>
          </CardContent>
        </Card>
      </header>

      <section className="flex flex-1 flex-col bg-white">
        <div className="flex justify-center pt-2">
          <img
            className="h-[57px] w-[64px]"
            alt=""
            src="/figmaAssets/image-1.png"
          />
        </div>

        <div className="px-6 pt-9">
          <section className="relative w-full px-[25px]">
            <div className="flex w-full flex-col gap-0.5 overflow-hidden">
              <Button
                type="button"
                variant="ghost"
                data-testid="button-open-location-picker"
                onClick={() => setPickerOpen((open) => !open)}
                className="h-auto w-full justify-between rounded-[41px] bg-[#f1f1f1] px-[15px] py-2.5 shadow-[0px_4px_4px_#00000040] hover:bg-[#f1f1f1]"
              >
                <span className="inline-flex items-center gap-2">
                  <img
                    className="h-[21px] w-[21px]"
                    alt="Location pin"
                    src="/figmaAssets/location-pin-3--navigation-map-maps-pin-gps-location.svg"
                  />
                  <span
                    data-testid="text-active-location"
                    className="[font-family:'Nunito',Helvetica] text-sm font-normal leading-[22px] tracking-[0] text-[#4d4d4d]"
                  >
                    {activeLocation?.name ?? "Konum Seç"}
                  </span>
                </span>
                <img
                  className="h-[21px] w-[21px]"
                  alt="Sort descending"
                  src="/figmaAssets/sort-descending.svg"
                />
              </Button>

              {pickerOpen && (
                <Card className="w-full rounded-[27px] border border-solid border-[#999999] bg-[#f1f1f1] shadow-none">
                  <CardContent className="flex flex-col items-start gap-[5px] p-[15px]">
                    <div className="w-full">
                      <button
                        type="button"
                        data-testid="button-use-current-location"
                        disabled={geoLoading}
                        onClick={handleUseCurrentLocation}
                        className="block w-full text-left [font-family:'Nunito',Helvetica] text-base font-normal leading-[22px] tracking-[0] text-black disabled:opacity-50"
                      >
                        {geoLoading
                          ? "Konum alınıyor..."
                          : "Mevcut Konumu Kullan"}
                      </button>
                      {(savedLocationsQuery.data?.length ?? 0) > 0 && (
                        <div className="mt-[5px] h-px w-full bg-[#d9d9d9]" />
                      )}
                    </div>
                    {savedLocationsQuery.data?.map((loc, index) => (
                      <div key={loc.id} className="w-full">
                        <button
                          type="button"
                          data-testid={`button-location-${loc.name}`}
                          onClick={() => handlePickSavedLocation(loc)}
                          className="block w-full text-left [font-family:'Nunito',Helvetica] text-base font-normal leading-[22px] tracking-[0] text-black"
                        >
                          {loc.name}
                        </button>
                        {index < (savedLocationsQuery.data?.length ?? 0) - 1 ? (
                          <div className="mt-[5px] h-px w-full bg-[#d9d9d9]" />
                        ) : null}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </div>

        <section
          aria-labelledby="nearby-recycling-title"
          className="px-6 pt-6"
        >
          <h2
            id="nearby-recycling-title"
            className="[font-family:'Nunito',Helvetica] text-[15px] font-semibold leading-[22px] tracking-[0] text-black"
          >
            Yakınınızdaki Geri Dönüşüm Noktaları
          </h2>
        </section>

        <section className="px-6 pb-6 pt-2">
          <div className="px-[25px]">
            <div className="flex w-full flex-col items-start gap-2">
              {pointsQuery.isLoading && (
                <p className="[font-family:'Nunito',Helvetica] text-sm text-[#4d4d4d]">
                  Yükleniyor...
                </p>
              )}
              {!pointsQuery.isLoading && sortedPoints.length === 0 && (
                <p className="[font-family:'Nunito',Helvetica] text-sm text-[#4d4d4d]">
                  Yakında geri dönüşüm noktası bulunamadı.
                </p>
              )}
              {sortedPoints.map(({ point, km }) => {
                const dotClass = typeColorClass[point.type] ?? "bg-black";
                return (
                  <Card
                    key={point.id}
                    data-testid={`card-recycling-${point.id}`}
                    className="w-full rounded-[25px] border-0 bg-[#f1f1f1] shadow-none"
                  >
                    <CardContent className="p-2.5">
                      <article className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          data-testid={`button-recycle-${point.id}`}
                          onClick={() => {
                            setPendingPoint(point);
                            setProofImage(null);
                          }}
                          className="flex min-w-0 flex-1 items-center gap-[13px] text-left"
                        >
                          <img
                            className="h-[70px] w-[90px] rounded-[20px] object-cover"
                            alt={point.name}
                            src={point.imageUrl}
                          />
                          <div className="flex min-w-0 flex-col items-start justify-center">
                            <h3 className="[font-family:'Nunito',Helvetica] text-[11px] font-medium leading-[22px] tracking-[0] text-black">
                              {point.name}
                            </h3>
                            <p
                              data-testid={`text-distance-${point.id}`}
                              className="[font-family:'Nunito',Helvetica] text-[10px] font-normal leading-[22px] tracking-[0] text-black"
                            >
                              {km == null ? "—" : formatDistance(km)}
                            </p>
                            <div className="flex items-center gap-0.5">
                              <span
                                className={`block h-1.5 w-1.5 rounded-[3px] ${dotClass}`}
                                aria-hidden="true"
                              />
                              <span className="[font-family:'Nunito',Helvetica] text-[10px] font-normal leading-[22px] tracking-[0] text-black">
                                {point.type}
                              </span>
                            </div>
                          </div>
                        </button>
                        <div className="flex h-[65px] w-14 shrink-0 items-center justify-end">
                          <div
                            className="mr-3 h-[65px] w-px bg-[#8f8f8f]"
                            aria-hidden="true"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            data-testid={`button-directions-${point.id}`}
                            onClick={() => handleOpenDirections(point)}
                            className="h-auto w-[42px] rounded-none p-0 text-black hover:bg-transparent"
                          >
                            <span className="flex flex-col items-center gap-px">
                              <img
                                className="ml-[11px] h-[19px] w-[19px]"
                                alt="Yol tarifi al"
                                src="/figmaAssets/interface-cursor-arrow-2--mouse-select-cursor.svg"
                              />
                              <span className="[font-family:'Nunito',Helvetica] text-center text-[8px] font-light leading-[22px] tracking-[0] text-black whitespace-nowrap">
                                Yol Tarifi Al
                              </span>
                            </span>
                          </Button>
                        </div>
                      </article>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </section>

      <footer>
        <BottomNav />
      </footer>

      <Dialog
        open={!!pendingPoint}
        onOpenChange={(open) => {
          if (!open) closeRecycleDialog();
        }}
      >
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader>
            <DialogTitle data-testid="text-recycle-dialog-title">
              Geri dönüşüm fotoğrafı
            </DialogTitle>
            <DialogDescription>
              {pendingPoint
                ? `${pendingPoint.name} noktasında bıraktığın atığın fotoğrafını çek. Onaylandığında +${pendingPoint.pointsValue} puan kazanırsın.`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            data-testid="input-proof-image"
            onChange={handleFileChange}
            className="hidden"
          />

          {proofImage ? (
            <div className="relative">
              <img
                src={proofImage}
                alt="Geri dönüşüm kanıtı"
                data-testid="img-proof-preview"
                className="aspect-square w-full rounded-2xl object-cover"
              />
              <button
                type="button"
                data-testid="button-clear-proof"
                onClick={() => setProofImage(null)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                aria-label="Fotoğrafı kaldır"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              data-testid="button-take-photo"
              disabled={processingImage}
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#17594a]/40 bg-[#17594a]/5 text-[#17594a] hover:bg-[#17594a]/10 disabled:opacity-50"
            >
              <Camera className="h-10 w-10" />
              <span className="[font-family:'Nunito',Helvetica] text-sm font-semibold">
                {processingImage ? "Hazırlanıyor..." : "Fotoğraf Çek"}
              </span>
              <span className="px-4 text-center [font-family:'Nunito',Helvetica] text-[11px] text-[#4d4d4d]">
                Atığını kutuya bırakırken çektiğin fotoğraf kanıt olarak saklanır.
              </span>
            </button>
          )}

          <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              data-testid="button-recycle-cancel"
              onClick={closeRecycleDialog}
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              data-testid="button-recycle-confirm"
              disabled={
                !proofImage || recycleMutation.isPending || processingImage
              }
              onClick={() =>
                pendingPoint &&
                proofImage &&
                recycleMutation.mutate({
                  recyclingPointId: pendingPoint.id,
                  proofImage,
                })
              }
              className="bg-[#17594a] text-white hover:bg-[#17594a]/90"
            >
              {recycleMutation.isPending ? "Kaydediliyor..." : "Puan Kazan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};
