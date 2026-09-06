import type { Node, Edge } from "@xyflow/react";

export type LayoutOptions = {
  nodeWidth?: number;
  nodeHeight?: number;
  colGap?: number;
  rowGap?: number;
};

export function hierarchicalLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {},
): Node[] {
  const {
    nodeWidth = 200,
    nodeHeight = 80,
    colGap = 100,
    rowGap = 30,
  } = options;

  const inDeg = new Map<string, number>();
  const children = new Map<string, string[]>();

  nodes.forEach((n) => {
    inDeg.set(n.id, 0);
    children.set(n.id, []);
  });

  edges.forEach((e) => {
    if (!inDeg.has(e.target) || !children.has(e.source)) return;
    inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
    children.get(e.source)!.push(e.target);
  });

  // Kahn-style longest-path layering
  const layer = new Map<string, number>();
  const queue: string[] = [];

  inDeg.forEach((d, id) => {
    if (d === 0) {
      layer.set(id, 0);
      queue.push(id);
    }
  });

  const localIn = new Map(inDeg);
  while (queue.length) {
    const id = queue.shift()!;
    const lv = layer.get(id) ?? 0;
    for (const c of children.get(id) ?? []) {
      layer.set(c, Math.max(layer.get(c) ?? 0, lv + 1));
      localIn.set(c, (localIn.get(c) ?? 0) - 1);
      if (localIn.get(c) === 0) queue.push(c);
    }
  }

  const byLayer = new Map<number, string[]>();
  nodes.forEach((n) => {
    const l = layer.get(n.id) ?? 0;
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(n.id);
  });

  const positions = new Map<string, { x: number; y: number }>();
  [...byLayer.keys()]
    .sort((a, b) => a - b)
    .forEach((l) => {
      const ids = byLayer.get(l)!;
      const colX = l * (nodeWidth + colGap);
      const totalH = ids.length * nodeHeight + (ids.length - 1) * rowGap;
      const startY = -totalH / 2;
      ids.forEach((id, i) => {
        positions.set(id, { x: colX, y: startY + i * (nodeHeight + rowGap) });
      });
    });

  return nodes.map((n) => ({
    ...n,
    position: positions.get(n.id) ?? n.position,
  }));
}
