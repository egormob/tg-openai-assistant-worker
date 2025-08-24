export async function getThreadId(kv: KVNamespace, chatId: number): Promise<string | null> {
  return kv.get(chatId.toString());
}

export async function setThreadId(kv: KVNamespace, chatId: number, threadId: string): Promise<void> {
  await kv.put(chatId.toString(), threadId);
}
