import type { NextApiRequest, NextApiResponse } from 'next';

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;

async function getChartInsights(chartJson: any, userRole: string) {
  if (!OPENAI_API_KEY) throw new Error('Missing OpenAI API key');
  const prompt = [
    userRole === 'astrologer'
      ? 'You are an expert KP astrologer. Analyze the following chart JSON and return 3-5 technical, actionable insights for an astrologer. Use bullet points.'
      : 'You are an expert KP astrologer. Explain the following chart JSON in simple, friendly language for a client. Use 3-5 clear, supportive bullet points.',
    'Chart JSON:',
    JSON.stringify(chartJson, null, 2),
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });
  if (!response.ok) throw new Error('OpenAI API error');
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  // Extract bullet points
  const insights = content.split(/\n|•|\*/).map(x => x.trim()).filter(x => x.length > 0);
  return insights;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { chartJson, userRole } = req.body;
    if (!chartJson || !userRole) return res.status(400).json({ error: 'Missing chartJson or userRole' });
    const insights = await getChartInsights(chartJson, userRole);
    res.status(200).json({ insights });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
}
