import { pgTable, text, serial, integer, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";
import { users } from "./models/auth";

export * from "./models/auth";

export const blogInfo = pgTable("blog_info", {
  id: serial("id").primaryKey(),
  intro: text("intro").default("yo i'm shahaan :)").notNull(),
  thingsILike: text("things_i_like").default("football, films, badminton, cats, running, writing, working out, art, culture").notNull(),
  expect: text("expect").default("stuff about things i like, my thoughts on some topical news, film reviews etc").notNull(),
  letterboxd: text("letterboxd").default("@meowpeeps").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postsRelations = relations(posts, ({ many }) => ({
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

export const insertPostSchema = createInsertSchema(posts).omit({ id: true, likes: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertBlogInfoSchema = createInsertSchema(blogInfo).omit({ id: true, updatedAt: true });

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type BlogInfo = typeof blogInfo.$inferSelect;
export type InsertBlogInfo = z.infer<typeof insertBlogInfoSchema>;

import { type UpsertUser } from "./models/auth";
export type InsertUser = UpsertUser;
