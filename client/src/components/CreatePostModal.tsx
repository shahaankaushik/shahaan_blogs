import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema, type InsertPost } from "@shared/schema";
import { useCreatePost } from "@/hooks/use-blog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CreatePostModal() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createPost = useCreatePost();

  const form = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "",
    },
  });

  const onSubmit = (data: InsertPost) => {
    createPost.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({
          title: "Success",
          description: "Post created successfully!",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create post. Try again.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display uppercase tracking-wider text-white">Create New Post</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary font-bold uppercase">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title..." {...field} className="bg-background/50 border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-primary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary font-bold uppercase">Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} value={field.value || ''} className="bg-background/50 border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-primary/20" />
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
                  <FormLabel className="text-primary font-bold uppercase">Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write something..." {...field} className="min-h-[150px] bg-background/50 border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-primary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createPost.isPending} className="bg-primary text-primary-foreground font-bold uppercase tracking-wider hover:bg-primary/90">
                {createPost.isPending ? "Creating..." : "Publish Post"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
