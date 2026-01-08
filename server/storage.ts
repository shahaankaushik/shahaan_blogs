import { users, posts, comments, blogInfo, type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment, type BlogInfo, type InsertBlogInfo } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  likePost(id: number): Promise<Post | undefined>;

  getComments(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<void>;

  getBlogInfo(): Promise<BlogInfo>;
  updateBlogInfo(info: Partial<InsertBlogInfo>): Promise<BlogInfo>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(insertPost).returning();
    return post;
  }

  async likePost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    if (!post) return undefined;
    
    const [updated] = await db.update(posts)
      .set({ likes: post.likes + 1 })
      .where(eq(posts.id, id))
      .returning();
    return updated;
  }

  async getComments(postId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async getBlogInfo(): Promise<BlogInfo> {
    const [info] = await db.select().from(blogInfo);
    if (!info) {
      const [newInfo] = await db.insert(blogInfo).values({}).returning();
      return newInfo;
    }
    return info;
  }

  async updateBlogInfo(updates: Partial<InsertBlogInfo>): Promise<BlogInfo> {
    const info = await this.getBlogInfo();
    const [updated] = await db.update(blogInfo)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogInfo.id, info.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
