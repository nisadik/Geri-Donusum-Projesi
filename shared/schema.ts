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
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  points: integer("points").notNull().default(0),
});

export const recyclingPoints = pgTable("recycling_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  city: text("city").notNull(),
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

export const registerSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi gir."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı."),
  displayName: z
    .string()
    .min(2, "İsim en az 2 karakter olmalı.")
    .max(40, "İsim en fazla 40 karakter olabilir."),
});

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi gir."),
  password: z.string().min(1, "Şifreni gir."),
});

export const insertRecyclingPointSchema = createInsertSchema(
  recyclingPoints,
).omit({ id: true });

export const savedLocationInputSchema = z.object({
  name: z
    .string()
    .min(1, "Konum adı gerekli.")
    .max(30, "Konum adı en fazla 30 karakter olabilir."),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, "password">;

export type InsertRecyclingPoint = z.infer<typeof insertRecyclingPointSchema>;
export type RecyclingPoint = typeof recyclingPoints.$inferSelect;

export type SavedLocationInput = z.infer<typeof savedLocationInputSchema>;
export type SavedLocation = typeof savedLocations.$inferSelect;

export type RecyclingHistory = typeof recyclingHistory.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type Redemption = typeof redemptions.$inferSelect;

export type RecycleAction = z.infer<typeof recycleActionSchema>;
export type RedeemReward = z.infer<typeof redeemRewardSchema>;
