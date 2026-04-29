import { Card, CardContent } from "@/components/ui/card";

const headerData = {
  title: "Atık Yeri",
  points: "300",
  coinIcon:
    "/figmaAssets/coins-stack--accounting-billing-payment-stack-cash-coins-currenc.svg",
  badgeBackground: "/figmaAssets/vector.svg",
  badgeIcon: "/figmaAssets/group.png",
};

export const AppHeaderSection = (): JSX.Element => {
  return (
    <header className="relative w-full">
      <Card className="w-full rounded-b-[16px] rounded-t-none border-0 bg-[#17594a] shadow-none">
        <CardContent className="relative flex min-h-[136px] flex-col items-center px-5 pb-0 pt-[73px]">
          <h1 className="[font-family:'Nunito',Helvetica] text-xl font-bold leading-[22px] tracking-[0] text-white">
            {headerData.title}
          </h1>
          <div className="absolute right-[25px] top-[84px] flex items-center gap-1 rounded-[13px] border border-solid border-[#d9d9d9] px-[5px] py-[5px]">
            <img
              className="h-7 w-7 shrink-0"
              alt="Coins stack"
              src={headerData.coinIcon}
            />
            <span className="[font-family:'Nunito',Helvetica] text-[15px] font-medium leading-[22px] tracking-[0] text-[#d9d9d9]">
              {headerData.points}
            </span>
          </div>
          <div className="relative mb-[-36px] mt-[9px] h-[71px] w-[71px] overflow-hidden bg-[url(/figmaAssets/vector.svg)] bg-[100%_100%]">
            <img
              className="absolute left-[15.37%] top-[17.60%] h-[66.76%] w-[66.77%]"
              alt="Group"
              src={headerData.badgeIcon}
            />
          </div>
        </CardContent>
      </Card>
    </header>
  );
};
