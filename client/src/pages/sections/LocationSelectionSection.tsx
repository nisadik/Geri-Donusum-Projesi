import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const locationOptions = ["Mevcut Konumu Kullan", "Ev", "Okul"];

export const LocationSelectionSection = (): JSX.Element => {
  return (
    <section className="relative w-full px-[25px]">
      <div className="flex w-full flex-col gap-0.5 overflow-hidden">
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full justify-between rounded-[41px] bg-[#f1f1f1] px-[15px] py-2.5 shadow-[0px_4px_4px_#00000040] hover:bg-[#f1f1f1]"
        >
          <span className="inline-flex items-center gap-2">
            <img
              className="h-[21px] w-[21px]"
              alt="Location pin"
              src="/figmaAssets/location-pin-3--navigation-map-maps-pin-gps-location.svg"
            />
            <span className="[font-family:'Nunito',Helvetica] text-sm font-normal leading-[22px] tracking-[0] text-[#4d4d4d]">
              Mevcut Konum
            </span>
          </span>
          <img
            className="h-[21px] w-[21px]"
            alt="Sort descending"
            src="/figmaAssets/sort-descending.svg"
          />
        </Button>
        <Card className="w-full rounded-[27px] border border-solid border-[#999999] bg-[#f1f1f1] shadow-none backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)]">
          <CardContent className="flex flex-col items-start gap-[5px] p-[15px]">
            {locationOptions.map((option, index) => (
              <div key={option} className="w-full">
                <button
                  type="button"
                  className="block w-full text-left [font-family:'Nunito',Helvetica] text-base font-normal leading-[22px] tracking-[0] text-black"
                >
                  {option}
                </button>
                {index < locationOptions.length - 1 ? (
                  <div className="mt-[5px] h-px w-full bg-[#d9d9d9]" />
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
