import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import mammoth from 'mammoth';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { 
  getDatabase, 
  saveDatabase, 
  Article, 
  Category, 
  Message 
} from './server/db.js';
import { 
  generateToken, 
  requireAdminAuth, 
  AuthenticatedRequest, 
  verifyToken 
} from './server/auth.js';

const app = express();
const PORT = 3000;

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOAD_DIR));

// Configure multer for file uploads (.docx and images)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Helper to calculate reading time
function calculateReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/#|\*|_|`/g, '');
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return `${minutes} min read`;
}

// Helper to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ----------------------------------------------------
// PUBLIC API ROUTES
// ----------------------------------------------------

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Get Categories (with published count)
app.get('/api/categories', (_req, res) => {
  const db = getDatabase();
  const publishedArticles = db.articles.filter(a => a.status === 'published');
  
  const categoriesWithCount = db.categories.map(cat => ({
    ...cat,
    articleCount: publishedArticles.filter(a => a.category.toLowerCase() === cat.name.toLowerCase()).length
  }));

  res.json(categoriesWithCount);
});

// Get Published Articles (Public archive & search)
app.get('/api/articles', (req, res) => {
  const db = getDatabase();
  const { category, search, limit, featured } = req.query;

  let published = db.articles.filter(a => a.status === 'published');

  // Filter by category
  if (category && typeof category === 'string' && category !== 'All') {
    published = published.filter(a => 
      a.category.toLowerCase() === category.toLowerCase() ||
      generateSlug(a.category) === generateSlug(category)
    );
  }

  // Filter by search term
  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    published = published.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q)
    );
  }

  // Sort by publication date newest first
  published.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (limit) {
    const num = parseInt(limit as string, 10);
    if (!isNaN(num) && num > 0) {
      published = published.slice(0, num);
    }
  }

  res.json(published);
});

// Real-time article sync endpoint for cross-device updates
app.post('/api/articles/sync', (req, res) => {
  const { action, article, articleId } = req.body;
  const db = getDatabase();

  if (action === 'upsert' && article) {
    const existingIndex = db.articles.findIndex(a => a.id === article.id || a.slug === article.slug);
    if (existingIndex >= 0) {
      db.articles[existingIndex] = { ...db.articles[existingIndex], ...article, updatedAt: new Date().toISOString() };
    } else {
      db.articles.unshift({
        ...article,
        views: article.views || 0,
        createdAt: article.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    saveDatabase(db);
    return res.json({ success: true, count: db.articles.length });
  }

  if (action === 'delete' && articleId) {
    db.articles = db.articles.filter(a => a.id !== articleId && a.slug !== articleId);
    saveDatabase(db);
    return res.json({ success: true, count: db.articles.length });
  }

  res.status(400).json({ error: 'Invalid sync payload' });
});

// Get Single Article by Slug (Public access strictly for published, admin can preview drafts)
app.get('/api/articles/:slug', (req, res) => {
  const db = getDatabase();
  const { slug } = req.params;

  const article = db.articles.find(a => a.slug === slug || a.id === slug);

  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  // Check if draft
  if (article.status === 'draft') {
    // Check if requester has valid admin token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.substring(7));
      if (payload) {
        return res.json(article);
      }
    }
    return res.status(404).json({ error: 'Article not found' });
  }

  // Increment views
  article.views = (article.views || 0) + 1;
  saveDatabase(db);

  // Get related articles in same category
  const related = db.articles
    .filter(a => a.status === 'published' && a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  res.json({ article, related });
});

// Post Contact Form
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide name, email, and your message' });
  }

  const db = getDatabase();
  const newMessage: Message = {
    id: 'msg-' + Date.now(),
    name: name.trim(),
    email: email.trim(),
    subject: subject?.trim() || 'Website Inquiry',
    message: message.trim(),
    type: 'contact',
    read: false,
    createdAt: new Date().toISOString()
  };

  db.messages.unshift(newMessage);
  saveDatabase(db);

  res.status(201).json({ success: true, message: 'Your message has been sent to Emioluwa. Thank you!' });
});

// Post Say Hello Form
app.post('/api/say-hello', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide your name, email, and message' });
  }

  const db = getDatabase();
  const newMessage: Message = {
    id: 'hello-' + Date.now(),
    name: name.trim(),
    email: email.trim(),
    subject: 'Say Hello Note',
    message: message.trim(),
    type: 'say_hello',
    read: false,
    createdAt: new Date().toISOString()
  };

  db.messages.unshift(newMessage);
  saveDatabase(db);

  res.status(201).json({ success: true, message: 'Thank you for saying hello! Emioluwa has received your note.' });
});

// Admin Login (Strictly for Emioluwa)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Strict check: Only Emioluwa's email has admin access
  if (cleanEmail !== 'lifeofgod2912@gmail.com') {
    return res.status(401).json({ error: 'Access denied. Readers do not have access to the admin portal.' });
  }

  const db = getDatabase();
  const admin = db.admin;

  const isValidPassword = (password === 'Emioluwa2912') || (admin?.passwordHash && bcrypt.compareSync(password, admin.passwordHash));
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken({ adminId: admin?.id || 'admin-1', email: 'lifeofgod2912@gmail.com' });

  res.json({
    success: true,
    token,
    admin: {
      id: admin?.id || 'admin-1',
      email: 'lifeofgod2912@gmail.com',
      name: admin?.name || 'Emioluwa',
      bio: admin?.bio || 'Young Nigerian writer, essayist, and student crafting words that connect and stories that stay.'
    }
  });
});

// ----------------------------------------------------
// PROTECTED ADMIN API ROUTES
// ----------------------------------------------------

// Verify Admin Session / Get Profile
app.get('/api/admin/me', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const db = getDatabase();
  const admin = db.admin;
  res.json({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    bio: admin.bio
  });
});

// Update Admin Profile or Password
app.put('/api/admin/profile', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const { name, bio, email, currentPassword, newPassword } = req.body;
  const db = getDatabase();
  const admin = db.admin;

  if (email) admin.email = email.trim();
  if (name) admin.name = name.trim();
  if (bio !== undefined) admin.bio = bio.trim();

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to set a new password' });
    }
    const isValid = bcrypt.compareSync(currentPassword, admin.passwordHash);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password does not match' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    admin.passwordHash = bcrypt.hashSync(newPassword, 10);
  }

  saveDatabase(db);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      bio: admin.bio
    }
  });
});

// Admin Dashboard Overview Statistics
app.get('/api/admin/stats', requireAdminAuth, (_req, res) => {
  const db = getDatabase();
  const publishedArticles = db.articles.filter(a => a.status === 'published');
  const draftArticles = db.articles.filter(a => a.status === 'draft');
  const unreadMessages = db.messages.filter(m => !m.read);
  const totalViews = db.articles.reduce((acc, a) => acc + (a.views || 0), 0);

  res.json({
    publishedCount: publishedArticles.length,
    draftCount: draftArticles.length,
    totalArticles: db.articles.length,
    categoriesCount: db.categories.length,
    messagesCount: db.messages.length,
    unreadMessagesCount: unreadMessages.length,
    totalViews,
    recentArticles: db.articles.slice(0, 5),
    recentMessages: db.messages.slice(0, 5)
  });
});

// Admin Get All Articles (Drafts & Published)
app.get('/api/admin/articles', requireAdminAuth, (_req, res) => {
  const db = getDatabase();
  // Return sorted by updated/created
  const sorted = [...db.articles].sort((a, b) => 
    new Date(b.updatedAt || b.publishedAt).getTime() - new Date(a.updatedAt || a.publishedAt).getTime()
  );
  res.json(sorted);
});

// Admin Create Article
app.post('/api/admin/articles', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const { title, excerpt, content, category, featuredImage, slug, status, publishedAt, readTime } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Title, content, and category are required' });
  }

  const db = getDatabase();
  let finalSlug = slug ? generateSlug(slug) : generateSlug(title);

  // Ensure unique slug
  if (db.articles.some(a => a.slug === finalSlug)) {
    finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
  }

  const now = new Date().toISOString();
  const calculatedReadTime = readTime || calculateReadingTime(content);

  const newArticle: Article = {
    id: 'art-' + Date.now(),
    title: title.trim(),
    slug: finalSlug,
    excerpt: excerpt?.trim() || content.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...',
    content: content.trim(),
    category: category.trim(),
    featuredImage: featuredImage?.trim() || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop',
    readTime: calculatedReadTime,
    publishedAt: publishedAt || now.split('T')[0],
    status: status === 'draft' ? 'draft' : 'published',
    views: 0,
    createdAt: now,
    updatedAt: now
  };

  db.articles.unshift(newArticle);
  saveDatabase(db);

  res.status(201).json(newArticle);
});

// Admin Update Article
app.put('/api/admin/articles/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, excerpt, content, category, featuredImage, slug, status, publishedAt, readTime } = req.body;

  const db = getDatabase();
  const articleIndex = db.articles.findIndex(a => a.id === id);

  if (articleIndex === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const existing = db.articles[articleIndex];
  let finalSlug = slug ? generateSlug(slug) : existing.slug;

  // Check unique slug if changed
  if (finalSlug !== existing.slug && db.articles.some(a => a.id !== id && a.slug === finalSlug)) {
    finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
  }

  const updated: Article = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    slug: finalSlug,
    excerpt: excerpt !== undefined ? excerpt.trim() : existing.excerpt,
    content: content !== undefined ? content.trim() : existing.content,
    category: category !== undefined ? category.trim() : existing.category,
    featuredImage: featuredImage !== undefined ? featuredImage.trim() : existing.featuredImage,
    status: status !== undefined ? status : existing.status,
    publishedAt: publishedAt !== undefined ? publishedAt : existing.publishedAt,
    readTime: readTime || (content ? calculateReadingTime(content) : existing.readTime),
    updatedAt: new Date().toISOString()
  };

  db.articles[articleIndex] = updated;
  saveDatabase(db);

  res.json(updated);
});

// Admin Toggle Article Status (Draft <-> Published)
app.post('/api/admin/articles/:id/toggle-status', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const article = db.articles.find(a => a.id === id);

  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  article.status = article.status === 'published' ? 'draft' : 'published';
  article.updatedAt = new Date().toISOString();
  saveDatabase(db);

  res.json(article);
});

// Admin Delete Article
app.delete('/api/admin/articles/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const initialLength = db.articles.length;
  db.articles = db.articles.filter(a => a.id !== id);

  if (db.articles.length === initialLength) {
    return res.status(404).json({ error: 'Article not found' });
  }

  saveDatabase(db);
  res.json({ success: true, message: 'Article deleted successfully' });
});

// Admin Import Word Document (.docx)
app.post('/api/admin/import-docx', requireAdminAuth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No Word document (.docx) uploaded' });
    }

    const filePath = req.file.path;
    const result = await mammoth.convertToHtml({ path: filePath });
    const rawTextResult = await mammoth.extractRawText({ path: filePath });

    // Clean up temporary file
    try {
      fs.unlinkSync(filePath);
    } catch {
      // ignore unlink error
    }

    const html = result.value;
    const rawText = rawTextResult.value;

    // Extract title guess from first non-empty line or file name
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const guessedTitle = lines.length > 0 ? lines[0] : req.file.originalname.replace(/\.[^/.]+$/, '');
    const guessedExcerpt = lines.slice(1).join(' ').slice(0, 180) + '...';

    res.json({
      success: true,
      title: guessedTitle,
      htmlContent: html,
      rawText: rawText,
      excerpt: guessedExcerpt,
      readTime: calculateReadingTime(rawText)
    });
  } catch (error) {
    console.error('Error parsing docx:', error);
    res.status(500).json({ error: 'Failed to parse Word document. Please ensure it is a valid .docx file.' });
  }
});

// Admin Upload Image (Featured Image or inline asset)
app.post('/api/admin/upload-image', requireAdminAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: imageUrl,
    filename: req.file.filename
  });
});

// Admin Categories CRUD
app.post('/api/admin/categories', requireAdminAuth, (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const db = getDatabase();
  const slug = generateSlug(name);

  if (db.categories.some(c => c.slug === slug || c.name.toLowerCase() === name.toLowerCase().trim())) {
    return res.status(400).json({ error: 'A category with this name already exists' });
  }

  const newCategory: Category = {
    id: 'cat-' + Date.now(),
    name: name.trim(),
    slug,
    description: description?.trim() || ''
  };

  db.categories.push(newCategory);
  saveDatabase(db);

  res.status(201).json(newCategory);
});

app.put('/api/admin/categories/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const db = getDatabase();
  const cat = db.categories.find(c => c.id === id);

  if (!cat) {
    return res.status(404).json({ error: 'Category not found' });
  }

  if (name) {
    const oldName = cat.name;
    cat.name = name.trim();
    cat.slug = generateSlug(name);

    // Update articles that had old category name
    db.articles.forEach(a => {
      if (a.category.toLowerCase() === oldName.toLowerCase()) {
        a.category = cat.name;
      }
    });
  }

  if (description !== undefined) {
    cat.description = description.trim();
  }

  saveDatabase(db);
  res.json(cat);
});

app.delete('/api/admin/categories/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const cat = db.categories.find(c => c.id === id);

  if (!cat) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // Remove category
  db.categories = db.categories.filter(c => c.id !== id);
  saveDatabase(db);

  res.json({ success: true, message: `Category "${cat.name}" deleted successfully` });
});

// Admin Messages Management
app.get('/api/admin/messages', requireAdminAuth, (_req, res) => {
  const db = getDatabase();
  // Newest messages first
  const sorted = [...db.messages].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sorted);
});

app.put('/api/admin/messages/:id/read', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { read } = req.body;
  const db = getDatabase();
  const msg = db.messages.find(m => m.id === id);

  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }

  msg.read = read !== undefined ? Boolean(read) : !msg.read;
  saveDatabase(db);

  res.json(msg);
});

app.post('/api/admin/messages/:id/reply', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Reply text is required' });
  }

  const db = getDatabase();
  const msg = db.messages.find(m => m.id === id);

  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }

  if (!msg.replies) {
    msg.replies = [];
  }

  const replyObj = {
    id: 'rep-' + Date.now(),
    text: text.trim(),
    sentAt: new Date().toISOString()
  };

  msg.replies.push(replyObj);
  msg.read = true; // Mark as read when replied
  saveDatabase(db);

  res.status(201).json({ success: true, reply: replyObj });
});

app.delete('/api/admin/messages/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const initialLength = db.messages.length;
  db.messages = db.messages.filter(m => m.id !== id);

  if (db.messages.length === initialLength) {
    return res.status(404).json({ error: 'Message not found' });
  }

  saveDatabase(db);
  res.json({ success: true, message: 'Message deleted successfully' });
});

// ----------------------------------------------------
// VITE INTEGRATION & STATIC SERVING
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Emioluwa Writes] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
