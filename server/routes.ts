import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertCommunitySchema, insertPostSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  app.get("/api/communities", async (req, res) => {
    const query = req.query.q as string | undefined;
    const communities = await storage.listCommunities(query);
    res.json(communities);
  });

  app.get("/api/communities/:id", async (req, res) => {
    const community = await storage.getCommunity(Number(req.params.id));
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    res.json(community);
  });

  app.post("/api/communities", requireAuth, async (req, res) => {
    const result = insertCommunitySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid community data" });
    }

    const community = await storage.createCommunity({
      ...result.data,
      creatorId: req.user!.id,
    });
    res.status(201).json(community);
  });

  app.post("/api/communities/:id/join", requireAuth, async (req, res) => {
    const communityId = Number(req.params.id);
    if (!(await storage.getCommunity(communityId))) {
      return res.status(404).json({ message: "Community not found" });
    }

    await storage.joinCommunity(req.user!.id, communityId);
    res.sendStatus(200);
  });

  app.post("/api/communities/:id/leave", requireAuth, async (req, res) => {
    const communityId = Number(req.params.id);
    if (!(await storage.getCommunity(communityId))) {
      return res.status(404).json({ message: "Community not found" });
    }

    await storage.leaveCommunity(req.user!.id, communityId);
    res.sendStatus(200);
  });

  app.get("/api/communities/:id/posts", async (req, res) => {
    const posts = await storage.listPosts(Number(req.params.id));
    res.json(posts);
  });

  app.post("/api/communities/:id/posts", requireAuth, async (req, res) => {
    const result = insertPostSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid post data" });
    }

    const post = await storage.createPost({
      ...result.data,
      communityId: Number(req.params.id),
      authorId: req.user!.id,
    });
    res.status(201).json(post);
  });

  const httpServer = createServer(app);
  return httpServer;
}
