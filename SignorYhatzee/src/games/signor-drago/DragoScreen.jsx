import { useDragoGame } from './hooks/useDragoGame';
import SetupScreen from './components/SetupScreen';
import BoardScreen from './components/BoardScreen';
import './signor-drago.css';

export default function DragoScreen({ onExit }) {
  const state = useDragoGame();

  if (state.phase === 'setup') {
    return <SetupScreen state={state} onExit={onExit} />;
  }
  return <BoardScreen state={state} onExit={onExit} />;
}
