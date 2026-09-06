"use client";

import { useStore, Position, type EdgeProps } from "@xyflow/react";
import { Point, Rect, polylineToRoundedPath, routeOrthogonal } from "@/lib/smart-router";

function exitPoint(x: number, y: number, pos?: Position): Point {
  const off = 14;
  switch (pos) {
    case Position.Left:
      return { x: x - off, y };
    case Position.Right:
      return { x: x + off, y };
    case Position.Top:
      return { x, y: y - off };
    case Position.Bottom:
      return { x, y: y + off };
    default:
      return { x: x + off, y };
  }
}

export function SmartEdge({
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  style,
}: EdgeProps) {
  const obstacles = useStore((store) => {
    const out: Rect[] = [];
    store.nodeLookup.forEach((n) => {
      if (n.id === source || n.id === target) return;
      const w = n.measured?.width ?? n.width ?? 180;
      const h = n.measured?.height ?? n.height ?? 60;
      const x = n.internals?.positionAbsolute?.x ?? n.position?.x ?? 0;
      const y = n.internals?.positionAbsolute?.y ?? n.position?.y ?? 0;
      out.push({
        x,
        y,
        w,
        h,
      });
    });
    return out;
  });

  const s = exitPoint(sourceX, sourceY, sourcePosition);
  const t = exitPoint(targetX, targetY, targetPosition);

  const pts = routeOrthogonal(s, t, obstacles, 18);
  const full: Point[] = [{ x: sourceX, y: sourceY }, ...pts, { x: targetX, y: targetY }];
  const d = polylineToRoundedPath(full, 10);

  const stroke = (style as React.CSSProperties)?.stroke ?? "hsl(var(--primary))";
  const strokeWidth = Number((style as React.CSSProperties)?.strokeWidth ?? 1.75);
  const w = strokeWidth + (selected ? 0.75 : 0);

  return (
    <>
      {/* Soft glow underlay */}
      <path
        d={d}
        fill="none"
        stroke={stroke as string}
        strokeWidth={w + 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={selected ? 0.35 : 0.12}
        style={{ filter: "blur(3px)" }}
      />
      {/* Solid path */}
      <path
        d={d}
        fill="none"
        stroke={stroke as string}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={selected ? 1 : 0.9}
        className="react-flow__edge-path"
      />
      {/* Animated dash overlay */}
      <path
        d={d}
        fill="none"
        stroke={stroke as string}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2 10"
        opacity={selected ? 0.9 : 0.55}
        className="edge-animated"
      />
      {/* Invisible broad hit target */}
      <path d={d} fill="none" stroke="transparent" strokeWidth={20} />
    </>
  );
}
