/**
 * 2D Simplex Noise implementation
 * Based on Stefan Gustavson's original Simplex Noise algorithm
 */

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

class SimplexNoise {
  private perm: number[] = [];
  private permMod12: number[] = [];

  private static readonly GRAD3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
  ];

  private static readonly F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  private static readonly G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

  constructor(seed: number = 0) {
    const p: number[] = [];
    const rng = new SeededRandom(seed);

    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }

    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  private dot(g: number[], x: number, y: number): number {
    return g[0] * x + g[1] * y;
  }

  noise2D(xin: number, yin: number): number {
    let n0, n1, n2;

    const s = (xin + yin) * SimplexNoise.F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);

    const t = (i + j) * SimplexNoise.G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    const x1 = x0 - i1 + SimplexNoise.G2;
    const y1 = y0 - j1 + SimplexNoise.G2;
    const x2 = x0 - 1.0 + 2.0 * SimplexNoise.G2;
    const y2 = y0 - 1.0 + 2.0 * SimplexNoise.G2;

    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.permMod12[ii + this.perm[jj]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
    const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) {
      n0 = 0.0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(SimplexNoise.GRAD3[gi0], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) {
      n1 = 0.0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(SimplexNoise.GRAD3[gi1], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) {
      n2 = 0.0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(SimplexNoise.GRAD3[gi2], x2, y2);
    }

    return 70.0 * (n0 + n1 + n2);
  }
}

/**
 * FBM (Fractional Brownian Motion) - 多重オクターブノイズ
 * 複数の異なる周波数（大きさ）のノイズを重ね合わせて、複雑な地形を作ります
 */
export function createNoise2D(seed: number) {
  const simplex = new SimplexNoise(seed);

  return {
    noise2D: (x: number, y: number): number => {
      return simplex.noise2D(x, y);
    },

    fbm2D: (
      x: number,
      y: number,
      octaves: number = 4,      // 波を重ねる回数（多いほど細かくなる）
      persistence: number = 0.5, // 重ねるごとに波の高さをどれくらい減らすか
      lacunarity: number = 2.0   // 重ねるごとに波の細かさをどれくらい増やすか
    ): number => {
      let total = 0;
      let frequency = 1;
      let amplitude = 1;
      let maxValue = 0;  // 正規化（値を0〜1の範囲に整える）用

      for (let i = 0; i < octaves; i++) {
        // ノイズを加算
        total += simplex.noise2D(x * frequency, y * frequency) * amplitude;
        
        maxValue += amplitude;
        
        // 次の波の設定を更新
        amplitude *= persistence; // 振幅（高さ）は減らす（例: 半分にする）
        frequency *= lacunarity;  // 周波数（細かさ）は増やす（例: 倍にする）
      }

      // 最後に合計値を割って、結果がおおよそ -1 〜 1 の範囲に収まるようにする
      return total / maxValue;
    },
  };
}