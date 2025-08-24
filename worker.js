/**
 * Telegram ↔ OpenAI Assistants on Cloudflare Workers (single-file)
 * Требования окружения:
 * - KV binding:      KV
 * - Secrets:         OPENAI_API_KEY, TELEGRAM_TOKEN, ASSISTANT_ID, WEBHOOK_SECRET
 * Маршрут вебхука:   /webhook/:secret
 */
async function tg(method, token, payload) {
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}
async function typing(token, chatId) { await tg("sendChatAction", token, { chat_id: chatId, action: "typing" }); }
async function sendText(token, chatId, text) { await tg("sendMessage", token, { chat_id: chatId, text }); }

async function ai(env, path, init = {}) {
  return fetch(`https://api.openai.com/v1/${path}`, {
    method: init.method || (init.body ? "POST" : "GET"),
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
}

async function getThreadId(kv, chatId) { return kv.get(`thread:${chatId}`); }
async function setThreadId(kv, chatId, threadId) { await kv.put(`thread:${chatId}`, threadId); }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const p = url.pathname.split("/").filter(Boolean);
    // точка входа: /webhook/:secret
    if (p[0] !== "webhook" || p[1] !== env.WEBHOOK_SECRET) return new Response("Not found", { status: 404 });
    if (req.method !== "POST") return new Response("OK");

    const update = await req.json().catch(()=> ({}));
    const msg = update.message || update.edited_message || update.callback_query?.message;
    const chatId = msg?.chat?.id;
    if (!chatId) return new Response("OK");

    await typing(env.TELEGRAM_TOKEN, chatId);

    const text = msg?.text ?? msg?.caption;
    if (!text) { await sendText(env.TELEGRAM_TOKEN, chatId, "Понимаю только текст. Пришлите сообщение текстом 🙌"); return new Response("OK"); }

    // история: chat_id → thread_id (KV)
    let threadId = await getThreadId(env.KV, chatId);
    if (!threadId) {
      const tRes = await ai(env, "threads", { body: {} });
      const tJson = await tRes.json(); threadId = tJson?.id;
      if (!threadId) { await sendText(env.TELEGRAM_TOKEN, chatId, "Не смог создать тред. Попробуйте позже."); return new Response("OK"); }
      await setThreadId(env.KV, chatId, threadId);
    }

    // сообщение пользователя
    await ai(env, `threads/${threadId}/messages`, { body: { role: "user", content: text } });

    // запуск ассистента
    const runRes = await ai(env, `threads/${threadId}/runs`, { body: { assistant_id: env.ASSISTANT_ID } });
    const run = await runRes.json();
    if (!run?.id) { await sendText(env.TELEGRAM_TOKEN, chatId, "Ошибка запуска ассистента. Попробуйте ещё раз."); return new Response("OK"); }

    // ожидание завершения + продление "typing"
    for (let i=0;i<45;i++){
      const st = await (await ai(env, `threads/${threadId}/runs/${run.id}`)).json();
      if (st.status === "completed") break;
      if (["failed","cancelled","expired"].includes(st.status)) {
        await sendText(env.TELEGRAM_TOKEN, chatId, "Упс, не смог ответить. Попробуйте ещё раз.");
        return new Response("OK");
      }
      if (i%5===0) await typing(env.TELEGRAM_TOKEN, chatId);
      await sleep(1000);
    }

    // ответ ассистента
    const mJson = await (await ai(env, `threads/${threadId}/messages?order=desc&limit=10`)).json();
    const assistantMsg = (mJson.data||[]).find(m=>m.role==="assistant");
    let out = "…";
    if (assistantMsg?.content?.length){
      const parts = assistantMsg.content.filter(c=>c.type==="text");
      out = parts.map(p=>p.text?.value||"").join("\n\n").trim() || "…";
    }
    await sendText(env.TELEGRAM_TOKEN, chatId, out);
    return new Response("OK");
  }
};
