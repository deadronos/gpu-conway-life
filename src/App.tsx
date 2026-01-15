import { Canvas } from '@react-three/fiber';
import GOLSimulation from './components/GOLSimulation';
import './App.css';

function App() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 100] }}>
        <GOLSimulation />
      </Canvas>
    </div>
  );
}

export default App;
