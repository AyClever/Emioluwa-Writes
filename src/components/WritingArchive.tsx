import React, { useState, useEffect, useMemo } from 'react';
import { Article, Category, ViewRoute } from '../types';
import { fetchPublishedArticles, fetchCategories, subscribeToArticlesChange } from '../lib/api';
import { 
  Search, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Filter, 
  BookOpen, 
  Feather, 
  X, 
  SlidersHorizontal 
} from 'lucide-react';

interface WritingArchiveProps {
  initialCategory?: string;
  initialSearch?: string;
  navigate: (route: ViewRoute) => void;
}

export const WritingArchive: React.FC<WritingArchiveProps> = ({ initialCategory, initialSearch, navigate }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'readTime'>('newest');
  const [loading, setLoading] = useState<boolean>(true);

  // Sync category if passed via prop
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    async function loadData() {
      try {
        const [articlesData, categoriesData] = await Promise.all([
          fetchPublishedArticles(),
          fetchCategories()
        ]);
        setArticles(articlesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching writing archive:', err);
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

  // Filtered and sorted articles
  const filteredArticles = useMemo(() => {
    return articles
      .filter((article) => {
        const matchesCategory = 
          selectedCategory === 'All' || 
          article.category.toLowerCase() === selectedCategory.toLowerCase();
        
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = 
          !q ||
          article.title.toLowerCase().includes(q) ||
          article.excerpt.toLowerCase().includes(q) ||
          article.category.toLowerCase().includes(q) ||
          article.content.toLowerCase().includes(q);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        }
        if (sortBy === 'readTime') {
          const aTime = parseInt(a.readTime, 10) || 0;
          const bTime = parseInt(b.readTime, 10) || 0;
          return aTime - bTime;
        }
        return 0;
      });
  }, [articles, selectedCategory, searchQuery, sortBy]);

  // Featured article (first one if 'All' and no search)
  const featuredArticle = useMemo(() => {
    if (selectedCategory === 'All' && !searchQuery && filteredArticles.length > 0) {
      return filteredArticles[0];
    }
    return null;
  }, [filteredArticles, selectedCategory, searchQuery]);

  const regularArticles = useMemo(() => {
    if (featuredArticle) {
      return filteredArticles.slice(1);
    }
    return filteredArticles;
  }, [filteredArticles, featuredArticle]);

  return (
    <div id="writing-archive" className="min-h-screen py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE8DA] border border-[#E0D5C1] text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider">
            <Feather className="w-3.5 h-3.5 text-[#C29B38]" />
            <span>The Archive</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#0D3B2E] tracking-tight">
            My Writing
          </h1>

          <p className="font-serif italic text-lg sm:text-xl text-[#786D5F]">
            Articles, essays, reflections, and stories from everyday observations.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="paper-card p-6 rounded-2xl mb-12 border border-[#E8DEC8] space-y-6">
          
          {/* Top Bar: Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80 md:w-96">
              <Search className="w-4 h-4 text-[#786D5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-articles-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search essays, keywords, topics..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221] placeholder-[#8A8174] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E] focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#786D5F] hover:text-[#0D3B2E]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-[#786D5F] font-medium hidden sm:inline">Sort:</span>
              <select
                id="sort-articles-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs font-medium text-[#0D3B2E] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="readTime">Shortest Read Time</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
            <span className="text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider pr-2 flex-shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#C29B38]" />
              Topic:
            </span>

            <button
              id="filter-category-all"
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[#0D3B2E] text-[#FAF7F2] shadow-xs'
                  : 'bg-[#FAF7F2] text-[#4E5754] border border-[#E0D5C1] hover:border-[#0D3B2E] hover:text-[#0D3B2E]'
              }`}
            >
              All Pieces ({articles.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`filter-category-${cat.slug}`}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-[#0D3B2E] text-[#FAF7F2] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#4E5754] border border-[#E0D5C1] hover:border-[#0D3B2E] hover:text-[#0D3B2E]'
                }`}
              >
                {cat.name} {cat.articleCount !== undefined && `(${cat.articleCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter & Active Filter info */}
        {(selectedCategory !== 'All' || searchQuery) && (
          <div className="flex items-center justify-between mb-8 text-sm text-[#786D5F]">
            <span>
              Showing {filteredArticles.length} {filteredArticles.length === 1 ? 'piece' : 'pieces'}
              {selectedCategory !== 'All' && <span> in <strong className="text-[#0D3B2E]">{selectedCategory}</strong></span>}
              {searchQuery && <span> matching "<strong className="text-[#0D3B2E]">{searchQuery}</strong>"</span>}
            </span>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-xs text-[#C29B38] font-bold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="paper-card rounded-2xl p-6 animate-pulse space-y-4">
                <div className="w-full h-48 bg-[#EFE8DA] rounded-xl" />
                <div className="w-24 h-4 bg-[#E0D5C1] rounded" />
                <div className="w-full h-6 bg-[#E0D5C1] rounded" />
                <div className="w-4/5 h-4 bg-[#EFE8DA] rounded" />
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          /* Empty State */
          <div className="paper-card rounded-3xl p-12 text-center max-w-lg mx-auto border border-[#E8DEC8] space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#E0D5C1] flex items-center justify-center mx-auto text-[#786D5F]">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#0D3B2E]">No articles found</h3>
            <p className="font-sans text-sm text-[#57615D]">
              We couldn't find any published pieces matching your current filter. Try adjusting your search query or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] transition-all"
            >
              Show All Articles
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Spotlight / Featured Lead Article if on 'All' */}
            {featuredArticle && (
              <div 
                id={`featured-spotlight-${featuredArticle.slug}`}
                onClick={() => navigate({ type: 'article', slug: featuredArticle.slug })}
                className="paper-card rounded-3xl overflow-hidden border border-[#E0D5C1] grid grid-cols-1 lg:grid-cols-12 cursor-pointer group hover:border-[#0D3B2E] transition-all"
              >
                <div className="lg:col-span-7 relative h-72 lg:h-auto overflow-hidden bg-[#EFE8DA]">
                  <img
                    src={featuredArticle.featuredImage}
                    alt={featuredArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#0D3B2E] text-[#FAF7F2] shadow-sm">
                      Featured Piece
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-3 text-xs text-[#786D5F] font-sans">
                      <span className="font-semibold text-[#0D3B2E] px-2.5 py-0.5 rounded-full bg-[#EFE8DA]">
                        {featuredArticle.category}
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#C29B38]" />
                        <span>{featuredArticle.readTime}</span>
                      </div>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0D3B2E] group-hover:text-[#135241] transition-colors leading-tight">
                      {featuredArticle.title}
                    </h2>

                    <p className="font-sans text-sm sm:text-base text-[#4E5754] leading-relaxed line-clamp-4">
                      {featuredArticle.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#EFE8DA] flex items-center justify-between">
                    <span className="text-xs text-[#786D5F]">
                      {new Date(featuredArticle.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D3B2E] group-hover:text-[#C29B38] transition-colors uppercase tracking-wider">
                      Read Full Article
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularArticles.map((article) => (
                <article
                  key={article.id}
                  id={`archive-card-${article.slug}`}
                  onClick={() => navigate({ type: 'article', slug: article.slug })}
                  className="paper-card rounded-2xl overflow-hidden flex flex-col justify-between group cursor-pointer border border-[#E8DEC8]"
                >
                  <div>
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
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF7F2]/95 backdrop-blur-sm text-[#0D3B2E] border border-[#E0D5C1]">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-[#786D5F] font-sans">
                        <Calendar className="w-3.5 h-3.5 text-[#C29B38]" />
                        <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-[#C29B38]" />
                        <span>{article.readTime}</span>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-[#0D3B2E] group-hover:text-[#135241] transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="font-sans text-sm text-[#4E5754] line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 border-t border-[#EFE8DA]/80">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D3B2E] group-hover:text-[#C29B38] transition-colors uppercase tracking-wider">
                      Read Essay
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </article>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
