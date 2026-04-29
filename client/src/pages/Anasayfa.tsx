import { Card, CardContent } from "@/components/ui/card";
import { AppHeaderSection } from "./sections/AppHeaderSection";
import { BottomNavigationSection } from "./sections/BottomNavigationSection";
import { LocationSelectionSection } from "./sections/LocationSelectionSection";
import { RecyclingListSection } from "./sections/RecyclingListSection";

export const Anasayfa = (): JSX.Element => {
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
          <AppHeaderSection />
        </header>
        <section className="flex flex-col bg-white">
          <div className="flex justify-center pt-2">
            <img
              className="h-[57px] w-[64px]"
              alt=""
              src="/figmaAssets/image-1.png"
            />
          </div>
          <div className="px-6 pt-9">
            <LocationSelectionSection />
          </div>
          <section
            aria-labelledby="nearby-recycling-title"
            className="px-6 pt-6"
          >
            <h1
              id="nearby-recycling-title"
              className="[font-family:'Nunito',Helvetica] text-[15px] font-semibold leading-[22px] tracking-[0] text-black"
            >
              Yakınınızdaki Geri Dönüşüm Noktaları
            </h1>
          </section>
          <section className="px-6 pb-6 pt-2">
            <Card className="h-auto w-full rounded-none border-0 bg-transparent p-0 shadow-none">
              <CardContent className="p-0">
                <RecyclingListSection />
              </CardContent>
            </Card>
          </section>
        </section>
        <footer>
          <BottomNavigationSection />
        </footer>
      </div>
    </main>
  );
};
