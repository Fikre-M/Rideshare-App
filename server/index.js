/**
 * AI Proxy Server
 * Keeps API keys server-side so they are never exposed to the browser.
 * The frontend calls /api/ai/* — this server forwards to OpenAI / Google AI.
 */

import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const app = express();
const PORT = process.env.PROXY_PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:8000',
    methods: ['GET', 'POST'],
  })
);

// ── Validate keys at startup ──────────────────────────────────────────────────
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_KEY = process.env.GOOGLE_AI_API_KEY;

if (!OPENAI_KEY) console.warn('[proxy] OPENAI_API_KEY not set — OpenAI routes will fail');
if (!GOOGLE_KEY) console.warn('[proxy] GOOGLE_AI_API_KEY not set — Google AI routes will fail');

// ── OpenAI client (server-side only) ─────────────────────────────────────────
const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null;

// ── Google AI client (server-side only) ──────────────────────────────────────
const googleAI = GOOGLE_KEY ? new GoogleGenerativeAI(GOOGLE_KEY) : null;

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/ai/health', (_req, res) => {
  res.json({
    status: 'ok',
    openai: !!openai,
    googleAI: !!googleAI,
  });
});

// ── OpenAI: chat completions ──────────────────────────────────────────────────
app.post('/api/ai/openai/chat', async (req, res) => {
  if (!openai) return res.status(503).json({ error: 'OpenAI not configured on server' });

  try {
    const { messages, model = 'gpt-4o', response_format, temperature, max_tokens, stream } = req.body;

    if (stream) {
      // Streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const streamRes = await openai.chat.completions.create({
        model,
        messages,
        stream: true,
        temperature,
        max_tokens,
      });

      for await (const chunk of streamRes) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    // Non-streaming response
    const completion = await openai.chat.completions.create({
      model,
      messages,
      response_format,
      temperature,
      max_tokens,
    });

    res.json(completion);
  } catch (err) {
    console.error('[proxy] OpenAI error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ── Google AI: chat ───────────────────────────────────────────────────────────
app.post('/api/ai/google/chat', async (req, res) => {
  if (!googleAI) return res.status(503).json({ error: 'Google AI not configured on server' });

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
    console.error('[proxy] Google AI error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[proxy] AI proxy server running on http://localhost:${PORT}`);
});
