// src/lib/forums.ts
const FORUMS_API_BASE = 'https://api.foru.ms/v1';
const FORUMS_API_KEY = import.meta.env.VITE_FORUMS_API_KEY || "";

export interface ForumsThread {
  id: string;
  title: string;
  content: string; // We'll store our stringified JSON parameters inside thread content
  created_at: string;
}

export interface ForumsPost {
  id: string;
  thread_id: string;
  content: string;
  author: {
    username: string;
  };
}

// 1. Fetch live Threat Vector entries (Foru.ms Threads)
export async function getThreatThreads(): Promise<ForumsThread[]> {
  const response = await fetch(`${FORUMS_API_BASE}/threads`, {
    headers: {
      'Authorization': `Bearer ${FORUMS_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to fetch threat streams.');
  return response.json();
}

// 2. Push a new Threat entry to the global database
export async function createThreatThread(title: string, rawPayload: object) {
  const response = await fetch(`${FORUMS_API_BASE}/threads`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FORUMS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title,
      content: JSON.stringify(rawPayload) // Stringify the vulnerability data fields
    })
  });
  return response.json();
}

// 3. Push a code patch / peer review update (Foru.ms Post)
export async function createPatchPost(threadId: string, patchContent: string) {
  const response = await fetch(`${FORUMS_API_BASE}/threads/${threadId}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FORUMS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: patchContent })
  });
  return response.json();
}
