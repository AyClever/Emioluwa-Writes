import React, { useState, useEffect } from 'react';
import { ViewRoute } from '../types';
import { EMIOLUWA_LOGO_IMAGE } from '../lib/assets';
import { Feather, Menu, X, BookOpen, Lock, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentRoute: ViewRoute;
  navigate: (route: ViewRoute) => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate, isAdminLoggedIn }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', route: { type: 'home' } as ViewRoute, isActive: currentRoute.type === 'home' },
    { label: 'About', route: { type: 'about' } as ViewRoute, isActive: currentRoute.type === 'about' },
    { label: 'My Writing', route: { type: 'writing' } as ViewRoute, isActive: currentRoute.type === 'writing' || currentRoute.type === 'article' },
    { label: 'Contact', route: { type: 'contact' } as ViewRoute, isActive: currentRoute.type === 'contact' },
  ];

  const handleNavClick = (route: ViewRoute) => {
    setMobileMenuOpen(false);
    navigate(route);
  };

  return (
    <header 
      id="main-navbar"
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#FAF7F2]/95 backdrop-blur-md shadow-sm border-b border-[#E8DEC8]' 
          : 'bg-[#FAF7F2] border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button 
            id="brand-logo-btn"
            onClick={() => handleNavClick({ type: 'home' })}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-12 h-12 rounded-xl bg-white border border-[#E0D5C1] p-1 flex items-center justify-center shadow-xs group-hover:border-[#0D3B2E] transition-all overflow-hidden">
              <img
                src={EMIOLUWA_LOGO_IMAGE}
                alt="Emioluwa Writes Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#0D3B2E] group-hover:text-[#135241] transition-colors block">
                EMIOLUWA WRITES
              </span>
              <span className="text-[10px] sm:text-xs font-sans tracking-widest text-[#786D5F] uppercase block -mt-0.5">
                Words that connect. Stories that stay.
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                id={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleNavClick(item.route)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  item.isActive
                    ? 'bg-[#0D3B2E] text-[#FAF7F2] shadow-sm'
                    : 'text-[#3E4543] hover:text-[#0D3B2E] hover:bg-[#EFE8DA]/60'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Admin Access Button (Shown only when author is logged in) */}
            {isAdminLoggedIn && (
              <div className="pl-3 ml-2 border-l border-[#E0D5C1] flex items-center">
                <button
                  id="nav-admin-dashboard-btn"
                  onClick={() => handleNavClick({ type: 'admin_dashboard' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E4CA7E]/30 text-[#0D3B2E] border border-[#C29B38]/40 hover:bg-[#E4CA7E]/50 transition-all"
                  title="Admin Dashboard"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0D3B2E]" />
                  <span>Admin Hub</span>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={() => handleNavClick({ type: 'admin_dashboard' })}
                className="p-2 rounded-lg bg-[#E4CA7E]/30 text-[#0D3B2E] text-xs font-semibold"
                title="Admin Dashboard"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-[#0D3B2E] hover:bg-[#EFE8DA] focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-b border-[#E8DEC8] px-4 pt-2 pb-6 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.route)}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  item.isActive
                    ? 'bg-[#0D3B2E] text-[#FAF7F2]'
                    : 'text-[#2D3331] hover:bg-[#EFE8DA]'
                }`}
              >
                {item.label}
              </button>
            ))}

            {isAdminLoggedIn && (
              <div className="pt-3 border-t border-[#E8DEC8] mt-2">
                <button
                  onClick={() => handleNavClick({ type: 'admin_dashboard' })}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#E4CA7E]/30 text-[#0D3B2E] font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Admin Dashboard
                  </span>
                  <span className="text-xs bg-[#0D3B2E] text-[#FAF7F2] px-2 py-0.5 rounded-full">Active</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
