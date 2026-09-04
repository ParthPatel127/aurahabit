# ⚡ AuraHabit - Production-Grade Habit Tracker & Goal Management SaaS

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-https%3A%2F%2Faurahabit.vercel.app-10B981?style=for-the-badge&logo=vercel&logoColor=white)](https://aurahabit.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-ParthPatel127%2Faurahabit-181717?style=for-the-badge&logo=github)](https://github.com/ParthPatel127/aurahabit)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

AuraHabit is a feature-rich, high-performance, production-grade Habit Tracker and Goal Management SaaS application inspired by Notion, Habitify, TickTick, and executive Excel habit tracking systems. It features a complete 3-step Email OTP security architecture, smart scheduled reminders with Date/Time/Day tracking, interactive analytics, priority execution planning, hydration/fitness/study trackers, and full PWA support.

---

## 🌐 Live Production Application

Access the live production app here: **[https://aurahabit.vercel.app](https://aurahabit.vercel.app)**

### 🔑 Demo Credentials
- **Email**: `demo@habittracker.com`
- **Password**: `password123`
- *(Or click the **1-Click Demo Login** button directly on the login page!)*

---

## 🔐 Authentication & 2-Step Email OTP Security

AuraHabit includes an enterprise-grade authentication system built with NextAuth, Bcrypt password encryption, and a 3-step Email OTP Password Reset Wizard:

```
[ Step 1: Request OTP ] ──> [ Step 2: Inbox OTP Verification ] ──> [ Step 3: Set & Confirm Password ]
```

1. **Step 1: Request OTP**: User enters their registered email address.
2. **Step 2: Inbox OTP Delivery**: A 6-digit verification code is generated, stored with a 15-minute expiration timestamp in Prisma DB, and dispatched directly to the user's email inbox via Gmail SMTP (`aurahabitwebapp@gmail.com`) or Resend API.
3. **Step 3: Password Update**: User verifies the 6-digit code from their email and sets a new password, encrypted with `bcrypt` (10 salt rounds).

---

## ⚡ Quick Start & Local Setup

The repository is completely self-contained and automatically initializes the database, runs migrations, and boots up the server in a single command!

### Standard Startup (Local & Wi-Fi Network Ready)
```bash
# 1. Clone repository
git clone https://github.com/ParthPatel127/aurahabit.git
cd aurahabit

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

### 🌐 Accessing on Local Wi-Fi Network
The server binds to `0.0.0.0:3000` so any phone, tablet, or device connected to your local Wi-Fi can access the app:
- **Local Machine**: [http://localhost:3000](http://localhost:3000)
- **Wi-Fi Devices**: `http://<YOUR-IP-ADDRESS>:3000` *(e.g. `http://192.168.1.15:3000`)*

### 🐳 Docker Container Startup
```bash
# Docker startup
docker compose up
```

---

## 🚀 Complete Feature Breakdown

### 📊 1. Executive Dashboard & Habit Engine
- **KPI Summary Cards**: Real-time stats for Total Habits, Completed Today, Today %, Weekly %, Monthly %, Yearly %, Current & Best Streaks, and Missed Habits.
- **Unlimited Habits Engine**: Create, edit, delete, archive, restore, and duplicate habits with custom color tags, categories, frequencies (Daily/Weekly/Monthly/Custom), and target days.
- **Yearly Habit Matrix**: Notion/Excel-inspired monthly grid (Days 1–31) across Jan–Dec with 1-click completion toggles and instant compliance computation.
- **Streak & Achievement Badges**: Automatic streak engine with visual achievement badges 🔥 (7, 30, 50, 100, 365 Days).

### 🔔 2. Smart Scheduled Reminders (Date, Time & Day)
- Integrated Reminders widget with live clock and calendar displaying current **Date, Time, and Day of the Week** (e.g. `Friday, September 4, 2026 at 03:45 PM`).
- Schedule reminders with explicit Date, Time, and Day of Week badges, toggle completion status, and filter pending vs completed tasks.

### 📈 3. Recharts Analytics Suite
- Visual graphs for daily and weekly completion trends, category distribution pie charts, and long-term consistency metrics.

### 🎯 4. Tomorrow Execution Planner & Goal Tracker
- **Priority Matrix**: 5 Priority Slots (Top Priority ⭐ + Tasks 2-5) with completion toggles and date selector.
- **Goal Tracker**: Categorized view for Yearly, Quarterly, Monthly, and Weekly goals with progress bars and daily check-ins.

### 💧 5. Lifestyle Logs (Water, Study & Fitness)
- **Hydration Tracker**: Animated circular SVG progress ring with 250ml / 500ml quick-add buttons and custom target goals.
- **Study & Pomodoro Log**: Track study sessions by subject, duration, topics completed, and pomodoro counters.
- **Workout & Calorie Tracker**: Log workouts by type (Gym, Running, Yoga, HIIT), duration, and calories burned.
- **Dream Vision Board**: Pin inspirational milestone cards, motivational statements, and target completion dates.

### 📦 6. Data Export & PWA Support
- **1-Click Excel/CSV Export**: Export all habits, logs, and analytics to `.xlsx` or `.csv`.
- **PWA & Browser Shortcuts**: Installable on Android, iOS, Windows, and Mac with high-res browser tab icons and Chrome speed dial shortcuts.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router & Server Actions)
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS 3.4 & Dark Mode Glassmorphism System
- **Database & ORM**: Prisma ORM 5.22 (PostgreSQL on production / SQLite locally)
- **Authentication**: NextAuth.js 4 & Bcryptjs 2.4
- **Email Service**: Nodemailer 6 & Resend API
- **Data Visualization**: Recharts 2.13
- **Export Engine**: SheetJS (XLSX)
- **PWA**: Web App Manifest & Service Worker
