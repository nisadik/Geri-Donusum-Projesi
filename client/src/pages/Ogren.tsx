import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BottomNav } from "@/components/BottomNav";

type Article = {
  id: string;
  category: string;
  title: string;
  summary: string;
  body: string;
  icon: string;
  color: string;
};

const articles: Article[] = [
  {
    id: "kagit",
    category: "Kağıt",
    title: "Kağıdı doğru ayrıştır",
    summary: "Kağıt türleri ve geri dönüşüme uygun olanlar.",
    body: "Gazete, dergi, ofis kağıdı ve karton kutular geri dönüştürülebilir. Yağlı, ıslak veya kirli kağıtları (peçete, pizza kutusu, fiş) ayrı toplama kabına atma. Karton kutuları katlayarak yer kazan ve metal/plastik bantlarını çıkarmayı unutma.",
    icon: "📄",
    color: "bg-[#fef3c7]",
  },
  {
    id: "plastik",
    category: "Plastik",
    title: "Plastik şişeleri sıkıştır",
    summary: "PET şişeleri sıkıştırarak hacmini azalt.",
    body: "PET şişe, kapaklar ve plastik ambalajlar geri dönüştürülebilir. Şişeleri yıka, sıkıştır ve kapağı tekrar tak. Geri dönüşümde şişe başına ortalama 2 saatlik ampul enerjisi tasarrufu sağlanır.",
    icon: "🧴",
    color: "bg-[#fee2e2]",
  },
  {
    id: "metal",
    category: "Metal",
    title: "Metal ambalajları durula",
    summary: "Konserve ve içecek kutularını boşalt ve yıka.",
    body: "Alüminyum kutular sonsuz kez geri dönüştürülebilir. Bir alüminyum kutu, 60 yıl sonra raflara geri dönebilir. Kutuyu sıkıştır ve kuru şekilde topla. Pas tutmuş ya da boya kalıntılı metalleri ayır.",
    icon: "🥫",
    color: "bg-[#dbeafe]",
  },
  {
    id: "cam",
    category: "Cam",
    title: "Camı renklerine ayır",
    summary: "Şeffaf, yeşil ve kahverengi cam ayrı toplanmalı.",
    body: "Cam, kalitesini kaybetmeden tekrar tekrar geri dönüştürülebilir. Pencere camı, ayna ve seramik geri dönüşüme uygun değildir; ayrı toplanmalıdır. Şişeleri durula ve etiketleri çıkarman gerekmiyor.",
    icon: "🍾",
    color: "bg-[#dcfce7]",
  },
  {
    id: "elektronik",
    category: "Elektronik",
    title: "E-atıkları çöpe atma",
    summary: "Eski telefonlar ve şarj aletleri özel toplama noktalarına.",
    body: "Elektronik atıklar (e-waste) içlerindeki ağır metaller nedeniyle özel olarak işlenmelidir. Eski telefon, şarj kablosu, küçük ev aletleri için belediyelerin ya da operatörlerin e-atık kutularını kullan.",
    icon: "📱",
    color: "bg-[#ede9fe]",
  },
  {
    id: "pil",
    category: "Pil",
    title: "Pilleri ayrı topla",
    summary: "Pil ve aküler kesinlikle çöpe gitmemeli.",
    body: "Bir kalem pil, 4 metrekare toprağı ve 20 metreküp suyu kirletebilir. Marketlerde ve okullarda bulunan pil toplama kutularını kullan. Şişen veya akan pilleri eldivenle topla.",
    icon: "🔋",
    color: "bg-[#fed7aa]",
  },
];

const tips = [
  "Tek kullanımlık plastiklerden kaçın, yanında kumaş çanta taşı.",
  "Kahveni almak için yanında kendi termosunu götür.",
  "Elektronik cihazları tamir etmeyi onarımdan önce dene.",
  "Mevsiminde ve yerel ürünleri tercih et, taşıma karbon ayak izini azalt.",
];

export const Ogren = (): JSX.Element => {
  const [openArticle, setOpenArticle] = useState<Article | null>(null);

  return (
    <main className="app-shell flex flex-col">
      <div className="contents">
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
            <CardContent className="relative flex min-h-[120px] flex-col items-center justify-end px-5 pb-5 pt-[60px]">
              <h1
                data-testid="text-page-title"
                className="[font-family:'Nunito',Helvetica] text-xl font-bold leading-[22px] tracking-[0] text-white"
              >
                Öğren
              </h1>
              <p className="mt-2 [font-family:'Nunito',Helvetica] text-[12px] text-white/80 text-center">
                Geri dönüşüm hakkında bilmen gerekenler
              </p>
            </CardContent>
          </Card>
        </header>

        <section className="px-6 pt-6">
          <h2 className="[font-family:'Nunito',Helvetica] text-[15px] font-semibold leading-[22px] text-black">
            Malzeme Rehberi
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {articles.map((article) => (
              <button
                key={article.id}
                type="button"
                data-testid={`button-article-${article.id}`}
                onClick={() => setOpenArticle(article)}
                className="text-left"
              >
                <Card className="w-full rounded-[20px] border-0 bg-[#f1f1f1] shadow-none transition hover:bg-[#e8e8e8]">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-2xl ${article.color}`}
                    >
                      {article.icon}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="[font-family:'Nunito',Helvetica] text-[10px] font-semibold uppercase tracking-wider text-[#17594a]">
                        {article.category}
                      </span>
                      <h3 className="[font-family:'Nunito',Helvetica] text-[13px] font-semibold leading-[18px] text-black">
                        {article.title}
                      </h3>
                      <p className="mt-0.5 [font-family:'Nunito',Helvetica] text-[11px] leading-[15px] text-[#4d4d4d]">
                        {article.summary}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-[#4d4d4d]" />
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </section>

        <section className="px-6 pb-6 pt-6">
          <h2 className="[font-family:'Nunito',Helvetica] text-[15px] font-semibold leading-[22px] text-black">
            Günlük İpuçları
          </h2>
          <Card className="mt-3 w-full rounded-[20px] border-0 bg-[#17594a]/5 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
              {tips.map((tip, i) => (
                <div
                  key={i}
                  data-testid={`text-tip-${i}`}
                  className="flex gap-2"
                >
                  <span className="text-[#17594a]">•</span>
                  <p className="[font-family:'Nunito',Helvetica] text-[12px] leading-[18px] text-black">
                    {tip}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <footer>
          <BottomNav />
        </footer>
      </div>

      <Dialog
        open={!!openArticle}
        onOpenChange={(open) => {
          if (!open) setOpenArticle(null);
        }}
      >
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{openArticle?.icon}</span>
              <DialogTitle data-testid="text-article-title">
                {openArticle?.title}
              </DialogTitle>
            </div>
          </DialogHeader>
          <p className="[font-family:'Nunito',Helvetica] text-[13px] leading-[20px] text-[#333]">
            {openArticle?.body}
          </p>
        </DialogContent>
      </Dialog>
    </main>
  );
};
