# 🎮 CaseClicker V2 — SwiftUI Edition

## 📁 Struktur

```
CaseClickerV2/
├── SwiftPlayground/
│   ├── ContentView.swift      ← App-Einstieg, Tab-Navigation (oben/unten/links/rechts)
│   ├── Models.swift           ← Alle Datenmodelle (Skin, Level, Achievement, Upgrade...)
│   ├── SkinPool.swift         ← 10 Cases mit je 12 Skins inkl. Messer & Handschuhe
│   ├── GameState.swift        ← Zentraler State (XP/Level, Keys, Cheats, Achievements)
│   ├── UpgradeTree.swift      ← 50+ Upgrades in 7 Kategorien mit Level-Anforderungen
│   ├── CaseOpenView.swift     ← Case öffnen (Keys, Multi-Öffnen, Spin), Gamble-Tab
│   ├── UpgradeTreeView.swift  ← Upgrade-Baum mit Cheat-Code-Feld
│   ├── OtherViews.swift       ← Inventar, Achievements, Missionen, Rangliste, Settings
│   └── APIService.swift       ← REST API Verbindung
└── backend/
    ├── server.js              ← Express + SQLite Backend
    └── package.json
```

---

## 🚀 Swift Playgrounds Setup

1. **Neue App Playground** auf iPad/Mac erstellen
2. Alle `.swift` Dateien in das Playground kopieren
3. In `APIService.swift` die `BASE_URL` mit deiner Server-URL ersetzen:
   ```swift
   static let BASE_URL = "https://deine-app.railway.app"
   ```

---

## 🌐 Backend (Railway / Render)

### Railway:
1. [railway.app](https://railway.app) → New Project → Deploy from Repo
2. `backend/` Ordner hochladen
3. URL in `APIService.swift` eintragen

### Render:
1. [render.com](https://render.com) → New Web Service
2. Root directory: `backend`
3. Build: `npm install` | Start: `node server.js`

---

## 🎮 Features Übersicht

| Feature | Details |
|---------|---------|
| 🎯 Level-System | XP durch Cases/Missionen/Verkäufe, 100+ Level |
| 🗝 Schlüssel-System | Schlüssel kaufen, Max-Buy, Auto-Kauf Upgrades |
| 📦 10 Cases | Starter bis Legendary, ab Level 0–75 |
| 📦×50 Multi-Öffnen | Upgrades: 5/10/20/50 auf einmal |
| 🌳 50+ Upgrades | 7 Kategorien mit Level-Anforderungen & Baum |
| 🔐 Cheat-Codes | `cheatcode123` → Gott-Modus, `cheatcode456` → Max-Baum |
| 🏅 23 Achievements | XP + Coins Belohnungen |
| 🎰 Gamble-Tab | Coinflip & Roulette |
| 🌐 Online Rangliste | Via Railway/Render Backend |
| 📋 Tägliche Missionen | Vom Server, 9 Missionen pro Tag |
| 🗂 Tab-Position | Oben/Unten/Links/Rechts einstellbar |
| 💾 Auto-Save | Alle 30 Sek in UserDefaults |

---

## 🔐 Cheat-Codes

| Code | Bedingung | Effekt |
|------|-----------|--------|
| `cheatcode123` | Ganzer Baum gekauft + Coins ≥ 3× Baumpreis | Schaltet ⚡ Gott-Modus frei (Alles ×10) |
| `cheatcode456` | Immer | Setzt ganzen Baum sofort auf MAX |

---

## 📈 Upgrade-Kategorien

| Kategorie | Upgrades | Highlights |
|-----------|---------|-----------|
| 👆 Klick Power | 9 | Bis +10.000/Klick, Krit-Chancen |
| 💰 Passiv | 7 | Bis +20.000/Sek, ×2 Verdoppler |
| 🍀 Glück | 10 | Bis +40% bessere Drops, StatTrak |
| ⚡ Effizienz | 12 | Rabatte, Verkauf +80%, XP-Boost |
| 🤖 Automation | 10 | Auto-Öffner, Auto-Key, ×5/10/20/50 |
| ✨ Spezial | 5 | Kombos, Missionen, Veteran |
| 🔐 Geheim | 1 | Gott-Modus (via Cheat-Code) |
