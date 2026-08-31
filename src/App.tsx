import React, { useState, useEffect } from 'react';
import { ViewRoute, AdminUser } from './types';
import { fetchAdminMe, removeAdminToken } from './lib/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { AboutPage } from './components/AboutPage';
import { WritingArchive } from './components/WritingArchive';
import { ArticleSingle } from './components/ArticleSingle';
import { ContactPage } from './components/ContactPage';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<ViewRoute>({ type: 'home' });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Helper to parse path from URL
  const parsePathToRoute = (pathname: string): ViewRoute => {
    const cleanPath = pathname.replace(/\/$/, '') || '/';

    if (cleanPath === '/' || cleanPath === '') {
      return { type: 'home' };
    }
    if (cleanPath === '/about') {
      return { type: 'about' };
    }
    if (cleanPath === '/writing') {
      return { type: 'writing' };
    }
    if (cleanPath.startsWith('/writing/')) {
      const slug = cleanPath.replace('/writing/', '');
      return { type: 'article', slug };
    }
    if (cleanPath === '/contact') {
      return { type: 'contact' };
    }
    if (cleanPath === '/admin') {
      return { type: 'admin_login' };
    }
    if (cleanPath === '/admin/dashboard') {
      return { type: 'admin_dashboard' };
    }

    return { type: 'home' };
  };

  // Helper to get URL path from route
  const getPathFromRoute = (route: ViewRoute): string => {
    switch (route.type) {
      case 'home': return '/';
      case 'about': return '/about';
      case 'writing': return '/writing';
      case 'article': return `/writing/${route.slug}`;
      case 'contact': return '/contact';
      case 'admin_login': return '/admin';
      case 'admin_dashboard': return '/admin/dashboard';
      default: return '/';
    }
  };

  // Check auth session on startup
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await fetchAdminMe();
        setAdminUser(user);
      } catch {
        setAdminUser(null);
      } finally {
        setAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  // Listen to browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      const route = parsePathToRoute(window.location.pathname);
      setCurrentRoute(route);
    };

    window.addEventListener('popstate', handlePopState);
    // Initial route parse
    const initialRoute = parsePathToRoute(window.location.pathname);
    setCurrentRoute(initialRoute);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Custom Navigation function that updates history
  const navigate = (route: ViewRoute) => {
    const targetPath = getPathFromRoute(route);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
  };

  const handleLogout = () => {
    removeAdminToken();
    setAdminUser(null);
    navigate({ type: 'admin_login' });
  };

  // Render current view
  const renderView = () => {
    switch (currentRoute.type) {
      case 'home':
        return <HomePage navigate={navigate} />;

      case 'about':
        return <AboutPage navigate={navigate} />;

      case 'writing':
        return (
          <WritingArchive
            initialCategory={currentRoute.category}
            initialSearch={currentRoute.search}
            navigate={navigate}
          />
        );

      case 'article':
        return (
          <ArticleSingle
            slug={currentRoute.slug}
            navigate={navigate}
          />
        );

      case 'contact':
        return <ContactPage navigate={navigate} />;

      case 'admin_login':
        if (adminUser) {
          return <AdminDashboard admin={adminUser} navigate={navigate} onLogout={handleLogout} />;
        }
        return <AdminLogin navigate={navigate} onLoginSuccess={handleLoginSuccess} />;

      case 'admin_dashboard':
        if (!authChecking && !adminUser) {
          return <AdminLogin navigate={navigate} onLoginSuccess={handleLoginSuccess} />;
        }
        if (adminUser) {
          return <AdminDashboard admin={adminUser} navigate={navigate} onLogout={handleLogout} />;
        }
        return (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-3 border-[#0D3B2E] border-t-transparent rounded-full" />
          </div>
        );

      default:
        return <HomePage navigate={navigate} />;
    }
  };

  const isDashboardView = currentRoute.type === 'admin_dashboard' && !!adminUser;

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#1E2221] font-sans antialiased selection:bg-[#0D3B2E] selection:text-[#FAF7F2]">
      {/* Sticky Navbar (hidden on full dashboard if needed or displayed cleanly) */}
      <Navbar
        currentRoute={currentRoute}
        navigate={navigate}
        isAdminLoggedIn={!!adminUser}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {renderView()}
      </main>

      {/* Main Footer (shown on all public views) */}
      {!isDashboardView && (
        <Footer navigate={navigate} />
      )}
    </div>
  );
}
