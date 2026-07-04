# DevFolio

![Dashboard Screenshot](https://via.placeholder.com/1200x600.png?text=DevFolio+Dashboard)

## 📖 Project Overview

DevFolio is a comprehensive developer portfolio and progress-tracking platform. It allows developers to showcase their projects, track their coding journey, and monitor their progress on platforms like LeetCode and GeeksforGeeks, all from a centralized, beautifully designed dashboard.

## ✨ Features

- **User Authentication**: Secure signup and login with JWT and Bcrypt.
- **Developer Dashboard**: A centralized view of all your stats, activities, and achievements.
- **Platform Syncing**: Seamlessly sync progress from coding platforms (e.g., GeeksforGeeks).
- **Daily Tracker**: Track daily coding habits, goals, and consistency.
- **Wallet & Rewards**: Earn coins for daily logins and completing tasks.
- **Leaderboard**: Compete with other developers and see where you stand.
- **Public Profiles**: Share your unique developer profile with recruiters and peers.
- **Admin Panel**: Dedicated admin dashboard for platform management.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JSON Web Tokens (JWT)
- **Styling**: Tailwind CSS with custom global styles

## 📁 Folder Structure

```
DevFolio/
├── frontend/             # React (Vite) Frontend
│   ├── public/           # Static public assets
│   ├── src/
│   │   ├── assets/       # Images, icons, etc.
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React Context (Auth, etc.)
│   │   ├── pages/        # Application Pages (Dashboard, Profile, etc.)
│   │   ├── services/     # API Integration logic
│   │   └── styles/       # Global CSS styles
│   └── package.json
│
├── backend/              # Node.js/Express Backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route logic and handlers
│   ├── middleware/       # Express middlewares (Auth, Rate Limiting)
│   ├── models/           # Mongoose Database Models
│   ├── routes/           # Express API Routes
│   ├── services/         # Business logic and external API integrations
│   └── package.json
│
├── README.md
└── .gitignore
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI or Local MongoDB instance

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/DevFolio.git
cd DevFolio
```

### 2. Environment Variables

Create a `.env` file in both the `frontend` and `backend` directories based on the provided `.env.example` files.

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

**`backend/.env`**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/devfolio
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
ADMIN_ID=admin_id_here
ADMIN_PASSWORD=admin_password_here
```

### 3. Install Dependencies & Run

You will need to start both the frontend and backend servers.

**Run Backend:**
```bash
cd backend
npm install
npm run dev
```

**Run Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🌐 Deployment

- **Frontend**: Can be deployed to Vercel, Netlify, or AWS Amplify. Make sure to set the `VITE_API_URL` environment variable.
- **Backend**: Can be deployed to Render, Railway, or Heroku. Ensure all environment variables are securely added in the deployment dashboard.

## 🔮 Future Improvements

- Automated LeetCode syncing.
- Enhanced public profile themes.
- Advanced analytics and graphical reporting for coding trends.
- OAuth integration (Google/GitHub login).

## 📄 License

This project is licensed under the ISC License.
