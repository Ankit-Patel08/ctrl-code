
PROJECT STRUCTURE
=================

leetcode_app/
│
├── backend/
│   │
│   ├── config/
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── activityController.js
│   │   └── authController.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Activity.js
│   │   └── Group.js
│   │
│   ├── routes/
│   │   ├── activity.js
│   │   ├── auth.js
│   │   ├── goals.js
│   │   ├── groups.js
│   │   ├── leaderboard.js
│   │   └── users.js
│   │
│   ├── services/
│   │   ├── leetcodeService.js
│   │   ├── notificationService.js
│   │   └── streakService.js
│   │
│   ├── jobs/
│   │   └── index.js
│   │
│   ├── utils/
│   │   └── logger.js
│   │
│   ├── logs/
│   │   ├── combined.log
│   │   └── error.log
│   │
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
│
├── codestreak-frontend/
│   │
│   ├── src/
│   │   │
│   │   ├── api/
│   │   │   ├── activity.js
│   │   │   ├── auth.js
│   │   │   ├── client.js
│   │   │   ├── goals.js
│   │   │   ├── groups.js
│   │   │   ├── leaderboard.js
│   │   │   └── users.js
│   │   │
│   │   ├── components/
│   │   │   ├── charts.jsx
│   │   │   ├── Layout/
│   │   │   │   └── Sidebar.jsx
│   │   │   └── UI/
│   │   │       └── index.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useApi.js
│   │   │   └── useToast.js
│   │   │
│   │   ├── pages/
│   │   │   ├── AuthScreen.jsx
│   │   │   ├── DashboardView.jsx
│   │   │   ├── GoalsView.jsx
│   │   │   ├── GroupsView.jsx
│   │   │   ├── LeaderboardView.jsx
│   │   │   └── SettingsView.jsx
│   │   │
│   │   ├── constants/
│   │   │   └── theme.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
│
│
├── .gitignore
└── README.md
