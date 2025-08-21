import listenPng from './images/listen.png';
import speakPng from './images/speak.png';
import thinkPng from './images/think.png';
import sleepPng from './images/sleep.png';
import neutralPng from './images/neutral.png';
import styles from './Face.module.css';
import { useEffect, useState } from 'react';

type Props = {
  faceIcon:FaceIcon
}

export enum FaceIcon {
  NEUTRAL = 'neutral',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
  THINKING = 'thinking',
  SLEEPING = 'sleeping'
}

function _renderInnerContent(state:FaceIcon, speakingFrame:boolean) {
  const className = styles.icon;
  switch(state) {
    case FaceIcon.NEUTRAL:
      return <img src={neutralPng} alt="Neutral" className={className} />;
    case FaceIcon.LISTENING:
      return <img src={listenPng} alt="Listening" className={className} />;
    case FaceIcon.SPEAKING: {
      const src = speakingFrame ? speakPng : neutralPng;
      return <img src={src} alt="Speaking" className={className} />;
    }
    case FaceIcon.THINKING:
      return <img src={thinkPng} alt="Thinking" className={className} />;
    case FaceIcon.SLEEPING:
      return <img src={sleepPng} alt="Sleeping" className={className} />;
    default:
      return null;
  }
}

function Face({faceIcon}:Props) {
  const [speakingFrame, setSpeakingFrame] = useState<boolean>(true);

  useEffect(() => {
    if (faceIcon === FaceIcon.SPEAKING) {
      setSpeakingFrame(true);
      const id = window.setInterval(() => setSpeakingFrame(prev => !prev), 200);
      return () => clearInterval(id);
    }
    return;
  }, [faceIcon]);

  const innerContent = _renderInnerContent(faceIcon, speakingFrame);

  return (
    <div className={styles.container}>
      {innerContent}
    </div>
  ); 
}

export default Face;
