import { useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import Terrain from './world/Terrain';
import Vegetation from './world/Vegetation';

// ========================================
// カメラ位置・向きの設定 (ここを調整してください)
// ========================================
const FIXED_CAMERA_POSITION: [number, number, number] = [-15, 5, -15]; // 南西角から撮影
// X/Z: 水平位置 (-15～15の範囲で地形の端), Y: 高さ (15～30推奨)
const FIXED_CAMERA_TARGET: [number, number, number] = [0, 0, 0]; // カメラが向く位置（地形の中心）
const FIXED_CAMERA_FOV = 45; // 視野角

// 固定カメラの向きを設定するコンポーネント
function FixedCameraController() {
  const { camera } = useThree();
  
  useFrame(() => {
    camera.lookAt(...FIXED_CAMERA_TARGET);
  });
  
  return null;
}

function App() {
  const SEED = 123;
  const SIZE = 30;
  
  const [isOrbitMode, setIsOrbitMode] = useState(false); // false = 固定カメラ, true = 自由カメラ

  // Ctrl+C でカメラモードをトグル
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'c') {
        event.preventDefault(); // ブラウザのコピー動作を防ぐ
        setIsOrbitMode((prev) => !prev);
        console.log(`カメラモード切替: ${!isOrbitMode ? '自由カメラ' : '固定カメラ'}`);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOrbitMode]);

  return (
    <Canvas
      shadows 
      camera={{ 
        position: isOrbitMode ? [15, 15, 15] : FIXED_CAMERA_POSITION,
        fov: FIXED_CAMERA_FOV 
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <fog attach="fog" args={['#cce0ff', 5, 40]} />
      <color attach="background" args={['#cce0ff']} />

      <ambientLight intensity={0.4} />
      
      <directionalLight 
        position={[50, 50, 25]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
      </directionalLight>

      <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} />

      <Terrain seed={SEED} size={SIZE} segments={120} />
      <Vegetation seed={SEED} size={SIZE} />

      {/* 固定カメラモードの時はカメラの向きを制御 */}
      {!isOrbitMode && <FixedCameraController />}

      {/* 自由カメラモードの時だけOrbitControlsを有効化 */}
      {isOrbitMode && <OrbitControls autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2.1} />}
    </Canvas>
  );
}

export default App;