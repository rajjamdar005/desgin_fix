# DesignFix: AI-Powered Design Analysis Platform

> Enterprise-grade design analysis system powered by Google Gemini, enabling rapid, scalable design audits for web applications with actionable, AI-driven recommendations.

![DesignFix](https://img.shields.io/badge/Enterprise-Ready-green) ![Gemini](https://img.shields.io/badge/Gemini-1.5%20Flash-blue) ![Node](https://img.shields.io/badge/Node.js-18+-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [API Specification](#api-specification)
- [Testing & Deployment](#testing--deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Overview

DesignFix is a production-ready, full-stack application that automates design analysis using vision-based AI. The platform:

- **Ingests** websites via URL and captures visual/structural design metrics
- **Processes** design analysis through Gemini 1.5 Flash API with structured output
- **Delivers** categorized, prioritized design recommendations with actionable guidance
- **Tracks** user feedback to measure recommendation relevance and drive model improvements

### Core Features

| Feature | Specification |
|---------|-------------|
| **Website Analysis** | Automated capture and analysis of design metrics (typography, color, spacing, accessibility) |
| **AI Engine** | Google Gemini 1.5 Flash (free tier: 15 RPM, 1M TPM) |
| **Response Time** | 10-15 seconds per analysis (P95 latency target) |
| **Feedback Loop** | Binary + optional comment feedback for ML training |
| **Cost Model** | Zero API costs; infrastructure costs scale linearly |

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│              • SPA with real-time UI state                   │
│              • Responsive design (mobile-first)              │
│              • Error boundary + graceful degradation         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST (JSON)
                       │ POST /api/analyze
                       │ POST /api/feedback
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express Backend (Node.js)                  │
│              • Request validation & rate limiting            │
│              • Error handling & structured logging           │
│              • Async job orchestration                       │
└──────┬─────────────────────────────┬──────────────────────────┘
       │                             │
       ▼                             ▼
  ┌─────────────┐            ┌──────────────────┐
  │ Puppeteer   │            │  Gemini 1.5      │
  │  Scraper    │            │  Flash API       │
  ├─────────────┤            ├──────────────────┤
  │• Screenshot │            │• Vision analysis │
  │• DOM parse  │            │• Structured JSON │
  │• Metrics    │            │• Prioritization  │
  └─────────────┘            └──────────────────┘
```

### Technology Stack

| Layer | Component | Rationale |
|-------|-----------|-----------|
| **Frontend** | React 19 + Vite | Modern, performant SPA framework with HMR |
| **Backend** | Node.js + Express | Non-blocking I/O for concurrent requests |
| **Scraping** | Puppeteer | Headless Chrome for accurate DOM/rendering capture |
| **AI/ML** | Gemini 1.5 Flash | Multimodal vision model, free tier sufficient for MVP |
| **Styling** | Modern CSS (Grid/Flexbox) | No external dependencies; optimized bundle size |

---

## Quick Start

### Prerequisites

- **Node.js**: 18.0.0 or higher (verify: `node --version`)
- **npm**: 9.0.0 or higher
- **Gemini API Key**: Obtain free at [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone and navigate**
   ```bash
   git clone https://github.com/rajjamdar005/desgin_fix.git
   cd desgin_fix
   ```

2. **Backend Configuration**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
   
   Edit `backend/.env`:
   ```env
   GEMINI_API_KEY=<your-api-key>
   PORT=3001
   NODE_ENV=development
   LOG_LEVEL=debug
   ```

3. **Frontend Configuration**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   ```
   
   Edit `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_ENVIRONMENT=development
   ```

---

## Development Setup

### Running Locally

**Terminal 1: Backend Server**
```bash
cd backend
npm run dev
```
Backend accessible at `http://localhost:3001`

**Terminal 2: Frontend Development Server**
```bash
cd frontend
npm run dev
```
Frontend accessible at `http://localhost:5173` with HMR enabled

### Project Structure

```
desgin_fix/
├── backend/
│   ├── src/
│   │   ├── server.js                    # Express app initialization
│   │   ├── middleware/
│   │   │   ├── errorHandler.js          # Centralized error handling
│   │   │   ├── requestLogger.js         # Structured logging
│   │   │   └── rateLimit.js             # Rate limiting middleware
│   │   ├── routes/
│   │   │   ├── analyze.js               # POST /api/analyze
│   │   │   └── feedback.js              # POST /api/feedback
│   │   ├── services/
│   │   │   ├── analyzer.js              # Puppeteer orchestration
│   │   │   ├── gemini.js                # Gemini API client
│   │   │   └── cache.js                 # Optional: response caching
│   │   └── utils/
│   │       └── validators.js            # Input validation schemas
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DesignFix.jsx            # Main UI component
│   │   │   ├── DesignFix.css            # Component styles
│   │   │   └── ErrorBoundary.jsx        # Error handling
│   │   ├── hooks/
│   │   │   ├── useAnalysis.js           # Analysis state logic
│   │   │   └── useFeedback.js           # Feedback submission
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## API Specification

### `POST /api/analyze`

Analyzes website design and returns categorized recommendations.

**Request**
```json
{
  "url": "https://example.com",
  "options": {
    "viewport": { "width": 1920, "height": 1080 },
    "timeout": 30000
  }
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "timestamp": "2025-10-26T14:32:00Z",
    "designMetrics": {
      "primaryColors": ["#ffffff", "#000000"],
      "fontFamilies": ["Segoe UI", "Arial"],
      "spacingPattern": "8px grid"
    },
    "suggestions": [
      {
        "id": "sugg_001",
        "category": "Typography",
        "priority": "high",
        "issue": "Body text (12px) falls below WCAG AA accessibility threshold",
        "suggestion": "Increase base font size to 16px; improves readability by ~23%",
        "reasoning": "Based on common design patterns and accessibility standards",
        "estimatedImpact": "high"
      }
    ],
    "analysis": {
      "executionTime": 12453,
      "model": "gemini-1.5-flash",
      "tokenUsage": { "input": 1024, "output": 256 }
    }
  }
}
```

**Error Response (400 Bad Request)**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "Provided URL is malformed or inaccessible",
    "details": { "url": "invalid-url" }
  }
}
```

### `POST /api/feedback`

Records user feedback on analysis recommendations for model improvement.

**Request**
```json
{
  "url": "https://example.com",
  "suggestionId": "sugg_001",
  "helpful": true,
  "comment": "Implemented this and saw 15% increase in engagement"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "feedbackId": "fb_12345",
    "recorded": true,
    "timestamp": "2025-10-26T14:35:00Z"
  }
}
```

---

## Testing & Deployment

### Manual API Testing

```bash
# Test analyzer endpoint
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Test feedback endpoint
curl -X POST http://localhost:3001/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","helpful":true}'
```

### Integration Testing (Browser)

1. Start both backend and frontend (see [Development Setup](#development-setup))
2. Navigate to `http://localhost:5173`
3. Enter test URL: `https://example.com`
4. Click "Analyze Design"
5. Verify suggestions appear within 15 seconds
6. Submit feedback and confirm submission

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Puppeteer fails on Linux** | Install system dependencies (see [Troubleshooting](#troubleshooting)) |
| **CORS errors** | Verify `VITE_API_URL` in frontend `.env` matches backend URL |
| **Gemini API rate limit** | Check quota at [Google AI Studio](https://aistudio.google.com/app/apikey); free tier: 15 RPM |
| **Timeout on large sites** | Increase `timeout` option in request; verify network stability |

### Troubleshooting

#### Puppeteer Installation Issues (Linux)

```bash
# Install required system libraries
sudo apt-get update && sudo apt-get install -y \
  gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
  libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 \
  libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 \
  libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
  libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
  libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxss1 libxtst6 fonts-liberation libappindicator1 libnss3
```

#### Gemini API Configuration

- **Invalid API Key**: Verify at [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Rate Limits**: Free tier allows 15 requests/minute; upgrade for higher throughput
- **Network Issues**: Check firewall; ensure `.env` file is in correct directory (`backend/`, not root)

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| **P95 Response Time** | < 15s | Includes Puppeteer + Gemini latency |
| **Availability** | 99.5% | SLA target; excludes Gemini API outages |
| **Daily Analyses** | 1,000+ | Scales with backend instances |
| **Feedback Relevance** | ≥ 30% | Helpful feedback rate for model validation |

---

## Roadmap

### Phase 2: Enhanced Analysis
- [ ] Before/after visual comparison UI
- [ ] Auto-generated CSS patches (downloadable)
- [ ] Multi-page site crawling and analysis
- [ ] PDF report generation
- [ ] Design pattern matching (e.g., "similar to design X")

### Phase 3: Monetization & Scaling
- [ ] Stripe integration (Pro Mode: $10/month)
- [ ] API tier system (free, pro, enterprise)
- [ ] Browser extension (right-click → analyze)
- [ ] White-label agency dashboard
- [ ] Batch analysis API for enterprise

### Phase 4: Intelligence & ML
- [ ] Custom ML model fine-tuning on user feedback
- [ ] A/B testing recommendations
- [ ] Design trend analysis
- [ ] Competitive benchmarking

---

## Contributing

### Code Standards

1. **Commit Convention**: Use [Conventional Commits](https://www.conventionalcommits.org/)
   - `feat: add user feedback storage`
   - `fix: resolve CORS issue on production`
   - `docs: update API specification`

2. **Code Style**:
   - Backend: ESLint + Prettier (2-space indentation)
   - Frontend: React best practices + functional components
   - Meaningful variable names; avoid abbreviations

3. **Testing**: Unit tests for business logic; integration tests for API endpoints

### Contribution Process

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make atomic commits with clear messages
3. Submit pull request with description and test results
4. Await code review before merging

---

## Deployment

### Environment Variables (Production)

**Backend `.env`**
```env
GEMINI_API_KEY=<production-key>
PORT=3001
NODE_ENV=production
LOG_LEVEL=info
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend `.env.production`**
```env
VITE_API_URL=https://api.designfix.com
VITE_ENVIRONMENT=production
VITE_ANALYTICS_ID=<tracking-id>
```

### Docker Deployment (Optional)

```dockerfile
# Backend Dockerfile (Node.js LTS + Puppeteer)
FROM node:18-alpine
RUN apk add --no-cache chromium
WORKDIR /app
COPY package.json .
RUN npm ci --only=production
COPY src src
EXPOSE 3001
CMD ["node", "src/server.js"]
```

---

## License

MIT License - See LICENSE file for full text.

---

## Support & Contact

For issues, feature requests, or questions:
- Open an issue on [GitHub Issues](https://github.com/rajjamdar005/desgin_fix/issues)
- Check [Troubleshooting](#troubleshooting) section first

**Built with professional standards using Gemini 1.5 Flash**
