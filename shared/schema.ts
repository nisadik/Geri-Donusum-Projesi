import { sql } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  pgTable,
  text,
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
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRecyclingPoint = z.infer<typeof insertRecyclingPointSchema>;
export type RecyclingPoint = typeof recyclingPoints.$inferSelect;

export type InsertSavedLocation = z.infer<typeof insertSavedLocationSchema>;
export type SavedLocation = typeof savedLocations.$inferSelect;

export type RecycleAction = z.infer<typeof recycleActionSchema>;
