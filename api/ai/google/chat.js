/**
 * POST /api/ai/google/chat
 * Vercel Serverless Function — proxies requests to Google Gemini.
 * API key lives in Vercel environment variables, never in the browser.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const googleAI = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!googleAI) {
    return res.status(503).json({ error: 'Google AI not configured — set GOOGLE_AI_API_KEY in Vercel env vars' });
  }

  try {
    const {
      message,
      history = [],
      modelName = process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash',
      generationConfig = {},
    } = req.body;

    const model = googleAI.getGenerativeModel({ model: modelName });
    const chat = model.startChat({ history, generationConfig });
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    res.json({ text });
  } catch (err) {
    console.error('[vercel/google]', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
}
