/**
 * POST /api/ai/openai/chat
 * Vercel Serverless Function — proxies requests to OpenAI.
 * API key lives in Vercel environment variables, never in the browser.
 */
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export default async function handler(req, res) {
  // CORS headers (Vercel serves frontend + functions on the same domain, but
  // set them explicitly for safety)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!openai) {
    return res.status(503).json({ error: 'OpenAI not configured — set OPENAI_API_KEY in Vercel env vars' });
  }

  try {
    const { messages, model = 'gpt-4o', response_format, temperature, max_tokens, stream } = req.body;

    if (stream) {
      // Streaming via SSE
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

    const completion = await openai.chat.completions.create({
      model,
      messages,
      response_format,
      temperature,
      max_tokens,
    });

    res.json(completion);
  } catch (err) {
    console.error('[vercel/openai]', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
}
