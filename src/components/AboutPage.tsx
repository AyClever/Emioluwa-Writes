import React from 'react';
import { ViewRoute } from '../types';
import { EMIOLUWA_ABOUT_IMAGE, EMIOLUWA_LOGO_IMAGE } from '../lib/assets';
import { 
  Feather, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  Heart, 
  Mail, 
  GraduationCap, 
  CheckCircle2,
  Quote
} from 'lucide-react';

interface AboutPageProps {
  navigate: (route: ViewRoute) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  const topics = [
    { title: 'Student Life', desc: 'Deadlines, hostel conversations, exams, holidays, and campus growing pains.' },
    { title: 'Personal Growth', desc: 'Lessons on patience, discipline, resilience, and unhurried progress.' },
    { title: 'Self-Discovery', desc: 'Finding your voice, understanding your inner compass, and staying true.' },
    { title: 'Life Experiences', desc: 'Nigerian moments, everyday observations, and quiet insights.' },
    { title: 'Opinions', desc: 'Thoughtful takes on books, digital culture, friendship, and ambition.' },
    { title: 'Creative Writing', desc: 'Short narratives, poetic prose, and imaginative vignettes.' },
  ];

  return (
    <div id="about-page" className="min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Badge & Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE8DA] border border-[#E0D5C1] text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider">
            <Feather className="w-3.5 h-3.5 text-[#C29B38]" />
            <span>Meet the Writer</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#0D3B2E] tracking-tight">
            About Emioluwa
          </h1>

          <p className="font-serif italic text-xl text-[#786D5F]">
            A young writer crafting words that connect and stories that stay.
          </p>
        </div>

        {/* Editorial Profile Card */}
        <div className="paper-card rounded-3xl p-8 sm:p-12 md:p-14 mb-16 border border-[#E0D5C1] shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            
            {/* Visual Portrait / Editorial Accent */}
            <div className="w-full md:w-5/12 flex-shrink-0">
              <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-[#EFE8DA] bg-[#EFE8DA]">
                <img
                  src={EMIOLUWA_ABOUT_IMAGE}
                  alt="Emioluwa writing portrait"
                  referrerPolicy="no-referrer"
                  className="w-full h-88 sm:h-[420px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B2E]/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-[#FAF7F2]">
                  <p className="font-serif font-bold text-lg">Emioluwa</p>
                  <p className="text-xs text-[#E4CA7E]">Writer, Essayist & Student • Nigeria</p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8] text-xs text-[#57615D] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#0D3B2E]">Location</span>
                  <span>Nigeria</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#0D3B2E]">Primary Medium</span>
                  <span>Essays & Digital Journal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#0D3B2E]">Favorite Instrument</span>
                  <span>Notebooks & Ink</span>
                </div>
              </div>

              {/* Official Brand Seal */}
              <div className="mt-4 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8] flex items-center gap-3">
                <img
                  src={EMIOLUWA_LOGO_IMAGE}
                  alt="Emioluwa Writes Official Logo"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-contain bg-white border border-[#E0D5C1] p-1 shadow-xs"
                />
                <div>
                  <span className="text-xs font-serif font-bold text-[#0D3B2E] block">Emioluwa Writes</span>
                  <span className="text-[10px] text-[#786D5F] block">Official Author Space</span>
                </div>
              </div>
            </div>

            {/* Long-form Content */}
            <div className="w-full md:w-7/12 space-y-6 text-[#242927] font-serif text-lg leading-relaxed">
              <p className="dropcap">
                I'm Emioluwa, a young writer who believes that words can do more than communicate. They can make people pause, think, feel, learn and sometimes see life differently.
              </p>

              <p>
                <strong>Emioluwa Writes</strong> is my personal space on the internet — a place for articles, reflections, ideas, stories and the small lessons I pick up from everyday life.
              </p>

              <p>
                I'm a student, and much of my writing is shaped by deadlines, doubt, growth, holidays, and the hopeful work of figuring out who you're becoming. But you don't have to be a student to recognise those feelings.
              </p>

              <p className="font-sans text-base text-[#3A423F] bg-[#FAF7F2] p-5 rounded-xl border-l-3 border-[#0D3B2E]">
                I write warmly, honestly, and without pretending to have everything figured out. If a piece here makes you pause for a second longer than you planned to, it has done its job.
              </p>
            </div>
          </div>
        </div>

        {/* ---------------- WHY I WRITE SECTION ---------------- */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <span className="text-xs font-sans font-semibold tracking-widest uppercase text-[#C29B38] block mb-2">
              The Purpose Behind The Craft
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D3B2E]">
              Why I Write
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pillar 1 */}
            <div className="paper-card p-8 rounded-2xl border border-[#E8DEC8] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0D3B2E] text-[#E4CA7E] flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0D3B2E]">
                To Think Clearly
              </h3>
              <p className="font-sans text-sm text-[#4E5754] leading-relaxed">
                Thoughts are often chaotic until they are given shape on paper. Writing allows me to slow down my mind, examine my motives, and transform raw feelings into structured understanding.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="paper-card p-8 rounded-2xl border border-[#E8DEC8] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0D3B2E] text-[#E4CA7E] flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0D3B2E]">
                To Preserve Memories
              </h3>
              <p className="font-sans text-sm text-[#4E5754] leading-relaxed">
                Hostel conversations, the tension before exam seasons, ordinary rainy afternoons in Lagos, and conversations with friends: writing freezes ephemeral moments before they fade into the background.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="paper-card p-8 rounded-2xl border border-[#E8DEC8] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0D3B2E] text-[#E4CA7E] flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0D3B2E]">
                To Connect With Strangers
              </h3>
              <p className="font-sans text-sm text-[#4E5754] leading-relaxed">
                The most magical thing about literature is discovering that an emotion you thought was private to you is shared by someone thousands of miles away. It bridges solitary hearts.
              </p>
            </div>

          </div>
        </section>

        {/* ---------------- WRITING TOPICS & ARCHIVE CTA ---------------- */}
        <section className="bg-[#F4EFE6] rounded-3xl p-8 sm:p-12 border border-[#E0D5C1] space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-sans font-semibold tracking-widest uppercase text-[#C29B38] block mb-2">
              Exploration
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#0D3B2E] mb-3">
              Writing Topics
            </h2>
            <p className="font-sans text-sm text-[#4E5754]">
              Here are the spaces and themes where you will most frequently find my thoughts:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topics.map((t) => (
              <div key={t.title} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8] flex items-start gap-3.5">
                <div className="mt-1 flex-shrink-0 text-[#0D3B2E]">
                  <CheckCircle2 className="w-5 h-5 text-[#0D3B2E]" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#0D3B2E]">{t.title}</h4>
                  <p className="font-sans text-xs text-[#57615D] mt-0.5 leading-normal">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              id="about-read-writing-btn"
              onClick={() => navigate({ type: 'writing' })}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] font-semibold text-sm sm:text-base hover:bg-[#135241] transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              <span>Read My Writing</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="about-contact-btn"
              onClick={() => navigate({ type: 'contact' })}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#FAF7F2] border border-[#D6C8B0] text-[#0D3B2E] font-medium text-sm sm:text-base hover:bg-[#EFE8DA] transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4 text-[#C29B38]" />
              <span>Send Me a Message</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};
