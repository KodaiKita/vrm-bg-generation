import { useMemo } from 'react';
import { createNoise2D } from './noise';
import { generatePoissonDisk } from './poissonDisk';

// 1本の木を描画するコンポーネント
// positionを受け取って、その場所に木を描画します
const Tree = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* 幹 (茶色の円柱) */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.08, 1.2, 6]} />
        <meshStandardMaterial color="#5c4033" />
      </mesh>

      {/* 葉 (緑の円錐) - 2段重ねて可愛くする */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.4, 0.8, 6]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.3, 0.6, 6]} />
        <meshStandardMaterial color="#4a8c2a" />
      </mesh>
    </group>
  );
};

interface VegetationProps {
  seed: number;
  size: number;
}

function Vegetation({ seed, size }: VegetationProps) {
  const trees = useMemo(() => {
    const noise = createNoise2D(seed);
    const points = generatePoissonDisk({
      width: size,
      height: size,
      minDistance: 2.0, // 少し詰め気味に
      seed: seed + 100
    });

    return points.map(point => {
      const x = point.x - size / 2;
      const z = point.y - size / 2;
      const y = noise.fbm2D(x * 0.1, z * 0.1, 4, 0.5, 2.0) * 4.0;
      return { x, y, z };
    }).filter(tree => tree.y > 0.0); // 水没しないようにフィルタリング
  }, [seed, size]);

  return (
    <group>
      {trees.map((tree, index) => (
        // 作成した Tree コンポーネントを使用
        <Tree key={index} position={[tree.x, tree.y, tree.z]} />
      ))}
    </group>
  );
}

export default Vegetation;