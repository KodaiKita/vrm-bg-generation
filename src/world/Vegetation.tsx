import { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { createNoise2D } from './noise';
import { generatePoissonDisk } from './poissonDisk';
import type { NoiseConfig, VegetationConfig } from '../presets';

// プロシージャル木コンポーネント
const ProceduralTree = ({ position, config }: { 
  position: [number, number, number];
  config: VegetationConfig['treeModel'];
}) => {
  const { trunk, foliage } = config;
  
  if (!trunk || !foliage) return null;

  return (
    <group position={position}>
      {/* 幹 */}
      <mesh position={[0, trunk.height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[trunk.radiusTop, trunk.radiusBottom, trunk.height, 6]} />
        <meshStandardMaterial color={trunk.color} />
      </mesh>

      {/* 葉（複数レイヤー） */}
      {foliage.map((layer, index) => (
        <mesh key={index} position={layer.position} castShadow receiveShadow>
          <coneGeometry args={[layer.radius, layer.height, 6]} />
          <meshStandardMaterial color={layer.color} />
        </mesh>
      ))}
    </group>
  );
};

// GLTFモデル木コンポーネント
const GLTFTree = ({ position, modelPath, scale = 1 }: { 
  position: [number, number, number];
  modelPath: string;
  scale?: number;
}) => {
  try {
    const { scene } = useGLTF(modelPath);
    
    return (
      <primitive 
        object={scene.clone()} 
        position={position} 
        scale={[scale, scale, scale]}
        castShadow
        receiveShadow
      />
    );
  } catch (error) {
    // モデルが読み込めない場合はスキップ
    console.warn(`Failed to load GLTF model: ${modelPath}`, error);
    return null;
  }
};

interface VegetationProps {
  seed: number;
  size: number;
  noiseConfig: NoiseConfig;
  vegetationConfig: VegetationConfig;
}

function Vegetation({ seed, size, noiseConfig, vegetationConfig }: VegetationProps) {
  const trees = useMemo(() => {
    if (!vegetationConfig.enabled) return [];

    const noise = createNoise2D(seed);
    const points = generatePoissonDisk({
      width: size,
      height: size,
      minDistance: vegetationConfig.minDistance,
      seed: seed + 100
    });

    const { frequency, amplitude, octaves, persistence, lacunarity } = noiseConfig;

    return points.map(point => {
      const x = point.x - size / 2;
      const z = point.y - size / 2;
      // 地形と同じノイズパラメータを使用（高さ同期）
      const y = noise.fbm2D(x * frequency, z * frequency, octaves, persistence, lacunarity) * amplitude;
      return { x, y, z };
    }).filter(tree => tree.y > vegetationConfig.waterThreshold);
  }, [seed, size, noiseConfig, vegetationConfig]);

  if (!vegetationConfig.enabled || trees.length === 0) {
    return null;
  }

  const { treeModel } = vegetationConfig;

  // GLTFモデルを使用する場合
  if (treeModel.useGLTF && treeModel.modelPath) {
    return (
      <Suspense fallback={null}>
        <group>
          {trees.map((tree, index) => (
            <GLTFTree
              key={index}
              position={[tree.x, tree.y, tree.z]}
              modelPath={treeModel.modelPath!}
              scale={treeModel.scale}
            />
          ))}
        </group>
      </Suspense>
    );
  }

  // プロシージャル生成を使用する場合
  return (
    <group>
      {trees.map((tree, index) => (
        <ProceduralTree
          key={index}
          position={[tree.x, tree.y, tree.z]}
          config={treeModel}
        />
      ))}
    </group>
  );
}

export default Vegetation;