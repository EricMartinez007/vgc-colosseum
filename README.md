# VGC Colosseum 🏆

A full-stack competitive Pokémon team builder designed for VGC (Video Game Championship) players. VGC Colosseum gives competitive players a powerful and intuitive tool to build teams, optimize EV spreads, analyze type coverage, export to Pokémon Showdown, and share teams with the community.

---

## 🎮 Features

### Team Management
- Create, edit, and delete competitive teams
- Teams require exactly 6 Pokémon before saving
- Each team card displays Pokémon sprites, ability, nature, item, and all 4 moves

### Pokémon Showdown Import
- Paste any Showdown format team string to instantly import a full team
- Automatically parses Pokémon, ability, nature, item, EVs, IVs, and moves
- Handles Showdown name differences (e.g. Urshifu, Calyrex forms)
- Defaults to Hardy nature for Pokémon exported without a nature line

### Pokémon Builder
- Select from 50 of the most popular VGC Pokémon
- Choose ability, nature, item, and up to 4 moves
- EV sliders with **510 total EV cap enforcement**
- IV sliders defaulting to 31 (competitive standard)
- **Live stat calculations** using the official Level 50 competitive formula
- Type matchup display showing strengths and weaknesses

### Team Coverage Analysis
- Visual grid showing offensive coverage against all 18 types
- Team vulnerability map highlighting defensive weaknesses
- Color coded cards — green for covered, red for gaps, yellow for vulnerabilities

### Type Synergy Score
- Letter grade (S through F) based on shared weaknesses and offensive coverage
- Factors in both critical weaknesses (3+ Pokémon weak) and warnings (2 Pokémon weak)
- Shared weakness breakdown with color coded cards — yellow for warnings, red for critical

### Speed Tier Calculator
- Calculates each Pokémon's actual Level 50 speed stat using official formula
- Factors in EVs, IVs, and nature speed modifiers
- Compares your team's speeds against all 50 database Pokémon at baseline (0 EVs, 31 IVs, neutral nature)
- Team Pokémon highlighted in gold for easy identification

### Pokémon Showdown Export
- One click export of your full team in official Showdown format
- Copies directly to clipboard for immediate use
- Only exports non-zero EVs following Showdown conventions

### Social Features
- Like and unlike community teams
- Save favorite teams to your Favorites page
- Comment on any team and delete your own comments
- Like count displayed on all team cards

### Filtering & Discovery
- Filter teams by Pokémon across Community Teams, My Teams, and Favorites
- Filter teams by format (Singles/Doubles)
- Browse all community teams with full Pokémon rosters displayed

### Profile
- Personalized banner with gradient and most used Pokémon avatar
- Stats including total teams created and most used Pokémon
- Edit profile information

### Damage Calculator
- Calculate damage between any two Pokémon using the official Level 50 VGC damage formula
- Adjust EV and IV spreads for both attacker and defender
- Factor in weather, terrain, attacker item, and critical hits
- Attacker stage modifiers for boosted scenarios
- Displays min/max damage range with OHKO, 2HKO, and safe indicators

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, React Router v7
- **Backend:** JSON Server
- **Styling:** CSS Variables with custom dark theme
- **Fonts:** Bebas Neue, Rajdhani, Oxanium (Google Fonts)
- **Testing:** Vitest, React Testing Library

---

## 🧪 Testing

VGC Colosseum has a full unit test suite covering all core game logic and utility functions.

```bash
# Run all tests once
npm run test:run

# Run in watch mode (re-runs on save)
npm test

# Open the visual test dashboard
npm run test:ui

# Generate a coverage report
npm run test:coverage
```

### Test Coverage — 152 tests across 7 files

| File | Tests | What it covers |
|------|-------|----------------|
| `calculateStat.test.js` | 19 | HP vs non-HP formula, edge cases, DB benchmarks |
| `calculateSpeed.test.js` | 20 | All 8 speed natures, EV/IV combos, speed tier ordering |
| `teamGrade.test.js` | 18 | All 6 grade thresholds (S–F), coverage bonuses |
| `parseShowdownString.test.js` | 28 | EV/IV parsing, name mapping, nature fallback, multi-mon |
| `calculateDamage.test.js` | 34 | Type effectiveness, STAB, weather, terrain, items, crits |
| `evCap.test.js` | 16 | 510 EV cap enforcement, IV bypass, edge spreads |
| `teamFilters.test.js` | 17 | Pokémon filter, format filter, combined filters |

All pure game logic is extracted into `src/utils/statUtils.js` and imported by components, ensuring a single source of truth across the entire app.

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- npm

### Installation

1. Clone the client repository
```bash
git clone https://github.com/EricMartinez007/vgc-colosseum.git
cd vgc-colosseum
```

2. Clone the API repository
```bash
git clone https://github.com/EricMartinez007/vgc-colosseum-api.git
cd vgc-colosseum-api
```

3. Install dependencies for both
```bash
npm install
```

4. Start the JSON Server (from the API directory)
```bash
npm start
```

5. Start the React app (from the client directory)
```bash
npm run dev
```

6. Navigate to `http://localhost:5173`

### Demo Accounts
| Name | Email |
|------|-------|
| Ash Ketchum | ash@pallet.edu |
| Misty Waterflower | misty@cerulean.edu |
| Brock Harrison | brock@pewter.edu |

---

## 📸 Screenshots

*Coming soon*

---

## 🔮 Future Features
- Move search and filtering by type and category
- Team rating system
- Empty state illustrations for My Teams, Community Teams, and Favorites

---

## 👨‍💻 Author

Built by Eric Martinez as a capstone project at Nashville Software School.

- GitHub: [@EricMartinez007](https://github.com/EricMartinez007)
- LinkedIn: [Eric Martinez](https://www.linkedin.com/in/eric-jose-ramon-martinez/)