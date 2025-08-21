import { useEffect, useState } from "react";

import styles from './HomeScreen.module.css';
import { init } from "./interactions/initialization";
import { submitPrompt } from "./interactions/prompt";
import ContentButton from '@/components/contentButton/ContentButton';
import LoadScreen from '@/loadScreen/LoadScreen';
import TopBar from '@/components/topBar/TopBar';
import BinSetView from "./BinSetView";
import BinSet, { createEmptyBinSet } from "@/transactions/types/BinSet";
import OperationType from "@/transactions/types/OperationType";
import ConversationState from "@/conversation/types/ConversationState";
import Face, { FaceIcon } from "@/components/face/Face";

function _getFaceIcon(state:ConversationState, isBusy:boolean):FaceIcon {
  switch(state) {
    case ConversationState.IDLE: return isBusy ? FaceIcon.THINKING : FaceIcon.NEUTRAL;
    case ConversationState.USER_SPEAKING: return FaceIcon.LISTENING;
    case ConversationState.ASSISTANT_SPEAKING: return FaceIcon.SPEAKING;
    default: return FaceIcon.SLEEPING;
  }
}

function HomeScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');
  const [activeBinId, setActiveBinId] = useState<number|null>(null);
  const [activeOperation, setActiveOperation] = useState<OperationType|null>(null);
  const [conversationState, setConversationState] = useState<ConversationState>(ConversationState.INITIALIZING);
  const [binSet, setBinSet] = useState<BinSet>(createEmptyBinSet());
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  useEffect(() => {
    if (isLoading) return;

    init(setPrompt, _onFinal, setConversationState).then(isLlmConnected => { 
      if (!isLlmConnected) { 
        setIsLoading(true);
        return;
      }
      setIsInitialized(true);
    });
  }, [isLoading]);

  if (isLoading) return <LoadScreen onComplete={() => setIsLoading(false)} />;

  async function _processPrompt(text:string) {
    await submitPrompt(text, setPrompt, setIsBusy, setActiveBinId, setActiveOperation, setBinSet);
  }

  function _onKeyDown(e:React.KeyboardEvent<HTMLInputElement>) {
    if(e.key === 'Enter' && prompt !== '') _processPrompt(prompt);
  }

  function _onFinal(text:string) {
    if (isBusy) return;
    _processPrompt(text);
  }

  const arePromptsDisabled = isBusy || !isInitialized;
  const faceIcon = _getFaceIcon(conversationState, isBusy);
  
  return (
    <div className={styles.container}>
      <TopBar />
      <div className={styles.content}>
        <p><input type="text" className={styles.promptBox} placeholder="Say what you are doing with the bins and items" 
            value={prompt} onKeyDown={_onKeyDown} onChange={(e) => setPrompt(e.target.value)} disabled={arePromptsDisabled}/>
        <ContentButton text="Send" onClick={() => _processPrompt(prompt)} disabled={arePromptsDisabled}/></p>
        <Face faceIcon={faceIcon} />
        <BinSetView binSet={binSet} activeBinId={activeBinId} activeOperation={activeOperation}/>
      </div>
    </div>
  );
}

export default HomeScreen;