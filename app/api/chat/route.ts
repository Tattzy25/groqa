import { model, modelID } from "@/ai/providers";
import { toolsRegistry } from "@/ai/registry";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { searchMemory, addMemory } from "@/lib/memos";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    selectedModel,
  }: { messages: UIMessage[]; selectedModel: modelID } = await req.json();

  // Get the latest user message
  const latestUserMessage = (messages[messages.length - 1] as any)?.content ?? "";

  // Step 1: Pull relevant memories BEFORE streaming
  const memories = await searchMemory(latestUserMessage, "owner");

  // Step 2: Build memory context for system prompt
  const memoryContext =
    memories.length > 0
      ? `\n\n## What you remember about this user:\n${memories
          .map((m: string, i: number) => `${i + 1}. ${m}`)
          .join("\n")}`
      : "";

  const systemPrompt = `You are a helpful assistant, always greet the user by Whats good Im the Gandon AI, inch anenk? inches uzum ara ? and you have memory.${memoryContext}`;

  const result = streamText({
    model: model.languageModel(selectedModel),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5), // enable multi-step agentic flow
    tools: toolsRegistry,
    experimental_telemetry: {
      isEnabled: true,
    },
    onFinish: async ({ text }) => {
      // Step 4: Save to memory AFTER stream completes
      // async_mode means this won't affect streaming speed
      await addMemory(latestUserMessage, text, "owner");
    },
  });

  return result.toTextStreamResponse();
}
