"use client"

import { memo, useState } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Database, GitBranch, Play, Sparkles, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

const handleClass =
  "!h-2.5 !w-2.5 !border-2 !border-background !bg-primary"

/** Trigger / entry node — a single source handle. */
export const TriggerNode = memo(function TriggerNode({ data, selected }: NodeProps) {
  const label = (data as { label?: string }).label ?? "Trigger"
  return (
    <div
      className={cn(
        "min-w-[180px] rounded-lg border bg-card px-4 py-3 shadow-sm transition-shadow",
        selected ? "border-primary shadow-md ring-1 ring-primary/40" : "border-border",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Play className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold leading-none text-card-foreground">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">Starts the flow</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className={handleClass} />
    </div>
  )
})

const iconMap = { database: Database, branch: GitBranch, terminal: Terminal } as const

/** Process node — target + source handles, an icon and a subtitle. */
export const ProcessNode = memo(function ProcessNode({ data, selected }: NodeProps) {
  const d = data as { label?: string; subtitle?: string; icon?: keyof typeof iconMap }
  const Icon = iconMap[d.icon ?? "terminal"]
  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border bg-card px-4 py-3 shadow-sm transition-shadow",
        selected ? "border-primary shadow-md ring-1 ring-primary/40" : "border-border",
      )}
    >
      <Handle type="target" position={Position.Left} className={handleClass} />
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold leading-none text-card-foreground">{d.label ?? "Process"}</p>
          {d.subtitle ? <p className="mt-1 text-xs text-muted-foreground">{d.subtitle}</p> : null}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className={handleClass} />
    </div>
  )
})

/** Editable node — demonstrates interactive content inside a node. */
export const TextInputNode = memo(function TextInputNode({ data, selected }: NodeProps) {
  const [value, setValue] = useState((data as { value?: string }).value ?? "")
  return (
    <div
      className={cn(
        "min-w-[220px] rounded-lg border bg-card p-3 shadow-sm transition-shadow",
        selected ? "border-primary shadow-md ring-1 ring-primary/40" : "border-border",
      )}
    >
      <Handle type="target" position={Position.Left} className={handleClass} />
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Prompt
      </label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a message…"
        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      />
      <Handle type="source" position={Position.Right} className={handleClass} />
    </div>
  )
})

/** Output node — a single target handle. */
export const OutputNode = memo(function OutputNode({ data, selected }: NodeProps) {
  const label = (data as { label?: string }).label ?? "Output"
  return (
    <div
      className={cn(
        "min-w-[160px] rounded-lg border bg-primary px-4 py-3 text-primary-foreground shadow-sm transition-shadow",
        selected ? "shadow-md ring-2 ring-primary/40" : "",
      )}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-2 !border-primary !bg-background" />
      <p className="text-sm font-semibold leading-none">{label}</p>
      <p className="mt-1 text-xs opacity-80">Returns the result</p>
    </div>
  )
})

export const nodeTypes = {
  trigger: TriggerNode,
  process: ProcessNode,
  textInput: TextInputNode,
  output: OutputNode,
}
