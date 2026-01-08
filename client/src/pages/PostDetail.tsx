import { usePost, useComments, useCreateComment, useLikePost } from "@/hooks/use-blog";
import { useRoute } from "wouter";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCommentSchema, type InsertComment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function PostDetail() {
  const [match, params] = useRoute("/post/:id");
  const id = parseInt(params?.id || "0");
  
  const { data: post, isLoading: postLoading } = usePost(id);
  const { data: comments, isLoading: commentsLoading } = useComments(id);
  const likePost = useLikePost();
  const createComment = useCreateComment();

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
          <Link href="/" className="flex items-center text-muted-foreground hover:text-primary transition-colors lowercase">
            <ArrowLeft className="w-4 h-4 mr-2" /> back
          </Link>
          <div className="lowercase text-xs opacity-50">shahaan's blog</div>
        </nav>

        <main className="space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-3xl font-normal leading-tight lowercase">{post.title}</h1>
            <div className="text-[10px] opacity-50 lowercase">
              {format(new Date(post.createdAt), 'mmmm d, yyyy')}
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
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center group-hover:border-primary transition-all">
                <Heart className={`w-6 h-6 ${post.likes > 0 ? 'fill-accent text-accent' : 'text-foreground'} transition-colors`} />
              </div>
              <span className="text-[10px] opacity-50 lowercase">{post.likes} likes</span>
            </motion.button>
          </div>

          <section className="space-y-6 pt-8 border-t border-primary/10">
            <h3 className="text-lg lowercase">comments ({comments?.length || 0})</h3>
            
            <div className="space-y-4">
              {comments?.map((comment) => (
                <div key={comment.id} className="cute-card !bg-card/20 p-4 space-y-2">
                  <div className="flex items-center justify-between text-[10px] opacity-50">
                    <span className="font-bold text-primary lowercase">{comment.authorName}</span>
                    <span>{format(new Date(comment.createdAt), 'mmm d, h:mm a')}</span>
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
