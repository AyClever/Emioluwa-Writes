import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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

export interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  type: 'contact' | 'say_hello';
  read: boolean;
  createdAt: string;
  replies?: Array<{
    id: string;
    text: string;
    sentAt: string;
  }>;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  bio: string;
}

export interface DatabaseSchema {
  admin: AdminUser;
  categories: Category[];
  articles: Article[];
  messages: Message[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial seed articles written in Emioluwa's authentic Nigerian student & literary voice
const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Student Life',
    slug: 'student-life',
    description: 'Reflections from lecture halls, hostel corridors, exams, and the messy beauty of school.',
  },
  {
    id: 'cat-2',
    name: 'Personal Growth',
    slug: 'personal-growth',
    description: 'Lessons on patience, discipline, navigating setbacks, and building character in your twenties.',
  },
  {
    id: 'cat-3',
    name: 'Self-Discovery',
    slug: 'self-discovery',
    description: 'Unravelling identity, finding your voice, understanding your inner compass, and gentle honesty.',
  },
  {
    id: 'cat-4',
    name: 'Life Experiences',
    slug: 'life-experiences',
    description: 'Moments from Lagos to Ibadan, rainy mornings, family dinners, and ordinary days turned into essays.',
  },
  {
    id: 'cat-5',
    name: 'Opinions',
    slug: 'opinions',
    description: 'Thoughtful perspectives on modern culture, reading habits, friendship dynamics, and youthful ambition.',
  },
  {
    id: 'cat-6',
    name: 'Creative Writing',
    slug: 'creative-writing',
    description: 'Short stories, poetic prose, vignettes, and narratives crafted with heart and imagery.',
  },
];

const INITIAL_ARTICLES: Article[] = [];

const INITIAL_MESSAGES: Message[] = [];

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function initDatabase(): DatabaseSchema {
  ensureDataDirectory();
  
  if (!fs.existsSync(DB_FILE)) {
    // Generate default admin password hash
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('Emioluwa2912', salt);

    const initialDb: DatabaseSchema = {
      admin: {
        id: 'admin-1',
        email: 'lifeofgod2912@gmail.com',
        passwordHash,
        name: 'Emioluwa',
        bio: 'Young Nigerian writer, essayist, and student crafting words that connect and stories that stay.'
      },
      categories: INITIAL_CATEGORIES,
      articles: INITIAL_ARTICLES,
      messages: INITIAL_MESSAGES
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading database file, re-initializing:', err);
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('Emioluwa2026!', salt);

    const fallbackDb: DatabaseSchema = {
      admin: {
        id: 'admin-1',
        email: 'lifeofgod2912@gmail.com',
        passwordHash,
        name: 'Emioluwa',
        bio: 'Young Nigerian writer, essayist, and student crafting words that connect and stories that stay.'
      },
      categories: INITIAL_CATEGORIES,
      articles: INITIAL_ARTICLES,
      messages: INITIAL_MESSAGES
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallbackDb, null, 2), 'utf-8');
    return fallbackDb;
  }
}

export function getDatabase(): DatabaseSchema {
  return initDatabase();
}

export function saveDatabase(data: DatabaseSchema): void {
  ensureDataDirectory();
  // Atomic write via temp file
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}
