import { clearChatHistory, generate, setNShotExamples, setSystemMessage } from "@/llm/llmUtil";
import NShotExchange from "@/llm/types/NShotExchange";

const SYSTEM_MESSAGE = `Output as a comma-delimited list any physical objects described by user. ` +
  `Do not output anything else. ` +
  `Include adjectives and item descriptions provided by the user that may be helpful in distinguishing the object from others.`;
  `Do not invent objects or adjectives beyond what user has provided. ` +
  `Numbers and abstract nouns are not physical objects and should not be included in the output. ` +
  `If no physical objects have been mentioned by user, output the single character "?".`;
  
const N_SHOT_EXAMPLES:NShotExchange[] = [
  {userMessage:"i'm uh putting a baseball a bat in", assistantMessage:"baseball,bat"},
  {userMessage:"this pot goes in number seven", assistantMessage:"pot"},
  {userMessage:"adding items to number three", assistantMessage:"?"},
  {userMessage:"baked beans camp stove lighter beef jerky", assistantMessage:"baked beans,camp stove,lighter,beef jerky"},
  {userMessage:"taking out this old smelly scarf", assistantMessage:"old smelly scarf"},
  {userMessage:"taking some things out", assistantMessage:"?"},
  {userMessage:"let's yank out these old paint brushes", assistantMessage:"old paintbrushes"},
  {userMessage:"what to do with these socks i could just get rid of them", assistantMessage:"socks"},
  {userMessage:"should I keep these", assistantMessage:"?"},
  {userMessage:"uh", assistantMessage:"?"}
];

export async function findItems(prompt:string):Promise<string[]> {
  clearChatHistory();
  setSystemMessage(SYSTEM_MESSAGE);
  setNShotExamples(N_SHOT_EXAMPLES);
  const response = await generate(prompt); // TODO - could parse and update as comma-delimited values come in. Add an onStatusUpdate callback if you want to do that.
  console.log(`Items response from LLM: ${response}`);
  if (response.trim() === '?') return [];
  return response.split(',').map(item => item.trim()).filter(item => item.length > 0);
}