import { sql } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  points: integer("points").notNull().default(0),
});

export const recyclingPoints = pgTable("recycling_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  imageUrl: text("image_url").notNull(),
  pointsValue: integer("points_value").notNull().default(10),
});

export const savedLocations = pgTable("saved_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
});

export const recyclingHistory = pgTable("recycling_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  recyclingPointId: varchar("recycling_point_id").notNull(),
  pointName: text("point_name").notNull(),
  pointType: text("point_type").notNull(),
  pointsEarned: integer("points_earned").notNull(),
  proofImage: text("proof_image").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cost: integer("cost").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
});

export const redemptions = pgTable("redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  rewardId: varchar("reward_id").notNull(),
  rewardName: text("reward_name").notNull(),
  rewardIcon: text("reward_icon").notNull(),
  rewardDescription: text("reward_description").notNull(),
  cost: integer("cost").notNull(),
  code: text("code").notNull().unique(),
  redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
  usedAt: timestamp("used_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRecyclingPointSchema = createInsertSchema(
  recyclingPoints,
).omit({ id: true });

export const insertSavedLocationSchema = createInsertSchema(
  savedLocations,
).omit({ id: true });

export const recycleActionSchema = z.object({
  recyclingPointId: z.string().min(1),
  proofImage: z
    .string()
    .min(1, "Geri dönüşüm fotoğrafı zorunludur.")
    .startsWith("data:image/", "Geçerli bir fotoğraf gerekli."),
});

export const redeemRewardSchema = z.object({
  rewardId: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRecyclingPoint = z.infer<typeof insertRecyclingPointSchema>;
export type RecyclingPoint = typeof recyclingPoints.$inferSelect;

export type InsertSavedLocation = z.infer<typeof insertSavedLocationSchema>;
export type SavedLocation = typeof savedLocations.$inferSelect;

export type RecyclingHistory = typeof recyclingHistory.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type Redemption = typeof redemptions.$inferSelect;

export type RecycleAction = z.infer<typeof recycleActionSchema>;
export type RedeemReward = z.infer<typeof redeemRewardSchema>;
