import { clearChatHistory, generate, setNShotExamples, setSystemMessage } from "@/llm/llmUtil";
import NShotExchange from "@/llm/types/NShotExchange";

const MAX_WORDS_IN_ITEM = 5;

const SYSTEM_MESSAGE = `Output as a comma-delimited list any physical objects described by user. ` +
  `Do not output anything else. ` +
  `Include adjectives and item descriptions provided by the user that may be helpful in distinguishing the object from others.`;
  `Do not invent objects or adjectives beyond what user has provided. ` +
  `Numbers, pronouns, and abstract nouns are not physical objects and should not be included in the output. ` +
  `If no physical objects have been mentioned by user, output the single character "?".`;
  
const N_SHOT_EXAMPLES:NShotExchange[] = [
  {userMessage:"i'm uh putting a baseball a bat in", assistantMessage:"baseball,bat"},
  {userMessage:"this pot goes in number seven", assistantMessage:"pot"},
  {userMessage:"this thing goes in number seven", assistantMessage:"?"},
  {userMessage:"adding items to number three", assistantMessage:"?"},
  {userMessage:"baked beans camp stove lighter beef jerky", assistantMessage:"baked beans,camp stove,lighter,beef jerky"},
  {userMessage:"taking out this old smelly scarf", assistantMessage:"old smelly scarf"},
  {userMessage:"taking some things out", assistantMessage:"?"},
  {userMessage:"let's yank out these old paint brushes", assistantMessage:"old paintbrushes"},
  {userMessage:"what to do with these socks i could just get rid of them", assistantMessage:"socks"},
  {userMessage:"should I keep these", assistantMessage:"?"},
  {userMessage:"uh", assistantMessage:"?"}
];

// Instead of fighting with the LLM to avoid certain items, just filter them out here.
const EXCLUDE_ITEMS = ['thing', 'stuff', 'item', 'items', 'these', 'this', 'number', 'bin', '?', 
  'added', 'it', 'the'];

// These keywords signal that the LLM thinks it has something important to say rather than following instructions and listing items.
const BAD_RESPONSE_KEYWORDS = ['assistant', 'assistance', 'illegal', 'cannot', `can't`];

// Certain punctuation marks signal a bad response.
const BAD_RESPONSE_PUNCTUATION = ['.', '!', '?', ':', ';', '(', ')', '{', '}'];

function _isProbablyBadResponse(item:string) {
  const words = item.toLowerCase().split(' ');
  return words.length > MAX_WORDS_IN_ITEM ||
      BAD_RESPONSE_PUNCTUATION.some(char => item.includes(char)) ||
      words.some(word => BAD_RESPONSE_KEYWORDS.includes(word));
}

function _shouldIncludeItem(item:string):boolean {
  if (item.length === 0) return false;
  if (EXCLUDE_ITEMS.includes(item.toLowerCase())) return false;
  return !_isProbablyBadResponse(item);
}

export async function findItems(prompt:string, onFindItem:(itemName:string)=>void):Promise<string[]> {
  clearChatHistory();
  setSystemMessage(SYSTEM_MESSAGE);
  setNShotExamples(N_SHOT_EXAMPLES);

  let parsedItems:string[] = [];
  let responseParsedPos = 0;

  function _onUpdateResponse(partialResponse:string) {
    const commaPos = partialResponse.indexOf(',', responseParsedPos);
    if (commaPos === -1) return;
    const nextItem = partialResponse.substring(responseParsedPos, commaPos).trim();
    if (_shouldIncludeItem(nextItem)) {
      onFindItem(nextItem);
      parsedItems.push(nextItem);
    }
    responseParsedPos = commaPos + 1;
  }

  const response = await generate(prompt, _onUpdateResponse);
  if (response.trim() === '?') return [];

  _onUpdateResponse(response + ','); // Parse the last item.
  return parsedItems;
}