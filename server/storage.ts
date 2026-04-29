import { randomUUID } from "crypto";
import {
  type InsertRecyclingPoint,
  type InsertSavedLocation,
  type InsertUser,
  type RecyclingPoint,
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
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private points = new Map<string, RecyclingPoint>();
  private locations = new Map<string, SavedLocation>();

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

  insertUserDirect(user: User) {
    this.users.set(user.id, user);
  }

  insertRecyclingPointDirect(point: RecyclingPoint) {
    this.points.set(point.id, point);
  }

  insertSavedLocationDirect(location: SavedLocation) {
    this.locations.set(location.id, location);
  }
}

const memStorage = new MemStorage();

export const DEMO_USER_ID = "demo-user";

const ISTANBUL_CENTER = { lat: 41.0082, lng: 28.9784 };

memStorage.insertUserDirect({
  id: DEMO_USER_ID,
  username: "demo",
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

export const storage: IStorage = memStorage;
