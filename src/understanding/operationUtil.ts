import OperationType from '@/transactions/types/OperationType';

const ADD_MATCH_RULES = ['add', 'adding', 'put...in', 'putting...in', 'put...into', 'putting...into', 'put...inside', 'putting...inside',
  'insert', 'inserting', 'place', 'placing', 'drop...in', 'dropping...in'];
const REMOVE_MATCH_RULES = ['remove', 'removing', 'take...out', 'taking...out', 'pull...out', 'pulling...out', 'yank', 'yanking', 'extract', 
  'extracting', 'grab', 'grabbing'];

function _doWordsMatchRule(words:string[], rule:string):boolean { // If this gets any more complicated just grab your matching code from sl-spiel and reuse.
  const clauses = rule.split('...');
  let clauseI = 0;
  for(let wordI = 0; wordI < words.length && clauseI < clauses.length; ++wordI) {
    if (words[wordI] === clauses[clauseI]) ++clauseI;
  }
  return clauseI === clauses.length;
}

function _doWordsMatchRules(words:string[], rules:string[]):boolean {
  return rules.some(rule => _doWordsMatchRule(words, rule));
}

export async function findOperation(prompt:string):Promise<OperationType|null> {
  const words = prompt.split(' ').map(w => w.toLowerCase().trim());
  if (_doWordsMatchRules(words, ADD_MATCH_RULES)) return OperationType.ADD_TO_BIN;
  if (_doWordsMatchRules(words, REMOVE_MATCH_RULES)) return OperationType.REMOVE_FROM_BIN;
  return null;
}