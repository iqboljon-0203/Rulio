import { NextResponse } from 'next/server';
import { sessionFromRequest } from '@/lib/auth';
import { kvGet, kvSet } from '@/lib/store';

interface UserSyncData {
  ticketResults: Record<string, any>;
  mistakes: any[];
  saved: Record<string, boolean>;
  updatedAt: number;
}

export async function GET(request: Request) {
  const user = await sessionFromRequest(request);
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const data = await kvGet<UserSyncData>(`user:${user.telegramId}:sync`);
  return NextResponse.json({
    ok: true,
    data: data ?? { ticketResults: {}, mistakes: [], saved: {}, updatedAt: 0 },
  });
}

export async function POST(request: Request) {
  const user = await sessionFromRequest(request);
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const raw = await request.text().catch(() => '');
  if (raw.length > 300_000) return NextResponse.json({ ok: false, error: 'too_large' }, { status: 413 });
  let body: Partial<UserSyncData> = {};
  try {
    body = JSON.parse(raw || '{}');
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }
  if (body.ticketResults && Object.keys(body.ticketResults).some((k) => !/^\d{1,2}$/.test(k))) {
    return NextResponse.json({ ok: false, error: 'bad_data' }, { status: 400 });
  }
  const key = `user:${user.telegramId}:sync`;
  const existing = (await kvGet<UserSyncData>(key)) ?? {
    ticketResults: {},
    mistakes: [],
    saved: {},
    updatedAt: 0,
  };

  // Merge ticket results: Keep the best score or latest
  const mergedResults = { ...existing.ticketResults, ...(body.ticketResults || {}) };

  // Merge mistakes: Deduplicate by questionId
  const mistakeMap = new Map<string, any>();
  for (const m of existing.mistakes || []) {
    if (m?.questionId) mistakeMap.set(m.questionId, m);
  }
  for (const m of body.mistakes || []) {
    if (m?.questionId) mistakeMap.set(m.questionId, m);
  }
  const mergedMistakes = Array.from(mistakeMap.values()).slice(0, 100);

  // Merge saved
  const mergedSaved = { ...existing.saved, ...(body.saved || {}) };

  const updated: UserSyncData = {
    ticketResults: mergedResults,
    mistakes: mergedMistakes,
    saved: mergedSaved,
    updatedAt: Date.now(),
  };

  await kvSet(key, updated);

  return NextResponse.json({
    ok: true,
    data: updated,
  });
}
