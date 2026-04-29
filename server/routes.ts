import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  insertSavedLocationSchema,
  recycleActionSchema,
  redeemRewardSchema,
} from "@shared/schema";
import { DEMO_USER_ID, generateRedemptionCode, storage } from "./storage";

function handleZodError(err: unknown, res: Response) {
  if (err instanceof z.ZodError) {
    return res
      .status(400)
      .json({ error: fromZodError(err).toString() });
  }
  return res.status(500).json({ error: "Internal server error" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.get("/api/me", async (_req: Request, res: Response) => {
    const user = await storage.getUser(DEMO_USER_ID);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password: _password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.get("/api/recycling-points", async (_req: Request, res: Response) => {
    const points = await storage.listRecyclingPoints();
    res.json(points);
  });

  app.get("/api/saved-locations", async (_req: Request, res: Response) => {
    const locations = await storage.listSavedLocations(DEMO_USER_ID);
    res.json(locations);
  });

  app.post("/api/saved-locations", async (req: Request, res: Response) => {
    try {
      const parsed = insertSavedLocationSchema
        .omit({ userId: true })
        .parse(req.body);
      const created = await storage.createSavedLocation({
        ...parsed,
        userId: DEMO_USER_ID,
      });
      res.status(201).json(created);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete(
    "/api/saved-locations/:id",
    async (req: Request, res: Response) => {
      const ok = await storage.deleteSavedLocation(req.params.id, DEMO_USER_ID);
      if (!ok) return res.status(404).json({ error: "Location not found" });
      res.status(204).end();
    },
  );

  app.post("/api/recycle", async (req: Request, res: Response) => {
    try {
      const { recyclingPointId, proofImage } = recycleActionSchema.parse(
        req.body,
      );
      const point = await storage.getRecyclingPoint(recyclingPointId);
      if (!point) {
        return res.status(404).json({ error: "Recycling point not found" });
      }
      const updated = await storage.addUserPoints(
        DEMO_USER_ID,
        point.pointsValue,
      );
      if (!updated) return res.status(404).json({ error: "User not found" });
      await storage.createRecyclingHistory({
        userId: DEMO_USER_ID,
        recyclingPointId: point.id,
        pointName: point.name,
        pointType: point.type,
        pointsEarned: point.pointsValue,
        proofImage,
      });
      const { password: _password, ...safeUser } = updated;
      res.json({
        user: safeUser,
        earnedPoints: point.pointsValue,
        recyclingPoint: point,
      });
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.get("/api/history", async (_req: Request, res: Response) => {
    const history = await storage.listRecyclingHistory(DEMO_USER_ID);
    res.json(history);
  });

  app.get("/api/rewards", async (_req: Request, res: Response) => {
    const rewards = await storage.listRewards();
    res.json(rewards);
  });

  app.get("/api/redemptions", async (_req: Request, res: Response) => {
    const redemptions = await storage.listRedemptions(DEMO_USER_ID);
    res.json(redemptions);
  });

  app.get("/api/redemptions/:code", async (req: Request, res: Response) => {
    const redemption = await storage.getRedemptionByCode(req.params.code);
    if (!redemption) {
      return res.status(404).json({ error: "Kod bulunamadı." });
    }
    res.json(redemption);
  });

  app.post(
    "/api/redemptions/:code/use",
    async (req: Request, res: Response) => {
      const existing = await storage.getRedemptionByCode(req.params.code);
      if (!existing) {
        return res.status(404).json({ error: "Kod bulunamadı." });
      }
      if (existing.usedAt) {
        return res
          .status(400)
          .json({ error: "Bu kod zaten kullanıldı.", redemption: existing });
      }
      const updated = await storage.markRedemptionUsed(req.params.code);
      res.json(updated);
    },
  );

  app.post("/api/rewards/redeem", async (req: Request, res: Response) => {
    try {
      const { rewardId } = redeemRewardSchema.parse(req.body);
      const reward = await storage.getReward(rewardId);
      if (!reward) {
        return res.status(404).json({ error: "Reward not found" });
      }
      const user = await storage.getUser(DEMO_USER_ID);
      if (!user) return res.status(404).json({ error: "User not found" });
      if (user.points < reward.cost) {
        return res
          .status(400)
          .json({ error: "Yetersiz puan. Daha fazla geri dönüştür." });
      }
      const updated = await storage.addUserPoints(DEMO_USER_ID, -reward.cost);
      if (!updated) return res.status(404).json({ error: "User not found" });
      const code = generateRedemptionCode();
      const redemption = await storage.createRedemption({
        userId: DEMO_USER_ID,
        rewardId: reward.id,
        rewardName: reward.name,
        rewardIcon: reward.icon,
        rewardDescription: reward.description,
        cost: reward.cost,
        code,
      });
      const { password: _password, ...safeUser } = updated;
      res.json({ user: safeUser, reward, redemption });
    } catch (err) {
      handleZodError(err, res);
    }
  });

  return httpServer;
}
