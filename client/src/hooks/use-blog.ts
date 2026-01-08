import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertPost, type InsertComment } from "@shared/schema";
import { z } from "zod";

// ============================================
// BLOG POSTS HOOKS
// ============================================

export function usePosts() {
  return useQuery({
    queryKey: [api.posts.list.path],
    queryFn: async () => {
      const res = await fetch(api.posts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return api.posts.list.responses[200].parse(await res.json());
    },
  });
}

export function usePost(id: number) {
  return useQuery({
    queryKey: [api.posts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.posts.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch post");
      return api.posts.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPost) => {
      const validated = api.posts.create.input.parse(data);
      const res = await fetch(api.posts.create.path, {
        method: api.posts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create post");
      return api.posts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.posts.list.path] }),
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.posts.like.path, { id });
      const res = await fetch(url, { 
        method: api.posts.like.method, 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to like post");
      return api.posts.like.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.posts.get.path, data.id] });
    },
  });
}

// ============================================
// COMMENTS HOOKS
// ============================================

export function useComments(postId: number) {
  return useQuery({
    queryKey: [api.comments.list.path, postId],
    queryFn: async () => {
      const url = buildUrl(api.comments.list.path, { id: postId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch comments");
      return api.comments.list.responses[200].parse(await res.json());
    },
    enabled: !isNaN(postId),
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, ...data }: InsertComment) => {
      const validated = api.comments.create.input.parse(data);
      const url = buildUrl(api.comments.create.path, { id: postId });
      const res = await fetch(url, {
        method: api.comments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to post comment");
      return api.comments.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.comments.list.path, variables.postId] });
    },
  });
}
