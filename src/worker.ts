import { sendMessage, sendTyping } from './telegram';
import { createThread, getAssistantResponse } from './openai';
import { getThreadId, setThreadId } from './storage';

export interface Env {
  TELEGRAM_TOKEN: string;
  OPENAI_API_KEY: string;
  OPENAI_ASSISTANT_ID: string;
  THREADS: KVNamespace;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const update = await req.json<any>();
    const message = update.message;
    if (!message) {
      return new Response('OK');
    }

    const chatId: number = message.chat.id;

    if (typeof message.text !== 'string') {
      await sendMessage(env, chatId, 'Пожалуйста, отправьте текстовое сообщение.');
      return new Response('OK');
    }

    await sendTyping(env, chatId);

    let threadId = await getThreadId(env.THREADS, chatId);
    if (!threadId) {
      threadId = await createThread(env);
      await setThreadId(env.THREADS, chatId, threadId);
    }

    const reply = await getAssistantResponse(env, threadId, message.text);
    if (reply) {
      await sendMessage(env, chatId, reply);
    }

    return new Response('OK');
  },
};
