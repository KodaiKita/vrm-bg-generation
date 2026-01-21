import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei'; // Skyを追加
import Terrain from './world/Terrain';
import Vegetation from './world/Vegetation';

function App() {
  const SEED = 123;
  const SIZE = 30; // 世界を少し広くしてみましょう

  return (
    // shadows: 影を有効化
    <Canvas
      shadows 
      camera={{ position: [15, 15, 15], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* 霧を追加 (色, 開始距離, 終了距離) */}
      {/* 遠くの境界線をごまかし、空気感を出します */}
      <fog attach="fog" args={['#cce0ff', 5, 40]} />

      {/* 空の色を霧と合わせる */}
      <color attach="background" args={['#cce0ff']} />

      <ambientLight intensity={0.4} />
      
      {/* 太陽の光 (castShadowで影を落とす) */}
      <directionalLight 
        position={[50, 50, 25]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]} // 影の解像度
      >
        {/* 影を落とす範囲の設定（これがないと影が切れることがあります） */}
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
      </directionalLight>

      {/* 綺麗な空を表示するコンポーネント */}
      <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} />

      <Terrain seed={SEED} size={SIZE} segments={120} />
      <Vegetation seed={SEED} size={SIZE} />

      {/* autoRotate: ゆっくりカメラを回して鑑賞モードに */}
      <OrbitControls autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  );
}

export default App;