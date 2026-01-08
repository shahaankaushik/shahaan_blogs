import { usePost, useComments, useCreateComment, useLikePost } from "@/hooks/use-blog";
import { useRoute } from "wouter";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCommentSchema, type InsertComment, api } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Heart, ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function PostDetail() {
  const { user } = useAuth();
  const [match, params] = useRoute("/post/:id");
  const id = parseInt(params?.id || "0");
  
  const { data: post, isLoading: postLoading } = usePost(id);
  const { data: comments, isLoading: commentsLoading } = useComments(id);
  const likePost = useLikePost();
  const createComment = useCreateComment();

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed to delete comment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${id}/comments`] });
    },
  });

  const form = useForm<Omit<InsertComment, "postId">>({
    resolver: zodResolver(insertCommentSchema.omit({ postId: true })),
    defaultValues: {
      authorName: "",
      content: "",
    },
  });

  if (postLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-4 lowercase">post not found</h1>
        <Link href="/" className="text-primary hover:underline lowercase">back to home</Link>
      </div>
    );
  }

  const handleLike = () => {
    likePost.mutate(id);
  };

  const onSubmit = (data: Omit<InsertComment, "postId">) => {
    createComment.mutate({ ...data, postId: id }, {
      onSuccess: () => {
        form.reset();
      }
    });
  };

  return (
    <div className="min-h-screen pb-20 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8">
        <nav className="flex items-center justify-between">
          <Link href="/" className="small-button bg-card/80 backdrop-blur-sm border border-primary/20 px-3 py-1 flex items-center text-muted-foreground hover:text-primary transition-colors lowercase shadow-sm">
            <ArrowLeft className="w-3 h-3 mr-1" /> back
          </Link>
          <div className="small-button bg-card/80 backdrop-blur-sm border border-primary/20 px-3 py-1 lowercase text-[10px] text-muted-foreground shadow-sm">shahaan's blog</div>
        </nav>

        <main className="space-y-8">
          <header className="text-center space-y-6">
          <div className="flex justify-center">
            <h1 className="small-button bg-card/90 backdrop-blur-md border-2 border-primary/30 px-6 py-3 text-3xl font-normal leading-tight lowercase shadow-2xl">{post.title}</h1>
          </div>
          <div className="flex justify-center">
            <div className="small-button bg-card/80 backdrop-blur-sm border border-primary/20 px-3 py-1 text-[10px] text-muted-foreground lowercase shadow-sm">
              {format(new Date(post.createdAt), 'MMMM d, yyyy')}
            </div>
          </div>
            
            {post.imageUrl && (
              <div className="rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl">
                <img src={post.imageUrl} alt={post.title} className="w-full object-cover max-h-[400px] opacity-90" />
              </div>
            )}
          </header>

          <article className="cute-card !bg-card p-6 space-y-4">
            {post.content.split('\n').map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed lowercase">{paragraph}</p>
            ))}
          </article>

          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-2 group relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className="w-12 h-12 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center group-hover:border-primary transition-all relative"
              >
                <Heart className={`w-6 h-6 ${post.likes > 0 ? 'fill-accent text-accent' : 'text-foreground'} transition-colors`} />
                <AnimatePresence>
                  {likePost.isPending && (
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <Heart className="w-6 h-6 fill-accent text-accent" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              {user && <span className="text-[10px] opacity-50 lowercase">{post.likes} likes</span>}
            </div>
          </div>

          <section className="space-y-6 pt-8 border-t border-primary/10">
            <div className="flex justify-start">
              <div className="small-button bg-card/80 backdrop-blur-sm border border-primary/20 px-4 py-1.5 text-sm lowercase shadow-sm">
                comments ({comments?.length || 0})
              </div>
            </div>
            
            <div className="space-y-4">
              {comments?.map((comment) => (
                <div key={comment.id} className="cute-card !bg-card/20 p-4 space-y-2 relative group">
                  <div className="flex items-center justify-between text-[10px] opacity-50">
                    <span className="font-bold text-primary lowercase">{comment.authorName}</span>
                    <div className="flex items-center gap-2">
                      <span>{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</span>
                      {user && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-4 w-4 opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs lowercase">{comment.content}</p>
                </div>
              ))}
            </div>

            <div className="cute-card p-6">
              <h4 className="text-sm mb-4 lowercase">leave a comment</h4>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="authorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="your name" 
                            {...field} 
                            className="bg-background/50 border-primary/20 lowercase h-8 text-xs"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="your thoughts" 
                            {...field} 
                            className="bg-background/50 border-primary/20 lowercase min-h-[80px] text-xs"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={createComment.isPending}
                    size="sm"
                    className="w-full bg-primary text-primary-foreground lowercase text-xs h-8"
                  >
                    {createComment.isPending ? "posting..." : "post comment"}
                  </Button>
                </form>
              </Form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
