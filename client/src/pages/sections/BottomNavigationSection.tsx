import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    label: "Anasayfa",
    icon: "/figmaAssets/component-8.svg",
    active: true,
  },
  {
    label: "Öğren",
    icon: "/figmaAssets/component-8-1.svg",
    active: false,
  },
  {
    label: "Dönüştür",
    icon: "/figmaAssets/component-8-2.svg",
    active: false,
  },
  {
    label: "Profil",
    icon: "/figmaAssets/component-8-3.svg",
    active: false,
  },
];

export const BottomNavigationSection = (): JSX.Element => {
  return (
    <nav
      aria-label="Alt gezinme"
      className="relative w-full bg-white border border-solid border-[#0000004c]"
    >
      <div className="grid h-[76px] w-full grid-cols-4 items-center px-4">
        {navigationItems.map((item) => (
          <Button
            key={item.label}
            type="button"
            variant="ghost"
            className="relative h-auto min-w-0 rounded-none p-0 hover:bg-transparent"
          >
            <span className="flex h-[54px] w-full flex-col items-center justify-start">
              <span className="flex h-7 items-start justify-center">
                <img
                  className="h-[28px] w-[28px] object-contain"
                  alt={item.label}
                  src={item.icon}
                />
              </span>
              <span className="mt-1 [font-family:'Nunito',Helvetica] text-[10px] font-semibold leading-[22px] text-[#000000b2]">
                {item.label}
              </span>
              {item.active ? (
                <span className="mt-[-2px] h-3.5 w-12 rounded-[14px] bg-[#d3d04e]" />
              ) : (
                <span className="mt-[-2px] h-3.5 w-12 rounded-[14px] opacity-0" />
              )}
            </span>
          </Button>
        ))}
      </div>
    </nav>
  );
};
