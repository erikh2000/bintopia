import { ConversationStateChangeCallback, initConversation } from "@/conversation/conversationUtil";
import { isLlmConnected } from "@/llm/llmUtil";
import { IStringCallback } from "sl-web-speech/dist/types/callbacks";

export async function init(setPrompt:IStringCallback, onFinal:IStringCallback, onConversationStateChange:ConversationStateChangeCallback):Promise<boolean> {
  if (!isLlmConnected()) return false;

  return await initConversation(setPrompt, onFinal, onConversationStateChange);
}