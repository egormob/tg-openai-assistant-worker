import type { Env } from './worker';

const API = 'https://api.openai.com/v1';

async function api(env: Env, path: string, init: RequestInit = {}): Promise<Response> {
  const headers = {
    Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    ...init.headers,
  } as HeadersInit;
  return fetch(`${API}${path}`, { ...init, headers });
}

export async function createThread(env: Env): Promise<string> {
  const res = await api(env, '/threads', { method: 'POST', body: '{}' });
  const data = await res.json<any>();
  return data.id as string;
}

export async function getAssistantResponse(env: Env, threadId: string, text: string): Promise<string> {
  await api(env, `/threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ role: 'user', content: text }),
  });

  const runRes = await api(env, `/threads/${threadId}/runs`, {
    method: 'POST',
    body: JSON.stringify({ assistant_id: env.OPENAI_ASSISTANT_ID }),
  });
  let run = await runRes.json<any>();

  while (run.status !== 'completed') {
    await new Promise((r) => setTimeout(r, 1000));
    const statusRes = await api(env, `/threads/${threadId}/runs/${run.id}`);
    run = await statusRes.json<any>();
  }

  const msgsRes = await api(env, `/threads/${threadId}/messages`);
  const msgs = await msgsRes.json<any>();
  const msg = msgs.data.find((m: any) => m.role === 'assistant');
  return msg?.content[0]?.text?.value ?? '';
}
