import { useMemo } from 'react';
import { PlaneGeometry, Color, Float32BufferAttribute } from 'three'; // Color, Float32BufferAttribute を追加
import { createNoise2D } from './noise';

interface TerrainProps {
  seed?: number;
  size?: number;
  segments?: number;
}

function Terrain({ seed = 123, size = 20, segments = 50 }: TerrainProps) {
  const geometry = useMemo(() => {
    const noise = createNoise2D(seed);
    const geo = new PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position.array as Float32Array;
    const vertexCount = positions.length / 3;

    // ★ 色のデータを格納する配列を準備（RGBの3つ × 頂点数）
    const colors = new Float32Array(vertexCount * 3);
    const colorObj = new Color(); // 計算用のColorオブジェクト

    for (let i = 0; i < vertexCount; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];

      // 高さ計算（前回と同じ）
      let height = noise.fbm2D(x * 0.1, z * 0.1, 4, 0.5, 2.0) * 4.0;
      positions[i * 3 + 1] = height;

      // ★ 高さ（height）に応じて色を決めるロジック
      if (height < -0.5) {
        // 水辺（深い青）
        colorObj.set('#1a4d8c'); 
      } else if (height < 1.0) {
        // 草原（緑）
        colorObj.set('#4a8c2a');
      } else if (height < 2.5) {
        // 岩肌（茶色）
        colorObj.set('#8c6b4a');
      } else {
        // 雪山（白）
        colorObj.set('#ffffff');
      }

      // 決定した色を配列にセット
      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;
    }

    geo.computeVertexNormals();
    
    // ★ ジオメトリに「color」属性として登録
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3));

    return geo;
  }, [seed, size, segments]);

  return (
    <mesh geometry={geometry} receiveShadow>
      {/* vertexColors: true にすると、自分で作った color 属性を使ってくれます 
        wireframe: false にして、面を塗ります
        roughness: 1.0 (テカテカしない)
      */}
      <meshStandardMaterial vertexColors roughness={0.8} />
    </mesh>
  );
}

export default Terrain;