import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Edit2, Save, X, Heart, MessageCircle, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { CreatePostModal } from "@/components/CreatePostModal";

export default function Home() {
  const { user } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [showLikes, setShowLikes] = useState(false);
  const [showExpect, setShowExpect] = useState(false);

  const { data: blogInfo, isLoading: infoLoading } = useQuery({
    queryKey: ["/api/blog-info"],
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await fetch("/api/blog-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-info"] });
      setEditing(null);
    },
  });

  if (infoLoading || postsLoading) {
    return (
      <div className="max-w-2xl mx-auto p-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  const handleUpdate = (field: string, value: string) => {
    updateMutation.mutate({ [field]: value });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-lg space-y-8">
        {/* Header Section */}
        <header className="text-center space-y-2 pt-12">
          <div className="flex items-center justify-center gap-2 group min-h-[40px]">
            {editing === 'intro' ? (
              <div className="flex gap-2 items-center">
                <Input 
                  defaultValue={blogInfo?.intro} 
                  id="intro-input"
                  autoFocus
                  className="bg-card/50 border-primary/50 text-center lowercase h-8 text-sm" 
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdate('intro', e.currentTarget.value)}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUpdate('intro', (document.getElementById('intro-input') as HTMLInputElement).value)}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <p className="text-base lowercase">{blogInfo?.intro || "yo i'm shahaan :) "}</p>
                {user && <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setEditing('intro')}><Edit2 className="h-3 w-3" /></Button>}
              </>
            )}
          </div>
        </header>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            variant={showLikes ? "default" : "outline"} 
            className={`small-button ${showLikes ? 'bg-accent text-accent-foreground' : 'bg-accent/20 border-accent/40 text-accent'} lowercase`}
            onClick={() => setShowLikes(!showLikes)}
          >
            things i like
          </Button>
          <Button 
            variant={showExpect ? "default" : "outline"} 
            className={`small-button ${showExpect ? 'bg-primary text-primary-foreground' : 'bg-primary/20 border-primary/40 text-primary'} lowercase`}
            onClick={() => setShowExpect(!showExpect)}
          >
            what you can expect
          </Button>
        </div>

        {/* Collapsible Content */}
        <div className="space-y-4">
          {showLikes && (
            <Card className="bg-card/40 backdrop-blur-sm border-accent/30 rounded-2xl overflow-hidden">
              <CardContent className="p-4 relative group">
                {editing === 'likes' ? (
                  <div className="space-y-2">
                    <Textarea 
                      defaultValue={blogInfo?.thingsILike} 
                      id="likes-input"
                      autoFocus
                      className="bg-transparent border-accent/50 lowercase min-h-[100px] text-xs" 
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" className="h-8 text-[10px] lowercase" onClick={() => handleUpdate('thingsILike', (document.getElementById('likes-input') as HTMLTextAreaElement).value)}>save</Button>
                      <Button size="sm" variant="ghost" className="h-8 text-[10px] lowercase" onClick={() => setEditing(null)}>cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs leading-relaxed lowercase">{blogInfo?.thingsILike}</p>
                    {user && <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => setEditing('likes')}><Edit2 className="h-3 w-3" /></Button>}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {showExpect && (
            <Card className="bg-card/40 backdrop-blur-sm border-primary/30 rounded-2xl overflow-hidden">
              <CardContent className="p-4 relative group">
                {editing === 'expect' ? (
                  <div className="space-y-2">
                    <Textarea 
                      defaultValue={blogInfo?.expect} 
                      id="expect-input"
                      autoFocus
                      className="bg-transparent border-primary/50 lowercase min-h-[100px] text-xs" 
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" className="h-8 text-[10px] lowercase" onClick={() => handleUpdate('expect', (document.getElementById('expect-input') as HTMLTextAreaElement).value)}>save</Button>
                      <Button size="sm" variant="ghost" className="h-8 text-[10px] lowercase" onClick={() => setEditing(null)}>cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs leading-relaxed lowercase">{blogInfo?.expect}</p>
                    {user && <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => setEditing('expect')}><Edit2 className="h-3 w-3" /></Button>}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Blog Posts */}
        <div className="space-y-6 pt-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm opacity-50 lowercase">recent posts</h2>
            {user && <CreatePostModal />}
          </div>
          {posts?.map((post: any) => (
            <Link key={post.id} href={`/post/${post.id}`}>
              <Card className="bg-card/30 hover:bg-card/50 transition-all cursor-pointer border-primary/10 rounded-2xl overflow-hidden group">
                {post.imageUrl && (
                  <div className="h-32 overflow-hidden">
                    <img src={post.imageUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" alt={post.title} />
                  </div>
                )}
                <CardContent className="p-4 space-y-2">
                  <h2 className="text-base font-normal lowercase">{post.title}</h2>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 lowercase">{post.content}</p>
                  <div className="flex gap-4 pt-1 text-[8px] text-muted-foreground uppercase opacity-50">
                    <span className="flex items-center gap-1"><Heart className="h-2 w-2" /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-2 w-2" /> comments</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {posts?.length === 0 && (
            <p className="text-center text-xs opacity-30 py-8 lowercase">no posts yet... write something soon!</p>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center pt-20 pb-12 group relative">
          {editing === 'letterboxd' ? (
            <div className="flex gap-2 items-center justify-center">
              <Input 
                defaultValue={blogInfo?.letterboxd} 
                id="lb-input"
                autoFocus
                className="bg-card/50 border-accent/50 text-center lowercase h-8 max-w-[150px] text-xs" 
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate('letterboxd', e.currentTarget.value)}
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUpdate('letterboxd', (document.getElementById('lb-input') as HTMLInputElement).value)}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <a 
                href={`https://letterboxd.com/${blogInfo?.letterboxd?.replace('@', '')}`} 
                target="_blank" 
                className="text-accent hover:underline text-xs lowercase"
              >
                letterboxd: {blogInfo?.letterboxd}
              </a>
              {user && <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => setEditing('letterboxd')}><Edit2 className="h-3 w-3" /></Button>}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
