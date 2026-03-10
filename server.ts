import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("accounting.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    password TEXT,
    credits INTEGER DEFAULT 2,
    role TEXT DEFAULT 'user',
    is_active INTEGER DEFAULT 1,
    last_reset_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    question TEXT,
    solution TEXT,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS redeem_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    value INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add username column if it doesn't exist
try {
  db.exec("ALTER TABLE users ADD COLUMN username TEXT UNIQUE");
} catch (e) {
  // Column might already exist
}

// Migration: Add is_active column if it doesn't exist
try {
  db.exec("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1");
  // Ensure existing users have is_active = 1
  db.exec("UPDATE users SET is_active = 1 WHERE is_active IS NULL");
} catch (e) {
  // Column might already exist
}

// Seed Settings
const defaultSettings = [
  { key: 'daily_free_credits_user', value: '5' },
  { key: 'daily_free_credits_guest', value: '2' },
  { key: 'maintenance_mode', value: 'false' }
];

defaultSettings.forEach(s => {
  const exists = db.prepare("SELECT * FROM settings WHERE key = ?").get(s.key);
  if (!exists) {
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(s.key, s.value);
  }
});

// Seed Admin
const adminEmail = "admin@admin.admin";
const adminUsername = "admin";
const adminPassword = "admin admin 018";
const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail) as any;
if (!existingAdmin) {
  db.prepare("INSERT INTO users (email, username, password, role, credits) VALUES (?, ?, ?, 'admin', 999999)").run(adminEmail, adminUsername, adminPassword);
} else if (existingAdmin.password !== adminPassword) {
  db.prepare("UPDATE users SET password = ? WHERE email = ?").run(adminPassword, adminEmail);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Maintenance Mode Middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/credits/consume') || req.path.startsWith('/api/history')) {
      const maintenance = db.prepare("SELECT value FROM settings WHERE key = 'maintenance_mode'").get() as any;
      if (maintenance?.value === 'true') {
        return res.status(503).json({ success: false, message: "সার্ভার বর্তমানে রক্ষণাবেক্ষণের অধীনে আছে। অনুগ্রহ করে পরে চেষ্টা করুন।" });
      }
    }
    next();
  });

  // Middleware to handle daily credit reset
  const resetCredits = (user: any) => {
    if (!user) return 0;
    const today = new Date().toISOString().split('T')[0];
    
    if (user.last_reset_date !== today) {
      const isGuest = user.email.startsWith("guest_");
      const guestCreditsSetting = db.prepare("SELECT value FROM settings WHERE key = 'daily_free_credits_guest'").get() as any;
      const userCreditsSetting = db.prepare("SELECT value FROM settings WHERE key = 'daily_free_credits_user'").get() as any;
      
      const dailyCredits = user.role === 'admin' ? 999999 : (isGuest ? parseInt(guestCreditsSetting?.value || '2') : parseInt(userCreditsSetting?.value || '5'));
      db.prepare("UPDATE users SET credits = ?, last_reset_date = ? WHERE id = ?")
        .run(dailyCredits, today, user.id);
      return dailyCredits;
    }
    return user.credits;
  };

  // API Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    // Optimized query: select only needed fields
    const user = db.prepare("SELECT id, email, username, role, credits, last_reset_date, is_active FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      if (!user.is_active) {
        return res.status(403).json({ success: false, message: "আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে। সহায়তার জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।" });
      }
      const credits = resetCredits(user);
      res.json({ success: true, user: { id: user.id, email: user.email, username: user.username, role: user.role, credits } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, username, password } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (email, username, password, credits, last_reset_date) VALUES (?, ?, ?, 5, ?)")
        .run(email, username, password, new Date().toISOString().split('T')[0]);
      res.json({ success: true, user: { id: Number(result.lastInsertRowid), email, username, role: 'user', credits: 5 } });
    } catch (e: any) {
      if (e.message.includes("users.username")) {
        res.status(400).json({ success: false, message: "Username already exists" });
      } else {
        res.status(400).json({ success: false, message: "Email already exists" });
      }
    }
  });

  app.get("/api/user/:id", (req, res) => {
    const userId = parseInt(req.params.id);
    const user = db.prepare("SELECT id, email, username, role, credits, last_reset_date FROM users WHERE id = ?").get(userId) as any;
    if (user) {
      const credits = resetCredits(user);
      res.json({ id: user.id, email: user.email, username: user.username, role: user.role, credits });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });

  app.post("/api/credits/consume", (req, res) => {
    const { userId } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
    if (user && user.credits > 0) {
      db.prepare("UPDATE users SET credits = credits - 1 WHERE id = ?").run(userId);
      res.json({ success: true, remaining: user.credits - 1 });
    } else {
      res.status(403).json({ success: false, message: "Insufficient credits" });
    }
  });

  app.post("/api/credits/earn", (req, res) => {
    const { userId, amount, action } = req.body;
    db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(amount, userId);
    db.prepare("INSERT INTO stats (user_id, action) VALUES (?, ?)").run(userId, action);
    res.json({ success: true });
  });

  app.post("/api/credits/redeem", (req, res) => {
    const { userId, code } = req.body;
    const redeemCode = db.prepare("SELECT * FROM redeem_codes WHERE code = ? AND is_active = 1").get(code) as any;
    if (redeemCode) {
      db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(redeemCode.value, userId);
      db.prepare("UPDATE redeem_codes SET is_active = 0 WHERE id = ?").run(redeemCode.id);
      res.json({ success: true, value: redeemCode.value });
    } else {
      res.status(400).json({ success: false, message: "Invalid or expired code" });
    }
  });

  app.get("/api/history/:userId", (req, res) => {
    const history = db.prepare("SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20").all(req.params.userId);
    res.json(history);
  });

  app.post("/api/history", (req, res) => {
    const { userId, question, solution, type } = req.body;
    db.prepare("INSERT INTO history (user_id, question, solution, type) VALUES (?, ?, ?, ?)").run(userId, question, solution, type);
    res.json({ success: true });
  });

  app.get("/api/leaderboard", (req, res) => {
    const topSolvers = db.prepare(`
      SELECT u.username, COUNT(h.id) as solves 
      FROM users u 
      JOIN history h ON u.id = h.user_id 
      GROUP BY u.id 
      ORDER BY solves DESC 
      LIMIT 10
    `).all();
    res.json(topSolvers);
  });

  // Admin Routes
  app.get("/api/admin/stats", (req, res) => {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    const totalSolves = db.prepare("SELECT COUNT(*) as count FROM history").get() as any;
    const recentSolves = db.prepare("SELECT h.*, u.username FROM history h JOIN users u ON h.user_id = u.id ORDER BY h.created_at DESC LIMIT 10").all();
    res.json({ totalUsers: totalUsers.count, totalSolves: totalSolves.count, recentSolves });
  });

  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare("SELECT id, email, username, role, credits, is_active, created_at FROM users").all();
    res.json(users);
  });

  app.post("/api/admin/toggle-user-status", (req, res) => {
    const { userId, is_active } = req.body;
    db.prepare("UPDATE users SET is_active = ? WHERE id = ?").run(is_active ? 1 : 0, userId);
    res.json({ success: true });
  });

  app.get("/api/admin/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all();
    res.json(settings);
  });

  app.post("/api/admin/update-settings", (req, res) => {
    const { settings } = req.body; // Array of { key, value }
    const update = db.prepare("UPDATE settings SET value = ? WHERE key = ?");
    const transaction = db.transaction((items) => {
      for (const item of items) update.run(item.value, item.key);
    });
    transaction(settings);
    res.json({ success: true });
  });

  app.post("/api/admin/generate-code", (req, res) => {
    const { code, value } = req.body;
    try {
      db.prepare("INSERT INTO redeem_codes (code, value) VALUES (?, ?)").run(code, value);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ success: false, message: "Code already exists" });
    }
  });

  app.get("/api/admin/codes", (req, res) => {
    const codes = db.prepare("SELECT * FROM redeem_codes ORDER BY created_at DESC").all();
    res.json(codes);
  });

  app.post("/api/admin/update-credits", (req, res) => {
    const { userId, credits } = req.body;
    db.prepare("UPDATE users SET credits = ? WHERE id = ?").run(credits, userId);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
