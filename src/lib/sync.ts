'use client';

export interface SyncPayload {
  ticketResults?: Record<string, any>;
  mistakes?: any[];
  saved?: Record<string, boolean>;
}

export async function syncUserData(immediatePayload?: SyncPayload) {
  if (typeof window === 'undefined') return null;

  try {
    const localResults = JSON.parse(localStorage.getItem('rulio_ticket_results') || '{}');
    const localMistakes = JSON.parse(localStorage.getItem('rulio_mistakes') || '[]');
    const localSaved = JSON.parse(localStorage.getItem('rulio_saved') || '{}');

    const payload: SyncPayload = {
      ticketResults: { ...localResults, ...(immediatePayload?.ticketResults || {}) },
      mistakes: immediatePayload?.mistakes || localMistakes,
      saved: { ...localSaved, ...(immediatePayload?.saved || {}) },
    };

    const res = await fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (json.ok && json.data) {
      localStorage.setItem('rulio_ticket_results', JSON.stringify(json.data.ticketResults || {}));
      localStorage.setItem('rulio_mistakes', JSON.stringify(json.data.mistakes || []));
      localStorage.setItem('rulio_saved', JSON.stringify(json.data.saved || {}));
      return json.data;
    }
  } catch (err) {
    console.warn('Sync failed (offline or guest):', err);
  }
  return null;
}

export async function fetchServerUserData() {
  if (typeof window === 'undefined') return null;

  try {
    const res = await fetch('/api/user/sync');
    if (!res.ok) return null;
    const json = await res.json();
    if (json.ok && json.data) {
      const localResults = JSON.parse(localStorage.getItem('rulio_ticket_results') || '{}');
      const localMistakes = JSON.parse(localStorage.getItem('rulio_mistakes') || '[]');
      const localSaved = JSON.parse(localStorage.getItem('rulio_saved') || '{}');

      const mergedResults = { ...(json.data.ticketResults || {}), ...localResults };
      const mergedSaved = { ...(json.data.saved || {}), ...localSaved };

      localStorage.setItem('rulio_ticket_results', JSON.stringify(mergedResults));
      localStorage.setItem('rulio_saved', JSON.stringify(mergedSaved));
      if (json.data.mistakes?.length && localMistakes.length === 0) {
        localStorage.setItem('rulio_mistakes', JSON.stringify(json.data.mistakes));
      }
      return json.data;
    }
  } catch (err) {
    console.warn('Fetch server sync failed:', err);
  }
  return null;
}
