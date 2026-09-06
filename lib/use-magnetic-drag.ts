"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Node } from "@xyflow/react";

export type MagneticOptions = {
  gap?: number;
  step?: number;
  passes?: number;
  fallbackSize?: { w: number; h: number };
};

function box(n: Node, fallback: { w: number; h: number }) {
  return {
    x: n.position.x,
    y: n.position.y,
    w: n.measured?.width ?? n.width ?? fallback.w,
    h: n.measured?.height ?? n.height ?? fallback.h,
  };
}

export function computeRepulsion(
  nodes: Node[],
  dragId: string,
  options: MagneticOptions = {},
) {
  const { gap = 20, step = 4, fallbackSize = { w: 140, h: 80 } } = options;
  const drag = nodes.find((n) => n.id === dragId);
  if (!drag) return new Map<string, { x: number; y: number }>();

  const d = box(drag, fallbackSize);
  const out = new Map<string, { x: number; y: number }>();

  nodes
    .filter((n) => n.id !== dragId && !n.dragging)
    .forEach((n) => {
      const r = box(n, fallbackSize);
      const ox = (d.w + r.w) / 2 + gap - Math.abs(d.x + d.w / 2 - (r.x + r.w / 2));
      const oy = (d.h + r.h) / 2 + gap - Math.abs(d.y + d.h / 2 - (r.y + r.h / 2));

      if (ox > 0 && oy > 0) {
        const x = r.x + (ox < oy ? (r.x >= d.x ? ox : -ox) : 0);
        const y = r.y + (oy <= ox ? (r.y >= d.y ? oy : -oy) : 0);

        if (
          Math.abs(x - n.position.x) >= step ||
          Math.abs(y - n.position.y) >= step
        ) {
          out.set(n.id, { x: Math.round(x), y: Math.round(y) });
        }
      }
    });

  return out;
}

export function useMagneticDrag(
  setNodes: (updater: (nodes: Node[]) => Node[]) => void,
  options: MagneticOptions = {},
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const dragId = useRef<string | null>(null);
  const frame = useRef<number | null>(null);

  const onNodeDragStart = useCallback((_: unknown, node: Node) => {
    dragId.current = node.id;
    hostRef.current?.classList.add("magnetic-repelling");
  }, []);

  const onNodeDrag = useCallback(
    (_: unknown, node: Node) => {
      if (!node) return;
      dragId.current = node.id;
      if (frame.current !== null) return;

      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        setNodes((nodes) => {
          const liveNodes = nodes.map((n) => (n.id === node.id ? node : n));
          const moves = computeRepulsion(liveNodes, node.id, options);
          if (moves.size === 0) return nodes;
          return nodes.map((n) =>
            moves.has(n.id) ? { ...n, position: moves.get(n.id)! } : n,
          );
        });
      });
    },
    [options, setNodes],
  );

  const onNodeDragStop = useCallback(() => {
    dragId.current = null;
    hostRef.current?.classList.remove("magnetic-repelling");
  }, []);

  useEffect(() => {
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return { hostRef, onNodeDragStart, onNodeDrag, onNodeDragStop };
}
