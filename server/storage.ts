import { randomUUID } from "crypto";
import {
  type InsertRecyclingPoint,
  type InsertSavedLocation,
  type InsertUser,
  type RecyclingHistory,
  type RecyclingPoint,
  type Reward,
  type SavedLocation,
  type User,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  addUserPoints(userId: string, delta: number): Promise<User | undefined>;

  listRecyclingPoints(): Promise<RecyclingPoint[]>;
  getRecyclingPoint(id: string): Promise<RecyclingPoint | undefined>;
  createRecyclingPoint(point: InsertRecyclingPoint): Promise<RecyclingPoint>;

  listSavedLocations(userId: string): Promise<SavedLocation[]>;
  createSavedLocation(location: InsertSavedLocation): Promise<SavedLocation>;
  deleteSavedLocation(id: string, userId: string): Promise<boolean>;

  listRecyclingHistory(userId: string): Promise<RecyclingHistory[]>;
  createRecyclingHistory(
    entry: Omit<RecyclingHistory, "id" | "createdAt">,
  ): Promise<RecyclingHistory>;

  listRewards(): Promise<Reward[]>;
  getReward(id: string): Promise<Reward | undefined>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private points = new Map<string, RecyclingPoint>();
  private locations = new Map<string, SavedLocation>();
  private history = new Map<string, RecyclingHistory>();
  private rewards = new Map<string, Reward>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, points: 0 };
    this.users.set(id, user);
    return user;
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

  async createRecyclingPoint(
    point: InsertRecyclingPoint,
  ): Promise<RecyclingPoint> {
    const id = randomUUID();
    const created: RecyclingPoint = {
      ...point,
      id,
      pointsValue: point.pointsValue ?? 10,
    };
    this.points.set(id, created);
    return created;
  }

  async listSavedLocations(userId: string): Promise<SavedLocation[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.userId === userId,
    );
  }

  async createSavedLocation(
    location: InsertSavedLocation,
  ): Promise<SavedLocation> {
    const id = randomUUID();
    const created: SavedLocation = { ...location, id };
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

  insertUserDirect(user: User) {
    this.users.set(user.id, user);
  }

  insertRecyclingPointDirect(point: RecyclingPoint) {
    this.points.set(point.id, point);
  }

  insertSavedLocationDirect(location: SavedLocation) {
    this.locations.set(location.id, location);
  }

  insertRewardDirect(reward: Reward) {
    this.rewards.set(reward.id, reward);
  }
}

const memStorage = new MemStorage();

export const DEMO_USER_ID = "demo-user";

const ISTANBUL_CENTER = { lat: 41.0082, lng: 28.9784 };

memStorage.insertUserDirect({
  id: DEMO_USER_ID,
  username: "Yeşil Kahraman",
  password: "demo",
  points: 300,
});

const seededPoints: RecyclingPoint[] = [
  {
    id: "rp-arden",
    name: "ARDEN KAĞITÇILIK",
    type: "Kağıt",
    latitude: ISTANBUL_CENTER.lat + 0.005,
    longitude: ISTANBUL_CENTER.lng + 0.003,
    imageUrl: "/figmaAssets/rectangle-8.svg",
    pointsValue: 15,
  },
  {
    id: "rp-aras",
    name: "ARAS GERİ DÖNÜŞÜM",
    type: "Plastik",
    latitude: ISTANBUL_CENTER.lat + 0.012,
    longitude: ISTANBUL_CENTER.lng - 0.008,
    imageUrl: "/figmaAssets/rectangle-8-2.svg",
    pointsValue: 20,
  },
  {
    id: "rp-yusuf",
    name: "YUSUF METAL",
    type: "Metal",
    latitude: ISTANBUL_CENTER.lat - 0.011,
    longitude: ISTANBUL_CENTER.lng + 0.009,
    imageUrl: "/figmaAssets/rectangle-8-1.svg",
    pointsValue: 25,
  },
  {
    id: "rp-cam",
    name: "EGE CAM GERİ DÖNÜŞÜM",
    type: "Cam",
    latitude: ISTANBUL_CENTER.lat - 0.018,
    longitude: ISTANBUL_CENTER.lng - 0.014,
    imageUrl: "/figmaAssets/rectangle-8-2.svg",
    pointsValue: 18,
  },
  {
    id: "rp-elektronik",
    name: "TEKNO ELEKTRONİK",
    type: "Elektronik",
    latitude: ISTANBUL_CENTER.lat + 0.022,
    longitude: ISTANBUL_CENTER.lng + 0.016,
    imageUrl: "/figmaAssets/rectangle-8-1.svg",
    pointsValue: 30,
  },
  {
    id: "rp-pil",
    name: "YEŞİL PİL TOPLAMA",
    type: "Pil",
    latitude: ISTANBUL_CENTER.lat + 0.007,
    longitude: ISTANBUL_CENTER.lng - 0.02,
    imageUrl: "/figmaAssets/rectangle-8.svg",
    pointsValue: 22,
  },
];

for (const point of seededPoints) {
  memStorage.insertRecyclingPointDirect(point);
}

memStorage.insertSavedLocationDirect({
  id: "loc-ev",
  userId: DEMO_USER_ID,
  name: "Ev",
  latitude: ISTANBUL_CENTER.lat,
  longitude: ISTANBUL_CENTER.lng,
});

memStorage.insertSavedLocationDirect({
  id: "loc-okul",
  userId: DEMO_USER_ID,
  name: "Okul",
  latitude: ISTANBUL_CENTER.lat + 0.015,
  longitude: ISTANBUL_CENTER.lng + 0.01,
});

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
    description: "Geri dönüştürülmüş malzemeden üretilmiş Atık Yeri tişörtü.",
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
