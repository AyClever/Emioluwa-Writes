import React, { useState, useEffect, useRef } from 'react';
import { Article, Category, Message, AdminUser, AdminStats, ViewRoute } from '../types';
import {
  fetchAdminStats,
  fetchAdminArticles,
  createAdminArticle,
  updateAdminArticle,
  toggleArticleStatus,
  deleteAdminArticle,
  importDocxFile,
  uploadImageFile,
  fetchCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  fetchAdminMessages,
  toggleMessageRead,
  replyToMessage,
  deleteAdminMessage,
  updateAdminProfile,
  removeAdminToken,
  subscribeToArticlesChange
} from '../lib/api';
import { EMIOLUWA_LOGO_IMAGE, EMIOLUWA_ABOUT_IMAGE } from '../lib/assets';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Mail,
  Settings,
  Plus,
  Upload,
  FileUp,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  LogOut,
  Sparkles,
  Search,
  ExternalLink,
  Save,
  Send,
  Lock,
  ArrowRight,
  Shield,
  Smartphone,
  Monitor,
  X,
  AlertTriangle,
  Feather,
  Quote,
  Bold,
  Italic,
  List,
  Heading2,
  Heading3
} from 'lucide-react';

interface AdminDashboardProps {
  admin: AdminUser;
  navigate: (route: ViewRoute) => void;
  onLogout: () => void;
}

const PRESET_IMAGES = [
  { label: 'Journal & Pen', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Library & Books', url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Open Notebook', url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Vintage Typewriter', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Study & Coffee', url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Warm Sunlight', url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1200&auto=format&fit=crop' }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, navigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'editor' | 'categories' | 'messages' | 'settings'>('overview');

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Articles state
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleSearch, setArticleSearch] = useState('');
  const [articleFilterStatus, setArticleFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [articleFilterCategory, setArticleFilterCategory] = useState<string>('all');

  // Article Editor State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editFeaturedImage, setEditFeaturedImage] = useState('');
  const [editStatus, setEditStatus] = useState<'draft' | 'published'>('published');
  const [editPublishedAt, setEditPublishedAt] = useState('');
  const [editReadTime, setEditReadTime] = useState('');
  const [savingArticle, setSavingArticle] = useState(false);
  const [editorNotice, setEditorNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Word Doc Import & Image Upload States
  const [importingDocx, setImportingDocx] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Delete Article Modal
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [messageSearch, setMessageSearch] = useState('');
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'contact' | 'say_hello'>('all');

  // Settings State
  const [profileName, setProfileName] = useState(admin.name);
  const [profileBio, setProfileBio] = useState(admin.bio);
  const [profileEmail, setProfileEmail] = useState(admin.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsNotice, setSettingsNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Initial Data Load & Realtime Sync
  useEffect(() => {
    loadAllData();

    const unsubscribe = subscribeToArticlesChange(() => {
      loadAllData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  async function loadAllData() {
    try {
      const [statsData, articlesData, categoriesData, messagesData] = await Promise.all([
        fetchAdminStats(),
        fetchAdminArticles(),
        fetchCategories(),
        fetchAdminMessages()
      ]);
      setStats(statsData);
      setArticles(articlesData);
      setCategories(categoriesData);
      setMessages(messagesData);

      if (categoriesData.length > 0 && !editCategory) {
        setEditCategory(categoriesData[0].name);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  }

  // Handle opening editor for new article
  const handleOpenNewArticle = () => {
    setEditingArticleId(null);
    setEditTitle('');
    setEditSlug('');
    setEditCategory(categories[0]?.name || 'Student Life');
    setEditExcerpt('');
    setEditContent('');
    setEditFeaturedImage(PRESET_IMAGES[0].url);
    setEditStatus('published');
    setEditPublishedAt(new Date().toISOString().split('T')[0]);
    setEditReadTime('4 min read');
    setEditorNotice(null);
    setActiveTab('editor');
  };

  // Handle editing existing article
  const handleEditArticle = (article: Article) => {
    setEditingArticleId(article.id);
    setEditTitle(article.title);
    setEditSlug(article.slug);
    setEditCategory(article.category);
    setEditExcerpt(article.excerpt);
    setEditContent(article.content);
    setEditFeaturedImage(article.featuredImage);
    setEditStatus(article.status);
    setEditPublishedAt(article.publishedAt);
    setEditReadTime(article.readTime);
    setEditorNotice(null);
    setActiveTab('editor');
  };

  // Handle DOCX Import
  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportingDocx(true);
      setEditorNotice(null);
      const res = await importDocxFile(file);
      
      if (!editTitle) {
        setEditTitle(res.title);
      }
      setEditContent(res.htmlContent || res.rawText);
      if (!editExcerpt) {
        setEditExcerpt(res.excerpt);
      }
      if (!editReadTime) {
        setEditReadTime(res.readTime);
      }

      setEditorNotice({
        type: 'success',
        text: `Successfully imported "${file.name}"! Content and title populated.`
      });
    } catch (err: any) {
      setEditorNotice({
        type: 'error',
        text: err.message || 'Failed to import Word document (.docx)'
      });
    } finally {
      setImportingDocx(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Image File Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await uploadImageFile(file);
      setEditFeaturedImage(res.url);
      setEditorNotice({
        type: 'success',
        text: 'Featured image uploaded successfully!'
      });
    } catch (err: any) {
      setEditorNotice({
        type: 'error',
        text: err.message || 'Failed to upload image'
      });
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Save Article
  const handleSaveArticle = async (statusOverride?: 'draft' | 'published') => {
    if (!editTitle.trim() || !editContent.trim()) {
      setEditorNotice({ type: 'error', text: 'Title and content are required.' });
      return;
    }

    try {
      setSavingArticle(true);
      setEditorNotice(null);

      const targetStatus = statusOverride || editStatus;

      const payload = {
        title: editTitle,
        slug: editSlug,
        category: editCategory || (categories[0]?.name || 'Student Life'),
        excerpt: editExcerpt,
        content: editContent,
        featuredImage: editFeaturedImage || PRESET_IMAGES[0].url,
        status: targetStatus,
        publishedAt: editPublishedAt || new Date().toISOString().split('T')[0],
        readTime: editReadTime
      };

      if (editingArticleId) {
        await updateAdminArticle(editingArticleId, payload);
      } else {
        await createAdminArticle(payload);
      }

      await loadAllData();
      setEditorNotice({
        type: 'success',
        text: targetStatus === 'published' ? 'Article published live!' : 'Draft saved securely!'
      });

      setTimeout(() => {
        setActiveTab('articles');
      }, 1200);
    } catch (err: any) {
      setEditorNotice({ type: 'error', text: err.message || 'Failed to save article' });
    } finally {
      setSavingArticle(false);
    }
  };

  // Toggle Status directly from list
  const handleToggleStatus = async (article: Article) => {
    try {
      await toggleArticleStatus(article.id);
      await loadAllData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Confirm Delete Article
  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;
    try {
      await deleteAdminArticle(articleToDelete.id);
      setArticleToDelete(null);
      await loadAllData();
    } catch (err) {
      console.error('Failed to delete article:', err);
    }
  };

  // Categories Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await createAdminCategory({ name: newCatName, description: newCatDesc });
      setNewCatName('');
      setNewCatDesc('');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCatName.trim()) return;
    try {
      await updateAdminCategory(id, { name: editCatName, description: editCatDesc });
      setEditingCatId(null);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteAdminCategory(id);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  // Messages Handlers
  const handleToggleMessageRead = async (msg: Message) => {
    try {
      const updated = await toggleMessageRead(msg.id, !msg.read);
      setMessages(messages.map(m => m.id === msg.id ? updated : m));
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage(updated);
      }
      await loadAllData();
    } catch (err) {
      console.error('Failed to toggle read status:', err);
    }
  };

  const handleSendReply = async (msgId: string) => {
    if (!replyText.trim()) return;
    try {
      setSendingReply(true);
      await replyToMessage(msgId, replyText);
      setReplyText('');
      await loadAllData();
      const updatedList = await fetchAdminMessages();
      setMessages(updatedList);
      const updatedMsg = updatedList.find(m => m.id === msgId);
      if (updatedMsg) setSelectedMessage(updatedMsg);
    } catch (err: any) {
      alert(err.message || 'Failed to save reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await deleteAdminMessage(id);
      if (selectedMessage?.id === id) setSelectedMessage(null);
      await loadAllData();
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  // Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setSettingsNotice({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      setSavingSettings(true);
      setSettingsNotice(null);
      await updateAdminProfile({
        name: profileName,
        bio: profileBio,
        email: profileEmail,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSettingsNotice({ type: 'success', text: 'Admin profile updated successfully!' });
    } catch (err: any) {
      setSettingsNotice({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Formatting helpers for content editor
  const insertFormatting = (prefix: string, suffix: string = '') => {
    setEditContent(prev => prev + `\n${prefix}Text${suffix}\n`);
  };

  return (
    <div id="admin-dashboard" className="min-h-screen bg-[#FAF7F2] pb-20">
      
      {/* Top Admin Header Bar */}
      <div className="bg-[#0D3B2E] text-[#FAF7F2] border-b border-[#1A5E4B] sticky top-20 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E0D5C1] p-1 flex items-center justify-center shadow-xs overflow-hidden">
                <img
                  src={EMIOLUWA_LOGO_IMAGE}
                  alt="Emioluwa Writes"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="font-serif font-bold text-lg text-[#FAF7F2] leading-tight flex items-center gap-2">
                  <span>Emioluwa's Publishing Desk</span>
                </h1>
                <p className="text-[11px] text-[#E4CA7E] tracking-wider uppercase">
                  Logged in as {admin.name} ({admin.email})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate({ type: 'home' })}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FAF7F2]/10 hover:bg-[#FAF7F2]/20 text-[#FAF7F2] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#E4CA7E]" />
                <span>View Live Site</span>
              </button>

              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                title="Log out of Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>

          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto py-2 border-t border-[#135241]">
            <button
              id="admin-tab-overview"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'overview' ? 'bg-[#E4CA7E] text-[#0D3B2E]' : 'text-[#FAF7F2]/80 hover:bg-[#135241]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              id="admin-tab-articles"
              onClick={() => setActiveTab('articles')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'articles' || activeTab === 'editor' ? 'bg-[#E4CA7E] text-[#0D3B2E]' : 'text-[#FAF7F2]/80 hover:bg-[#135241]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Articles ({articles.length})</span>
            </button>

            <button
              id="admin-tab-categories"
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'categories' ? 'bg-[#E4CA7E] text-[#0D3B2E]' : 'text-[#FAF7F2]/80 hover:bg-[#135241]'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Categories ({categories.length})</span>
            </button>

            <button
              id="admin-tab-messages"
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all relative ${
                activeTab === 'messages' ? 'bg-[#E4CA7E] text-[#0D3B2E]' : 'text-[#FAF7F2]/80 hover:bg-[#135241]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Reader Inbox ({messages.length})</span>
              {stats && stats.unreadMessagesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              )}
            </button>

            <button
              id="admin-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'settings' ? 'bg-[#E4CA7E] text-[#0D3B2E]' : 'text-[#FAF7F2]/80 hover:bg-[#135241]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
            
            {/* Quick Greeting & Action Bar */}
            <div className="paper-card p-6 sm:p-8 rounded-3xl border border-[#E0D5C1] bg-gradient-to-r from-[#FFFDF9] via-[#FAF7F2] to-[#F4EFE6] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0D3B2E]">
                  Welcome back, Emioluwa ✨
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#57615D]">
                  Here is an overview of your publication, drafts, and incoming reader notes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="overview-new-article-btn"
                  onClick={handleOpenNewArticle}
                  className="px-5 py-2.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] font-semibold text-xs hover:bg-[#135241] transition-all shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-[#E4CA7E]" />
                  <span>Write New Article</span>
                </button>

                <button
                  onClick={() => {
                    handleOpenNewArticle();
                    setTimeout(() => fileInputRef.current?.click(), 100);
                  }}
                  className="px-4 py-2.5 rounded-full bg-[#FAF7F2] border border-[#D6C8B0] text-[#0D3B2E] font-semibold text-xs hover:bg-[#EFE8DA] transition-all flex items-center gap-2"
                >
                  <FileUp className="w-4 h-4 text-[#C29B38]" />
                  <span>Import Word Doc (.docx)</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="paper-card p-5 rounded-2xl border border-[#E8DEC8] space-y-2">
                <div className="flex items-center justify-between text-[#786D5F]">
                  <span className="text-xs font-semibold uppercase tracking-wider">Published</span>
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-3xl font-serif font-bold text-[#0D3B2E]">
                  {stats?.publishedCount || 0}
                </div>
                <p className="text-[11px] text-[#57615D]">Live on website</p>
              </div>

              <div className="paper-card p-5 rounded-2xl border border-[#E8DEC8] space-y-2">
                <div className="flex items-center justify-between text-[#786D5F]">
                  <span className="text-xs font-semibold uppercase tracking-wider">Drafts</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-3xl font-serif font-bold text-[#0D3B2E]">
                  {stats?.draftCount || 0}
                </div>
                <p className="text-[11px] text-[#57615D]">Private writing in progress</p>
              </div>

              <div className="paper-card p-5 rounded-2xl border border-[#E8DEC8] space-y-2">
                <div className="flex items-center justify-between text-[#786D5F]">
                  <span className="text-xs font-semibold uppercase tracking-wider">Reader Messages</span>
                  <Mail className="w-4 h-4 text-[#C29B38]" />
                </div>
                <div className="text-3xl font-serif font-bold text-[#0D3B2E]">
                  {stats?.messagesCount || 0}
                </div>
                <p className="text-[11px] text-[#57615D]">
                  <strong className="text-emerald-700">{stats?.unreadMessagesCount || 0}</strong> unread
                </p>
              </div>

              <div className="paper-card p-5 rounded-2xl border border-[#E8DEC8] space-y-2">
                <div className="flex items-center justify-between text-[#786D5F]">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Views</span>
                  <Eye className="w-4 h-4 text-[#0D3B2E]" />
                </div>
                <div className="text-3xl font-serif font-bold text-[#0D3B2E]">
                  {stats?.totalViews || 0}
                </div>
                <p className="text-[11px] text-[#57615D]">Across published essays</p>
              </div>

            </div>

            {/* Recent Activity: Recent Articles & Latest Messages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Recent Articles */}
              <div className="paper-card p-6 rounded-3xl border border-[#E0D5C1] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFE8DA]">
                  <h3 className="font-serif text-lg font-bold text-[#0D3B2E] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C29B38]" />
                    <span>Recent Articles</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('articles')}
                    className="text-xs text-[#C29B38] font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {articles.slice(0, 4).map((art) => (
                    <div
                      key={art.id}
                      onClick={() => handleEditArticle(art)}
                      className="p-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DA] transition-colors cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            art.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {art.status}
                          </span>
                          <span className="text-xs text-[#786D5F]">{art.category}</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#0D3B2E] truncate">
                          {art.title}
                        </h4>
                      </div>
                      <span className="text-xs text-[#786D5F] flex-shrink-0 font-mono">
                        {art.readTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Reader Messages */}
              <div className="paper-card p-6 rounded-3xl border border-[#E0D5C1] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFE8DA]">
                  <h3 className="font-serif text-lg font-bold text-[#0D3B2E] flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#C29B38]" />
                    <span>Latest Reader Messages</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="text-xs text-[#C29B38] font-bold hover:underline"
                  >
                    Open Inbox
                  </button>
                </div>

                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-xs text-[#786D5F] py-4 text-center">No messages yet.</p>
                  ) : (
                    messages.slice(0, 4).map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => {
                          setSelectedMessage(msg);
                          setActiveTab('messages');
                        }}
                        className={`p-3.5 rounded-xl cursor-pointer transition-colors space-y-1 ${
                          !msg.read ? 'bg-[#FAF7F2] border-l-3 border-[#0D3B2E]' : 'bg-[#FAF7F2]/60 hover:bg-[#EFE8DA]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#0D3B2E]">{msg.name}</span>
                          <span className="text-[#786D5F] text-[11px]">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#4E5754] line-clamp-1">
                          {msg.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ARTICLES LIST */}
        {/* ======================================================== */}
        {activeTab === 'articles' && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#0D3B2E]">
                  Article Management
                </h2>
                <p className="font-sans text-xs text-[#57615D]">
                  Manage, edit, publish, or delete your articles and drafts.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="articles-new-btn"
                  onClick={handleOpenNewArticle}
                  className="px-4 py-2.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] transition-all flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Article</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="paper-card p-4 rounded-2xl border border-[#E8DEC8] flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#786D5F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs text-[#1E2221] focus:outline-none focus:ring-1 focus:ring-[#0D3B2E]"
                  />
                </div>

                <select
                  value={articleFilterStatus}
                  onChange={(e) => setArticleFilterStatus(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs font-medium text-[#0D3B2E]"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published Only</option>
                  <option value="draft">Drafts Only</option>
                </select>

                <select
                  value={articleFilterCategory}
                  onChange={(e) => setArticleFilterCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs font-medium text-[#0D3B2E]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-[#786D5F]">
                {articles.length} total articles
              </span>
            </div>

            {/* Articles Table / Cards */}
            <div className="space-y-3">
              {articles.length === 0 ? (
                <div className="paper-card p-12 text-center rounded-2xl border border-dashed border-[#D6C8B0] space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#EFE8DA] flex items-center justify-center text-[#0D3B2E]">
                    <FileText className="w-6 h-6 text-[#C29B38]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-lg text-[#0D3B2E]">No articles in your desk yet</h3>
                    <p className="text-sm text-[#786D5F] max-w-md mx-auto">
                      All demo articles have been cleared. Write your first essay or import a Word (.docx) document to get started!
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenNewArticle()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Write First Essay</span>
                  </button>
                </div>
              ) : articles
                .filter((art) => {
                  if (articleFilterStatus !== 'all' && art.status !== articleFilterStatus) return false;
                  if (articleFilterCategory !== 'all' && art.category.toLowerCase() !== articleFilterCategory.toLowerCase()) return false;
                  if (articleSearch && !art.title.toLowerCase().includes(articleSearch.toLowerCase())) return false;
                  return true;
                })
                .map((art) => (
                  <div
                    key={art.id}
                    className="paper-card p-4 sm:p-5 rounded-2xl border border-[#E8DEC8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0D3B2E] transition-all"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#EFE8DA] flex-shrink-0">
                        <img
                          src={art.featuredImage}
                          alt={art.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleToggleStatus(art)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                              art.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                            title="Click to toggle Draft / Published"
                          >
                            {art.status.toUpperCase()}
                          </button>
                          <span className="text-xs font-semibold text-[#0D3B2E] bg-[#EFE8DA] px-2 py-0.5 rounded">
                            {art.category}
                          </span>
                          <span className="text-xs text-[#786D5F]">
                            {art.publishedAt}
                          </span>
                          <span className="text-xs text-[#786D5F]">
                            • {art.readTime}
                          </span>
                          {art.views !== undefined && (
                            <span className="text-xs text-[#786D5F]">
                              • {art.views} views
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif font-bold text-base text-[#0D3B2E] truncate">
                          {art.title}
                        </h3>

                        <p className="text-xs text-[#57615D] truncate max-w-xl">
                          {art.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                      {art.status === 'published' && (
                        <button
                          onClick={() => navigate({ type: 'article', slug: art.slug })}
                          className="p-2 rounded-lg bg-[#FAF7F2] border border-[#D6C8B0] text-[#0D3B2E] hover:bg-[#EFE8DA]"
                          title="View on site"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleEditArticle(art)}
                        className="px-3 py-1.5 rounded-lg bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setArticleToDelete(art)}
                        className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                        title="Delete article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ARTICLE EDITOR */}
        {/* ======================================================== */}
        {activeTab === 'editor' && (
          <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
            
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DEC8]">
              <div>
                <button
                  onClick={() => setActiveTab('articles')}
                  className="text-xs font-semibold text-[#786D5F] hover:text-[#0D3B2E] mb-1 flex items-center gap-1"
                >
                  ← Back to Articles
                </button>
                <h2 className="font-serif text-2xl font-bold text-[#0D3B2E]">
                  {editingArticleId ? 'Edit Article' : 'Write New Article'}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs font-semibold text-[#0D3B2E] hover:bg-[#EFE8DA] flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-[#C29B38]" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => handleSaveArticle('draft')}
                  disabled={savingArticle}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs font-semibold text-[#0D3B2E] hover:bg-[#EFE8DA] flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Draft</span>
                </button>

                <button
                  onClick={() => handleSaveArticle('published')}
                  disabled={savingArticle}
                  className="px-5 py-2 rounded-xl bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-[#E4CA7E]" />
                  <span>Publish Article</span>
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {editorNotice && (
              <div className={`p-4 rounded-2xl text-xs font-medium ${
                editorNotice.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {editorNotice.text}
              </div>
            )}

            {/* Word Document (.docx) Quick Import Card */}
            <div className="paper-card p-5 rounded-2xl border border-dashed border-[#C29B38] bg-[#FDFBF7] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0D3B2E] text-[#E4CA7E] flex items-center justify-center flex-shrink-0">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#0D3B2E]">Import Word Document (.docx)</h4>
                  <p className="text-xs text-[#57615D]">
                    Upload an essay from Microsoft Word. Headings, paragraphs, and formatted text will be parsed automatically.
                  </p>
                </div>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".docx"
                  onChange={handleDocxUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importingDocx}
                  className="px-4 py-2 rounded-xl bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{importingDocx ? 'Parsing .docx...' : 'Choose .docx File'}</span>
                </button>
              </div>
            </div>

            {/* Main Form Fields */}
            <div className="paper-card p-6 sm:p-8 rounded-3xl border border-[#E0D5C1] space-y-6">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider mb-2">
                  Article Title *
                </label>
                <input
                  id="article-edit-title"
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    if (!editingArticleId) {
                      setEditSlug(e.target.value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. The Quiet Art of Becoming: Finding Pace in a Rushed World"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-base font-serif font-bold text-[#0D3B2E] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                />
              </div>

              {/* Category, Status, Date, Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">Category *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs text-[#0D3B2E] font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs text-[#0D3B2E] font-medium"
                  >
                    <option value="published">Published (Public)</option>
                    <option value="draft">Draft (Private)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">Publication Date</label>
                  <input
                    type="date"
                    value={editPublishedAt}
                    onChange={(e) => setEditPublishedAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs text-[#0D3B2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">Estimated Read Time</label>
                  <input
                    type="text"
                    value={editReadTime}
                    onChange={(e) => setEditReadTime(e.target.value)}
                    placeholder="4 min read"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs text-[#0D3B2E]"
                  />
                </div>

              </div>

              {/* URL Slug & Excerpt */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">
                    Custom URL Slug
                  </label>
                  <div className="flex items-center bg-[#FAF7F2] border border-[#D6C8B0] rounded-xl px-3 py-2 text-xs">
                    <span className="text-[#786D5F] font-mono">/writing/</span>
                    <input
                      type="text"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      placeholder="custom-article-slug"
                      className="bg-transparent text-[#0D3B2E] font-mono flex-1 focus:outline-none ml-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">
                    Excerpt / Summary (displayed in cards and search)
                  </label>
                  <textarea
                    rows={2}
                    value={editExcerpt}
                    onChange={(e) => setEditExcerpt(e.target.value)}
                    placeholder="Short engaging overview of this piece..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs text-[#1E2221] focus:outline-none focus:ring-1 focus:ring-[#0D3B2E]"
                  />
                </div>
              </div>

              {/* Featured Image Selector & Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider">
                  Featured Image
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-8 space-y-2">
                    <input
                      type="text"
                      value={editFeaturedImage}
                      onChange={(e) => setEditFeaturedImage(e.target.value)}
                      placeholder="Image URL or choose from presets below"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs text-[#1E2221] focus:outline-none focus:ring-1 focus:ring-[#0D3B2E]"
                    />

                    {/* Presets */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                      <span className="text-[10px] text-[#786D5F] whitespace-nowrap">Presets:</span>
                      {PRESET_IMAGES.map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() => setEditFeaturedImage(img.url)}
                          className="px-2.5 py-1 rounded-md text-[10px] bg-[#FAF7F2] border border-[#D6C8B0] hover:bg-[#0D3B2E] hover:text-[#FAF7F2] transition-colors whitespace-nowrap"
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex items-center gap-3">
                    <input
                      type="file"
                      ref={imageInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs font-semibold text-[#0D3B2E] hover:bg-[#EFE8DA] flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    </button>
                  </div>
                </div>

                {/* Preview Thumbnail */}
                {editFeaturedImage && (
                  <div className="h-32 w-full max-w-sm rounded-xl overflow-hidden bg-[#EFE8DA] border border-[#E8DEC8]">
                    <img
                      src={editFeaturedImage}
                      alt="Featured Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Main Content Area with Formatting Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider">
                    Full Article Content *
                  </label>
                  
                  {/* Quick Format Tools */}
                  <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-lg border border-[#D6C8B0] text-xs">
                    <button
                      type="button"
                      onClick={() => insertFormatting('## ')}
                      className="p-1 hover:bg-[#EFE8DA] rounded text-[#0D3B2E]"
                      title="Heading 2"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('### ')}
                      className="p-1 hover:bg-[#EFE8DA] rounded text-[#0D3B2E]"
                      title="Heading 3"
                    >
                      <Heading3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('> ')}
                      className="p-1 hover:bg-[#EFE8DA] rounded text-[#0D3B2E]"
                      title="Quote"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('- ')}
                      className="p-1 hover:bg-[#EFE8DA] rounded text-[#0D3B2E]"
                      title="Bullet List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  id="article-edit-content"
                  rows={16}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write your story, essay, or reflections here (supports Markdown and rich paragraphs)..."
                  className="w-full p-4 rounded-2xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm font-serif leading-relaxed text-[#1E2221] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                />
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-[#EFE8DA] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('articles')}
                  className="text-xs font-semibold text-[#786D5F] hover:text-[#0D3B2E]"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSaveArticle('draft')}
                    disabled={savingArticle}
                    className="px-5 py-2.5 rounded-full bg-[#FAF7F2] border border-[#D6C8B0] text-xs font-semibold text-[#0D3B2E] hover:bg-[#EFE8DA]"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveArticle('published')}
                    disabled={savingArticle}
                    className="px-6 py-2.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4 text-[#E4CA7E]" />
                    <span>Publish Now</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: CATEGORIES */}
        {/* ======================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto">
            
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#0D3B2E]">
                Category Management
              </h2>
              <p className="font-sans text-xs text-[#57615D]">
                Organize your essays into themes. Categories automatically update on the homepage and archive filters.
              </p>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleCreateCategory} className="paper-card p-6 rounded-3xl border border-[#E0D5C1] space-y-4">
              <h3 className="font-serif text-base font-bold text-[#0D3B2E] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#C29B38]" />
                <span>Add New Category</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Literary Reflections"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs text-[#1E2221] focus:outline-none focus:ring-1 focus:ring-[#0D3B2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">Short Description</label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Brief description of this writing space"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs text-[#1E2221] focus:outline-none focus:ring-1 focus:ring-[#0D3B2E]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241]"
                >
                  Create Category
                </button>
              </div>
            </form>

            {/* Categories List */}
            <div className="space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="paper-card p-4 sm:p-5 rounded-2xl border border-[#E8DEC8] flex items-center justify-between gap-4"
                >
                  {editingCatId === cat.id ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#0D3B2E] text-xs"
                      />
                      <input
                        type="text"
                        value={editCatDesc}
                        onChange={(e) => setEditCatDesc(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#0D3B2E] text-xs"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-base text-[#0D3B2E]">{cat.name}</h4>
                        <span className="text-[11px] font-mono text-[#786D5F] bg-[#EFE8DA] px-2 py-0.5 rounded">
                          {cat.slug}
                        </span>
                        {cat.articleCount !== undefined && (
                          <span className="text-xs text-[#786D5F]">
                            • {cat.articleCount} pieces
                          </span>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-xs text-[#57615D]">{cat.description}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {editingCatId === cat.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateCategory(cat.id)}
                          className="px-3 py-1 rounded-lg bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="px-3 py-1 rounded-lg bg-[#FAF7F2] border border-[#D6C8B0] text-xs"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setEditCatName(cat.name);
                            setEditCatDesc(cat.description || '');
                          }}
                          className="p-2 rounded-lg bg-[#FAF7F2] border border-[#D6C8B0] text-[#0D3B2E] hover:bg-[#EFE8DA]"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: READER INBOX / MESSAGES */}
        {/* ======================================================== */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#0D3B2E]">
                  Reader Messages & Notes
                </h2>
                <p className="font-sans text-xs text-[#57615D]">
                  Private inbox for contact form submissions and Say Hello reader notes.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMessageFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    messageFilter === 'all' ? 'bg-[#0D3B2E] text-[#FAF7F2]' : 'bg-[#FAF7F2] border border-[#D6C8B0] text-[#4E5754]'
                  }`}
                >
                  All ({messages.length})
                </button>
                <button
                  onClick={() => setMessageFilter('unread')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    messageFilter === 'unread' ? 'bg-[#0D3B2E] text-[#FAF7F2]' : 'bg-[#FAF7F2] border border-[#D6C8B0] text-[#4E5754]'
                  }`}
                >
                  Unread ({messages.filter(m => !m.read).length})
                </button>
              </div>
            </div>

            {/* Split View: List on left, details on right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Message List */}
              <div className="lg:col-span-5 space-y-3">
                {messages.length === 0 ? (
                  <div className="paper-card p-8 rounded-2xl text-center text-xs text-[#786D5F]">
                    No messages received yet.
                  </div>
                ) : (
                  messages
                    .filter(m => {
                      if (messageFilter === 'unread') return !m.read;
                      if (messageFilter === 'contact') return m.type === 'contact';
                      if (messageFilter === 'say_hello') return m.type === 'say_hello';
                      return true;
                    })
                    .map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => {
                          setSelectedMessage(msg);
                          if (!msg.read) handleToggleMessageRead(msg);
                        }}
                        className={`paper-card p-4 rounded-2xl cursor-pointer border transition-all space-y-2 ${
                          selectedMessage?.id === msg.id
                            ? 'border-[#0D3B2E] bg-[#FFFDF9] shadow-sm'
                            : !msg.read
                            ? 'border-[#C29B38] bg-[#FDFBF7]'
                            : 'border-[#E8DEC8] bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${!msg.read ? 'bg-emerald-600' : 'bg-transparent'}`} />
                            <span className="font-serif font-bold text-[#0D3B2E]">{msg.name}</span>
                          </div>
                          <span className="text-[11px] text-[#786D5F]">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            msg.type === 'say_hello' ? 'bg-[#E4CA7E]/30 text-[#0D3B2E]' : 'bg-[#EFE8DA] text-[#57615D]'
                          }`}>
                            {msg.type === 'say_hello' ? 'Say Hello Note' : 'Contact Form'}
                          </span>
                          {msg.subject && (
                            <span className="text-xs font-semibold text-[#0D3B2E] truncate">
                              {msg.subject}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#57615D] line-clamp-2 leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    ))
                )}
              </div>

              {/* Message Details & Reply Panel */}
              <div className="lg:col-span-7">
                {selectedMessage ? (
                  <div className="paper-card p-6 sm:p-8 rounded-3xl border border-[#E0D5C1] space-y-6">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EFE8DA]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EFE8DA] text-[#0D3B2E]">
                            {selectedMessage.type === 'say_hello' ? 'Say Hello Note' : 'General Inquiry'}
                          </span>
                          <span className="text-xs text-[#786D5F]">
                            {new Date(selectedMessage.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <h3 className="font-serif text-xl font-bold text-[#0D3B2E]">
                          {selectedMessage.subject || 'Say Hello Note'}
                        </h3>

                        <div className="text-xs text-[#57615D] space-y-0.5">
                          <p>From: <strong>{selectedMessage.name}</strong></p>
                          <p>Email: <a href={`mailto:${selectedMessage.email}`} className="text-[#0D3B2E] underline">{selectedMessage.email}</a></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleMessageRead(selectedMessage)}
                          className="px-3 py-1 rounded-lg bg-[#FAF7F2] border border-[#D6C8B0] text-xs font-semibold text-[#0D3B2E]"
                        >
                          {selectedMessage.read ? 'Mark Unread' : 'Mark Read'}
                        </button>

                        <button
                          onClick={() => handleDeleteMessage(selectedMessage.id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8DEC8] font-serif text-base text-[#242927] leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </div>

                    {/* Previous Replies if any */}
                    {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0D3B2E]">
                          Previous Replies sent by Emioluwa:
                        </h4>
                        {selectedMessage.replies.map((rep) => (
                          <div key={rep.id} className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                            <p className="font-medium">{rep.text}</p>
                            <span className="text-[10px] text-emerald-700 block">
                              Sent on {new Date(rep.sentAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Box */}
                    <div className="space-y-3 pt-4 border-t border-[#EFE8DA]">
                      <label className="block text-xs font-semibold text-[#0D3B2E] uppercase tracking-wider">
                        Reply to {selectedMessage.name}
                      </label>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your response to keep a note in this thread..."
                        className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs text-[#1E2221] focus:outline-none focus:ring-1 focus:ring-[#0D3B2E]"
                      />

                      <div className="flex items-center justify-between">
                        <a
                          href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject || 'Your note on Emioluwa Writes'}`)}`}
                          className="text-xs font-bold text-[#0D3B2E] hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open in Email App</span>
                        </a>

                        <button
                          onClick={() => handleSendReply(selectedMessage.id)}
                          disabled={sendingReply || !replyText.trim()}
                          className="px-5 py-2 rounded-full bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5 text-[#E4CA7E]" />
                          <span>Record Reply</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="paper-card p-12 rounded-3xl border border-[#E0D5C1] text-center text-sm text-[#786D5F] flex flex-col items-center justify-center min-h-[300px]">
                    <Mail className="w-8 h-8 text-[#C29B38] mb-3 opacity-60" />
                    <p className="font-serif text-lg font-bold text-[#0D3B2E]">Select a Message</p>
                    <p className="text-xs text-[#57615D]">Click any message on the left to read and reply.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: SETTINGS */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
            
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#0D3B2E]">
                Admin Settings & Security
              </h2>
              <p className="font-sans text-xs text-[#57615D]">
                Update your author bio, admin contact email, or change your secure login password.
              </p>
            </div>

            {settingsNotice && (
              <div className={`p-4 rounded-2xl text-xs font-medium ${
                settingsNotice.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {settingsNotice.text}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="paper-card p-8 rounded-3xl border border-[#E0D5C1] space-y-6">
              
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#0D3B2E] border-b border-[#EFE8DA] pb-2 flex items-center justify-between">
                  <span>Profile Information</span>
                  <span className="text-[11px] font-sans font-normal text-[#786D5F]">Author & Brand Identity</span>
                </h3>

                {/* Author Brand Assets Preview */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F4EFE6] border border-[#E8DEC8]">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#E0D5C1] shadow-xs flex-shrink-0 bg-[#EFE8DA]">
                    <img
                      src={EMIOLUWA_ABOUT_IMAGE}
                      alt="Emioluwa Portrait"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-[#0D3B2E]">Emioluwa</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0D3B2E] text-[#E4CA7E] font-semibold">Active Author</span>
                    </div>
                    <p className="text-xs text-[#57615D] mt-0.5">About picture & official branding logo active across all reader views.</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E0D5C1] p-1 flex items-center justify-center shadow-xs flex-shrink-0">
                    <img
                      src={EMIOLUWA_LOGO_IMAGE}
                      alt="Website Logo"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">Author Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">Admin Email</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">Short Bio</label>
                  <textarea
                    rows={3}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-xs text-[#1E2221]"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4 pt-4 border-t border-[#EFE8DA]">
                <h3 className="font-serif text-lg font-bold text-[#0D3B2E] border-b border-[#EFE8DA] pb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#C29B38]" />
                  <span>Change Password</span>
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing password to verify"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0D3B2E] mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D6C8B0] text-sm text-[#1E2221]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 rounded-full bg-[#0D3B2E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#135241] shadow-md disabled:opacity-50"
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>

            </form>

          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* PREVIEW MODAL */}
      {/* ======================================================== */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#E0D5C1]">
            
            {/* Modal Top Bar */}
            <div className="bg-[#0D3B2E] text-[#FAF7F2] px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-serif font-bold text-sm text-[#FAF7F2]">Article Live Preview</span>
                <span className="text-[11px] bg-[#E4CA7E] text-[#0D3B2E] px-2 py-0.5 rounded-full font-bold">
                  {editStatus.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-[#FAF7F2]/20 text-[#E4CA7E]' : 'text-[#FAF7F2]/60'}`}
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-[#FAF7F2]/20 text-[#E4CA7E]' : 'text-[#FAF7F2]/60'}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 text-[#FAF7F2] hover:bg-[#FAF7F2]/10 rounded-lg ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex justify-center bg-[#FAF7F2]">
              <div className={`w-full ${previewDevice === 'mobile' ? 'max-w-sm border-8 border-[#222] rounded-3xl p-4 bg-[#FAF7F2] shadow-xl' : 'max-w-3xl'}`}>
                
                <div className="text-center space-y-4 mb-8">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EFE8DA] text-[#0D3B2E]">
                    {editCategory || 'Student Life'}
                  </span>

                  <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#0D3B2E] leading-tight">
                    {editTitle || 'Untitled Article'}
                  </h1>

                  {editExcerpt && (
                    <p className="font-serif italic text-sm sm:text-base text-[#57615D]">
                      {editExcerpt}
                    </p>
                  )}

                  <div className="text-xs text-[#786D5F] flex items-center justify-center gap-3">
                    <span>By Emioluwa</span>
                    <span>•</span>
                    <span>{editPublishedAt || new Date().toISOString().split('T')[0]}</span>
                    <span>•</span>
                    <span>{editReadTime || '4 min read'}</span>
                  </div>
                </div>

                {editFeaturedImage && (
                  <div className="rounded-2xl overflow-hidden mb-8 border border-[#E8DEC8] bg-[#EFE8DA]">
                    <img
                      src={editFeaturedImage}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full max-h-72 object-cover"
                    />
                  </div>
                )}

                <div className="paper-card p-6 rounded-2xl border border-[#E8DEC8] font-serif text-base leading-relaxed text-[#242927] whitespace-pre-wrap">
                  {editContent || 'No article content typed yet.'}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="paper-card p-6 sm:p-8 rounded-3xl max-w-md w-full border border-red-200 bg-[#FFFDF9] space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-xl font-bold text-[#0D3B2E]">Delete Article?</h3>
              <p className="font-sans text-xs text-[#57615D]">
                Are you sure you want to delete "<strong>{articleToDelete.title}</strong>"? This action cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setArticleToDelete(null)}
                className="px-5 py-2 rounded-full bg-[#FAF7F2] border border-[#D6C8B0] text-xs font-semibold text-[#0D3B2E]"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteArticle}
                className="px-5 py-2 rounded-full bg-red-700 text-white text-xs font-semibold hover:bg-red-800"
              >
                Yes, Delete Article
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
