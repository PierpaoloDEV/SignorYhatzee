import { useWheelGame } from './hooks/useWheelGame';
import SetupScreen from './components/SetupScreen';
import WheelScreen from './components/WheelScreen';
import './signor-wheel.css';

export default function WheelGame({ onExit }) {
  const state = useWheelGame();

  if (state.phase === 'setup') {
    return <SetupScreen state={state} onExit={onExit} />;
  }
  return <WheelScreen state={state} onExit={onExit} />;
}
