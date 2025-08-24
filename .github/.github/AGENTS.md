# AGENT RULES (Codex)
## Цель
Поддерживать Telegram ↔ Cloudflare Workers ↔ OpenAI Assistants. Минимум инструментов.

## Ограничения
- Не добавлять и не трогать секреты/ключи в коде, .env, wrangler.toml.
- Допустимые файлы к правке: /src/**, README.md, wrangler.toml (без секретов), .github/**, package.json, tsconfig.json.
- Зависимости только: wrangler, typescript, @cloudflare/workers-types. Без «магии» и сторонних SDK.
- TypeScript ESM, одна точка входа: src/worker.ts. Без фреймворков.
- Один PR = одна маленькая задача. Пиши кратко, что и зачем.

## Интерфейсы
- Cloudflare KV: хранит mapping telegram_chat_id → openai_thread_id.
- Telegram: корректно обрабатываем не-текст (вежливый ответ) и отправляем typing.
- OpenAI Assistants: инструкции меняются только в кабинете OpenAI (не в коде).

## PR Оформление
Описание «что/почему», чек-лист из PULL_REQUEST_TEMPLATE.md выполнен.
