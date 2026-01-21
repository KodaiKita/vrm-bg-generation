import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import Terrain from './world/Terrain';

function App() {
  return (
    <Canvas
      camera={{ position: [10, 10, 10], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <color attach="background" args={['#333']} />

      {/* --- 地形コンポーネントを表示 --- */}
      {/* seedを変えると地形の形が変わります */}
      <Terrain seed={123} size={20} segments={50} />

      <Grid infiniteGrid fadeDistance={50} sectionColor="#ffffff" cellColor="#888888" position={[0, -2, 0]}/>
      <OrbitControls />
    </Canvas>
  );
}

export default App;