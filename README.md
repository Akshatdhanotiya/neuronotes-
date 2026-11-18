# 🧠 NeuroNotes — AI-Powered Study Assistant

> Transform any YouTube video, PDF, or text into smart summaries, flashcards, quizzes, and more — powered by Groq AI.

🌐 **Live Demo:** [https://neuronotes-psi.vercel.app](https://neuronotes-psi.vercel.app)

---

## 📌 Project Title and Brief Description

**NeuroNotes** is a full-stack AI-powered study assistant web application that helps students learn faster and smarter. Users can input YouTube URLs, paste text, or upload PDF/TXT files to instantly receive:
- Bullet-point summaries in English, Hindi, or Hinglish
- AI-generated flashcards for memory retention
- Concept-based MCQ quizzes with instant scoring
- Text-to-speech playback with word highlighting
- Progress tracking across sessions

---

## 🛠️ Technology Stack and Tools Used

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 14** (App Router) | React framework for SSR/SSG |
| **TypeScript** | Type-safe JavaScript |
| **Vanilla CSS** (inline) | Custom styling with dark/light mode |
| **Vercel** | Frontend deployment & hosting |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express.js** | RESTful API server |
| **Supabase (PostgreSQL)** | Cloud database (users, history, progress) |
| **Groq API** (LLaMA 3.3 70B) | AI for summaries, quizzes, flashcards |
| **JWT (jsonwebtoken)** | Authentication & authorization |
| **bcryptjs** | Password hashing |
| **Nodemailer + Gmail** | OTP email for password recovery |
| **Helmet + express-rate-limit** | Security middleware |

### Tools & Services
- **GitHub** — Version control
- **Supabase** — PostgreSQL cloud database
- **Vercel** — Frontend CI/CD deployment
- **Groq Cloud** — LLM inference API

---

## ✨ Features and Functionalities Implemented

### 🔐 Authentication System
- User Registration & Login with JWT tokens
- Forgot Password via OTP email (Gmail)
- Bcrypt password hashing
- Role-based access (User / Admin)
- Brute-force protection with rate limiting

### 📝 AI Summarizer
- **YouTube URL** → Auto-fetches transcript → AI Summary
- **Text Input** → Direct AI summarization
- **PDF Upload** → Text extraction → AI Summary
- **TXT File Upload** → AI Summary
- Multilingual output: English / Hindi / Devanagari / Hinglish

### 🃏 Flashcards Generator
- AI generates 8 flashcards from any summary
- Flip animation on click
- Based on key concepts from content

### 🧩 Quiz Generator
- 5 conceptual MCQ questions per summary
- Instant scoring with correct/wrong highlighting
- NOT reading comprehension — tests actual concept knowledge

### 📊 Progress Dashboard
- Track total quizzes taken
- Track correct answers & accuracy %
- Track summaries generated
- Visual circular progress indicators

### 🎙️ Text-to-Speech (TTS)
- Read summary aloud with word-by-word highlighting
- Speed control (0.5x to 2x)
- Seekable progress bar
- Hindi/English voice selection

### 📚 History
- Last 20 summaries stored per user
- Click to reload any past summary
- Delete individual history entries

### 🔒 Admin Panel
- View all registered users
- Toggle user roles (user ↔ admin)
- Delete users + their history
- View statistics (total users, summaries, etc.)

### 🌙 Dark/Light Mode
- Full dark mode with localStorage persistence
- Custom animated cursor

---

## ⚙️ Installation / Execution Steps to Run the Project

### Prerequisites
- Node.js v18+ installed
- npm or yarn
- Supabase account (free tier)
- Groq API key (free at groq.com)
- Gmail App Password (for OTP)

### Step 1: Clone the Repository
```bash
git clone https://github.com/20Akshat/neuronotes.git
cd neuronotes
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
PORT=5001
JWT_SECRET=your_jwt_secret_key_here
GROQ_API_KEY=your_groq_api_key_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_digit_app_password
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the SQL in Supabase SQL Editor to create tables:
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  reset_password_otp TEXT,
  otp_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT DEFAULT 'guest',
  input TEXT, summary TEXT, language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  total_quizzes INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_summaries INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Start the backend:
```bash
npm start
# Server runs on http://localhost:5001
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the `frontend/` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

Start the frontend:
```bash
npm run dev
# App runs on http://localhost:3000
```

### Step 4: Open in Browser
Navigate to `http://localhost:3000`

---

## 👥 Team Members

| Name | Role |
|------|------|
| Akshat Marwadi | Full Stack Developer |
| *(Add team members here)* | *(Add roles)* |

---

## 📸 Project Screenshots / Output

### 🏠 Login Page
> Dark mode authentication screen with animated background

### 📝 Summary Dashboard
> AI-generated bullet-point summary from YouTube video

### 🃏 Flashcards
> Auto-generated flashcards with flip animation

### 🧩 Quiz
> MCQ quiz with instant scoring and color-coded answers

### 📊 Progress Tracker
> Circular progress indicators tracking learning stats

---

## 🌐 Live Deployment

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | [https://neuronotes-psi.vercel.app](https://neuronotes-psi.vercel.app) |
| **Database (Supabase)** | PostgreSQL (cloud-hosted, always on) |

---

## 📄 License

This project was built as a Mini Project submission for educational purposes.
