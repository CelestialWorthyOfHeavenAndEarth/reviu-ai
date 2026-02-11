#  Reviu AI — AI-Powered Code Review Assistant

> Paste a public GitHub repo URL → get instant code review with flagged Security, Performance, and Code Quality issues.

![Reviu AI](https://img.shields.io/badge/Hackathon-2026-blueviolet?style=for-the-badge) ![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square) ![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square) ![Flask](https://img.shields.io/badge/Flask-3.x-000?style=flat-square)

---

##  What It Does

Reviu AI analyzes `.py` and `.js` files from any **public** GitHub repository and flags issues across three categories:

| Severity | Category | Examples |
|----------|----------|----------|
|  **Critical** | Security | Hardcoded secrets, `eval()`, SQL injection |
|  **Warning** | Performance | Nested loops O(n²), `SELECT *`, blocking sleep |
|  **Suggestion** | Code Quality | Missing docstrings, magic numbers, deep nesting |

---

##  Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Python + Flask + Flask-CORS
- **AI**: HuggingFace CodeBERTa (optional enhancement) + robust heuristic analysis
- **APIs**: GitHub REST API (public repos, no auth needed for basic use)

---

##  Quick Start

### Prerequisites

- **Python 3.10+** and **pip**
- **Node.js 18+** and **npm**
- (Optional) A free [GitHub Personal Access Token](https://github.com/settings/tokens) for higher rate limits

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd reviu-ai
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

#### Set up environment variables

```bash
cp .env.example .env
# Edit .env and add your GitHub token (optional):
# GITHUB_TOKEN=ghp_your_token_here
```

#### Start the backend

```bash
python app.py
#  Server runs at http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
#  Opens at http://localhost:3000
```

### 4. Use it!

1. Open **http://localhost:3000** in your browser
2. Paste a public GitHub repo URL (e.g. `https://github.com/pallets/flask`)
3. Click **Analyze Repo** and watch the magic 

---

##  Getting a Free GitHub Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Give it a name (e.g. "reviu-ai")
4. Select scope: **`public_repo`** (only)
5. Generate and copy the token
6. Paste it in `backend/.env` as `GITHUB_TOKEN=ghp_...`

> **Note**: The app works without a token, but GitHub limits unauthenticated API requests to 60/hour. With a token, you get 5,000/hour.

---

##  Screenshots

<!-- Add screenshots after running the app -->

*Coming soon — run the app and see the beautiful dark-themed UI!*

---

##  Project Structure

```
reviu-ai/
├── backend/
│   ├── app.py              # Flask API server
│   ├── github_service.py   # GitHub API integration
│   ├── ai_service.py       # Code analysis engine
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment template
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main application
│   │   ├── index.css        # Tailwind + custom styles
│   │   └── components/
│   │       ├── RepoInput.jsx    # URL input
│   │       ├── FileTree.jsx     # File sidebar
│   │       ├── ReviewPanel.jsx  # Issue cards
│   │       └── SeverityBadge.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

##  Hackathon Notes

- **100% free** — no paid APIs, no subscriptions
- **Works offline** after first model download (heuristic mode always works)
- **Fast demo** — analyzes a repo in seconds
- **Beautiful UI** — dark theme with glassmorphism, animations, and severity-coded badges
- AI analysis combines **regex heuristics** (reliable) with **CodeBERTa ML** (optional enhancement)

---

