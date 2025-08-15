import LLMMessage from "./LLMMessage";
import NShotExchange from "./NShotExchange";

type LLMMessages = {
  chatHistory:LLMMessage[],
  maxChatHistorySize:number;
  systemMessage:string|null;
  nShotExamples:NShotExchange[];
}

export default LLMMessages;