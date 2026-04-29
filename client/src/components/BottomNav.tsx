import { Link, useLocation } from "wouter";

const navigationItems = [
  { label: "Anasayfa", icon: "/figmaAssets/component-8.svg", path: "/" },
  { label: "Öğren", icon: "/figmaAssets/component-8-1.svg", path: "/ogren" },
  {
    label: "Dönüştür",
    icon: "/figmaAssets/component-8-2.svg",
    path: "/donustur",
  },
  { label: "Profil", icon: "/figmaAssets/component-8-3.svg", path: "/profil" },
];

export const BottomNav = (): JSX.Element => {
  const [location] = useLocation();

  return (
    <nav
      aria-label="Alt gezinme"
      className="relative w-full bg-white border border-solid border-[#0000004c]"
    >
      <div className="grid h-[76px] w-full grid-cols-4 items-center px-4">
        {navigationItems.map((item) => {
          const active = location === item.path;
          return (
            <Link
              key={item.label}
              href={item.path}
              data-testid={`link-nav-${item.label}`}
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
                {active ? (
                  <span className="mt-[-2px] h-3.5 w-12 rounded-[14px] bg-[#d3d04e]" />
                ) : (
                  <span className="mt-[-2px] h-3.5 w-12 rounded-[14px] opacity-0" />
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
