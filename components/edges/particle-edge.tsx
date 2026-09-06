"use client";

import { BaseEdge, getBezierPath, type Edge, type EdgeProps } from "@xyflow/react";

export type ParticleEdgeData = { speed?: number };
export type ParticleEdgeType = Edge<ParticleEdgeData, "particle">;

export function ParticleEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}: EdgeProps<ParticleEdgeType>) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const dur = `${(data?.speed ?? 2.4).toFixed(2)}s`;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{ stroke: "hsl(var(--primary))", strokeWidth: 1.5, opacity: 0.4 }}
      />
      <path
        d={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2.5}
        strokeDasharray="6 14"
        className="edge-animated"
        style={{ opacity: 0.9 }}
      />
      <circle r="4" fill="hsl(var(--primary))" filter="drop-shadow(0 0 6px hsl(var(--primary)))">
        <animateMotion dur={dur} repeatCount="indefinite" path={path} />
      </circle>
      <circle r="2.5" fill="hsl(var(--primary))" opacity="0.6">
        <animateMotion
          dur={dur}
          begin={`-${parseFloat(dur) / 3}s`}
          repeatCount="indefinite"
          path={path}
        />
      </circle>
      <circle r="2" fill="hsl(var(--primary))" opacity="0.4">
        <animateMotion
          dur={dur}
          begin={`-${(parseFloat(dur) * 2) / 3}s`}
          repeatCount="indefinite"
          path={path}
        />
      </circle>
    </>
  );
}
