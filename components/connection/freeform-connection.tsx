"use client";

import { useEffect, useRef, useState } from "react";
import type { ConnectionLineComponentProps } from "@xyflow/react";

type Point = { x: number; y: number };

export function FreeformConnection({ fromX, fromY, toX, toY }: ConnectionLineComponentProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const spaceRef = useRef(false);

  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceRef.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceRef.current = false;
    };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    if (spaceRef.current) {
      setPoints((p) => [...p, { x: toX, y: toY }]);
    }
  }, [toX, toY]);

  const isFreeform = points.length > 2;
  const path = isFreeform
    ? `M ${fromX} ${fromY} ${points.map((p) => `L ${p.x} ${p.y}`).join(" ")}`
    : `M ${fromX} ${fromY} C ${(fromX + toX) / 2} ${fromY}, ${(fromX + toX) / 2} ${toY}, ${toX} ${toY}`;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeDasharray={isFreeform ? undefined : "5 5"}
        opacity={0.9}
      />
      <circle cx={toX} cy={toY} r={5} fill="hsl(var(--primary))" />
    </g>
  );
}
