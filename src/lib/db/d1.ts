// D1 Database helper for Cloudflare Workers / OpenNext

export interface D1Binding {
  prepare: (query: string) => D1PreparedStatement;
  batch: <T = unknown>(statements: D1PreparedStatement[]) => Promise<D1Result<T>[]>;
  exec: (query: string) => Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = unknown>(colName?: string) => Promise<T | null>;
  run: <T = unknown>() => Promise<D1Result<T>>;
  all: <T = unknown>() => Promise<D1Result<T>>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  meta: Record<string, unknown>;
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

// Get D1 database binding from Cloudflare request env or process.env
export function getD1Database(env?: { DB?: D1Binding }): D1Binding | null {
  if (env?.DB) {
    return env.DB;
  }
  return null;
}

// Helper to execute parameterized SQL query on D1 with safety fallback
export async function queryD1<T = unknown>(
  query: string,
  params: unknown[] = [],
  env?: { DB?: D1Binding }
): Promise<T[]> {
  const db = getD1Database(env);
  if (!db) {
    return [];
  }

  try {
    const stmt = db.prepare(query).bind(...params);
    const res = await stmt.all<T>();
    return res.results || [];
  } catch (error) {
    console.error("D1 Query Error:", error);
    return [];
  }
}
