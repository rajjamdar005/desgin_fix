import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const MODEL_NAME = 'gemini-2.0-flash';
const DEFAULT_SUGGESTIONS = getMockSuggestions();

// simple in-memory cache for suggestions keyed by a snapshot hash
const suggestionsCache = new Map(); // key -> {expires, value}
const SUGGESTIONS_TTL_MS = 1000 * 60 * 30; // 30 minutes

let genAI;
let currentApiKey;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('Gemini API key missing in environment variables.');
    return null;
  }

  if (!genAI || currentApiKey !== apiKey) {
    console.log('[Gemini] Initializing client with provided API key.');
    genAI = new GoogleGenerativeAI(apiKey);
    currentApiKey = apiKey;
  }

  return genAI;
}

function buildPrompt(designSnapshot) {
  return `You are DesignFix, an expert web design consultant. Analyze the website data provided below and return 5-8 concise, actionable recommendations.

Website title: ${designSnapshot.title}
Meta description: ${designSnapshot.metaDescription}
Body styles: ${JSON.stringify(designSnapshot.bodyStyles, null, 2)}
Headings sample: ${JSON.stringify(designSnapshot.headings, null, 2)}
Buttons sample: ${JSON.stringify(designSnapshot.buttons, null, 2)}
Color palette: ${designSnapshot.colorPalette.join(', ')}

Each recommendation must follow this JSON shape:
[
  {
    "category": "Typography | Color | Spacing | Layout | Buttons | Accessibility",
    "issue": "Brief description of the problem",
    "suggestion": "Specific fix that a designer can apply",
    "priority": "High | Medium | Low"
  }
]

Respond ONLY with JSON. Do not include explanations outside the array.`;
}

export async function getDesignSuggestions(designSnapshot, screenshotBase64) {
  const client = getClient();

  // check cache first
  try {
    const key = JSON.stringify(designSnapshot || {});
    const entry = suggestionsCache.get(key);
    if (entry && Date.now() < entry.expires) {
      return entry.value;
    }
  } catch (e) {
    // ignore cache serialization errors
  }

  if (!client) {
    console.warn('Gemini client is not configured. Returning mock suggestions.');
    return DEFAULT_SUGGESTIONS;
  }

  try {
    const model = client.getGenerativeModel({ model: MODEL_NAME });
    const prompt = buildPrompt(designSnapshot);

    // To reduce payload size and model processing time, prefer sending a small
    // inline image only if provided. The screenshot is expected to be a viewport
    // capture (smaller) from the analyzer.
    const content = [{ text: prompt }];
    if (screenshotBase64) {
      content.push({ inlineData: { mimeType: 'image/png', data: screenshotBase64 } });
    }

    const result = await model.generateContent(content);

    const text = result.response?.text()?.trim();

    if (!text) {
      console.warn('Gemini returned an empty response. Falling back to mock suggestions.');
      return DEFAULT_SUGGESTIONS;
    }

    const normalized = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    const suggestions = JSON.parse(normalized);

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error('Gemini returned invalid suggestion format.');
    }

    // cache suggestions for this snapshot
    try {
      const key = JSON.stringify(designSnapshot || {});
      suggestionsCache.set(key, { value: suggestions, expires: Date.now() + SUGGESTIONS_TTL_MS });
    } catch (e) {
      // ignore cache set errors
    }

    return suggestions;
  } catch (error) {
    console.error('Gemini suggestion error:', error);
    return DEFAULT_SUGGESTIONS;
  }
}

function getMockSuggestions() {
  return [
    {
      category: 'Typography',
      issue: 'Body text uses a 12px font size, reducing readability on desktop.',
      suggestion: 'Increase the base font size to at least 16px and use a fluid scale (clamp) to adapt across breakpoints.',
      priority: 'High'
    },
    {
      category: 'Color',
      issue: 'Primary buttons use light gray text on a pale background, causing low contrast.',
      suggestion: 'Adopt a darker accent color (WCAG AA) for the button background and use pure white text to improve contrast.',
      priority: 'High'
    },
    {
      category: 'Layout',
      issue: 'Hero section lacks visual hierarchy, making the CTA hard to spot.',
      suggestion: 'Introduce clear spacing between headline, subcopy, and CTA; add a subtle background overlay to make the button stand out.',
      priority: 'Medium'
    },
    {
      category: 'Spacing',
      issue: 'Sections stack tightly with minimal vertical spacing.',
      suggestion: 'Add 64px top/bottom padding to major sections and increase line-height to 1.6 for supporting copy.',
      priority: 'Medium'
    },
    {
      category: 'Accessibility',
      issue: 'Images lack descriptive alt text, hindering screen-readers.',
      suggestion: 'Ensure all decorative and informative images include meaningful alt text describing their purpose.',
      priority: 'High'
    }
  ];
}
