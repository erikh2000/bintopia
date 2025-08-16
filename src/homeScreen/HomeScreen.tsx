import { useEffect, useState } from "react";

import WaitingEllipsis from '@/components/waitingEllipsis/WaitingEllipsis';
import styles from './HomeScreen.module.css';
import { init, toggleMute } from "./interactions/initialization";
import { submitPrompt } from "./interactions/prompt";
import ContentButton from '@/components/contentButton/ContentButton';
import LoadScreen from '@/loadScreen/LoadScreen';
import TopBar from '@/components/topBar/TopBar';
import BinSetView from "./BinSetView";
import BinSet, { createEmptyBinSet } from "@/bins/types/BinSet";
import OperationType from "@/bins/types/OperationType";

function HomeScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');
  const [activeBinId, setActiveBinId] = useState<number|null>(null);
  const [activeOperation, setActiveOperation] = useState<OperationType|null>(null);
  const [binSet, setBinSet] = useState<BinSet>(createEmptyBinSet());
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  useEffect(() => {
    if (isLoading) return;

    init(setPrompt, _onFinal).then(isLlmConnected => { 
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

  const toggleMuteText = isMuted ? 'Unmute' : 'Mute';

  const arePromptsDisabled = isBusy || !isInitialized;
  
  return (
    <div className={styles.container}>
      <TopBar />
      <div className={styles.content}>
        <p><input type="text" className={styles.promptBox} placeholder="Say what you are doing with the bins and items" 
            value={prompt} onKeyDown={_onKeyDown} onChange={(e) => setPrompt(e.target.value)} disabled={arePromptsDisabled}/>
        <ContentButton text="Send" onClick={() => _processPrompt(prompt)} disabled={arePromptsDisabled}/>
        <ContentButton text={toggleMuteText} onClick={() => toggleMute(isMuted, setIsMuted)} disabled={arePromptsDisabled}/></p>
        { isBusy ? <WaitingEllipsis trailing/> : null }
        <BinSetView binSet={binSet} activeBinId={activeBinId} activeOperation={activeOperation}/>
      </div>
    </div>
  );
}

export default HomeScreen;