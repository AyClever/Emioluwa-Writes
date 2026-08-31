export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  featuredImage: string;
  readTime: string;
  publishedAt: string;
  status: 'draft' | 'published';
  views?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount?: number;
}

export interface MessageReply {
  id: string;
  text: string;
  sentAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  type: 'contact' | 'say_hello';
  read: boolean;
  createdAt: string;
  replies?: MessageReply[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  bio: string;
}

export interface AdminStats {
  publishedCount: number;
  draftCount: number;
  totalArticles: number;
  categoriesCount: number;
  messagesCount: number;
  unreadMessagesCount: number;
  totalViews: number;
  recentArticles: Article[];
  recentMessages: Message[];
}

export type ViewRoute = 
  | { type: 'home' }
  | { type: 'about' }
  | { type: 'writing'; category?: string; search?: string }
  | { type: 'article'; slug: string }
  | { type: 'contact' }
  | { type: 'admin_login' }
  | { type: 'admin_dashboard'; tab?: 'overview' | 'articles' | 'categories' | 'messages' | 'editor' | 'settings'; editArticleId?: string };
