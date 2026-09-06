// Obstacle-avoiding orthogonal router
// Sparse-grid A* with turn penalty so paths prefer few corners

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };

function segmentBlocked(a: Point, b: Point, obstacles: Rect[], pad: number) {
  for (const r of obstacles) {
    const x1 = r.x - pad;
    const y1 = r.y - pad;
    const x2 = r.x + r.w + pad;
    const y2 = r.y + r.h + pad;
    if (a.y === b.y) {
      const y = a.y;
      if (y <= y1 || y >= y2) continue;
      const lo = Math.min(a.x, b.x);
      const hi = Math.max(a.x, b.x);
      if (hi <= x1 || lo >= x2) continue;
      return true;
    } else {
      const x = a.x;
      if (x <= x1 || x >= x2) continue;
      const lo = Math.min(a.y, b.y);
      const hi = Math.max(a.y, b.y);
      if (hi <= y1 || lo >= y2) continue;
      return true;
    }
  }
  return false;
}

function buildAxes(start: Point, end: Point, obstacles: Rect[], pad: number) {
  const xs = new Set<number>([start.x, end.x]);
  const ys = new Set<number>([start.y, end.y]);
  for (const r of obstacles) {
    xs.add(r.x - pad);
    xs.add(r.x + r.w + pad);
    ys.add(r.y - pad);
    ys.add(r.y + r.h + pad);
  }
  return {
    xs: [...xs].sort((a, b) => a - b),
    ys: [...ys].sort((a, b) => a - b),
  };
}

export function routeOrthogonal(start: Point, end: Point, obstacles: Rect[], pad = 20): Point[] {
  const { xs, ys } = buildAxes(start, end, obstacles, pad);
  const xi = new Map<number, number>();
  const yi = new Map<number, number>();
  xs.forEach((v, i) => xi.set(v, i));
  ys.forEach((v, i) => yi.set(v, i));

  const sIx = xi.get(start.x)!;
  const sIy = yi.get(start.y)!;
  const eIx = xi.get(end.x)!;
  const eIy = yi.get(end.y)!;

  const key = (ix: number, iy: number) => ix * 10000 + iy;
  const startK = key(sIx, sIy);
  const endK = key(eIx, eIy);

  type AStarNode = { ix: number; iy: number; g: number; f: number; dir: 0 | 1 | 2 };
  const open = new Map<number, AStarNode>();
  const came = new Map<number, number>();
  const closed = new Set<number>();
  open.set(startK, {
    ix: sIx,
    iy: sIy,
    g: 0,
    f: Math.abs(end.x - start.x) + Math.abs(end.y - start.y),
    dir: 0,
  });

  const TURN = 25;

  while (open.size) {
    let curK = -1;
    let cur: AStarNode | null = null;
    for (const [k, v] of open) {
      if (!cur || v.f < cur.f) {
        cur = v;
        curK = k;
      }
    }
    if (!cur) break;
    if (curK === endK) {
      const out: Point[] = [];
      let k: number | undefined = curK;
      while (k !== undefined) {
        const ix = Math.floor(k / 10000);
        const iy = k - ix * 10000;
        out.push({ x: xs[ix], y: ys[iy] });
        k = came.get(k);
      }
      return simplify(out.reverse());
    }
    open.delete(curK);
    closed.add(curK);

    const moves: Array<[number, number, 1 | 2]> = [
      [-1, 0, 1],
      [1, 0, 1],
      [0, -1, 2],
      [0, 1, 2],
    ];
    for (const [dx, dy, d] of moves) {
      const nx = cur.ix + dx;
      const ny = cur.iy + dy;
      if (nx < 0 || ny < 0 || nx >= xs.length || ny >= ys.length) continue;
      const nk = key(nx, ny);
      if (closed.has(nk)) continue;
      const a = { x: xs[cur.ix], y: ys[cur.iy] };
      const b = { x: xs[nx], y: ys[ny] };
      if (segmentBlocked(a, b, obstacles, pad - 1)) continue;
      const turnPenalty = cur.dir !== 0 && cur.dir !== d ? TURN : 0;
      const g = cur.g + Math.abs(b.x - a.x) + Math.abs(b.y - a.y) + turnPenalty;
      const h = Math.abs(end.x - b.x) + Math.abs(end.y - b.y);
      const f = g + h;
      const existing = open.get(nk);
      if (!existing || g < existing.g) {
        open.set(nk, { ix: nx, iy: ny, g, f, dir: d });
        came.set(nk, curK);
      }
    }
  }
  // fallback: simple L path
  return [start, { x: end.x, y: start.y }, end];
}

function simplify(pts: Point[]): Point[] {
  if (pts.length < 3) return pts;
  const out: Point[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = out[out.length - 1];
    const b = pts[i];
    const c = pts[i + 1];
    const collinear = (a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y);
    if (!collinear) out.push(b);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export function polylineToRoundedPath(pts: Point[], radius = 8): string {
  if (pts.length === 0) return "";
  if (pts.length < 3) {
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const next = pts[i + 1];
    const v1x = Math.sign(cur.x - prev.x);
    const v1y = Math.sign(cur.y - prev.y);
    const v2x = Math.sign(next.x - cur.x);
    const v2y = Math.sign(next.y - cur.y);
    const len1 = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const len2 = Math.hypot(next.x - cur.x, next.y - cur.y);
    const r = Math.min(radius, len1 / 2, len2 / 2);
    const p1 = { x: cur.x - v1x * r, y: cur.y - v1y * r };
    const p2 = { x: cur.x + v2x * r, y: cur.y + v2y * r };
    d += ` L ${p1.x} ${p1.y} Q ${cur.x} ${cur.y} ${p2.x} ${p2.y}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}
