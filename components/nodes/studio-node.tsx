"use client";

import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export type StudioNodeData = {
  label: string;
  kind?: "source" | "sink" | "process" | "active";
  sublabel?: string;
};

export type StudioNodeType = Node<StudioNodeData, "studio">;

const KIND_STYLES: Record<
  NonNullable<StudioNodeData["kind"]>,
  { dot: string; badge: string; ring: string, activeRing: string }
> = {
  source: {
    dot: "bg-primary",
    badge: "text-primary bg-primary/10 border-primary/20",
    ring: "border-primary/40",
    activeRing: "border-primary ring-2 ring-primary/30 shadow-md",
  },
  active: {
    dot: "bg-primary",
    badge: "text-primary bg-primary/10 border-primary/30",
    ring: "border-primary/50",
    activeRing: "border-primary ring-2 ring-primary/30 shadow-md",
  },
  process: {
    dot: "bg-emerald-500",
    badge: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    ring: "border-emerald-500/40",
    activeRing: "border-emerald-500 ring-2 ring-emerald-500/30 shadow-md",
  },
  sink: {
    dot: "bg-violet-500",
    badge: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    ring: "border-violet-500/40",
    activeRing: "border-violet-500 ring-2 ring-violet-500/30 shadow-md",
  },
};

function StudioNodeImpl({ data, selected }: NodeProps<StudioNodeType>) {
  const kind = data.kind ?? "process";
  const s = KIND_STYLES[kind];
  const isLive = kind === "active" || kind === "source";

  return (
    <div
      className={cn(
        "group relative min-w-[190px] rounded-xl border bg-card/95 px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-200",
        selected
          ? s.activeRing
          : s.ring,
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-primary"
      />

      <div className="mb-1.5 flex items-center gap-2">
        <span className="relative flex">
          <span className={cn("size-2 rounded-full", s.dot)} />
          {isLive && (
            <span
              className={cn("absolute inset-0 rounded-full pulse-ring", s.dot)}
            />
          )}
        </span>
        <span
          className={cn(
            "rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider",
            s.badge,
          )}
        >
          {data.sublabel ?? kind}
        </span>
      </div>
      <div className="text-sm font-semibold tracking-tight text-card-foreground">
        {data.label}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-primary"
      />
    </div>
  );
}

export const StudioNode = memo(StudioNodeImpl);
