"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useReactFlow, type Edge, type EdgeProps } from "@xyflow/react";

export type Point = { x: number; y: number };

export type EditableEdgeData = {
  points: Point[];
};

export type EditableEdgeType = Edge<EditableEdgeData, "editable">;

// Build a smooth Catmull-Rom-as-Bezier path through an ordered list of points.
export function smoothPath(pts: Point[]): string {
  if (pts.length < 2) return "";
  if (pts.length === 2) {
    const [a, b] = pts;
    const mx = (a.x + b.x) / 2;
    return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 0.18;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps<EditableEdgeType>) {
  const { setEdges, screenToFlowPosition } = useReactFlow();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [midPts, setMidPts] = useState<Point[]>([]);

  const waypoints = data?.points ?? [];
  const full: Point[] = [{ x: sourceX, y: sourceY }, ...waypoints, { x: targetX, y: targetY }];
  const path = smoothPath(full);
  const segCount = full.length - 1;

  useLayoutEffect(() => {
    if (!selected || !pathRef.current) return;
    const total = pathRef.current.getTotalLength();
    const out: Point[] = [];
    for (let i = 0; i < segCount; i++) {
      const p = pathRef.current.getPointAtLength((total * (i + 0.5)) / segCount);
      out.push({ x: p.x, y: p.y });
    }
    setMidPts(out);
  }, [path, selected, segCount]);

  const updatePoint = (idx: number, pt: Point) => {
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id !== id) return e;
        const pts = [...((e.data?.points as Point[] | undefined) ?? [])];
        pts[idx] = pt;
        return { ...e, data: { ...(e.data ?? {}), points: pts } };
      }),
    );
  };

  const insertPointAt = (clientX: number, clientY: number) => {
    const pt = screenToFlowPosition({ x: clientX, y: clientY });
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < full.length - 1; i++) {
      const a = full[i];
      const b = full[i + 1];
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const d = (mx - pt.x) ** 2 + (my - pt.y) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id !== id) return e;
        const pts = [...((e.data?.points as Point[] | undefined) ?? [])];
        pts.splice(best, 0, pt);
        return { ...e, data: { ...(e.data ?? {}), points: pts } };
      }),
    );
  };

  const onHandlePointerDown = (idx: number) => (e: React.PointerEvent<SVGCircleElement>) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    setActiveIdx(idx);
  };
  const onHandlePointerMove = (idx: number) => (e: React.PointerEvent<SVGCircleElement>) => {
    if (activeIdx !== idx) return;
    const pt = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    updatePoint(idx, pt);
  };
  const onHandlePointerUp = () => (e: React.PointerEvent<SVGCircleElement>) => {
    (e.target as Element).releasePointerCapture(e.pointerId);
    setActiveIdx(null);
  };

  return (
    <>
      {/* Visible curve */}
      <path
        ref={pathRef}
        d={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={selected ? 2.5 : 1.75}
        opacity={selected ? 1 : 0.85}
        strokeLinecap="round"
      />

      {/* Broad hit area */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={22}
        className="react-flow__edge-interaction"
        style={{ cursor: "pointer" }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          insertPointAt(e.clientX, e.clientY);
        }}
      />

      {selected && (
        <g style={{ pointerEvents: "all" }}>
          {/* Midpoint add hints */}
          {midPts.map((m, i) => (
            <circle
              key={`mid-${i}`}
              cx={m.x}
              cy={m.y}
              r={4}
              fill="hsl(var(--background))"
              stroke="hsl(var(--primary))"
              strokeWidth={1.5}
              opacity={0.65}
              style={{ cursor: "copy", pointerEvents: "all" }}
              onPointerDown={(e) => {
                e.stopPropagation();
                insertPointAt(e.clientX, e.clientY);
              }}
            />
          ))}

          {/* Draggable waypoint handles */}
          {waypoints.map((p, i) => {
            const isActive = activeIdx === i;
            return (
              <g key={`wp-${i}`}>
                {isActive && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={12}
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    style={{ pointerEvents: "none" }}
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 5 : 7}
                  fill={isActive ? "hsl(var(--primary))" : "hsl(var(--background))"}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  style={{ cursor: "grab", pointerEvents: "all" }}
                  onPointerDown={onHandlePointerDown(i)}
                  onPointerMove={onHandlePointerMove(i)}
                  onPointerUp={onHandlePointerUp()}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEdges((eds) =>
                      eds.map((edge) => {
                        if (edge.id !== id) return edge;
                        const pts = [...((edge.data?.points as Point[] | undefined) ?? [])];
                        pts.splice(i, 1);
                        return { ...edge, data: { ...(edge.data ?? {}), points: pts } };
                      }),
                    );
                  }}
                />
              </g>
            );
          })}
        </g>
      )}
    </>
  );
}
