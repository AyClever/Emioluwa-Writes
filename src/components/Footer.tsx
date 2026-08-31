import React from 'react';
import { ViewRoute } from '../types';
import { EMIOLUWA_LOGO_IMAGE } from '../lib/assets';
import { Feather, Heart, Mail, Phone, ArrowUpRight, Lock } from 'lucide-react';

interface FooterProps {
  navigate: (route: ViewRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer id="main-footer" className="bg-[#0D3B2E] text-[#FAF7F2] pt-16 pb-12 mt-20 border-t border-[#135241]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-[#1A5E4B]">
          
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#1A5E4B] p-1 flex items-center justify-center shadow-sm overflow-hidden">
                <img
                  src={EMIOLUWA_LOGO_IMAGE}
                  alt="Emioluwa Writes Official Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-[#FAF7F2] block">
                  EMIOLUWA WRITES
                </span>
                <span className="text-[10px] uppercase font-sans tracking-widest text-[#E4CA7E]">
                  Official Author Brand
                </span>
              </div>
            </div>
            
            <p className="font-serif italic text-lg text-[#E4CA7E]">
              Words that connect. Stories that stay.
            </p>
            
            <p className="text-sm text-[#FAF7F2]/80 leading-relaxed max-w-md font-sans">
              The online writing space and personal brand of Emioluwa, a young Nigerian writer capturing student life, quiet growth, and reflections from the everyday page.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-[#E4CA7E]/90">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2]/5 border border-[#FAF7F2]/10">
                🇳🇬 Nigeria • Writing across timezones
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#E4CA7E]">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-[#FAF7F2]/85">
              <li>
                <button 
                  onClick={() => navigate({ type: 'home' })}
                  className="hover:text-[#E4CA7E] transition-colors flex items-center gap-1"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate({ type: 'about' })}
                  className="hover:text-[#E4CA7E] transition-colors flex items-center gap-1"
                >
                  About Emioluwa
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate({ type: 'writing' })}
                  className="hover:text-[#E4CA7E] transition-colors flex items-center gap-1"
                >
                  My Writing Archive
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate({ type: 'contact' })}
                  className="hover:text-[#E4CA7E] transition-colors flex items-center gap-1"
                >
                  Contact & Say Hello
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Reach */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#E4CA7E]">
              Get In Touch
            </h4>
            <div className="space-y-2.5 text-sm">
              <a 
                href="mailto:lifeofgod2912@gmail.com" 
                className="flex items-center gap-2 text-[#FAF7F2]/85 hover:text-[#E4CA7E] transition-colors group"
              >
                <Mail className="w-4 h-4 text-[#E4CA7E]" />
                <span className="truncate">lifeofgod2912@gmail.com</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <a 
                href="tel:+2347069318353" 
                className="flex items-center gap-2 text-[#FAF7F2]/85 hover:text-[#E4CA7E] transition-colors group"
              >
                <Phone className="w-4 h-4 text-[#E4CA7E]" />
                <span>+234 706 931 8353</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <div className="pt-3">
                <button
                  onClick={() => navigate({ type: 'contact' })}
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#E4CA7E] text-[#0D3B2E] hover:bg-[#F3DE9E] transition-all shadow-sm"
                >
                  Send a Warm Note
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF7F2]/70 font-sans">
          <p>© 2026 Emioluwa Writes. All rights reserved.</p>
          
          <div className="flex items-center gap-4 text-[#FAF7F2]/60">
            <button onClick={() => navigate({ type: 'writing' })} className="hover:text-[#FAF7F2] transition-colors">
              Essays
            </button>
            <span>•</span>
            <button onClick={() => navigate({ type: 'about' })} className="hover:text-[#FAF7F2] transition-colors">
              Philosophy
            </button>
            <span>•</span>
            <button onClick={() => navigate({ type: 'admin_login' })} className="hover:text-[#FAF7F2] transition-colors">
              Author Access
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
