# AuraHabit - Production-Ready Full Stack Habit Tracker SaaS Application

A feature-rich, high-performance, single-command run full-stack Habit Tracker SaaS application inspired by Notion, Habitify, TickTick, and premium Excel habit trackers.

---

## ⚡ Single Command Startup

The application is completely self-contained and automatically initializes the database, runs migrations, seeds 365 Bhagavad Gita quotes, and boots up the Next.js server!

### Standard Startup (Local & Wi-Fi Network Ready)
```bash
npm install
npm start
# OR for development mode
npm run dev
```

### 🌐 Accessing on Local Wi-Fi Network
The app automatically binds to `0.0.0.0:3000` so any device on your Wi-Fi/Local Network (phones, tablets, laptops) can access it instantly:
- **Local Machine**: Open [http://localhost:3000](http://localhost:3000)
- **Other Devices on Wi-Fi**: Open `http://<YOUR-IP-ADDRESS>:3000` (e.g. `http://192.168.1.15:3000` or `http://10.31.51.20:3000`)
  - *To find your IP*: Run `ipconfig` (Windows) or `ifconfig` / `ip a` (Mac/Linux) in terminal.

> 💡 **Tip for Web Notifications on IP address**: If accessing over an HTTP IP address (`http://10.31.51.20:3000`), open `chrome://flags/#unsafely-treat-insecure-origin-as-secure` in Chrome and add `http://<YOUR-IP>:3000` to enable desktop OS notifications, or access via `http://localhost:3000`.

### Docker Startup
```bash
docker compose up
```

Open [http://localhost:3000](http://localhost:3000) or `http://<YOUR-IP>:3000` in your browser.

**Demo Credentials**:
- **Email**: `demo@habittracker.com`
- **Password**: `password123`
- (Or click the **1-Click Demo Login** button on the Login page!)

---

## 🚀 Built-in SaaS Features

1. **Authentication**: Secure bcrypt password hashing, NextAuth credentials provider, protected app shell.
2. **Executive Dashboard**: KPI summary cards (Total Habits, Completed Today, Today %, Weekly %, Monthly %, Yearly %, Current & Best Streaks, Missed Habits).
3. **365 Bhagavad Gita Daily Inspiration**: Pre-seeded database with 365 authentic Sanskrit verses, English translations, and Chapter/Verse numbers that automatically rotate daily.
4. **Unlimited Habits Engine**: Create, edit, delete, archive, restore, and duplicate habits with custom color tags, categories, frequencies, and target days.
5. **Yearly Habit Tracker Matrix**: Notion/Excel-inspired Jan–Dec monthly grid (Days 1–31) with 1-click completion toggles and instant rate computation.
6. **Achievement Badges & Streaks**: Automatic streak calculation + achievement badges 🔥 (7, 30, 50, 100, 365 Days).
7. **Analytics Suite**: Recharts data visualization for daily/weekly completion trends, category distribution pie chart, and consistency graphs.
8. **Tomorrow Execution Planner**: 5 Priority Matrix (Top Priority ⭐ + Tasks 2-5) with status toggles & date selector.
9. **Goal Tracker**: Categorized view for Yearly, Quarterly, Monthly, and Weekly goals with visual progress bars.
10. **Hydration & Water Tracker**: Circular animated SVG progress ring, glass intake log buttons (+250ml, +500ml), 3L default target.
11. **Study Tracker & Pomodoro Log**: Log study sessions by subject, hours, topics, and pomodoros.
12. **Fitness & Calorie Tracker**: Log workouts by type (Gym, Running, Yoga, HIIT), duration, and estimated calories burned.
13. **Dream Vision Board**: Pin inspirational images, motivational statements, and milestone cards.
14. **Data Export System**: 1-click export of habits & analytics to `.xlsx` (Excel) and `.csv`.
15. **PWA & Theme Support**: Full PWA support (installable on Android/iOS/Windows/Mac) + Light/Dark/System theme switcher.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router & Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Glassmorphism design system
- **Database & ORM**: Prisma ORM with SQLite zero-config storage (`prisma/dev.db`)
- **Authentication**: NextAuth.js & Bcrypt
- **Data Visualization**: Recharts
- **Export Engine**: SheetJS (XLSX)
- **PWA**: Web App Manifest & Service Worker
