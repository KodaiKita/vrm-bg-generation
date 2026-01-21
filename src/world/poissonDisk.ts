/**
 * Poisson Disk Sampling
 * お互いに minDistance 以上の距離を保ちながら、ランダムに点を配置するアルゴリズム
 */

class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

export interface Point2D { x: number; y: number; }

interface PoissonOptions {
  width: number;
  height: number;
  minDistance: number; // これが「最小距離」
  maxAttempts?: number;
  seed?: number;
}

export function generatePoissonDisk({
  width,
  height,
  minDistance,
  maxAttempts = 30,
  seed = 0,
}: PoissonOptions): Point2D[] {
  const rng = new SeededRandom(seed);
  const cellSize = minDistance / Math.sqrt(2);
  
  // グリッド計算用の準備
  const gridWidth = Math.ceil(width / cellSize);
  const gridHeight = Math.ceil(height / cellSize);
  const grid: (Point2D | null)[][] = Array.from({ length: gridWidth }, () =>
    Array(gridHeight).fill(null)
  );

  const points: Point2D[] = [];
  const activeList: Point2D[] = [];

  // 最初の1点をランダムに決める
  const firstPoint = {
    x: rng.next() * width,
    y: rng.next() * height,
  };
  
  // グリッドに登録
  const insertPoint = (p: Point2D) => {
    const gx = Math.floor(p.x / cellSize);
    const gy = Math.floor(p.y / cellSize);
    grid[gx][gy] = p;
    points.push(p);
    activeList.push(p);
  };

  insertPoint(firstPoint);

  // 点を増やしていくループ
  while (activeList.length > 0) {
    const randomIndex = Math.floor(rng.next() * activeList.length);
    const point = activeList[randomIndex];
    let found = false;

    for (let i = 0; i < maxAttempts; i++) {
      // 既存の点の周囲（minDistance 〜 2*minDistance）に新しい候補点を作る
      const angle = rng.next() * Math.PI * 2;
      const radius = minDistance + rng.next() * minDistance;
      const newPoint = {
        x: point.x + Math.cos(angle) * radius,
        y: point.y + Math.sin(angle) * radius,
      };

      // 範囲内か？ 他の点と近すぎないか？ をチェック
      if (
        newPoint.x >= 0 && newPoint.x < width &&
        newPoint.y >= 0 && newPoint.y < height
      ) {
        const gx = Math.floor(newPoint.x / cellSize);
        const gy = Math.floor(newPoint.y / cellSize);
        let tooClose = false;

        // 周囲のグリッドを確認
        for (let ix = Math.max(0, gx - 2); ix <= Math.min(gridWidth - 1, gx + 2); ix++) {
          for (let iy = Math.max(0, gy - 2); iy <= Math.min(gridHeight - 1, gy + 2); iy++) {
            const neighbor = grid[ix][iy];
            if (neighbor) {
              const dx = newPoint.x - neighbor.x;
              const dy = newPoint.y - neighbor.y;
              if (dx * dx + dy * dy < minDistance * minDistance) {
                tooClose = true;
                break;
              }
            }
          }
          if (tooClose) break;
        }

        if (!tooClose) {
          insertPoint(newPoint);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      activeList.splice(randomIndex, 1);
    }
  }

  return points;
}