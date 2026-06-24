const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = new Database(path.join(__dirname, 'caseclicker.db'));

// ── DB SETUP ──────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    total_value REAL DEFAULT 0,
    cases_opened INTEGER DEFAULT 0,
    player_level INTEGER DEFAULT 1,
    best_item TEXT DEFAULT 'None',
    best_item_value REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS items_found (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    item_name TEXT NOT NULL,
    item_rarity TEXT NOT NULL,
    item_value REAL NOT NULL,
    found_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS daily_missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward INTEGER NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 100,
    mission_type TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    expires_at DATETIME NOT NULL
  );
`);

// Add player_level column if it doesn't exist (migration)
try {
  db.exec(`ALTER TABLE leaderboard ADD COLUMN player_level INTEGER DEFAULT 1`);
} catch (_) {}

// ── SEED MISSIONS ─────────────────────────────────────────────────────────────

function seedMissions() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const existing = db.prepare(
    'SELECT COUNT(*) as count FROM daily_missions WHERE expires_at > ?'
  ).get(now.toISOString());
  if (existing.count > 0) return;

  db.prepare('DELETE FROM daily_missions').run();

  const missions = [
    { id: 'open_5',    title: 'Anfänger',       description: '5 Cases öffnen',              reward: 500,   xp: 50,   type: 'open_cases',  target: 5 },
    { id: 'open_20',   title: 'Case Junkie',    description: '20 Cases öffnen',             reward: 2000,  xp: 200,  type: 'open_cases',  target: 20 },
    { id: 'open_50',   title: 'Hardcore',       description: '50 Cases öffnen',             reward: 6000,  xp: 600,  type: 'open_cases',  target: 50 },
    { id: 'open_100',  title: 'Endlos-Öffner',  description: '100 Cases öffnen',            reward: 15000, xp: 1500, type: 'open_cases',  target: 100 },
    { id: 'find_rare', title: 'Glückspilz',     description: '1 Rare/Covert Item finden',   reward: 1500,  xp: 300,  type: 'find_rarity', target: 1 },
    { id: 'find_3rare',title: 'Schatzjäger',    description: '3 Rare/Covert Items finden',  reward: 5000,  xp: 800,  type: 'find_rarity', target: 3 },
    { id: 'earn_10k',  title: 'Geldmaschine',   description: '10.000 Coins verdienen',      reward: 1000,  xp: 100,  type: 'earn_coins',  target: 10000 },
    { id: 'earn_100k', title: 'Millionär',      description: '100.000 Coins verdienen',     reward: 5000,  xp: 500,  type: 'earn_coins',  target: 100000 },
    { id: 'earn_1m',   title: 'Milliardär',     description: '1.000.000 Coins verdienen',   reward: 25000, xp: 2000, type: 'earn_coins',  target: 1000000 },
  ];

  const insert = db.prepare(`
    INSERT INTO daily_missions (mission_id, title, description, reward, xp_reward, mission_type, target_value, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const m of missions) {
    insert.run(m.id, m.title, m.description, m.reward, m.xp, m.type, m.target, tomorrow.toISOString());
  }

  console.log('✅ Tägliche Missionen generiert');
}

seedMissions();

// ── ROUTES ────────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'CaseClicker V2 API 🎮' });
});

// GET /leaderboard
app.get('/leaderboard', (req, res) => {
  const rows = db.prepare(`
    SELECT username, total_value, cases_opened, player_level, best_item, best_item_value, updated_at
    FROM leaderboard ORDER BY total_value DESC LIMIT 50
  `).all();
  res.json(rows);
});

// GET /leaderboard/:username
app.get('/leaderboard/:username', (req, res) => {
  const player = db.prepare('SELECT * FROM leaderboard WHERE username = ?').get(req.params.username);
  if (!player) return res.status(404).json({ error: 'Spieler nicht gefunden' });
  const rank = db.prepare('SELECT COUNT(*) + 1 as rank FROM leaderboard WHERE total_value > ?').get(player.total_value);
  res.json({ ...player, rank: rank.rank });
});

// POST /leaderboard
app.post('/leaderboard', (req, res) => {
  const { username, total_value, cases_opened, player_level, best_item, best_item_value } = req.body;

  if (!username || username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: 'Username muss 2–20 Zeichen lang sein' });
  }

  const existing = db.prepare('SELECT id FROM leaderboard WHERE username = ?').get(username);
  if (existing) {
    db.prepare(`
      UPDATE leaderboard
      SET total_value=?, cases_opened=?, player_level=?, best_item=?, best_item_value=?, updated_at=CURRENT_TIMESTAMP
      WHERE username=?
    `).run(total_value, cases_opened, player_level || 1, best_item, best_item_value, username);
  } else {
    db.prepare(`
      INSERT INTO leaderboard (username, total_value, cases_opened, player_level, best_item, best_item_value)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(username, total_value, cases_opened, player_level || 1, best_item, best_item_value);
  }

  const rank = db.prepare('SELECT COUNT(*) + 1 as rank FROM leaderboard WHERE total_value > ?').get(total_value);
  res.json({ success: true, rank: rank.rank });
});

// POST /items
app.post('/items', (req, res) => {
  const { username, item_name, item_rarity, item_value } = req.body;
  if (!username || !item_name) return res.status(400).json({ error: 'Fehlende Daten' });
  db.prepare('INSERT INTO items_found (username, item_name, item_rarity, item_value) VALUES (?, ?, ?, ?)')
    .run(username, item_name, item_rarity, item_value);
  res.json({ success: true });
});

// GET /items/recent
app.get('/items/recent', (req, res) => {
  const rows = db.prepare(`
    SELECT username, item_name, item_rarity, item_value, found_at
    FROM items_found ORDER BY found_at DESC LIMIT 20
  `).all();
  res.json(rows);
});

// GET /missions
app.get('/missions', (req, res) => {
  seedMissions();
  const missions = db.prepare(
    'SELECT * FROM daily_missions WHERE expires_at > ? ORDER BY reward ASC'
  ).all(new Date().toISOString());
  res.json(missions);
});

// GET /stats
app.get('/stats', (req, res) => {
  const totalPlayers   = db.prepare('SELECT COUNT(*) as count FROM leaderboard').get();
  const totalCases     = db.prepare('SELECT SUM(cases_opened) as total FROM leaderboard').get();
  const topPlayer      = db.prepare('SELECT username, total_value FROM leaderboard ORDER BY total_value DESC LIMIT 1').get();
  const rareFinds      = db.prepare("SELECT COUNT(*) as count FROM items_found WHERE item_rarity IN ('Covert','Rare Special')").get();
  res.json({
    total_players:      totalPlayers.count,
    total_cases_opened: totalCases.total || 0,
    top_player:         topPlayer || null,
    rare_finds:         rareFinds.count
  });
});

app.listen(PORT, () => console.log(`✅ CaseClicker V2 Backend läuft auf Port ${PORT}`));
