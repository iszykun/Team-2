# Team-2 Daily Habit Checklist

A daily habit tracking system that helps users track their calorie goals and fitness workouts with a ranking system.

## 🚀 Features

- ✅ **Daily Checklist** - Track 2 habits daily: Calorie Goal & Fitness Workout
- 📊 **Progress Tracking** - See your completion percentage in real-time
- 🏆 **Ranking System** - Earn ranks based on consistency:
  - Iron (0-25%)
  - Bronze (26-50%)
  - Silver (51-75%)
  - Gold (76-100%)
- 📅 **Monthly View** - Track your progress throughout the month
- 💾 **Persistent Data** - Your progress is saved automatically

---

## Local Setup

Install backend dependencies:

```bash
cd backend
npm install
npm start
```

Open:

```text
http://localhost:3000/pages/login.html
```

You can also run from the project root:

```bash
npm start
```

## Demo Accounts

Admin demo login:

```text
Username: admin
Password: admin
```

Student accounts must use this email format:

```text
25000000@myrp.edu.sg

## Docker

Build and run:

```bash
docker compose up --build
```

Open:

```text
http://localhost:3000/pages/login.html
```

The Compose file mounts `backend/data` so JSON data persists outside the container.

## CI/CD Notes

- Use `npm test` inside `backend/` for a basic Node syntax check.
- Store real deployment secrets using your CI/CD platform secrets, based on `.env.example`.
- Keep work in feature branches and use pull requests for GitHub collaboration evidence.
- JSON storage is intentionally simple for the assignment; the model layer can be replaced by a database later without rewriting routes or UI code.

