import { groq } from "@ai-sdk/groq";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";

const languageModels = {
  "meta-llama/llama-4-scout-17b-16e-instruct": groq(
    "meta-llama/llama-4-scout-17b-16e-instruct",
  ),
  "openai/gpt-oss-120b": groq("openai/gpt-oss-120b"),
};

export const model = customProvider({
  languageModels,
});

export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID = "meta-llama/llama-4-scout-17b-16e-instruct";
