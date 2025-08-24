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

## Deployment
1. In the Cloudflare Dashboard create a KV namespace and bind it to the worker as `THREADS`.
2. Add secrets `TELEGRAM_TOKEN`, `OPENAI_API_KEY` and `OPENAI_ASSISTANT_ID` in *Workers → Settings → Variables*.
3. Deploy:
   ```sh
   npm run deploy
   ```
4. Point the Telegram webhook to the deployed worker URL.
