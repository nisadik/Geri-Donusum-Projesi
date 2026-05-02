import { useEffect, useRef, useState } from "react";
import { ChevronRight, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BottomNav } from "@/components/BottomNav";

// ─── Article data ────────────────────────────────────────────────────────────

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

// ─── Chatbot knowledge engine ────────────────────────────────────────────────

type ChatMsg = { id: number; text: string; isUser: boolean };

const QUICK_REPLIES = [
  "Plastiği nereye atayım?",
  "Hangi kutu hangi renk?",
  "Pil neden tehlikeli?",
  "Neden geri dönüştürmeliyim?",
  "Cam geri dönüştürülebilir mi?",
  "E-atık nereye gider?",
  "Başlangıç ipuçları",
];

type Rule = { keywords: string[]; response: string };

const RULES: Rule[] = [
  {
    keywords: ["plastik", "pet", "şişe", "ambalaj", "naylon", "poşet"],
    response:
      "♻️ Plastik\n\n• PET şişe, kapak ve gıda ambalajları mavi/sarı geri dönüşüm kutusuna gider.\n• Şişeyi yıka, sıkıştır ve kapağını geri tak.\n• Bir PET şişeyi geri dönüştürmek 2 saatlik ampul enerjisi tasarrufu sağlar 💡\n• Kirli veya yağlı plastikleri normal çöpe at — kirli ambalajlar sistemi bozar.\n• Naylon poşetleri market toplama noktalarına götür.",
  },
  {
    keywords: ["kağıt", "gazete", "dergi", "karton", "kutu", "kitap"],
    response:
      "📄 Kağıt ve Karton\n\n• Gazete, dergi, ofis kağıdı ve karton kutular geri dönüştürülebilir.\n• Pizza kutusu, ıslak peçete ve yağlı kağıtları ATMA — süreci bozarlar!\n• Karton kutuları düzleştirerek hacmini azalt.\n• 1 ton kağıdın geri dönüşümü 17 ağacı kurtarır 🌳\n• Metal veya plastik bantları kartondan çıkarmayı unutma.",
  },
  {
    keywords: ["cam", "kavanoz", "bardak"],
    response:
      "🍾 Cam\n\n• Cam şişe ve kavanozlar yeşil geri dönüşüm kutusuna gider.\n• Cam kalitesini kaybetmeden sonsuz kez geri dönüştürülebilir!\n• Pencere camı, ayna ve seramik geri dönüşüme UYGUN DEĞİLDİR.\n• Şişeleri durula; etiketleri çıkarman gerekmiyor.\n• Geri dönüştürülmüş camdan yeni şişe yapmak sıfırdan yapmaktan %30 az enerji tüketir ⚡",
  },
  {
    keywords: ["metal", "alüminyum", "kutu", "teneke", "konserve", "demir"],
    response:
      "🥫 Metal\n\n• Alüminyum içecek kutuları ve konserve tenekeler geri dönüştürülebilir.\n• Kutuyu sıkıştır, duruladıktan sonra geri dönüşüm kutusuna at.\n• Alüminyum sonsuz kez geri dönüştürülebilir — 60 yıl sonra rafta olabilir!\n• Alüminyum üretmek yerine geri dönüştürmek %95 daha az enerji harcar 🌍",
  },
  {
    keywords: ["pil", "akü", "batarya"],
    response:
      "🔋 Pil ve Akü\n\n• Piller asla çöpe ATILMAMALI — zehirli ağır metaller (cıva, kurşun) toprağa karışır.\n• 1 kalem pil; 4 m² toprağı ve 20 m³ suyu kirletebilir!\n• Market girişlerindeki ve okullardaki turuncu/sarı kutulara bırak.\n• Şişen veya sızan pilleri eldivenle topla.\n• Şarjlı piller elektronik geri dönüşüm noktasına gider.",
  },
  {
    keywords: ["elektronik", "telefon", "bilgisayar", "şarj", "kablo", "e-atık", "tablet", "laptop"],
    response:
      "📱 Elektronik Atık (E-Atık)\n\n• Eski telefon, tablet, bilgisayar, şarj kablosu ve küçük ev aletleri özel noktalara gider.\n• Türkiye'de operatör mağazaları ve belediye e-atık noktaları kullanılabilir.\n• E-atıkların içindeki altın, gümüş, bakır ve nadir toprak elementleri kurtarılır.\n• Kişisel verilerini silmeyi unutma! 🔐\n• Çalışan cihazları önce ikinci el sitelerine veya tamir dükkanına götürmeyi düşün.",
  },
  {
    keywords: ["organik", "yemek", "gıda", "sebze", "meyve", "kompost"],
    response:
      "🌱 Organik Atık ve Kompost\n\n• Sebze-meyve kabukları, yemek artıkları ve kahve telvesi kompost edilebilir.\n• Evde küçük bir kompost kovası bulundurabilirsin; birkaç haftada gübre oluşur.\n• Pişmiş yemek artıkları ve et ev kompostuna uygun değildir.\n• Kompost sayesinde çöpünün yaklaşık %30'unu azaltabilirsin ♻️",
  },
  {
    keywords: ["tekstil", "kıyafet", "giysi", "kumaş", "bez", "ayakkabı"],
    response:
      "👗 Tekstil ve Kıyafet\n\n• Kullanılabilir kıyafetleri ikinci el mağazalara, Kızılay'a veya ÇEKUD kutularına bırak.\n• Tekstil atıkları doğada 200 yıl kalabilir!\n• Yırtık kumaşlar bez çanta veya temizlik bezi olarak değerlendirilebilir.\n• Bazı marka mağazaları (H&M, Zara) eski kıyafet toplama noktası işletiyor.",
  },
  {
    keywords: ["renk", "hangi kutu", "hangi kap", "nereye at", "nereye koy"],
    response:
      "🗑️ Kutu Renkleri (Türkiye Standardı)\n\n🔵 Mavi → Kağıt & Karton\n🟡 Sarı → Plastik & Metal\n🟢 Yeşil → Cam\n🟠 Turuncu → Pil ve Akümülatör\n⚫ Siyah/Gri → Karışık/Genel Çöp\n\nBelediyeye göre renkler değişebilir; kutunun üzerindeki etiketi mutlaka oku!",
  },
  {
    keywords: ["neden", "niye", "önemli", "fayda", "ne işe", "gerekli"],
    response:
      "🌍 Neden Geri Dönüştürmeli?\n\n• Türkiye her yıl 32 milyon ton çöp üretiyor.\n• Geri dönüşüm; enerji, su ve doğal kaynak tasarrufu sağlar.\n• Çöp depolarından çıkan metan, CO₂'den 80 kat güçlü bir sera gazıdır.\n• Geri dönüşüm sektörü milyonlarca kişiye iş imkânı sağlar 💼\n• Her geri dönüştürdüğünde karbon ayak izini küçültürsün 🌱",
  },
  {
    keywords: ["iklim", "karbon", "sera", "küresel ısınma", "çevre", "doğa"],
    response:
      "🌡️ Geri Dönüşüm ve İklim\n\n• Katı atık depolarından çıkan metan, CO₂'den 80 kat güçlü bir sera gazıdır.\n• Geri dönüşüm, hammadde üretimine kıyasla enerji kullanımını ortalama %60 azaltır.\n• 1 ton alüminyum geri dönüştürmek 9 ton CO₂ emisyonunu önler 🏭\n• Kağıt geri dönüşümü su tüketimini ve kimyasal kullanımı dramatik azaltır.",
  },
  {
    keywords: ["ipucu", "öneri", "tavsiye", "ne yapabilirim", "nasıl yardım"],
    response:
      "💡 Günlük Geri Dönüşüm İpuçları\n\n1. Tek kullanımlık plastiği reddet — kumaş çanta ve metal pipet kullan.\n2. Kahve için kendi termosu veya kupasını götür ☕\n3. Elektronik cihazları atmadan önce tamir etmeyi dene.\n4. Mevsiminde ve yerel ürünler satın al.\n5. Su faturasını düşürmek için fırında dolu yük çalıştır.\n6. Geri dönüşüm kutunu mutfak tezgâhına yakın koy — görmek harekete geçirir!",
  },
  {
    keywords: ["nasıl başla", "başlangıç", "yeni başlıyorum", "nereden başla"],
    response:
      "🚀 Geri Dönüşüme Nasıl Başlarım?\n\n1️⃣ Mutfağına küçük bir geri dönüşüm kutusu koy.\n2️⃣ Atığı atmadan önce 2 saniye düşün: geri dönüştürülebilir mi?\n3️⃣ Pilleri biriktirmek için çekmecene küçük bir kutu koy.\n4️⃣ YeşilCepte ile yakındaki geri dönüşüm noktalarını bul ve puan kazan! 🎁\n5️⃣ Alışkanlık oluştuktan sonra aile ve arkadaşlarınla paylaş.",
  },
];

const GREETINGS = ["merhaba", "selam", "hey", "günaydın", "iyi günler", "hi"];
const THANKS = ["teşekkür", "sağ ol", "eyw", "makbule", "çok iyi", "süper"];

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function getBotReply(input: string): string {
  const n = normalize(input);
  if (GREETINGS.some((g) => n.includes(g))) {
    return "Merhaba! 👋 Ben YeşilBot, YeşilCepte'nin geri dönüşüm asistanıyım.\n\nPlastik, kağıt, cam, metal, pil, elektronik atık ve daha fazlası hakkında soru sorabilirsin. Aşağıdaki hızlı sorulardan birini kullanabilirsin!";
  }
  if (THANKS.some((t) => n.includes(normalize(t)))) {
    return "Ne demek! 😊 Başka soruların olursa buradayım. Geri dönüşüm alışkanlığın her geçen gün dünyayı biraz daha güzelleştiriyor 🌍";
  }
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => n.includes(normalize(kw)))) {
      return rule.response;
    }
  }
  return "🤔 Bu konuda tam emin değilim, ama şu konularda yardımcı olabilirim:\n\n• Plastik, kağıt, cam, metal\n• Pil ve elektronik atıklar\n• Organik atık ve kompost\n• Kutu renk rehberi\n• Neden geri dönüştürmeliyim?\n• Günlük ipuçları\n\nAşağıdaki hızlı sorulardan birini deneye bilirsin 👇";
}

// ─── Chatbot component ────────────────────────────────────────────────────────

let msgCounter = 0;

const WELCOME: ChatMsg = {
  id: ++msgCounter,
  isUser: false,
  text: "Merhaba! 👋 Ben YeşilBot, YeşilCepte'nin geri dönüşüm asistanıyım.\n\nPlastik, cam, pil, kağıt ve daha fazlası hakkında soru sorabilirsin. Aşağıdan hızlı soru seçebilir ya da kendin yazabilirsin! ♻️",
};

function ChatBot() {
  const [messages, setMessages] = useState<ChatMsg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");
    setShowQuick(false);
    const userMsg: ChatMsg = { id: ++msgCounter, isUser: true, text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);
    setTimeout(() => {
      const reply = getBotReply(trimmed);
      setMessages((prev) => [
        ...prev,
        { id: ++msgCounter, isUser: false, text: reply },
      ]);
      setTyping(false);
    }, 700);
  }

  return (
    <div className="flex flex-col" style={{ height: "480px" }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            data-testid={msg.isUser ? `msg-user-${msg.id}` : `msg-bot-${msg.id}`}
            className={`flex gap-2 ${msg.isUser ? "justify-end" : "justify-start"}`}
          >
            {!msg.isUser && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d3d04e] text-base">
                ♻️
              </div>
            )}
            <div
              className={`max-w-[75%] whitespace-pre-line rounded-[18px] px-4 py-2.5 [font-family:'Nunito',Helvetica] text-[12px] leading-[18px] ${
                msg.isUser
                  ? "rounded-br-[4px] bg-[#17594a] text-white"
                  : "rounded-bl-[4px] bg-[#f1f1f1] text-black"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-2 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d3d04e] text-base">
              ♻️
            </div>
            <div className="flex items-center gap-1 rounded-[18px] rounded-bl-[4px] bg-[#f1f1f1] px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block h-2 w-2 rounded-full bg-[#4d4d4d] animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {showQuick && (
        <div className="border-t border-[#e8e8e8] px-3 py-2 overflow-x-auto">
          <div className="flex gap-2" style={{ width: "max-content" }}>
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                type="button"
                data-testid={`button-quick-${q}`}
                onClick={() => send(q)}
                className="shrink-0 rounded-full border border-[#17594a]/30 bg-[#17594a]/8 px-3 py-1.5 [font-family:'Nunito',Helvetica] text-[11px] font-semibold text-[#17594a] whitespace-nowrap hover:bg-[#17594a]/15 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-[#e8e8e8] px-3 py-2 flex items-end gap-2 bg-white">
        <textarea
          data-testid="input-chatbot"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Bir şey sor... (plastik, cam, pil...)"
          className="flex-1 resize-none rounded-[20px] bg-[#f1f1f1] px-4 py-2.5 [font-family:'Nunito',Helvetica] text-[12px] leading-[18px] text-black outline-none placeholder:text-[#9d9d9d]"
          style={{ maxHeight: "80px", overflowY: "auto" }}
        />
        <button
          type="button"
          data-testid="button-send-chat"
          disabled={!input.trim() || typing}
          onClick={() => send(input)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#17594a] text-white disabled:opacity-40 transition"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = "rehber" | "bot";

export const Ogren = (): JSX.Element => {
  const [tab, setTab] = useState<Tab>("rehber");
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

              {/* Tab switcher inside header */}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  data-testid="tab-rehber"
                  onClick={() => setTab("rehber")}
                  className={`rounded-full px-5 py-1.5 [font-family:'Nunito',Helvetica] text-[12px] font-bold transition ${
                    tab === "rehber"
                      ? "bg-white text-[#17594a]"
                      : "bg-white/20 text-white"
                  }`}
                >
                  📚 Rehber
                </button>
                <button
                  type="button"
                  data-testid="tab-bot"
                  onClick={() => setTab("bot")}
                  className={`rounded-full px-5 py-1.5 [font-family:'Nunito',Helvetica] text-[12px] font-bold transition ${
                    tab === "bot"
                      ? "bg-white text-[#17594a]"
                      : "bg-white/20 text-white"
                  }`}
                >
                  🤖 YeşilBot
                </button>
              </div>
            </CardContent>
          </Card>
        </header>

        {tab === "rehber" ? (
          <>
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
          </>
        ) : (
          <section className="flex flex-1 flex-col px-4 pt-4 pb-2">
            <Card className="flex flex-1 flex-col overflow-hidden rounded-[20px] border-0 shadow-none">
              <CardContent className="flex flex-1 flex-col p-0 overflow-hidden">
                {/* Bot identity bar */}
                <div className="flex items-center gap-3 border-b border-[#e8e8e8] px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d3d04e] text-xl">
                    ♻️
                  </div>
                  <div>
                    <p className="[font-family:'Nunito',Helvetica] text-[13px] font-bold text-black">
                      YeşilBot
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="block h-2 w-2 rounded-full bg-green-500" />
                      <p className="[font-family:'Nunito',Helvetica] text-[10px] text-[#4d4d4d]">
                        Çevrimiçi · Geri dönüşüm uzmanı
                      </p>
                    </div>
                  </div>
                </div>
                <ChatBot />
              </CardContent>
            </Card>
          </section>
        )}

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
