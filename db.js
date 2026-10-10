const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, 'glitch.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  xp INTEGER NOT NULL DEFAULT 0,
  solved_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS solves (
  user_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  solved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, challenge_id)
);
CREATE TABLE IF NOT EXISTS duels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  challenger_id TEXT NOT NULL,
  opponent_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  winner_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

function ensureProfile(userId) {
  db.prepare('INSERT OR IGNORE INTO profiles (user_id) VALUES (?)').run(userId);
  return db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
}

module.exports = { db, ensureProfile };
