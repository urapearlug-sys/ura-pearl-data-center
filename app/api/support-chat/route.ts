import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupportChatFallbackReply } from '@/utils/support-chat-fallback';

export const dynamic = 'force-dynamic';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(4000),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).max(24),
  mode: z.enum(['support', 'kamisona']).optional(),
});

const SYSTEM_PROMPT = `You are the URAPearls support assistant for a Telegram mini-app themed around URA Pearls.
Be concise, friendly, and accurate. You help with:
- How to open the Clicker game from the website home page
- In-app areas: game, tasks, friends, services (URA & Uganda Electronic Single Window links), settings
- General guidance; you do not have access to user accounts or balances
If the user needs account-specific help, billing disputes, or official tax determinations, tell them politely to use the "talk to an agent" option in the chat widget for human support and official URA channels.
Never invent URA policies or legal advice. Keep answers short (2–5 sentences) unless the user asks for detail.`;

const KAMISONA_PROMPT = `You are “Ask the Kamisona” — a helpful AI guide in the URAPearls mini-app. You give bot assistance and frequently asked questions in the spirit of answers from the Kamisona General of URA (Ask the Commissioner General / Buuza Kamisona).
You answer general taxpayer education questions about Ugandan tax topics (PAYE, VAT, EFRIS, TIN, PRN payments, customs basics) in plain language.
Be concise (2–5 sentences), respectful, and clear. You are NOT the real Commissioner General and you do not issue official rulings.
If the user is not satisfied or does not find their answer, tell them to use “Submit your question to the Commissioner General” in the chat (Telegram or call URA toll-free 0800 117 000).
Never invent statutes or claim access to URA systems.`;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { messages, mode } = parsed.data;
  const systemPrompt = mode === 'kamisona' ? KAMISONA_PROMPT : SYSTEM_PROMPT;
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const lastUserText = lastUser?.content?.trim() ?? '';

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: getSupportChatFallbackReply(lastUserText), source: 'fallback' });
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini',
        temperature: 0.5,
        max_tokens: 500,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('support-chat OpenAI error', res.status, errText.slice(0, 500));
      return NextResponse.json({
        reply: getSupportChatFallbackReply(lastUserText),
        source: 'fallback',
      });
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json({
        reply: getSupportChatFallbackReply(lastUserText),
        source: 'fallback',
      });
    }

    return NextResponse.json({ reply, source: 'openai' });
  } catch (e) {
    console.error('support-chat', e);
    return NextResponse.json({
      reply: getSupportChatFallbackReply(lastUserText),
      source: 'fallback',
    });
  }
}
