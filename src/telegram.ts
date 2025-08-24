import type { Env } from './worker';

const API = 'https://api.telegram.org';

export async function sendTyping(env: Env, chatId: number): Promise<void> {
  const url = `${API}/bot${env.TELEGRAM_TOKEN}/sendChatAction`;
  await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' })
  });
}

export async function sendMessage(env: Env, chatId: number, text: string): Promise<void> {
  const url = `${API}/bot${env.TELEGRAM_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}
