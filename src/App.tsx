import { useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import Terrain from './world/Terrain';
import Vegetation from './world/Vegetation';
import PresetSelector from './components/PresetSelector';
import { PRESETS } from './presets';

// ========================================
// デフォルト設定
// ========================================
const DEFAULT_SEED = 123;

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
  const SIZE = 30;
  
  // URLパラメータからseedを取得（なければデフォルト値）
  const getInitialSeed = () => {
    const params = new URLSearchParams(window.location.search);
    const urlSeed = params.get('seed');
    if (urlSeed) {
      const parsed = parseInt(urlSeed, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    return DEFAULT_SEED;
  };

  const [seed, setSeed] = useState(getInitialSeed);
  const [currentPreset, setCurrentPreset] = useState('mountain');
  const [isOrbitMode, setIsOrbitMode] = useState(false);

  const preset = PRESETS[currentPreset];

  // seedが変更されたらURLを更新
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('seed', seed.toString());
    window.history.replaceState({}, '', url.toString());
  }, [seed]);

  // Ctrl+C でカメラモードをトグル
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'c') {
        event.preventDefault();
        setIsOrbitMode((prev) => !prev);
        console.log(`カメラモード切替: ${!isOrbitMode ? '自由カメラ' : '固定カメラ'}`);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOrbitMode]);

  return (
    <>
      <PresetSelector 
        currentPreset={currentPreset}
        onPresetChange={setCurrentPreset}
        cameraMode={isOrbitMode ? 'orbit' : 'fixed'}
        seed={seed}
        onSeedChange={setSeed}
        defaultSeed={DEFAULT_SEED}
      />
      
      <Canvas
        shadows 
        camera={{ 
          position: isOrbitMode ? [15, 15, 15] : FIXED_CAMERA_POSITION,
          fov: FIXED_CAMERA_FOV 
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <fog attach="fog" args={[preset.atmosphere.fogColor, preset.atmosphere.fogNear, preset.atmosphere.fogFar]} />
        <color attach="background" args={[preset.atmosphere.backgroundColor]} />

        <ambientLight intensity={0.4} />
        
        <directionalLight 
          position={[50, 50, 25]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        >
          <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
        </directionalLight>

        <Sky 
          sunPosition={preset.atmosphere.sunPosition} 
          turbidity={preset.atmosphere.skyTurbidity} 
          rayleigh={preset.atmosphere.skyRayleigh} 
        />

        <Terrain 
          seed={seed} 
          size={SIZE} 
          segments={120}
          noiseConfig={preset.noise}
          terrainConfig={preset.terrain}
        />
        
        <Vegetation 
          seed={seed} 
          size={SIZE}
          noiseConfig={preset.noise}
          vegetationConfig={preset.vegetation}
        />

        {!isOrbitMode && <FixedCameraController />}
        {isOrbitMode && <OrbitControls autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2.1} />}
      </Canvas>
    </>
  );
}

export default App;