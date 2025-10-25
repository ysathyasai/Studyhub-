# 📚 STUDYHUB – The All-in-One Academic Productivity Platform

🚀 STUDYHUB is a full-featured React.js web application designed to empower students with an integrated ecosystem of learning, productivity, and professional development tools — all in one place. It combines AI-powered utilities, smart document management, and personalized academic assistance to help students study smarter, stay organized, and grow faster.

## 🧠 Overview

Students often struggle with juggling multiple apps — one for notes, another for resumes, another for time management, and so on. STUDYHUB solves this problem by centralizing all major academic and professional tools into one seamless platform.

With features like Resume Builder, Notes Dashboard, Timetable Generator, Flashcard Creator, Project Database, Internship Finder, and AI Research Tools, STUDYHUB helps learners streamline their entire academic workflow.

## 💼 Core Features

### 📝 Productivity & Study Tools

- **Smart Notes Dashboard** – Create, edit, and organize AI-assisted notes.
- **Timetable Maker** – Auto-generate weekly study plans with drag-and-drop UI.
- **Flashcard Creator** – Convert notes or chapters into flashcards for revision.
- **Question Bank Generator** – Automatically generate topic-based questions using AI.
- **Research Paper Outline Builder** – Structured templates to plan academic papers.
- **Focus Mode & Study Timer** – Distraction-free mode with Pomodoro integration.

### 🧩 Utility Tools

- **Document Converter** – Convert between PDF, DOCX, TXT, MD, and other formats.
- **Photo/Code/Document Editor** – Built-in editors for quick file updates.
- **Document Scanner** – OCR-powered scanning via Google Cloud Vision API.
- **Word Counter & Grammar Checker** – For essays, reports, and documentation.

### 🎓 Academic & Career Tools

- **Resume & Portfolio Builder** – AI-powered resume generation with templates.
- **Internship Finder** – Curated list of internships and job openings via APIs.
- **Scholarship Alerts** – Automatic updates on new academic opportunities.
- **Project Database** – Access categorized academic project ideas and examples.
- **Course Information Hub** – Central repository for course materials and guides.

### 💡 AI-Enhanced Tools

- **OpenAI Integration** – AI for content generation, summarization, and ideation.
- **ChatGPT-based Research Assistant** – Personalized research and learning help.
- **AI Flashcard & Question Generator** – Converts content into quizzes and key points.

## ⚙️ Technical Stack

| Layer              | Technology Used                                                  | Purpose                             |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------- |
| **Frontend**       | React.js, Vite                                                   | Modern, high-performance UI         |
| **UI Frameworks**  | Tailwind CSS, Material UI                                        | Responsive and clean design         |
| **State Management** | Redux Toolkit, Context API                                       | Efficient app-wide data flow        |
| **Backend**        | Firebase                                                         | Authentication, Firestore DB, Cloud Storage |
| **APIs Used**      | OpenAI API, Google Drive API, Google Vision API, YouTube API, Spotify API | AI, storage, OCR, media             |
| **Authentication** | Firebase Auth / Google OAuth 2.0                                 | Secure login and account management |
| **Storage**        | Firebase Cloud Storage, IndexedDB                                | File uploads and offline caching    |
| **Deployment**     | Vercel / Firebase Hosting                                        | Seamless CI/CD deployment           |
| **Version Control**| Git & GitHub                                                     | Source management and collaboration |

## 🏗️ System Architecture

```
            ┌──────────────────────────┐
            │        Frontend (React)  │
            │  - Tailwind UI           │
            │  - Redux & Context API   │
            │  - Axios/Fetch API Calls │
            └────────────┬─────────────┘
                         │
         ┌───────────────▼────────────────┐
         │           Backend (Firebase)   │
         │ - Firestore Database           │
         │ - Authentication & Storage     │
         │ - Functions for Cloud Tasks    │
         └───────────────┬────────────────┘
                         │
          ┌──────────────▼──────────────┐
          │       External Integrations │
          │  - OpenAI API (AI Tools)    │
          │  - Google Vision (OCR)      │
          │  - YouTube & Spotify APIs   │
          │  - Drive & Notion APIs      │
          └─────────────────────────────┘
```

## 🧩 Integrations

- **OpenAI GPT Models** → For text generation, notes summarization, and AI writing.
- **Google Vision API** → OCR scanning for handwritten or printed documents.
- **Firebase Authentication** → Google and Email-based secure sign-in.
- **Spotify API** → Personalized study playlists.
- **YouTube API** → Educational video recommendations.
- **Google Calendar API** → Calendar sync for schedules and reminders.

## 🧑‍💻 Installation & Setup

1️⃣ **Clone the Repository**
```bash
git clone https://github.com/saketh-nandu/studyhub-.git
cd studyhub
```

2️⃣ **Install Dependencies**
```bash
npm install
```

3️⃣ **Setup Environment Variables**

Create a `.env` file in the root directory and add:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_OPENAI_API_KEY=your_openai_key
VITE_GOOGLE_VISION_API_KEY=your_google_key
```

4️⃣ **Run the App**
```bash
npm run dev
```

Visit 👉 http://localhost:5173 to view the app.

## 🔐 Authentication & Security

- Implements JWT and Firebase Auth for login.
- Supports Google OAuth and password-based signup.
- Encrypts user data and prevents cross-site scripting (XSS).
- Uses Firestore security rules for read/write control.

## 🧠 AI-Powered Capabilities

| Feature             | Model / API                |
| ------------------- | -------------------------- |
| **Notes & Summaries** | OpenAI GPT-4 / GPT-3.5     |
| **Question Generation** | OpenAI Fine-tuned Model    |
| **Flashcard Creator** | Prompt-based Text Extraction |
| **Grammar Checker**   | OpenAI API                 |
| **Document OCR**      | Google Vision API          |

## 🎨 UI/UX Highlights

- Dark & Light Theme toggle
- Responsive layout for mobile and desktop
- Minimal dashboard view with progress bars and analytics
- Quick Access Sidebar for modules
- Animated transitions using Framer Motion

## 🔄 Future Enhancements

- 📱 Launch mobile app version (React Native)
- 🎤 Add voice assistant for hands-free operations
- 🧩 Include AI project mentor
- 🏫 Integrate with college ERP systems
- 🔗 Add collaborative group study rooms
- 🧭 Include AI recommendation engine for personalized learning paths

## 🤝 Team Members

| Role                       | Name                                     |
| -------------------------- | ---------------------------------------- |
| **Technical Development**  | Surya, Yekeshwar, Sathya Sai, Saketh            |
| **Presentation & Data Team** | Karthikeya, Katta Tejeshwar, Purna Vikas, Sai Charan |
| **Tool Integration & Build Team** | Eknadh, Sri Krishna                          |

## 💬 Conclusion

STUDYHUB is more than just a student productivity tool — it’s a complete academic ecosystem designed to unify AI, automation, and organization into a single digital space. Built using React.js, Firebase, and OpenAI, it redefines how students learn, plan, and grow in the digital era.
