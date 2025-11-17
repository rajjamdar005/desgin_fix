# DesignFix MVP 🎨

> AI-powered website design analyzer that provides instant, actionable design improvements using Google Gemini 1.5 Flash (free tier)

![DesignFix Banner](https://img.shields.io/badge/AI-Powered-purple) ![Gemini](https://img.shields.io/badge/Gemini-1.5%20Flash-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 What is DesignFix?

DesignFix analyzes any website and provides expert design feedback in seconds. It's like having a professional web designer review your site instantly.

**Key Features:**
- 🔍 Analyze any website by URL
- 🧠 AI-powered design suggestions (typography, color, spacing, accessibility)
- ⚡ Results in 10-15 seconds
- 💬 User feedback system to track helpfulness
- 🆓 100% free using Google Gemini 1.5 Flash

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Free Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd designfix-mvp
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env
```

### Running the App

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

Open `http://localhost:5173` in your browser and start analyzing websites! 🎉

## 📖 Usage

1. Enter any website URL (e.g., `example.com` or `https://example.com`)
2. Click **"🔍 Analyze Design"**
3. Wait 10-15 seconds for AI analysis
4. Review 5-10 categorized design suggestions:
   - Typography improvements
   - Color contrast & accessibility
   - Spacing & whitespace
   - Button & CTA design
   - Layout & hierarchy
5. Provide feedback with 👍/👎 buttons

## 🧱 Architecture

```
┌─────────────────┐
│  React Frontend │  (Vite + Modern CSS)
└────────┬────────┘
         │
         │ HTTP POST /api/analyze
         ▼
┌─────────────────┐
│  Express API    │
└────────┬────────┘
         │
         ├──► Puppeteer (Scraper)
         │    • Captures page snapshot
         │    • Extracts styles, colors, fonts
         │    • Takes screenshot
         │
         └──► Gemini 1.5 Flash (AI)
              • Analyzes design patterns
              • Returns structured suggestions
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Backend | Node.js + Express |
| Scraper | Puppeteer (headless Chrome) |
| AI | Google Gemini 1.5 Flash (free) |
| Styling | Modern CSS with gradients & animations |

## 📂 Project Structure

```
designfix-mvp/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express app setup
│   │   ├── routes/
│   │   │   ├── analyze.js         # POST /api/analyze endpoint
│   │   │   └── feedback.js        # POST /api/feedback endpoint
│   │   └── services/
│   │       ├── analyzer.js        # Puppeteer scraper logic
│   │       └── gemini.js          # Gemini AI integration
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── DesignFix.jsx      # Main analysis UI
    │   │   └── DesignFix.css      # Component styles
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── package.json
    └── .env.example
```

## 🎨 API Endpoints

### `POST /api/analyze`
Analyze a website's design.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "timestamp": "2025-10-26T...",
  "designSnapshot": { ... },
  "suggestions": [
    {
      "category": "Typography",
      "issue": "Body text is too small at 12px",
      "suggestion": "Increase base font size to 16px for better readability",
      "priority": "High"
    }
  ]
}
```

### `POST /api/feedback`
Submit user feedback.

**Request:**
```json
{
  "url": "https://example.com",
  "helpful": true,
  "comment": "Very helpful!"
}
```

## 🧪 Testing

### Manual Test
```bash
# Start backend
cd backend
npm run dev

# In another terminal, test the analyze endpoint
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"example.com"}'
```

### Browser Test
1. Start both backend and frontend
2. Open `http://localhost:5173`
3. Enter `example.com` and click Analyze
4. Verify suggestions appear in ~15 seconds

## 📊 Success Metrics (MVP Goals)

| Metric | Target | What It Proves |
|--------|--------|---------------|
| Sites analyzed | ≥ 100 | Market interest |
| "Helpful" feedback | ≥ 30% | AI relevance |
| Avg. session time | < 2 min | Fast UX |
| Paying users | ≥ 5 | Willingness to pay |

## 🚧 Roadmap

### Phase 2 (Stretch Goals)
- [ ] Before/After visual comparison
- [ ] Auto-generated CSS patches (downloadable)
- [ ] Browser extension (right-click → analyze)
- [ ] PDF report generation
- [ ] Stripe integration for Pro Mode
- [ ] Portfolio builder for freelancers
- [ ] White-label agency dashboard

## 🤝 Contributing

This is an MVP project. Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables

### Backend `.env`
```env
GEMINI_API_KEY=your_gemini_api_key      # Required
PORT=3001                                # Optional (default: 3001)
NODE_ENV=development                     # Optional
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:3001      # Optional (default: http://localhost:3001)
```

## 🐛 Troubleshooting

### Puppeteer fails to launch
```bash
# Linux: Install dependencies
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
  libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
  libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
  libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
  libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxss1 libxtst6 fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils
```

### CORS errors
Ensure backend is running on port 3001 and frontend `.env` has correct `VITE_API_URL`

### Gemini API errors
- Check your API key is valid at https://aistudio.google.com/app/apikey
- Verify `.env` file is in `backend/` directory (not root)
- Check rate limits (Gemini 1.5 Flash free tier: 15 RPM, 1 million TPM)

## 📄 License

MIT License - see LICENSE file for details

## 💡 Inspiration

Built to validate the hypothesis:
> "If small web agencies, freelancers, and site owners can get meaningful design feedback from AI within 10 seconds, at least 20% will pay for deeper automated fixes."

---

**Built with ❤️ using Gemini 1.5 Flash (free tier)**

Questions? Open an issue or contact [your-email]
