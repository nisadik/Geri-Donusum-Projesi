import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const recyclingItems = [
  {
    name: "ARDEN KAĞITÇILIK",
    distance: "750 m",
    type: "Kağıt",
    dotClassName: "bg-black",
    image: "/figmaAssets/rectangle-8.svg",
  },
  {
    name: "ARAS GERİ DÖNÜŞÜM",
    distance: "1,5 km",
    type: "Plastik",
    dotClassName: "bg-[#e23737]",
    image: "/figmaAssets/rectangle-8-2.svg",
  },
  {
    name: "YUSUF METAL",
    distance: "1,5 km",
    type: "Metal",
    dotClassName: "bg-[#2fbfde]",
    image: "/figmaAssets/rectangle-8-1.svg",
  },
];

export const RecyclingListSection = (): JSX.Element => {
  return (
    <section className="w-full px-[25px]">
      <div className="flex w-full flex-col items-start gap-2">
        <p className="sr-only">
          The image shows a mobile recycling list section with three rounded
          light-gray cards. Each card contains a left thumbnail image, a center
          text block with company name, distance, and material type marked by a
          small colored dot, plus a right-side action area separated by a
          vertical divider with a cursor icon and the text “Yol Tarifi Al”.
        </p>
        {recyclingItems.map((item) => (
          <Card
            key={item.name}
            className="w-full rounded-[25px] border-0 bg-[#f1f1f1] shadow-none"
          >
            <CardContent className="p-2.5">
              <article className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-[13px]">
                  <img
                    className="h-[70px] w-[90px] rounded-[20px] object-cover"
                    alt={item.name}
                    src={item.image}
                  />
                  <div className="flex min-w-0 flex-col items-start justify-center">
                    <h3 className="[font-family:'Nunito',Helvetica] text-[11px] font-medium leading-[22px] tracking-[0] text-black">
                      {item.name}
                    </h3>
                    <p className="[font-family:'Nunito',Helvetica] text-[10px] font-normal leading-[22px] tracking-[0] text-black">
                      {item.distance}
                    </p>
                    <div className="flex items-center gap-0.5">
                      <span
                        className={`block h-1.5 w-1.5 rounded-[3px] ${item.dotClassName}`}
                        aria-hidden="true"
                      />
                      <span className="[font-family:'Nunito',Helvetica] text-[10px] font-normal leading-[22px] tracking-[0] text-black">
                        {item.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex h-[65px] w-14 shrink-0 items-center justify-end">
                  <div
                    className="mr-3 h-[65px] w-px bg-[#8f8f8f]"
                    aria-hidden="true"
                  />
                  <Button
                    type="button"
                    variant="ghost"
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
        ))}
      </div>
    </section>
  );
};
