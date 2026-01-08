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

  app.delete(api.comments.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await storage.deleteComment(Number(req.params.id));
    res.json({ success: true });
  });

  // Seed data
  const existingPosts = await storage.getPosts();
  if (existingPosts.length === 0) {
    await storage.createPost({
      title: "never coming back",
      content: `When you explore the surface, you interact with a lot of aquatic animals. But when you explore the vast depths, the traits you find in the aquatic animals are very different and, in a way, superior. But it comes with a “limitation” of not getting enough sunlight. As you go deeper, the pressure increases exponentially. At that depth, most would implode. But the ones who survive get to embark on an adventure, an eye feast that takes a fortune of a lifetime. At the bed, you can see the debris of the sunken ships and the skeletons of the drowned sailors, the pirates and the fishermen. The flora that grew through the eye of the skull. The sea stars that dwell in the caves. All this is the 1% known to mankind. If you reach there, you'll be alone. There's a high probability your oxygen is almost over. There's no way back up from here. You've come too far to go back. This is the moment you live your solitude. Absorb that moment, like the sunlight you will never have again. This is the point where the life ends. Below this, resides a trench where another life flourishes.`,
      imageUrl: "https://images.unsplash.com/photo-1518467166778-b88f373ffec7",
    });
  }

  return httpServer;
}
