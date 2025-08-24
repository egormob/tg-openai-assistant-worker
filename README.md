# tg-openai-assistant-worker

Telegram ↔ Cloudflare Workers ↔ OpenAI Assistants (threads + KV)

## Development
1. Install dependencies:
   ```sh
   npm install
   ```
2. Run the worker (remote mode for webhooks):
   ```sh
   npm run dev
   ```
3. Set Telegram webhook to the URL printed by `wrangler`.

## Deploy
Открой Cloudflare → Workers & Pages → tg-assistant-worker → Edit code → вставь worker.js → Save & Deploy
