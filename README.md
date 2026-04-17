# VGC Colosseum 🏆

A full-stack competitive Pokémon team builder designed for VGC (Video Game Championship) players. VGC Colosseum gives competitive players a powerful and intuitive tool to build teams, optimize EV spreads, analyze type coverage, export to Pokémon Showdown, and share teams with the community.

---

## 🎮 Features

### Team Management
- Create, edit, and delete competitive teams
- Teams require exactly 6 Pokémon before saving
- Each team card displays Pokémon sprites, ability, nature, item, and all 4 moves

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

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router v6
- **Backend:** JSON Server
- **Styling:** CSS Variables with custom dark theme
- **Fonts:** Bebas Neue, Rajdhani, Oxanium (Google Fonts)

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
json-server --watch db.json --port 8088
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
- Damage calculator using official VGC damage formula
- Move search and filtering by type and category
- Team rating system
- Speed tier calculator

---

## 👨‍💻 Author

Built by Eric Martinez as a capstone project at Nashville Software School.

- GitHub: [@EricMartinez007](https://github.com/EricMartinez007)
- LinkedIn: [Eric Martinez](https://www.linkedin.com/in/eric-jose-ramon-martinez/)