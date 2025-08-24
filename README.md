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

## Deploy (CI)
При merge в main GitHub Actions запускает `wrangler deploy`. Требуются секреты репозитория `CLOUDFLARE_API_TOKEN` и `CLOUDFLARE_ACCOUNT_ID`.

## KV
Перед merge заменить `<KV_NAMESPACE_ID>` в `wrangler.toml` на реальный ID из Cloudflare → Storage & Databases → KV → tg_assistant_kv → Overview → Namespace ID.

## Webhook
1. Получите URL воркера (например, `https://tg-assistant-worker.<account>.workers.dev`).
2. Установите вебхук:
   ```
   https://api.telegram.org/bot<TELEGRAM_TOKEN>/setWebhook?url=<worker_url>/webhook/<WEBHOOK_SECRET>
   ```
3. Проверить:
   ```
   https://api.telegram.org/bot<TELEGRAM_TOKEN>/getWebhookInfo
   ```
