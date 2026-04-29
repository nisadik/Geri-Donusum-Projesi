import { randomBytes, randomUUID } from "crypto";
import {
  type RecyclingHistory,
  type RecyclingPoint,
  type Redemption,
  type Reward,
  type SavedLocation,
  type SavedLocationInput,
  type User,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<User>;
  addUserPoints(userId: string, delta: number): Promise<User | undefined>;

  listRecyclingPoints(): Promise<RecyclingPoint[]>;
  getRecyclingPoint(id: string): Promise<RecyclingPoint | undefined>;

  listSavedLocations(userId: string): Promise<SavedLocation[]>;
  createSavedLocation(
    userId: string,
    location: SavedLocationInput,
  ): Promise<SavedLocation>;
  deleteSavedLocation(id: string, userId: string): Promise<boolean>;

  listRecyclingHistory(userId: string): Promise<RecyclingHistory[]>;
  createRecyclingHistory(
    entry: Omit<RecyclingHistory, "id" | "createdAt">,
  ): Promise<RecyclingHistory>;

  listRewards(): Promise<Reward[]>;
  getReward(id: string): Promise<Reward | undefined>;

  listRedemptions(userId: string): Promise<Redemption[]>;
  getRedemptionByCode(code: string): Promise<Redemption | undefined>;
  createRedemption(
    entry: Omit<Redemption, "id" | "redeemedAt" | "usedAt" | "code"> & {
      code: string;
    },
  ): Promise<Redemption>;
  markRedemptionUsed(code: string): Promise<Redemption | undefined>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private points = new Map<string, RecyclingPoint>();
  private locations = new Map<string, SavedLocation>();
  private history = new Map<string, RecyclingHistory>();
  private rewards = new Map<string, Reward>();
  private redemptions = new Map<string, Redemption>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const normalized = email.trim().toLowerCase();
    return Array.from(this.users.values()).find(
      (user) => user.email === normalized,
    );
  }

  async createUser(input: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      email: input.email.trim().toLowerCase(),
      password: input.password,
      displayName: input.displayName.trim(),
      points: 0,
    };
    this.users.set(id, user);
    this.seedDefaultLocations(id);
    return user;
  }

  private seedDefaultLocations(userId: string) {
    const istanbul = { lat: 41.0082, lng: 28.9784 };
    const ev: SavedLocation = {
      id: randomUUID(),
      userId,
      name: "Ev",
      latitude: istanbul.lat,
      longitude: istanbul.lng,
    };
    const okul: SavedLocation = {
      id: randomUUID(),
      userId,
      name: "Okul",
      latitude: istanbul.lat + 0.015,
      longitude: istanbul.lng + 0.01,
    };
    this.locations.set(ev.id, ev);
    this.locations.set(okul.id, okul);
  }

  async addUserPoints(
    userId: string,
    delta: number,
  ): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    const updated: User = { ...user, points: user.points + delta };
    this.users.set(userId, updated);
    return updated;
  }

  async listRecyclingPoints(): Promise<RecyclingPoint[]> {
    return Array.from(this.points.values());
  }

  async getRecyclingPoint(id: string): Promise<RecyclingPoint | undefined> {
    return this.points.get(id);
  }

  async listSavedLocations(userId: string): Promise<SavedLocation[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.userId === userId,
    );
  }

  async createSavedLocation(
    userId: string,
    input: SavedLocationInput,
  ): Promise<SavedLocation> {
    const id = randomUUID();
    const created: SavedLocation = {
      id,
      userId,
      name: input.name.trim(),
      latitude: input.latitude,
      longitude: input.longitude,
    };
    this.locations.set(id, created);
    return created;
  }

  async deleteSavedLocation(id: string, userId: string): Promise<boolean> {
    const existing = this.locations.get(id);
    if (!existing || existing.userId !== userId) return false;
    return this.locations.delete(id);
  }

  async listRecyclingHistory(userId: string): Promise<RecyclingHistory[]> {
    return Array.from(this.history.values())
      .filter((entry) => entry.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  async createRecyclingHistory(
    entry: Omit<RecyclingHistory, "id" | "createdAt">,
  ): Promise<RecyclingHistory> {
    const id = randomUUID();
    const created: RecyclingHistory = {
      ...entry,
      id,
      createdAt: new Date(),
    };
    this.history.set(id, created);
    return created;
  }

  async listRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values()).sort((a, b) => a.cost - b.cost);
  }

  async getReward(id: string): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }

  async listRedemptions(userId: string): Promise<Redemption[]> {
    return Array.from(this.redemptions.values())
      .filter((entry) => entry.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime(),
      );
  }

  async getRedemptionByCode(code: string): Promise<Redemption | undefined> {
    return Array.from(this.redemptions.values()).find(
      (entry) => entry.code === code,
    );
  }

  async createRedemption(
    entry: Omit<Redemption, "id" | "redeemedAt" | "usedAt" | "code"> & {
      code: string;
    },
  ): Promise<Redemption> {
    const id = randomUUID();
    const created: Redemption = {
      ...entry,
      id,
      redeemedAt: new Date(),
      usedAt: null,
    };
    this.redemptions.set(id, created);
    return created;
  }

  async markRedemptionUsed(code: string): Promise<Redemption | undefined> {
    const entry = Array.from(this.redemptions.values()).find(
      (e) => e.code === code,
    );
    if (!entry) return undefined;
    if (entry.usedAt) return entry;
    const updated: Redemption = { ...entry, usedAt: new Date() };
    this.redemptions.set(entry.id, updated);
    return updated;
  }

  insertRecyclingPointDirect(point: RecyclingPoint) {
    this.points.set(point.id, point);
  }

  insertRewardDirect(reward: Reward) {
    this.rewards.set(reward.id, reward);
  }
}

export function generateRedemptionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `YC-${code.slice(0, 4)}-${code.slice(4, 8)}`;
}

const memStorage = new MemStorage();

const IMG_PAPER = "/figmaAssets/rectangle-8.svg";
const IMG_PLASTIC = "/figmaAssets/rectangle-8-2.svg";
const IMG_METAL = "/figmaAssets/rectangle-8-1.svg";

type SeedPoint = {
  id: string;
  name: string;
  type: string;
  city: string;
  latitude: number;
  longitude: number;
  pointsValue: number;
};

const seededPoints: SeedPoint[] = [
  // İstanbul
  { id: "rp-ist-1", name: "ARDEN KAĞITÇILIK", type: "Kağıt", city: "İstanbul", latitude: 41.0132, longitude: 28.9814, pointsValue: 15 },
  { id: "rp-ist-2", name: "ARAS GERİ DÖNÜŞÜM", type: "Plastik", city: "İstanbul", latitude: 41.0202, longitude: 28.9704, pointsValue: 20 },
  { id: "rp-ist-3", name: "YUSUF METAL", type: "Metal", city: "İstanbul", latitude: 40.9972, longitude: 28.9874, pointsValue: 25 },
  { id: "rp-ist-4", name: "EGE CAM GERİ DÖNÜŞÜM", type: "Cam", city: "İstanbul", latitude: 40.9902, longitude: 28.9644, pointsValue: 18 },
  { id: "rp-ist-5", name: "TEKNO ELEKTRONİK", type: "Elektronik", city: "İstanbul", latitude: 41.0302, longitude: 28.9944, pointsValue: 30 },
  { id: "rp-ist-6", name: "YEŞİL PİL TOPLAMA", type: "Pil", city: "İstanbul", latitude: 41.0152, longitude: 28.9584, pointsValue: 22 },
  { id: "rp-ist-7", name: "KADIKÖY GERİ DÖNÜŞÜM", type: "Kağıt", city: "İstanbul", latitude: 40.9833, longitude: 29.0333, pointsValue: 15 },
  { id: "rp-ist-8", name: "ÜSKÜDAR PLASTİK", type: "Plastik", city: "İstanbul", latitude: 41.0233, longitude: 29.0152, pointsValue: 18 },
  { id: "rp-ist-9", name: "BEŞİKTAŞ METAL", type: "Metal", city: "İstanbul", latitude: 41.0422, longitude: 29.0083, pointsValue: 25 },
  { id: "rp-ist-10", name: "ŞİŞLİ CAM TOPLAMA", type: "Cam", city: "İstanbul", latitude: 41.0603, longitude: 28.9871, pointsValue: 18 },
  // Ankara
  { id: "rp-ank-1", name: "ÇANKAYA GERİ DÖNÜŞÜM", type: "Kağıt", city: "Ankara", latitude: 39.9208, longitude: 32.8541, pointsValue: 15 },
  { id: "rp-ank-2", name: "KIZILAY PLASTİK MERKEZİ", type: "Plastik", city: "Ankara", latitude: 39.9201, longitude: 32.8540, pointsValue: 20 },
  { id: "rp-ank-3", name: "ULUS METAL TOPLAMA", type: "Metal", city: "Ankara", latitude: 39.9407, longitude: 32.8538, pointsValue: 25 },
  { id: "rp-ank-4", name: "BATIKENT CAM GERİ DÖNÜŞÜM", type: "Cam", city: "Ankara", latitude: 39.9701, longitude: 32.7378, pointsValue: 18 },
  { id: "rp-ank-5", name: "KEÇİÖREN ELEKTRONİK", type: "Elektronik", city: "Ankara", latitude: 39.9851, longitude: 32.8657, pointsValue: 30 },
  // İzmir
  { id: "rp-izm-1", name: "KONAK GERİ DÖNÜŞÜM", type: "Kağıt", city: "İzmir", latitude: 38.4192, longitude: 27.1287, pointsValue: 15 },
  { id: "rp-izm-2", name: "ALSANCAK PLASTİK", type: "Plastik", city: "İzmir", latitude: 38.4378, longitude: 27.1438, pointsValue: 20 },
  { id: "rp-izm-3", name: "BORNOVA METAL", type: "Metal", city: "İzmir", latitude: 38.4678, longitude: 27.2167, pointsValue: 25 },
  { id: "rp-izm-4", name: "KARŞIYAKA CAM", type: "Cam", city: "İzmir", latitude: 38.4615, longitude: 27.1107, pointsValue: 18 },
  { id: "rp-izm-5", name: "BUCA PİL TOPLAMA", type: "Pil", city: "İzmir", latitude: 38.3805, longitude: 27.1736, pointsValue: 22 },
  // Bursa
  { id: "rp-bur-1", name: "OSMANGAZİ GERİ DÖNÜŞÜM", type: "Kağıt", city: "Bursa", latitude: 40.1956, longitude: 29.0610, pointsValue: 15 },
  { id: "rp-bur-2", name: "NİLÜFER PLASTİK", type: "Plastik", city: "Bursa", latitude: 40.2167, longitude: 28.9833, pointsValue: 20 },
  { id: "rp-bur-3", name: "YILDIRIM METAL", type: "Metal", city: "Bursa", latitude: 40.2117, longitude: 29.1003, pointsValue: 25 },
  // Antalya
  { id: "rp-ant-1", name: "MURATPAŞA GERİ DÖNÜŞÜM", type: "Kağıt", city: "Antalya", latitude: 36.8841, longitude: 30.7056, pointsValue: 15 },
  { id: "rp-ant-2", name: "KONYAALTI PLASTİK", type: "Plastik", city: "Antalya", latitude: 36.8575, longitude: 30.6322, pointsValue: 20 },
  { id: "rp-ant-3", name: "LARA CAM TOPLAMA", type: "Cam", city: "Antalya", latitude: 36.8500, longitude: 30.7833, pointsValue: 18 },
  // Adana
  { id: "rp-ada-1", name: "SEYHAN GERİ DÖNÜŞÜM", type: "Kağıt", city: "Adana", latitude: 37.0017, longitude: 35.3289, pointsValue: 15 },
  { id: "rp-ada-2", name: "YÜREĞİR METAL", type: "Metal", city: "Adana", latitude: 36.9789, longitude: 35.3742, pointsValue: 25 },
  // Konya
  { id: "rp-kon-1", name: "SELÇUKLU GERİ DÖNÜŞÜM", type: "Kağıt", city: "Konya", latitude: 37.8714, longitude: 32.4843, pointsValue: 15 },
  { id: "rp-kon-2", name: "MERAM PLASTİK", type: "Plastik", city: "Konya", latitude: 37.8581, longitude: 32.4587, pointsValue: 20 },
  // Diğer şehirler
  { id: "rp-esk-1", name: "ESKİŞEHİR GERİ DÖNÜŞÜM", type: "Kağıt", city: "Eskişehir", latitude: 39.7767, longitude: 30.5206, pointsValue: 15 },
  { id: "rp-gaz-1", name: "GAZİANTEP PLASTİK", type: "Plastik", city: "Gaziantep", latitude: 37.0662, longitude: 37.3833, pointsValue: 20 },
  { id: "rp-kay-1", name: "KAYSERİ METAL", type: "Metal", city: "Kayseri", latitude: 38.7312, longitude: 35.4787, pointsValue: 25 },
  { id: "rp-tra-1", name: "TRABZON CAM", type: "Cam", city: "Trabzon", latitude: 41.0015, longitude: 39.7178, pointsValue: 18 },
  { id: "rp-mer-1", name: "MERSİN PİL TOPLAMA", type: "Pil", city: "Mersin", latitude: 36.8121, longitude: 34.6415, pointsValue: 22 },
  { id: "rp-sam-1", name: "SAMSUN ELEKTRONİK", type: "Elektronik", city: "Samsun", latitude: 41.2867, longitude: 36.3300, pointsValue: 30 },
  { id: "rp-dyb-1", name: "DİYARBAKIR GERİ DÖNÜŞÜM", type: "Kağıt", city: "Diyarbakır", latitude: 37.9144, longitude: 40.2306, pointsValue: 15 },
];

const typeImage: Record<string, string> = {
  Kağıt: IMG_PAPER,
  Plastik: IMG_PLASTIC,
  Metal: IMG_METAL,
  Cam: IMG_PLASTIC,
  Elektronik: IMG_METAL,
  Pil: IMG_PAPER,
};

for (const point of seededPoints) {
  memStorage.insertRecyclingPointDirect({
    id: point.id,
    name: point.name,
    type: point.type,
    city: point.city,
    latitude: point.latitude,
    longitude: point.longitude,
    imageUrl: typeImage[point.type] ?? IMG_PAPER,
    pointsValue: point.pointsValue,
  });
}

const seededRewards: Reward[] = [
  {
    id: "rw-coffee",
    name: "Kahve İndirimi",
    description: "Anlaşmalı kafelerde 1 kahve için %25 indirim kuponu.",
    cost: 100,
    icon: "☕",
    category: "İndirim",
  },
  {
    id: "rw-cinema",
    name: "Sinema Bileti",
    description: "Hafta içi sinema biletinde 50 TL indirim kuponu.",
    cost: 250,
    icon: "🎬",
    category: "İndirim",
  },
  {
    id: "rw-tree",
    name: "1 Ağaç Dik",
    description: "Senin adına bir fidan dikilir ve sertifika gönderilir.",
    cost: 400,
    icon: "🌳",
    category: "Bağış",
  },
  {
    id: "rw-tshirt",
    name: "Geri Dönüştürülmüş Tişört",
    description: "Geri dönüştürülmüş malzemeden üretilmiş YeşilCepte tişörtü.",
    cost: 800,
    icon: "👕",
    category: "Ürün",
  },
  {
    id: "rw-bottle",
    name: "Çelik Termos",
    description: "Tek kullanımlık şişeye veda. 500ml çelik termos.",
    cost: 600,
    icon: "🧴",
    category: "Ürün",
  },
  {
    id: "rw-bus",
    name: "Toplu Taşıma Kredisi",
    description: "İstanbulkart için 30 TL kredi kuponu.",
    cost: 300,
    icon: "🚌",
    category: "İndirim",
  },
];

for (const reward of seededRewards) {
  memStorage.insertRewardDirect(reward);
}

export const storage: IStorage = memStorage;
export { memStorage };
