/**
 * プリセットシステム - 地形・植生・雰囲気の設定を定義
 * 新しいプリセットを追加するには、PRESETS オブジェクトに新しいエントリを追加するだけです
 */

// ========================================
// 型定義
// ========================================

/**
 * ノイズ生成パラメータ
 * 地形と植生で共有され、高さの同期を保証します
 */
export interface NoiseConfig {
  frequency: number;      // ノイズの周波数スケール (低い = 大きな地形、高い = 細かい地形)
  amplitude: number;      // 高さの倍率 (地形の起伏の大きさ)
  octaves: number;        // ノイズレイヤーの数 (多い = より詳細)
  persistence: number;    // 各オクターブの振幅減衰 (高い = より粗い)
  lacunarity: number;     // 各オクターブの周波数倍率 (高い = より複雑)
}

/**
 * 地形の色設定
 */
export interface ColorScheme {
  thresholds: number[];   // 高さの閾値 (昇順)
  colors: string[];       // 各高さ範囲の色 (HEXカラー)
}

/**
 * 地形設定
 */
export interface TerrainConfig {
  colorScheme: ColorScheme;
  materialRoughness: number;  // マテリアルの粗さ (0=光沢, 1=マット)
}

/**
 * 木のモデル設定
 */
export interface TreeModelConfig {
  useGLTF: boolean;           // GLTFモデルを使用するか
  modelPath?: string;         // GLTFモデルのパス (useGLTF=true の場合)
  scale?: number;             // モデルのスケール
  // プロシージャル生成用のパラメータ (useGLTF=false の場合)
  trunk?: {
    radiusTop: number;
    radiusBottom: number;
    height: number;
    color: string;
  };
  foliage?: Array<{
    position: [number, number, number];
    radius: number;
    height: number;
    color: string;
  }>;
}

/**
 * 植生設定
 */
export interface VegetationConfig {
  enabled: boolean;           // 植生を表示するか
  minDistance: number;        // 木の最小間隔 (低い = 密集)
  waterThreshold: number;     // 水面の高さ (この高さ以下には木を配置しない)
  treeModel: TreeModelConfig;
}

/**
 * 雰囲気設定 (霧・空・ライティング)
 */
export interface AtmosphereConfig {
  fogColor: string;
  fogNear: number;
  fogFar: number;
  backgroundColor: string;
  sunPosition: [number, number, number];
  skyTurbidity: number;
  skyRayleigh: number;
}

/**
 * ワールドプリセット
 */
export interface WorldPreset {
  name: string;
  description: string;
  noise: NoiseConfig;         // 地形と植生で共有されるノイズ設定
  terrain: TerrainConfig;
  vegetation: VegetationConfig;
  atmosphere: AtmosphereConfig;
}

// ========================================
// プリセット定義
// ========================================

export const PRESETS: Record<string, WorldPreset> = {
  mountain: {
    name: '山岳地帯 (Mountain)',
    description: '険しい山と雪に覆われた峰',
    noise: {
      frequency: 0.1,
      amplitude: 4.0,
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2.0,
    },
    terrain: {
      colorScheme: {
        thresholds: [-0.5, 1.0, 2.5],
        colors: ['#1a4d8c', '#4a8c2a', '#8c6b4a', '#ffffff'],
      },
      materialRoughness: 0.8,
    },
    vegetation: {
      enabled: true,
      minDistance: 2.0,
      waterThreshold: 0.0,
      treeModel: {
        useGLTF: false,
        trunk: {
          radiusTop: 0.05,
          radiusBottom: 0.08,
          height: 1.2,
          color: '#5c4033',
        },
        foliage: [
          {
            position: [0, 1.0, 0],
            radius: 0.4,
            height: 0.8,
            color: '#2d5016',
          },
          {
            position: [0, 1.4, 0],
            radius: 0.3,
            height: 0.6,
            color: '#4a8c2a',
          },
        ],
      },
    },
    atmosphere: {
      fogColor: '#cce0ff',
      fogNear: 5,
      fogFar: 40,
      backgroundColor: '#cce0ff',
      sunPosition: [100, 20, 100],
      skyTurbidity: 0.5,
      skyRayleigh: 0.5,
    },
  },

  forest: {
    name: '深い森 (Forest)',
    description: '鬱蒼とした緑豊かな森林',
    noise: {
      frequency: 0.12,
      amplitude: 3.0,
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2.0,
    },
    terrain: {
      colorScheme: {
        thresholds: [-0.2, 0.8, 2.0],
        colors: ['#1a4d8c', '#2d5016', '#4a8c2a', '#6b8c4a'],
      },
      materialRoughness: 0.9,
    },
    vegetation: {
      enabled: true,
      minDistance: 1.5,  // より密集
      waterThreshold: -0.1,
      treeModel: {
        useGLTF: false,
        trunk: {
          radiusTop: 0.06,
          radiusBottom: 0.1,
          height: 1.5,
          color: '#4a3020',
        },
        foliage: [
          {
            position: [0, 1.2, 0],
            radius: 0.5,
            height: 1.0,
            color: '#1a4010',
          },
          {
            position: [0, 1.8, 0],
            radius: 0.4,
            height: 0.8,
            color: '#2d5016',
          },
        ],
      },
    },
    atmosphere: {
      fogColor: '#b8d4c8',
      fogNear: 3,
      fogFar: 30,
      backgroundColor: '#b8d4c8',
      sunPosition: [80, 30, 80],
      skyTurbidity: 1.0,
      skyRayleigh: 0.8,
    },
  },

  plains: {
    name: '草原 (Plains)',
    description: '広大で穏やかな平原',
    noise: {
      frequency: 0.15,
      amplitude: 1.5,
      octaves: 3,
      persistence: 0.4,
      lacunarity: 2.0,
    },
    terrain: {
      colorScheme: {
        thresholds: [-0.3, 0.3, 1.0],
        colors: ['#6b9bd4', '#7cb342', '#9ccc65', '#aed581'],
      },
      materialRoughness: 0.85,
    },
    vegetation: {
      enabled: true,
      minDistance: 3.5,  // 疎ら
      waterThreshold: -0.2,
      treeModel: {
        useGLTF: false,
        trunk: {
          radiusTop: 0.04,
          radiusBottom: 0.07,
          height: 1.0,
          color: '#6b5a3d',
        },
        foliage: [
          {
            position: [0, 0.9, 0],
            radius: 0.45,
            height: 0.7,
            color: '#7cb342',
          },
        ],
      },
    },
    atmosphere: {
      fogColor: '#e8f4f8',
      fogNear: 10,
      fogFar: 50,
      backgroundColor: '#e8f4f8',
      sunPosition: [100, 40, 80],
      skyTurbidity: 0.3,
      skyRayleigh: 0.4,
    },
  },

  // GLTFモデル使用例 (モデルがあれば有効化)
  // custom: {
  //   name: 'カスタム (Custom)',
  //   description: 'GLTFモデルを使用した地形',
  //   noise: {
  //     frequency: 0.1,
  //     amplitude: 4.0,
  //     octaves: 4,
  //     persistence: 0.5,
  //     lacunarity: 2.0,
  //   },
  //   terrain: {
  //     colorScheme: {
  //       thresholds: [-0.5, 1.0, 2.5],
  //       colors: ['#1a4d8c', '#4a8c2a', '#8c6b4a', '#ffffff'],
  //     },
  //     materialRoughness: 0.8,
  //   },
  //   vegetation: {
  //     enabled: true,
  //     minDistance: 2.5,
  //     waterThreshold: 0.0,
  //     treeModel: {
  //       useGLTF: true,
  //       modelPath: '/models/tree.glb',
  //       scale: 1.0,
  //     },
  //   },
  //   atmosphere: {
  //     fogColor: '#cce0ff',
  //     fogNear: 5,
  //     fogFar: 40,
  //     backgroundColor: '#cce0ff',
  //     sunPosition: [100, 20, 100],
  //     skyTurbidity: 0.5,
  //     skyRayleigh: 0.5,
  //   },
  // },
};

// プリセット名の配列（ドロップダウン用）
export const PRESET_KEYS = Object.keys(PRESETS);
