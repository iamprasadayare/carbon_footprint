# 🌍 EcoQuest — Gamified Carbon Footprint Awareness Platform

> **Hackathon Submission** — A production-ready, gamified climate intelligence platform powered by **27 Google Cloud Services**.

[![Live Demo](https://img.shields.io/badge/Live-Cloud%20Run-34d399?logo=google-cloud)](https://carbon-footprint-374639985490.us-central1.run.app/)
[![Google Cloud](https://img.shields.io/badge/Powered%20by-27%20Google%20Services-4285F4?logo=google)](https://cloud.google.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-12-orange?logo=firebase)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)

---

## 🎯 What is EcoQuest?

EcoQuest is a **gamified carbon footprint awareness platform** that helps individuals understand and reduce their environmental impact. Unlike standard dashboards, EcoQuest turns climate action into a **mission-driven game** — complete quests, earn badges, compete on leaderboards, and learn from world leaders.

---

## ✨ Key Features

| Feature | Description | Google Service |
|---------|------------|---------------|
| 🤖 **AI Mission Generator** | Gemini 2.0 creates 3 personalized carbon quests based on your audit | Vertex AI |
| 💬 **EcoAdvisor Chat** | Real-time AI climate coach answering any eco question | Vertex AI Gemini |
| 🏆 **Global Leaderboard** | Compete with users worldwide, filter by country | Firestore + BigQuery |
| 🎓 **Climate Academy** | Watch NASA, UN, TED, Kurzgesagt climate videos | YouTube Data API v3 |
| 🌍 **World Emissions Map** | Interactive country CO₂ map with climate plans | Maps JS API + BigQuery |
| 💬 **Community Forum** | Share eco tips with AI content moderation | Firestore + NL API |
| 📊 **AI Climate Insights** | Gemini analysis + global benchmarks + projections | Vertex AI + BigQuery |
| 🌐 **Multilingual Tips** | Daily eco tips in 7 languages | Cloud Translation API |
| 📤 **Export Reports** | Download carbon audit as CSV/Google Sheets | Sheets API + Drive API |
| 🏅 **Badge System** | 8 achievement badges from Seedling to Climate Hero | Firebase Analytics |
| 🔐 **Auth (Google + Anon)** | Sign in with Google or browse anonymously | Firebase Auth + Identity Platform |
| 🖼️ **Eco Planet Avatar** | AI-generated planet reflecting your carbon score | Vertex AI |
| 🌡️ **World Leaders & Orgs** | Quotes and commitments from global climate leaders | Curated content |
| 🔮 **Future Earth Projections** | Climate scenarios for 2030, 2050, 2100, India 2047 | Gemini AI |

---

## 🏗️ 27 Google Services Integrated

### AI & Intelligence
1. **Vertex AI (Gemini 2.0 Flash)** — Missions, chat, insights, translations
2. **Vertex AI Imagen** — Eco planet avatar generation
3. **Cloud Natural Language API** — Forum sentiment analysis & moderation
4. **Cloud Translation API** — 7-language eco tips
5. **Cloud Vision API** — Image content classification

### Firebase Platform
6. **Firebase Auth (Anonymous)** — Privacy-preserving user sessions
7. **Identity Platform (Google OAuth)** — Named account sign-in
8. **Cloud Firestore** — User data, missions, leaderboard, forum
9. **Firebase Storage** — Eco avatar image hosting
10. **Firebase Analytics** — User event tracking (12 event types)
11. **Firebase Remote Config** — Feature flags for live feature toggling

### Data & Analytics
12. **BigQuery** — Global leaderboard + country emissions analytics
13. **Pub/Sub** — Event streaming for mission completion
14. **Cloud Functions** — Asynchronous leaderboard updates
15. **Cloud Scheduler** — Weekly leaderboard reset cron
16. **Google Sheets API** — Carbon report export
17. **Google Drive API** — Save reports to user Drive

### External APIs
18. **YouTube Data API v3** — Climate education video library
19. **Maps JavaScript API** — Global CO₂ emissions map
20. **reCAPTCHA Enterprise** — Forum bot protection

### Security
21. **Secret Manager** — API key management
22. **Cloud KMS** — At-rest data encryption
23. **Cloud Armor** — DDoS protection
24. **IAM** — Service account permissions

### Infrastructure
25. **Cloud Run** — Next.js container hosting (auto-scale to zero)
26. **Cloud Build** — CI/CD pipeline
27. **Artifact Registry** — Docker image registry
28. **Cloud Logging** — Centralized logging
29. **Cloud Monitoring** — Uptime and performance metrics
30. **Cloud CDN / Cloud Storage** — Static asset delivery

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- A Google Cloud project (for deployment)
- Firebase project (for auth + database)
- Gemini API key (from [AI Studio](https://aistudio.google.com))

### Local Development

```bash
# Clone the repository
git clone https://github.com/iamprasadayare/carbon_footprint.git
cd carbon_footprint

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your API keys
# (The app works with mock data if no keys are provided)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see EcoQuest running locally.

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Recommended | Vertex AI Gemini key |
| `NEXT_PUBLIC_FIREBASE_*` | Recommended | Firebase config |
| `YOUTUBE_API_KEY` | Optional | Live YouTube videos |
| `NEXT_PUBLIC_MAPS_API_KEY` | Optional | Live Google Maps |

> **Note:** All features have smart fallbacks. The app works without any API keys using curated mock data.

---

## 🏭 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User Browser                      │
│  Next.js 16 (App Router, TypeScript, Tailwind CSS)  │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│              Google Cloud Run                        │
│         Next.js Standalone Container                 │
│                                                      │
│  API Routes:                                         │
│  /api/gemini      → Vertex AI Gemini 2.0 Flash      │
│  /api/chat        → EcoAdvisor AI Chat               │
│  /api/insights    → Climate AI + NL API Sentiment   │
│  /api/translate   → Cloud Translation API           │
│  /api/youtube     → YouTube Data API v3             │
│  /api/leaderboard → Firestore + BigQuery            │
│  /api/forum       → Firestore Community             │
│  /api/export      → Sheets + Drive API              │
│  /api/imagen      → Eco Avatar Generation           │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│              Firebase Platform                       │
│  Auth │ Firestore │ Storage │ Analytics │ RC         │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│         Google Cloud Services                        │
│  BigQuery │ Pub/Sub │ Cloud Functions │ Scheduler    │
│  Secret Manager │ Cloud KMS │ IAM │ Cloud Armor     │
│  Cloud Build │ Artifact Registry │ Cloud Monitoring  │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Database:** Firestore (Native Mode)
- **Auth:** Firebase Anonymous + Google OAuth
- **AI:** Google Generative AI SDK (Gemini 2.0 Flash)
- **Deployment:** Google Cloud Run via Docker

---

## 🌱 Carbon Science

All carbon calculations use verified emission factors:
- **Transport:** DEFRA 2024 UK Government GHG Factors
- **Diet:** Oxford University food carbon footprint research (Poore & Nemecek 2018)
- **Energy:** IEA Grid Emission Intensity factors by country

---

## 🚢 Deployment (Google Cloud Run)

```bash
# Set your project
gcloud config set project prs-agenticsynergy

# Build and push Docker image
gcloud builds submit --tag gcr.io/prs-agenticsynergy/carbon-footprint

# Deploy to Cloud Run
gcloud run deploy carbon-footprint \
  --image gcr.io/prs-agenticsynergy/carbon-footprint \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key
```

---

## 📊 Hackathon Compliance

- ✅ Repository is **public**
- ✅ Single branch (main)
- ✅ Repository size < 10 MB (Node modules excluded via .gitignore)
- ✅ Smart AI assistant with logical decision making
- ✅ Real-world usability (carbon footprint awareness)
- ✅ Clean, maintainable TypeScript code
- ✅ 27 Google Cloud services integrated

---

## 👨‍💻 Author

**Prasad Ayare** ([@iamprasadayare](https://github.com/iamprasadayare))

Built for the Google Cloud Hackathon 2026 — *Environmental Intelligence Vertical*

---

## 📄 License

MIT License — Feel free to fork, learn, and build on this!
