const MEMOS_BASE_URL = "https://memos.memtensor.cn/api/openmem/v1";

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Token ${process.env.MEMOS_API_KEY}`,
};

// Search memories before answering
export async function searchMemory(query: string, userId: string) {
  try {
    const res = await fetch(`${MEMOS_BASE_URL}/search/memory`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        user_id: userId,
        conversation_id: "default_session",
        query: query,
        knowledgebase_ids: [process.env.MEMOS_KB_ID],
      }),
    });

    const data = await res.json();
    return data?.data?.memories ?? [];
  } catch (err) {
    console.error("MemOS search failed:", err);
    return [];
  }
}

// Save conversation to memory after each turn
export async function addMemory(
  userMessage: string,
  assistantReply: string,
  userId: string
) {
  try {
    await fetch(`${MEMOS_BASE_URL}/add/message`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        user_id: userId,
        conversation_id: "default_session",
        messages: [
          { role: "user", content: userMessage },
          { role: "assistant", content: assistantReply },
        ],
        allow_knowledgebase_ids: [process.env.MEMOS_KB_ID],
        async_mode: true, // won't block your stream
      }),
    });
  } catch (err) {
    console.error("MemOS save failed:", err);
  }
}