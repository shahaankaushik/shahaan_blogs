import { z } from "zod";
import { insertPostSchema, insertCommentSchema, insertBlogInfoSchema, posts, comments, blogInfo } from "./schema";

export const api = {
  blogInfo: {
    get: {
      method: "GET" as const,
      path: "/api/blog-info",
      responses: {
        200: z.custom<typeof blogInfo.$inferSelect>(),
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/blog-info",
      input: insertBlogInfoSchema.partial(),
      responses: {
        200: z.custom<typeof blogInfo.$inferSelect>(),
        401: z.object({ message: z.string() }),
      },
    },
  },
  posts: {
    list: {
      method: "GET" as const,
      path: "/api/posts",
      responses: {
        200: z.array(z.custom<typeof posts.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/posts/:id",
      responses: {
        200: z.custom<typeof posts.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/posts",
      input: insertPostSchema,
      responses: {
        201: z.custom<typeof posts.$inferSelect>(),
        401: z.object({ message: z.string() }),
      },
    },
    like: {
      method: "POST" as const,
      path: "/api/posts/:id/like",
      responses: {
        200: z.custom<typeof posts.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
  },
  comments: {
    create: {
      method: "POST" as const,
      path: "/api/posts/:id/comments",
      input: insertCommentSchema.omit({ postId: true }),
      responses: {
        201: z.custom<typeof comments.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    list: {
      method: "GET" as const,
      path: "/api/posts/:id/comments",
      responses: {
        200: z.array(z.custom<typeof comments.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
