import { useMemo } from 'react';
import { PlaneGeometry, Color, Float32BufferAttribute } from 'three';
import { createNoise2D } from './noise';
import type { NoiseConfig, TerrainConfig } from '../presets';

interface TerrainProps {
  seed?: number;
  size?: number;
  segments?: number;
  noiseConfig: NoiseConfig;
  terrainConfig: TerrainConfig;
}

function Terrain({ 
  seed = 123, 
  size = 20, 
  segments = 50,
  noiseConfig,
  terrainConfig
}: TerrainProps) {
  const geometry = useMemo(() => {
    const noise = createNoise2D(seed);
    const geo = new PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position.array as Float32Array;
    const vertexCount = positions.length / 3;

    const colors = new Float32Array(vertexCount * 3);
    const colorObj = new Color();

    const { frequency, amplitude, octaves, persistence, lacunarity } = noiseConfig;
    const { colorScheme } = terrainConfig;

    for (let i = 0; i < vertexCount; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];

      // プリセットのノイズパラメータを使用
      let height = noise.fbm2D(x * frequency, z * frequency, octaves, persistence, lacunarity) * amplitude;
      positions[i * 3 + 1] = height;

      // プリセットのカラースキームを使用
      let colorIndex = colorScheme.colors.length - 1;
      for (let j = 0; j < colorScheme.thresholds.length; j++) {
        if (height < colorScheme.thresholds[j]) {
          colorIndex = j;
          break;
        }
      }
      colorObj.set(colorScheme.colors[colorIndex]);

      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;
    }

    geo.computeVertexNormals();
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3));

    return geo;
  }, [seed, size, segments, noiseConfig, terrainConfig]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={terrainConfig.materialRoughness} />
    </mesh>
  );
}

export default Terrain;