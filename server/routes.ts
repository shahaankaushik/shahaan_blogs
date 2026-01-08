import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";
import { setupAuth } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  setupAuth(app);

  app.get(api.blogInfo.get.path, async (req, res) => {
    const info = await storage.getBlogInfo();
    res.json(info);
  });

  app.put(api.blogInfo.update.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const parsed = insertBlogInfoSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const info = await storage.updateBlogInfo(parsed.data);
    res.json(info);
  });

  app.get(api.posts.list.path, async (req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  app.get(api.posts.get.path, async (req, res) => {
    const post = await storage.getPost(Number(req.params.id));
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  });

  app.post(api.posts.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const parsed = insertPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const post = await storage.createPost(parsed.data);
    res.status(201).json(post);
  });

  app.post(api.posts.like.path, async (req, res) => {
    const post = await storage.likePost(Number(req.params.id));
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  });

  app.get(api.comments.list.path, async (req, res) => {
    const comments = await storage.getComments(Number(req.params.id));
    res.json(comments);
  });

  app.post(api.comments.create.path, async (req, res) => {
    const parsed = insertCommentSchema.omit({ postId: true }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const comment = await storage.createComment({
      ...parsed.data,
      postId: Number(req.params.id),
    });
    res.status(201).json(comment);
  });

  // Seed data
  const existingPosts = await storage.getPosts();
  if (existingPosts.length === 0) {
    await storage.createPost({
      title: "Welcome to my Blog",
      content: "This is the first post on Shahaan's blog. Welcome!",
      imageUrl: "https://images.unsplash.com/photo-1542332205-4da5d4719604", // Tennis court placeholder or generic
    });
  }

  return httpServer;
}
