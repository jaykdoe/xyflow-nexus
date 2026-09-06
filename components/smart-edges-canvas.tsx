"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  addEdge,
  Background,
  Controls,
  EdgeLabelRenderer,
  getBezierPath,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Connection,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  useEdgesState,
  useNodesState,
} from "@xyflow/react"
import {
  Circle,
  GitBranch,
  LayerArrowUp,
  Plus,
  RectangleHorizontal,
  RefreshCw,
  Sliders,
  Sparkles,
  Spline,
  Tangent,
  Triangle,
  Zap,
} from "lucide-react"
import {
  createSmartEdge,
  type SmartEdgePreset,
} from "@/app/smart-edges"

export type EdgePresetId = "bezier" | "simplebezier" | "step" | "smoothstep" | "straight"

interface PresetInfo {
  id: EdgePresetId
  label: string
  shortDesc: string
  algorithm: string
  pathStyle: string
  icon: React.ComponentType<{ className?: string }>
}

export const PRESETS: PresetInfo[] = [
  {
    id: "bezier",
    label: "Smart Bezier",
    shortDesc: "Diagonal A* with smooth quadratic bezier curve generation around obstacles.",
    algorithm: "A* Finder (Diagonal Allowed)",
    pathStyle: "Quadratic Bezier Curve",
    icon: Tangent,
  },
  {
    id: "simplebezier",
    label: "Smart Simple Bezier",
    shortDesc: "Diagonal A* with chained cubic bezier segments and handle orientation alignment.",
    algorithm: "A* Finder (Diagonal Allowed)",
    pathStyle: "Chained Cubic Bezier",
    icon: Spline,
  },
  {
    id: "step",
    label: "Smart Step",
    shortDesc: "Orthogonal jump point search generating crisp 90° right-angled turns.",
    algorithm: "Jump Point Search (Orthogonal)",
    pathStyle: "Orthogonal Step Lines",
    icon: GitBranch,
  },
  {
    id: "smoothstep",
    label: "Smart Smooth Step",
    shortDesc: "Orthogonal jump point search with rounded corner bends at each vertex.",
    algorithm: "Jump Point Search (Orthogonal)",
    pathStyle: "Rounded Orthogonal Steps",
    icon: GitBranch,
  },
  {
    id: "straight",
    label: "Smart Straight",
    shortDesc: "Diagonal A* with direct polyline segments between computed waypoints.",
    algorithm: "A* Finder (No Diagonal)",
    pathStyle: "Direct Polylines",
    icon: LayerArrowUp,
  },
]

const shapeStyles = {
  circle: "h-16 w-16 rounded-full",
  rectangle: "h-14 w-28 rounded-lg",
  parallelogram: "h-14 w-32 -skew-x-12 rounded-md",
  trapezoid: "h-14 w-32 [clip-path:polygon(12%_0,88%_0,100%_100%,0_100%)]",
  triangle: "h-0 w-0 border-x-[34px] border-b-[62px] border-x-transparent border-b-primary",
  obstacle: "h-20 w-36 rounded-xl border-dashed border-2 border-amber-500/80 bg-amber-500/15 backdrop-blur",
}

function ShapeNode({
  data,
}: NodeProps<
  Node<{ shape: keyof typeof shapeStyles; label: string; tone: string; isObstacle?: boolean }>
>) {
  const isTriangle = data.shape === "triangle"
  const isObstacle = data.isObstacle || data.shape === "obstacle"

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* 4-Way Handles (Top, Left, Right, Bottom) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-primary"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-primary"
      />

      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-primary"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-primary"
      />

      {/* Shape Body */}
      <div
        className={`${shapeStyles[data.shape]} flex items-center justify-center border border-border shadow-md transition-shadow hover:shadow-lg ${
          isTriangle ? "" : isObstacle ? "" : data.tone
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {isObstacle && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">
              Obstacle
            </span>
          )}
          <span
            className={`${
              isTriangle
                ? "absolute top-7 text-primary-foreground"
                : isObstacle
                ? "text-xs font-bold text-amber-400"
                : "text-white"
            } text-[11px] font-semibold`}
          >
            {data.label}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-primary"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-primary"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-primary"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-primary"
      />
    </div>
  )
}

const nodeTypes = { shape: ShapeNode }

const initialNodes: Node[] = [
  {
    id: "circle",
    type: "shape",
    position: { x: 60, y: 60 },
    data: { shape: "circle", label: "Start (A)", tone: "bg-primary" },
  },
  {
    id: "obstacle-1",
    type: "shape",
    position: { x: 260, y: 150 },
    data: { shape: "obstacle", label: "Drag Me", tone: "", isObstacle: true },
  },
  {
    id: "rectangle",
    type: "shape",
    position: { x: 500, y: 70 },
    data: { shape: "rectangle", label: "Processing", tone: "bg-slate-700 dark:bg-slate-600" },
  },
  {
    id: "parallelogram",
    type: "shape",
    position: { x: 260, y: 340 },
    data: { shape: "parallelogram", label: "Transform", tone: "bg-violet-600" },
  },
  {
    id: "trapezoid",
    type: "shape",
    position: { x: 540, y: 340 },
    data: { shape: "trapezoid", label: "Output", tone: "bg-cyan-600" },
  },
]

const initialEdges: Edge[] = [
  {
    id: "e-circle-rect",
    source: "circle",
    target: "rectangle",
    sourceHandle: "right-source",
    targetHandle: "left-target",
    type: "smart",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-circle-para",
    source: "circle",
    target: "parallelogram",
    sourceHandle: "bottom-source",
    targetHandle: "left-target",
    type: "smart",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-rect-trap",
    source: "rectangle",
    target: "trapezoid",
    sourceHandle: "bottom-source",
    targetHandle: "top-target",
    type: "smart",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-para-trap",
    source: "parallelogram",
    target: "trapezoid",
    sourceHandle: "right-source",
    targetHandle: "bottom-target",
    type: "smart",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
]

export interface SmartEdgesCanvasProps {
  initialEdgeType?: EdgePresetId
}

export function SmartEdgesCanvas({ initialEdgeType = "bezier" }: SmartEdgesCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedEdgeType, setSelectedEdgeType] = useState<EdgePresetId>(initialEdgeType)
  const [gridRatio, setGridRatio] = useState<number>(10)
  const [nodePadding, setNodePadding] = useState<number>(15)
  const [animatedEdges, setAnimatedEdges] = useState<boolean>(true)

  // Dynamically create the smart edge component based on current options
  const edgeTypes = useMemo(() => {
    return {
      smart: createSmartEdge(selectedEdgeType, {
        gridRatio,
        nodePadding,
      }),
    }
  }, [selectedEdgeType, gridRatio, nodePadding])

  const activePreset = useMemo(
    () => PRESETS.find((p) => p.id === selectedEdgeType) || PRESETS[0],
    [selectedEdgeType],
  )

  const handleSelectEdgeType = useCallback((id: EdgePresetId) => {
    setSelectedEdgeType(id)
  }, [])

  const resetGraph = useCallback(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [setEdges, setNodes])

  const addShape = useCallback(() => {
    const id = `shape-${nodes.length + 1}`
    const shapes: (keyof typeof shapeStyles)[] = ["rectangle", "parallelogram", "trapezoid", "circle"]
    const shape = shapes[nodes.length % shapes.length]
    setNodes((current) => [
      ...current,
      {
        id,
        type: "shape",
        position: {
          x: 180 + (nodes.length * 35) % 400,
          y: 120 + (nodes.length * 40) % 250,
        },
        data: { shape, label: `Node ${nodes.length + 1}`, tone: "bg-emerald-600" },
      },
    ])
  }, [nodes.length, setNodes])

  const addObstacle = useCallback(() => {
    const id = `obstacle-${nodes.length + 1}`
    setNodes((current) => [
      ...current,
      {
        id,
        type: "shape",
        position: { x: 340, y: 220 },
        data: { shape: "obstacle", label: "Obstacle Block", tone: "", isObstacle: true },
      },
    ])
  }, [nodes.length, setNodes])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            type: "smart",
            animated: animatedEdges,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          current,
        ),
      )
    },
    [animatedEdges, setEdges],
  )

  // Update animated prop on edges when toggled
  const renderedEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        animated: animatedEdges,
      })),
    [edges, animatedEdges],
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      {/* Sidebar Controls */}
      <aside className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div>
          <p className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Smart Edge Presets
          </p>
          <div className="mt-2.5 space-y-1.5">
            {PRESETS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectEdgeType(id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition ${
                  selectedEdgeType === id
                    ? "bg-primary/10 font-semibold text-primary ring-1 ring-primary/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pathfinder Parameters */}
        <div className="border-t border-border pt-4">
          <p className="flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <Sliders className="h-3.5 w-3.5 text-primary" /> Routing Tuning
          </p>

          <div className="mt-3 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Grid Granularity</span>
                <span className="font-mono text-[11px] font-semibold text-foreground">
                  {gridRatio}px
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={20}
                step={2}
                value={gridRatio}
                onChange={(e) => setGridRatio(Number(e.target.value))}
                className="mt-1.5 h-1.5 w-full cursor-pointer accent-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Obstacle Clearance</span>
                <span className="font-mono text-[11px] font-semibold text-foreground">
                  {nodePadding}px
                </span>
              </div>
              <input
                type="range"
                min={6}
                max={32}
                step={2}
                value={nodePadding}
                onChange={(e) => setNodePadding(Number(e.target.value))}
                className="mt-1.5 h-1.5 w-full cursor-pointer accent-primary"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={animatedEdges}
                onChange={(e) => setAnimatedEdges(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span>Pulse / Animated flow</span>
            </label>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-border pt-4 space-y-2">
          <p className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Graph Actions
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={addShape}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              <Plus className="h-3.5 w-3.5 text-primary" /> Add Shape Node
            </button>
            <button
              type="button"
              onClick={addObstacle}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500 transition hover:bg-amber-500/20"
            >
              <Zap className="h-3.5 w-3.5" /> Place Obstacle Block
            </button>
            <button
              type="button"
              onClick={resetGraph}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset Graph
            </button>
          </div>
        </div>

        <div className="border-t border-border pt-3 text-[11px] text-muted-foreground">
          <p className="font-semibold text-foreground">Interactive Demo</p>
          <p className="mt-1 leading-relaxed">
            Drag the amber <strong>Obstacle</strong> or shape nodes across edges. Watch how paths dynamically route around them!
          </p>
        </div>
      </aside>

      {/* Main Flow Canvas */}
      <div className="overflow-hidden rounded-xl border border-border bg-card flex flex-col min-h-[600px]">
        {/* Top Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <p className="text-sm font-semibold text-foreground">
                {activePreset.label}
              </p>
              <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                {activePreset.algorithm}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {activePreset.shortDesc}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addShape}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" /> Add shape
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative flex-1 min-h-[540px]">
          <ReactFlow
            nodes={nodes}
            edges={renderedEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.4}
          >
            <Background gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor="hsl(var(--primary))"
              maskColor="hsl(var(--background) / 0.75)"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}
