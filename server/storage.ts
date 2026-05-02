import { randomBytes, randomUUID } from "crypto";
import { pool } from "./db";
import type {
  RecyclingHistory,
  RecyclingPoint,
  Redemption,
  Reward,
  SavedLocation,
  SavedLocationInput,
  User,
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
  createSavedLocation(userId: string, location: SavedLocationInput): Promise<SavedLocation>;
  deleteSavedLocation(id: string, userId: string): Promise<boolean>;

  listRecyclingHistory(userId: string): Promise<RecyclingHistory[]>;
  createRecyclingHistory(entry: Omit<RecyclingHistory, "id" | "createdAt">): Promise<RecyclingHistory>;

  listRewards(): Promise<Reward[]>;
  getReward(id: string): Promise<Reward | undefined>;

  listRedemptions(userId: string): Promise<Redemption[]>;
  getRedemptionByCode(code: string): Promise<Redemption | undefined>;
  createRedemption(
    entry: Omit<Redemption, "id" | "redeemedAt" | "usedAt" | "code"> & { code: string },
  ): Promise<Redemption>;
  markRedemptionUsed(code: string): Promise<Redemption | undefined>;
}

// ─── Row mappers ──────────────────────────────────────────────────────────────

function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    password: row.password,
    points: row.points,
  };
}

function rowToRecyclingPoint(row: any): RecyclingPoint {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    city: row.city,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    pointsValue: row.points_value,
    imageUrl: row.image_url,
  };
}

function rowToSavedLocation(row: any): SavedLocation {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
  };
}

function rowToRecyclingHistory(row: any): RecyclingHistory {
  return {
    id: row.id,
    userId: row.user_id,
    recyclingPointId: row.recycling_point_id,
    pointName: row.point_name,
    pointType: row.point_type,
    pointsEarned: row.points_earned,
    proofImage: row.proof_image,
    createdAt: row.created_at,
  };
}

function rowToReward(row: any): Reward {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    cost: row.cost,
    icon: row.icon,
    category: row.category,
  };
}

function rowToRedemption(row: any): Redemption {
  return {
    id: row.id,
    userId: row.user_id,
    rewardId: row.reward_id,
    rewardName: row.reward_name,
    rewardIcon: row.reward_icon,
    rewardDescription: row.reward_description,
    cost: row.cost,
    code: row.code,
    redeemedAt: row.redeemed_at,
    usedAt: row.used_at ?? null,
  };
}

// ─── DatabaseStorage ──────────────────────────────────────────────────────────

class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0] ? rowToUser(rows[0]) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.trim().toLowerCase()],
    );
    return rows[0] ? rowToUser(rows[0]) : undefined;
  }

  async createUser(input: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<User> {
    const id = randomUUID();
    const email = input.email.trim().toLowerCase();
    const { rows } = await pool.query(
      `INSERT INTO users (id, email, display_name, password, points)
       VALUES ($1, $2, $3, $4, 0) RETURNING *`,
      [id, email, input.displayName.trim(), input.password],
    );
    const user = rowToUser(rows[0]);
    await this.seedDefaultLocations(id);
    return user;
  }

  private async seedDefaultLocations(userId: string) {
    const istanbul = { lat: 41.0082, lng: 28.9784 };
    await pool.query(
      `INSERT INTO saved_locations (id, user_id, name, latitude, longitude)
       VALUES ($1, $2, 'Ev', $3, $4), ($5, $2, 'Okul', $6, $7)`,
      [
        randomUUID(), userId, istanbul.lat, istanbul.lng,
        randomUUID(), istanbul.lat + 0.015, istanbul.lng + 0.01,
      ],
    );
  }

  async addUserPoints(userId: string, delta: number): Promise<User | undefined> {
    const { rows } = await pool.query(
      `UPDATE users SET points = points + $1 WHERE id = $2 RETURNING *`,
      [delta, userId],
    );
    return rows[0] ? rowToUser(rows[0]) : undefined;
  }

  async listRecyclingPoints(): Promise<RecyclingPoint[]> {
    const { rows } = await pool.query("SELECT * FROM recycling_points ORDER BY name");
    return rows.map(rowToRecyclingPoint);
  }

  async getRecyclingPoint(id: string): Promise<RecyclingPoint | undefined> {
    const { rows } = await pool.query("SELECT * FROM recycling_points WHERE id = $1", [id]);
    return rows[0] ? rowToRecyclingPoint(rows[0]) : undefined;
  }

  async listSavedLocations(userId: string): Promise<SavedLocation[]> {
    const { rows } = await pool.query(
      "SELECT * FROM saved_locations WHERE user_id = $1 ORDER BY name",
      [userId],
    );
    return rows.map(rowToSavedLocation);
  }

  async createSavedLocation(userId: string, input: SavedLocationInput): Promise<SavedLocation> {
    const id = randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO saved_locations (id, user_id, name, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, userId, input.name.trim(), input.latitude, input.longitude],
    );
    return rowToSavedLocation(rows[0]);
  }

  async deleteSavedLocation(id: string, userId: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      "DELETE FROM saved_locations WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    return (rowCount ?? 0) > 0;
  }

  async listRecyclingHistory(userId: string): Promise<RecyclingHistory[]> {
    const { rows } = await pool.query(
      "SELECT * FROM recycling_history WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    return rows.map(rowToRecyclingHistory);
  }

  async createRecyclingHistory(
    entry: Omit<RecyclingHistory, "id" | "createdAt">,
  ): Promise<RecyclingHistory> {
    const id = randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO recycling_history
         (id, user_id, recycling_point_id, point_name, point_type, points_earned, proof_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        id,
        entry.userId,
        entry.recyclingPointId,
        entry.pointName,
        entry.pointType,
        entry.pointsEarned,
        entry.proofImage,
      ],
    );
    return rowToRecyclingHistory(rows[0]);
  }

  async listRewards(): Promise<Reward[]> {
    const { rows } = await pool.query("SELECT * FROM rewards ORDER BY cost ASC");
    return rows.map(rowToReward);
  }

  async getReward(id: string): Promise<Reward | undefined> {
    const { rows } = await pool.query("SELECT * FROM rewards WHERE id = $1", [id]);
    return rows[0] ? rowToReward(rows[0]) : undefined;
  }

  async listRedemptions(userId: string): Promise<Redemption[]> {
    const { rows } = await pool.query(
      "SELECT * FROM redemptions WHERE user_id = $1 ORDER BY redeemed_at DESC",
      [userId],
    );
    return rows.map(rowToRedemption);
  }

  async getRedemptionByCode(code: string): Promise<Redemption | undefined> {
    const { rows } = await pool.query(
      "SELECT * FROM redemptions WHERE code = $1",
      [code],
    );
    return rows[0] ? rowToRedemption(rows[0]) : undefined;
  }

  async createRedemption(
    entry: Omit<Redemption, "id" | "redeemedAt" | "usedAt" | "code"> & { code: string },
  ): Promise<Redemption> {
    const id = randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO redemptions
         (id, user_id, reward_id, reward_name, reward_icon, reward_description, cost, code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        id,
        entry.userId,
        entry.rewardId,
        entry.rewardName,
        entry.rewardIcon,
        entry.rewardDescription,
        entry.cost,
        entry.code,
      ],
    );
    return rowToRedemption(rows[0]);
  }

  async markRedemptionUsed(code: string): Promise<Redemption | undefined> {
    const { rows } = await pool.query(
      `UPDATE redemptions SET used_at = NOW() WHERE code = $1 AND used_at IS NULL RETURNING *`,
      [code],
    );
    if (rows[0]) return rowToRedemption(rows[0]);
    // Already used — return existing
    return this.getRedemptionByCode(code);
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

export const storage: IStorage = new DatabaseStorage();
