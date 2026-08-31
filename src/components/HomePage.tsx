import React, { useState, useEffect } from 'react';
import { Article, Category, ViewRoute } from '../types';
import { fetchPublishedArticles, fetchCategories, subscribeToArticlesChange } from '../lib/api';
import { EMIOLUWA_ABOUT_IMAGE, EMIOLUWA_LOGO_IMAGE } from '../lib/assets';
import { 
  ArrowRight, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Feather, 
  Compass, 
  GraduationCap, 
  Heart, 
  Lightbulb, 
  PenTool, 
  Coffee,
  Quote
} from 'lucide-react';

interface HomePageProps {
  navigate: (route: ViewRoute) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Student Life': <GraduationCap className="w-5 h-5" />,
  'Personal Growth': <Sparkles className="w-5 h-5" />,
  'Self-Discovery': <Compass className="w-5 h-5" />,
  'Life Experiences': <Coffee className="w-5 h-5" />,
  'Opinions': <Lightbulb className="w-5 h-5" />,
  'Creative Writing': <PenTool className="w-5 h-5" />,
};

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [articlesData, categoriesData] = await Promise.all([
          fetchPublishedArticles({ limit: 3 }),
          fetchCategories()
        ]);
        setFeaturedArticles(articlesData.slice(0, 3));
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Subscribe to live article & category changes in real-time
    const unsubscribe = subscribeToArticlesChange(() => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen">
      
      {/* ---------------- HERO SECTION ---------------- */}
      <section 
        id="hero-section"
        className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-[#E8DEC8]"
      >
        {/* Subtle decorative background warmth */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
          <div className="absolute top-10 left-10 w-96 h-96 bg-[#E8DEC8]/50 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#D4B26F]/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle brand badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE8DA] border border-[#E0D5C1] text-xs font-semibold tracking-wider text-[#0D3B2E] uppercase mb-8 shadow-xs">
            <Feather className="w-3.5 h-3.5 text-[#C29B38]" />
            <span>The Online Writing Space of Emioluwa</span>
          </div>

          {/* Main Hero Typography */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#0D3B2E] uppercase mb-6 leading-[1.08]">
            EMIOLUWA WRITES
          </h1>

          <p className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#0D3B2E]/90 font-medium mb-8 max-w-2xl mx-auto leading-tight">
            Words that connect. Stories that stay.
          </p>

          <p className="font-sans text-base sm:text-lg md:text-xl text-[#3A423F] max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            "I'm Emioluwa, a young writer passionate about turning thoughts, experiences and ideas into words people can connect with."
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              id="hero-work-with-me-btn"
              onClick={() => navigate({ type: 'contact' })}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] font-semibold text-sm sm:text-base hover:bg-[#135241] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>Work With Me</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-explore-writing-btn"
              onClick={() => navigate({ type: 'writing' })}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#FFFDF9] border border-[#D6C8B0] text-[#0D3B2E] font-medium text-sm sm:text-base hover:bg-[#F4EFE6] transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#C29B38]" />
              <span>Explore My Writing</span>
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURED WRITING SECTION ---------------- */}
      <section id="featured-writing-section" className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 pb-4 border-b border-[#E8DEC8]">
          <div>
            <span className="text-xs font-sans font-semibold tracking-widest uppercase text-[#C29B38] block mb-2">
              Curated Selection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D3B2E]">
              Featured Writing
            </h2>
          </div>
          <button
            id="view-all-writing-btn"
            onClick={() => navigate({ type: 'writing' })}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D3B2E] hover:text-[#135241] group self-start md:self-auto"
          >
            <span>View all articles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="paper-card rounded-2xl p-6 animate-pulse space-y-4">
                <div className="w-full h-48 bg-[#EFE8DA] rounded-xl" />
                <div className="w-24 h-4 bg-[#E0D5C1] rounded" />
                <div className="w-full h-6 bg-[#E0D5C1] rounded" />
                <div className="w-4/5 h-4 bg-[#EFE8DA] rounded" />
              </div>
            ))}
          </div>
        ) : featuredArticles.length === 0 ? (
          <div className="paper-card p-12 text-center rounded-3xl border border-dashed border-[#D6C8B0] max-w-2xl mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#EFE8DA] border border-[#E0D5C1] flex items-center justify-center text-[#0D3B2E]">
              <Feather className="w-6 h-6 text-[#C29B38]" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-2xl text-[#0D3B2E]">New Essays Coming Soon</h3>
              <p className="font-sans text-sm text-[#4E5754] leading-relaxed max-w-md mx-auto">
                Emioluwa is currently drafting fresh essays and reflections. When published from the desk, they will immediately appear here!
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate({ type: 'contact' })}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] transition-all shadow-xs"
              >
                <span>Say Hello / Leave a Message</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <article
                key={article.id}
                id={`featured-card-${article.slug}`}
                className="paper-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer"
                onClick={() => navigate({ type: 'article', slug: article.slug })}
              >
                {/* Featured Image */}
                <div className="relative h-52 overflow-hidden bg-[#EFE8DA]">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF7F2]/95 backdrop-blur-sm text-[#0D3B2E] border border-[#E0D5C1] shadow-xs">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-[#786D5F] font-sans">
                      <Clock className="w-3.5 h-3.5 text-[#C29B38]" />
                      <span>{article.readTime}</span>
                      <span>•</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#0D3B2E] group-hover:text-[#135241] transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="font-sans text-sm text-[#4E5754] line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#EFE8DA]">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D3B2E] group-hover:text-[#C29B38] transition-colors uppercase tracking-wider">
                      Read More
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- WHAT I WRITE ABOUT SECTION ---------------- */}
      <section id="topics-section" className="py-16 md:py-20 bg-[#F4EFE6] border-y border-[#E8DEC8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-sans font-semibold tracking-widest uppercase text-[#C29B38] block mb-2">
            Themes & Perspectives
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D3B2E] mb-4">
            What I Write About
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#4E5754] max-w-xl mx-auto mb-12">
            Click any category to browse essays, personal reflections, and creative narratives.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(categories.length > 0 ? categories : [
              { id: '1', name: 'Student Life', slug: 'student-life', description: '' },
              { id: '2', name: 'Personal Growth', slug: 'personal-growth', description: '' },
              { id: '3', name: 'Self-Discovery', slug: 'self-discovery', description: '' },
              { id: '4', name: 'Life Experiences', slug: 'life-experiences', description: '' },
              { id: '5', name: 'Opinions', slug: 'opinions', description: '' },
              { id: '6', name: 'Creative Writing', slug: 'creative-writing', description: '' },
            ]).map((cat) => (
              <button
                key={cat.id}
                id={`category-btn-${cat.slug}`}
                onClick={() => navigate({ type: 'writing', category: cat.name })}
                className="paper-card p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 group hover:border-[#0D3B2E] transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] text-[#0D3B2E] flex items-center justify-center group-hover:bg-[#0D3B2E] group-hover:text-[#FAF7F2] transition-all shadow-xs">
                  {CATEGORY_ICONS[cat.name] || <BookOpen className="w-5 h-5" />}
                </div>
                <div>
                  <span className="font-serif font-bold text-sm sm:text-base text-[#0D3B2E] block group-hover:text-[#135241]">
                    {cat.name}
                  </span>
                  {cat.articleCount !== undefined && (
                    <span className="text-[11px] text-[#786D5F] block mt-0.5">
                      {cat.articleCount} {cat.articleCount === 1 ? 'piece' : 'pieces'}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- BEHIND THE WORDS SECTION ---------------- */}
      <section id="behind-the-words-section" className="py-20 md:py-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="paper-card rounded-3xl p-8 sm:p-12 md:p-14 border border-[#E0D5C1] relative overflow-hidden bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F2] to-[#F2ECE1]">
          
          {/* Subtle gold quote mark accent */}
          <div className="absolute top-6 right-8 opacity-10 text-[#C29B38] pointer-events-none">
            <Quote className="w-24 h-24" />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
            <div className="w-full md:w-7/12 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFE8DA] text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider">
                <Feather className="w-3.5 h-3.5 text-[#C29B38]" />
                <span>Behind the Words</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D3B2E] leading-tight">
                The Reason I Keep Returning to the Page
              </h2>

              <blockquote className="font-serif italic text-xl sm:text-2xl text-[#242927] leading-relaxed border-l-2 border-[#C29B38] pl-6 my-6">
                "Every writer has a reason they keep returning to the page. For me, writing is a way to make sense of thoughts, preserve moments and create something that can reach someone I've never met."
              </blockquote>

              <p className="font-sans text-sm sm:text-base text-[#4E5754] leading-relaxed">
                Writing is where confusion becomes clarity, and quiet hostel observations turn into lasting stories.
              </p>

              <div className="pt-2">
                <button
                  id="meet-emioluwa-btn"
                  onClick={() => navigate({ type: 'about' })}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] text-sm font-semibold hover:bg-[#135241] transition-all shadow-md group"
                >
                  <span>Meet Emioluwa</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Author Portrait Preview Frame */}
            <div className="w-full md:w-5/12 flex-shrink-0 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-[#E0D5C1] bg-[#EFE8DA] max-w-xs w-full group">
                <img
                  src={EMIOLUWA_ABOUT_IMAGE}
                  alt="Emioluwa"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B2E]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-[#FAF7F2]">
                  <p className="font-serif font-bold text-base">Emioluwa</p>
                  <p className="text-[11px] text-[#E4CA7E]">Author & Creator • Nigeria</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- NEWSLETTER / WARM REACH PROMPT ---------------- */}
      <section className="pb-16 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-8 rounded-2xl bg-[#0D3B2E] text-[#FAF7F2] space-y-4 shadow-lg">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF7F2]">
            Have a thought, a story, or a kind word?
          </h3>
          <p className="font-sans text-sm text-[#FAF7F2]/80 max-w-md mx-auto">
            I read every message sent through this site. Feel free to leave a note or inquire about creative writing collaborations.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate({ type: 'contact' })}
              className="px-6 py-3 rounded-full bg-[#E4CA7E] text-[#0D3B2E] font-semibold text-sm hover:bg-[#F3DE9E] transition-all"
            >
              Say Hello to Emioluwa
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
