import { usePosts } from "@/hooks/use-blog";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { format } from "date-fns";
import { CreatePostModal } from "@/components/CreatePostModal";
import { SectionToggle } from "@/components/SectionToggle";
import { ArrowRight, Film, Trophy, Heart, ExternalLink, Activity, Cat, PenTool, Dumbbell, Palette, Globe } from "lucide-react";

export default function Home() {
  const { data: posts, isLoading } = usePosts();
  const { user } = useAuth();

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <header className="pt-20 pb-12 px-4 md:px-6 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-display text-primary leading-[0.85] mb-6 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
          Yo I’m<br />
          <span className="text-white">Shahaan</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/80 font-light max-w-lg mb-12">
          And this is my blog.
        </p>

        {/* Interactive Toggles */}
        <div className="space-y-4 mb-16">
          <SectionToggle title="Things I Like">
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Trophy, label: "Football" },
                { icon: Film, label: "Films" },
                { icon: Activity, label: "Badminton" },
                { icon: Cat, label: "Cats" },
                { icon: Activity, label: "Running" },
                { icon: PenTool, label: "Writing" },
                { icon: Dumbbell, label: "Working Out" },
                { icon: Palette, label: "Art" },
                { icon: Globe, label: "Culture" },
              ].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </span>
              ))}
            </div>
          </SectionToggle>
          
          <SectionToggle title="What You Can Expect Here">
            <p>
              Stuff about things I like, my thoughts on some topical news, film reviews, and random ramblings about whatever catches my attention. 
              It's a digital garden of my interests.
            </p>
          </SectionToggle>
        </div>
      </header>

      {/* Blog Posts Grid */}
      <main className="px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
          <h2 className="text-3xl font-display text-white">Recent Posts</h2>
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-sm font-mono text-primary/70">{posts?.length || 0} ENTRIES</span>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-card/50 animate-pulse rounded-xl border border-white/5"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {posts?.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="group block h-full">
                <article className="h-full bg-card rounded-xl overflow-hidden border border-white/10 transition-all duration-300 hover:border-primary hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 flex flex-col">
                  {post.imageUrl && (
                    <div className="aspect-[16/9] overflow-hidden bg-black/20">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3 text-xs font-mono text-primary/70">
                      <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-current" />
                        {post.likes}
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-display text-white mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-white/60 line-clamp-3 text-sm mb-6 flex-1">
                      {post.content}
                    </p>
                    <div className="flex items-center text-primary text-sm font-bold uppercase tracking-wider mt-auto group-hover:translate-x-1 transition-transform">
                      Read Post <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
            
            {posts?.length === 0 && (
              <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-xl">
                <p className="text-white/40 font-mono">No posts yet. Time to write something!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/10 py-12 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-white/40 mb-4 font-mono text-sm">Follow me on Letterboxd</p>
          <a 
            href="https://letterboxd.com/meowpeeps" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors text-lg font-display tracking-wide"
          >
            @meowpeeps <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </footer>

      {/* Admin Actions */}
      {user && <CreatePostModal />}
    </div>
  );
}
