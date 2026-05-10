# PROJECT STRUCTURE

```txt
leetcode_app/
│
├── backend/
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
│   └── server.js
│
├── codestreak-frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── constants/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```
