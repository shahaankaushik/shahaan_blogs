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
import { Heart, ArrowLeft, Send } from "lucide-react";
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
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-display mb-4">Post Not Found</h1>
        <Link href="/" className="text-primary hover:underline">Back to Home</Link>
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
    <div className="min-h-screen pb-20">
      {/* Navigation */}
      <nav className="p-6 sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-white/60 hover:text-primary transition-colors font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Link>
          <div className="font-display text-white text-xl tracking-wider">SHAHAAN'S BLOG</div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 md:px-6 pt-12">
        {/* Article Header */}
        <header className="mb-12 text-center">
          <div className="inline-block px-3 py-1 mb-6 border border-primary/30 rounded-full text-primary text-xs font-mono">
            {format(new Date(post.createdAt), 'MMMM d, yyyy')}
          </div>
          <h1 className="text-4xl md:text-6xl font-display text-white mb-8 leading-tight">
            {post.title}
          </h1>
          
          {post.imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-12">
              <img src={post.imageUrl} alt={post.title} className="w-full object-cover max-h-[500px]" />
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className="prose prose-invert prose-lg max-w-none mb-16 prose-headings:font-display prose-headings:text-primary prose-p:text-white/80 prose-a:text-primary">
          {post.content.split('\n').map((paragraph, i) => (
            <p key={i} className="mb-4">{paragraph}</p>
          ))}
        </article>

        {/* Like Button */}
        <div className="flex justify-center mb-20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300 shadow-[0_0_20px_rgba(101,235,54,0.1)]">
              <Heart className={`w-8 h-8 ${post.likes > 0 ? 'fill-primary text-primary' : 'text-white'} transition-colors duration-300`} />
            </div>
            <span className="font-mono text-sm text-white/60 group-hover:text-primary transition-colors">
              {post.likes} LIKES
            </span>
          </motion.button>
        </div>

        {/* Comments Section */}
        <section className="border-t border-white/10 pt-16">
          <h3 className="text-2xl font-display text-white mb-8">Comments ({comments?.length || 0})</h3>
          
          <div className="space-y-6 mb-12">
            {commentsLoading ? (
              <div className="text-white/40">Loading comments...</div>
            ) : comments?.length === 0 ? (
              <div className="text-white/40 italic">No comments yet. Be the first to say something!</div>
            ) : (
              comments?.map((comment) => (
                <div key={comment.id} className="bg-card p-6 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-primary">{comment.authorName}</span>
                    <span className="text-xs text-white/30 font-mono">
                      {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-white/80">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <div className="bg-card border border-white/10 rounded-xl p-6 md:p-8">
            <h4 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Leave a Comment</h4>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Your Name" 
                          {...field} 
                          className="bg-background border-white/10 text-white placeholder:text-white/20 focus:border-primary"
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
                          placeholder="What are your thoughts?" 
                          {...field} 
                          className="bg-background border-white/10 text-white placeholder:text-white/20 focus:border-primary min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={createComment.isPending}
                  className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-wider hover:bg-primary/90"
                >
                  {createComment.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </form>
            </Form>
          </div>
        </section>
      </main>
    </div>
  );
}
