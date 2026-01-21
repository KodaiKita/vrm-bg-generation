import { useMemo } from 'react';
import { PlaneGeometry } from 'three';
import { createNoise2D } from './noise';

interface TerrainProps {
  seed?: number;     // 地形の形を決める種
  size?: number;     // 地形の広さ
  segments?: number; // 分割数（多いほど滑らかだが重くなる）
}

function Terrain({ seed = 123, size = 20, segments = 50 }: TerrainProps) { // ← segmentsを100くらいに増やすとより綺麗です！
  const geometry = useMemo(() => {
    const noise = createNoise2D(seed);
    const geo = new PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position.array as Float32Array;
    const vertexCount = positions.length / 3;

    for (let i = 0; i < vertexCount; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];

      // fbm2D(座標x, 座標z, 重ね合わせ回数, 減衰率, 周波数倍率)
      // 結果(-1.0 〜 1.0) に高さを掛けて強調します
      let height = noise.fbm2D(x * 0.1, z * 0.1, 4, 0.5, 2.0) * 4.0;

      // オプション: マイクラっぽい平原を作る工夫
      // 「高さが0より低い場所（谷）」を平らにする処理を入れると、水面っぽくなります
      // if (height < 0) height = height * 0.2; 

      positions[i * 3 + 1] = height;
    }

    geo.computeVertexNormals();
    return geo;
  }, [seed, size, segments]);

  return (
    <mesh geometry={geometry}>
      {/* 見やすくするために wireframe はそのままで */}
      <meshStandardMaterial color="#44ff88" wireframe />
    </mesh>
  );
}

export default Terrain;