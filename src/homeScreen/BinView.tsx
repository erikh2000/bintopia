import { ELSEWHERE_BIN_ID } from '@/bins/types/BinSet';
import styles from './BinView.module.css';
import Bin from '@/bins/types/Bin';

type Props = {
  bin:Bin,
  isActive:boolean
  status?:string
}

function BinView({bin, isActive, status}:Props) {
  let binTitle = bin.id === ELSEWHERE_BIN_ID ? 'Elsewhere' : `Bin #${bin.id}`;
  if (status) binTitle += ` (${status})`;
  const containerClassName = isActive ? `${styles.container} ${styles.active}` : styles.container;
  return (
    <div className={containerClassName}>
      <h3>{binTitle}</h3>
      <ul>
        {bin.items.map((item:string, index:number) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default BinView;