import type { Express, NextFunction, Request, Response } from "express";
import { type Server } from "http";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  loginSchema,
  recycleActionSchema,
  redeemRewardSchema,
  registerSchema,
  savedLocationInputSchema,
} from "@shared/schema";
import { hashPassword, verifyPassword } from "./auth";
import { generateRedemptionCode, storage } from "./storage";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

function handleZodError(err: unknown, res: Response) {
  if (err instanceof z.ZodError) {
    return res
      .status(400)
      .json({ error: fromZodError(err).toString() });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Giriş yapman gerekiyor." });
  }
  next();
}

function publicUser(user: {
  id: string;
  email: string;
  displayName: string;
  points: number;
}) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    points: user.points,
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res
          .status(409)
          .json({ error: "Bu e-posta ile zaten bir hesap var." });
      }
      const hashed = await hashPassword(data.password);
      const user = await storage.createUser({
        email: data.email,
        password: hashed,
        displayName: data.displayName,
      });
      req.session.userId = user.id;
      res.status(201).json(publicUser(user));
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res
          .status(401)
          .json({ error: "E-posta veya şifre hatalı." });
      }
      const ok = await verifyPassword(data.password, user.password);
      if (!ok) {
        return res
          .status(401)
          .json({ error: "E-posta veya şifre hatalı." });
      }
      req.session.userId = user.id;
      res.json(publicUser(user));
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });

  app.get("/api/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Giriş yapılmadı." });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "Hesap bulunamadı." });
    }
    res.json(publicUser(user));
  });

  app.get("/api/recycling-points", async (_req: Request, res: Response) => {
    const points = await storage.listRecyclingPoints();
    res.json(points);
  });

  app.get(
    "/api/saved-locations",
    requireAuth,
    async (req: Request, res: Response) => {
      const locations = await storage.listSavedLocations(req.session.userId!);
      res.json(locations);
    },
  );

  app.post(
    "/api/saved-locations",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const parsed = savedLocationInputSchema.parse(req.body);
        const created = await storage.createSavedLocation(
          req.session.userId!,
          parsed,
        );
        res.status(201).json(created);
      } catch (err) {
        handleZodError(err, res);
      }
    },
  );

  app.delete(
    "/api/saved-locations/:id",
    requireAuth,
    async (req: Request, res: Response) => {
      const ok = await storage.deleteSavedLocation(
        req.params.id,
        req.session.userId!,
      );
      if (!ok) return res.status(404).json({ error: "Konum bulunamadı." });
      res.status(204).end();
    },
  );

  app.post(
    "/api/recycle",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const { recyclingPointId, proofImage } = recycleActionSchema.parse(
          req.body,
        );
        const point = await storage.getRecyclingPoint(recyclingPointId);
        if (!point) {
          return res.status(404).json({ error: "Geri dönüşüm noktası bulunamadı." });
        }
        const updated = await storage.addUserPoints(
          req.session.userId!,
          point.pointsValue,
        );
        if (!updated) return res.status(404).json({ error: "Hesap bulunamadı." });
        await storage.createRecyclingHistory({
          userId: req.session.userId!,
          recyclingPointId: point.id,
          pointName: point.name,
          pointType: point.type,
          pointsEarned: point.pointsValue,
          proofImage,
        });
        res.json({
          user: publicUser(updated),
          earnedPoints: point.pointsValue,
          recyclingPoint: point,
        });
      } catch (err) {
        handleZodError(err, res);
      }
    },
  );

  app.get(
    "/api/history",
    requireAuth,
    async (req: Request, res: Response) => {
      const history = await storage.listRecyclingHistory(req.session.userId!);
      res.json(history);
    },
  );

  app.get("/api/rewards", async (_req: Request, res: Response) => {
    const rewards = await storage.listRewards();
    res.json(rewards);
  });

  app.get(
    "/api/redemptions",
    requireAuth,
    async (req: Request, res: Response) => {
      const redemptions = await storage.listRedemptions(req.session.userId!);
      res.json(redemptions);
    },
  );

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

  app.post(
    "/api/rewards/redeem",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const { rewardId } = redeemRewardSchema.parse(req.body);
        const reward = await storage.getReward(rewardId);
        if (!reward) {
          return res.status(404).json({ error: "Ödül bulunamadı." });
        }
        const user = await storage.getUser(req.session.userId!);
        if (!user) return res.status(404).json({ error: "Hesap bulunamadı." });
        if (user.points < reward.cost) {
          return res
            .status(400)
            .json({ error: "Yetersiz puan. Daha fazla geri dönüştür." });
        }
        const updated = await storage.addUserPoints(user.id, -reward.cost);
        if (!updated) return res.status(404).json({ error: "Hesap bulunamadı." });
        const code = generateRedemptionCode();
        const redemption = await storage.createRedemption({
          userId: user.id,
          rewardId: reward.id,
          rewardName: reward.name,
          rewardIcon: reward.icon,
          rewardDescription: reward.description,
          cost: reward.cost,
          code,
        });
        res.json({ user: publicUser(updated), reward, redemption });
      } catch (err) {
        handleZodError(err, res);
      }
    },
  );

  return httpServer;
}
