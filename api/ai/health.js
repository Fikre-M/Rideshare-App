/**
 * GET /api/ai/health
 * Vercel Serverless Function — health check
 */
export default function handler(req, res) {
  res.json({
    status: 'ok',
    openai: !!process.env.OPENAI_API_KEY,
    googleAI: !!process.env.GOOGLE_AI_API_KEY,
  });
}
