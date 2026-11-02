// Tiny key-value store on Upstash Redis (REST, no SDK). On Vercel add the
// "Upstash for Redis" integration: it sets KV_REST_API_URL + KV_REST_API_TOKEN.
// Without those variables (local dev) an in-memory Map is used instead.

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

const memory: Map<string, string> = ((globalThis as unknown as { __rulioMem?: Map<string, string> }).__rulioMem ??=
  new Map<string, string>());

export const storeIsPersistent = Boolean(URL_ && TOKEN);

async function redis<T = unknown>(command: (string | number)[]): Promise<T | null> {
  const res = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Redis ${command[0]} failed: ${res.status}`);
  const data = (await res.json()) as { result: T };
  return data.result ?? null;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const raw = storeIsPersistent ? await redis<string>(['GET', key]) : memory.get(key) ?? null;
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const raw = JSON.stringify(value);
  if (storeIsPersistent) await redis(['SET', key, raw]);
  else memory.set(key, raw);
}

/** Append to a list (used for the Payme statement index). */
export async function kvPush(key: string, value: string): Promise<void> {
  if (storeIsPersistent) {
    await redis(['RPUSH', key, value]);
  } else {
    const list = JSON.parse(memory.get(key) || '[]') as string[];
    list.push(value);
    memory.set(key, JSON.stringify(list));
  }
}

export async function kvList(key: string): Promise<string[]> {
  if (storeIsPersistent) return (await redis<string[]>(['LRANGE', key, 0, -1])) ?? [];
  return JSON.parse(memory.get(key) || '[]') as string[];
}

/** Atomic counter (order numbers). */
export async function kvIncr(key: string): Promise<number> {
  if (storeIsPersistent) return (await redis<number>(['INCR', key])) ?? 0;
  const n = Number(memory.get(key) || '0') + 1;
  memory.set(key, String(n));
  return n;
}

export async function kvDel(key: string): Promise<void> {
  if (storeIsPersistent) await redis(['DEL', key]);
  else memory.delete(key);
}

