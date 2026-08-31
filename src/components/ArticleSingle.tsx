import React, { useState, useEffect } from 'react';
import { Article, ViewRoute } from '../types';
import { fetchArticleBySlug, subscribeToArticlesChange } from '../lib/api';
import { EMIOLUWA_ABOUT_IMAGE } from '../lib/assets';
import { 
  Clock, 
  Calendar, 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  Check, 
  Copy, 
  Eye, 
  Feather, 
  ArrowRight, 
  MessageSquare,
  Sparkles,
  Twitter,
  Linkedin
} from 'lucide-react';

interface ArticleSingleProps {
  slug: string;
  navigate: (route: ViewRoute) => void;
}

export const ArticleSingle: React.FC<ArticleSingleProps> = ({ slug, navigate }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');

  useEffect(() => {
    async function loadArticle() {
      try {
        setError(null);
        const data = await fetchArticleBySlug(slug);
        setArticle(data.article);
        setRelatedArticles(data.related || []);
      } catch (err: any) {
        setError(err.message || 'Article not found');
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Live update if article is edited or deleted
    const unsubscribe = subscribeToArticlesChange(() => {
      loadArticle();
    });

    return () => {
      unsubscribe();
    };
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareToTwitter = () => {
    if (!article) return;
    const text = encodeURIComponent(`"${article.title}" by Emioluwa`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareToWhatsApp = () => {
    if (!article) return;
    const text = encodeURIComponent(`Read this piece on Emioluwa Writes: "${article.title}" - ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Helper to render formatted content if plain text / markdown / html
  const renderContent = (content: string) => {
    // If it contains HTML tags (like from docx import or rich text)
    if (content.includes('<p>') || content.includes('<h2>') || content.includes('<h3>')) {
      return (
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      );
    }

    // Markdown-like parser for paragraphs, headings, blockquotes, lists
    const paragraphs = content.split('\n\n');

    return (
      <div className="article-content space-y-6">
        {paragraphs.map((p, index) => {
          const trimmed = p.trim();
          if (!trimmed) return null;

          // H3
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={index} className="font-serif text-2xl font-bold text-[#0D3B2E] mt-8 mb-3">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }

          // H2
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={index} className="font-serif text-3xl font-bold text-[#0D3B2E] mt-10 mb-4">
                {trimmed.replace('## ', '')}
              </h2>
            );
          }

          // Blockquote
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={index} className="font-serif italic text-xl text-[#0D3B2E] border-l-3 border-[#C29B38] bg-[#F4EFE6] p-6 rounded-r-xl my-6 leading-relaxed">
                {trimmed.replace(/^>\s*/gm, '').replace(/"/g, '')}
              </blockquote>
            );
          }

          // Bullet List
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const items = trimmed.split('\n').filter(Boolean);
            return (
              <ul key={index} className="list-disc pl-6 space-y-2 font-serif text-lg text-[#242927]">
                {items.map((item, i) => (
                  <li key={i}>{item.replace(/^[-*]\s*/, '')}</li>
                ))}
              </ul>
            );
          }

          // Numbered List
          if (/^\d+\.\s/.test(trimmed)) {
            const items = trimmed.split('\n').filter(Boolean);
            return (
              <ol key={index} className="list-decimal pl-6 space-y-2 font-serif text-lg text-[#242927]">
                {items.map((item, i) => (
                  <li key={i}>{item.replace(/^\d+\.\s*/, '')}</li>
                ))}
              </ol>
            );
          }

          // First paragraph gets editorial dropcap
          const isFirstParagraph = index === 0;

          return (
            <p 
              key={index} 
              className={`leading-relaxed ${isFirstParagraph ? 'dropcap' : ''}`}
            >
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 animate-pulse space-y-8">
        <div className="h-6 w-32 bg-[#EFE8DA] rounded-full" />
        <div className="h-12 w-full bg-[#E0D5C1] rounded-xl" />
        <div className="h-4 w-48 bg-[#EFE8DA] rounded" />
        <div className="h-96 w-full bg-[#EFE8DA] rounded-2xl" />
        <div className="space-y-4">
          <div className="h-4 w-full bg-[#EFE8DA] rounded" />
          <div className="h-4 w-5/6 bg-[#EFE8DA] rounded" />
          <div className="h-4 w-4/6 bg-[#EFE8DA] rounded" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
        <div className="paper-card p-10 rounded-3xl max-w-md text-center border border-[#E8DEC8] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E0D5C1] flex items-center justify-center mx-auto text-[#0D3B2E]">
            <Feather className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0D3B2E]">Article Not Available</h2>
          <p className="font-sans text-sm text-[#57615D]">
            {error || "The piece you're looking for might have been moved or is currently in draft."}
          </p>
          <button
            onClick={() => navigate({ type: 'writing' })}
            className="px-6 py-2.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] transition-all"
          >
            Back to Archive
          </button>
        </div>
      </div>
    );
  }

  return (
    <article id={`article-single-${article.slug}`} className="min-h-screen py-10 md:py-16">
      
      {/* Sticky Progress / Breadcrumb Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between py-2 border-b border-[#E8DEC8]">
          <button
            onClick={() => navigate({ type: 'writing', category: article.category })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D3B2E] hover:text-[#C29B38] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {article.category}</span>
          </button>

          {/* Reading Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#FAF7F2] border border-[#D6C8B0] rounded-lg p-0.5 text-xs text-[#0D3B2E]">
              <button 
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded ${fontSize === 'normal' ? 'bg-[#0D3B2E] text-[#FAF7F2]' : 'hover:bg-[#EFE8DA]'}`}
                title="Normal font size"
              >
                A
              </button>
              <button 
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded text-sm ${fontSize === 'large' ? 'bg-[#0D3B2E] text-[#FAF7F2]' : 'hover:bg-[#EFE8DA]'}`}
                title="Large font size"
              >
                A+
              </button>
              <button 
                onClick={() => setFontSize('larger')}
                className={`px-2 py-0.5 rounded text-base font-bold ${fontSize === 'larger' ? 'bg-[#0D3B2E] text-[#FAF7F2]' : 'hover:bg-[#EFE8DA]'}`}
                title="Largest font size"
              >
                A++
              </button>
            </div>

            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg border border-[#D6C8B0] bg-[#FAF7F2] text-[#0D3B2E] hover:bg-[#EFE8DA] transition-all relative"
              title="Copy link to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#0D3B2E] text-[#FAF7F2] text-[10px] whitespace-nowrap shadow-md">
                  Link copied!
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <header className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        
        {/* Category & Status */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => navigate({ type: 'writing', category: article.category })}
            className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#EFE8DA] text-[#0D3B2E] hover:bg-[#0D3B2E] hover:text-[#FAF7F2] transition-colors"
          >
            {article.category}
          </button>
          {article.status === 'draft' && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Admin Draft Preview
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#0D3B2E] tracking-tight leading-[1.12] mb-6">
          {article.title}
        </h1>

        {/* Excerpt / Lead */}
        {article.excerpt && (
          <p className="font-serif italic text-lg sm:text-xl text-[#57615D] max-w-2xl mx-auto mb-6 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Metadata Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#786D5F] font-sans pt-4 border-t border-[#E8DEC8]">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-[#0D3B2E]">By Emioluwa</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#C29B38]" />
            <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#C29B38]" />
            <span>{article.readTime}</span>
          </div>
          {article.views !== undefined && article.views > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#C29B38]" />
                <span>{article.views} reads</span>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Featured Image Banner */}
      {article.featuredImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="rounded-3xl overflow-hidden shadow-sm border border-[#E0D5C1] bg-[#EFE8DA]">
            <img
              src={article.featuredImage}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        </div>
      )}

      {/* Main Article Body */}
      <div 
        className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 ${
          fontSize === 'large' ? 'text-[1.28rem]' : fontSize === 'larger' ? 'text-[1.4rem]' : 'text-[1.18rem]'
        }`}
      >
        <div className="paper-card p-6 sm:p-10 md:p-12 rounded-3xl border border-[#E8DEC8] shadow-xs">
          {renderContent(article.content)}
        </div>

        {/* Share and Feedback Bar */}
        <div className="my-10 p-6 rounded-2xl bg-[#F4EFE6] border border-[#E0D5C1] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider">
            <Share2 className="w-4 h-4 text-[#C29B38]" />
            <span>Share this piece:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={shareToWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D6C8B0] text-xs font-medium text-[#0D3B2E] hover:bg-[#0D3B2E] hover:text-[#FAF7F2] transition-colors"
            >
              WhatsApp
            </button>
            <button
              onClick={shareToTwitter}
              className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D6C8B0] text-xs font-medium text-[#0D3B2E] hover:bg-[#0D3B2E] hover:text-[#FAF7F2] transition-colors flex items-center gap-1"
            >
              <Twitter className="w-3.5 h-3.5" />
              <span>X (Twitter)</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] transition-colors flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Author Bio Box */}
        <div className="p-8 rounded-3xl bg-[#FFFDF9] border border-[#E0D5C1] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-16">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-[#E8DEC8]">
            <img
              src={EMIOLUWA_ABOUT_IMAGE}
              alt="Emioluwa"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="space-y-3 text-center sm:text-left">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#0D3B2E]">Emioluwa</h3>
              <p className="font-sans text-xs text-[#C29B38] font-semibold tracking-wider uppercase">Author & Essayist</p>
            </div>
            <p className="font-sans text-sm text-[#4E5754] leading-relaxed">
              A young Nigerian writer turning everyday student life, quiet doubts, and growing pains into essays and stories that connect.
            </p>
            <button
              onClick={() => navigate({ type: 'contact' })}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0D3B2E] hover:underline"
            >
              <span>Send Emioluwa a note</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="pt-8 border-t border-[#E8DEC8]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-serif text-2xl font-bold text-[#0D3B2E]">
                More from {article.category}
              </h3>
              <button
                onClick={() => navigate({ type: 'writing', category: article.category })}
                className="text-xs font-semibold text-[#C29B38] hover:underline"
              >
                View all in {article.category}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigate({ type: 'article', slug: rel.slug })}
                  className="paper-card p-5 rounded-2xl cursor-pointer group border border-[#E8DEC8] flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="h-32 rounded-xl overflow-hidden bg-[#EFE8DA]">
                      <img
                        src={rel.featuredImage}
                        alt={rel.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-[#C29B38] block">{rel.readTime}</span>
                    <h4 className="font-serif font-bold text-base text-[#0D3B2E] group-hover:text-[#135241] line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="pt-3 mt-3 border-t border-[#EFE8DA] flex items-center justify-between text-xs text-[#0D3B2E] font-bold">
                    <span>Read piece</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </article>
  );
};
