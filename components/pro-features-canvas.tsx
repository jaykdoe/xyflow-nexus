"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import {
  ArrowLeftRight,
  Boxes,
  ChevronDown,
  ChevronRight,
  Circle,
  GitBranch,
  Magnet,
  Minus,
  Plus,
  Radio,
  RectangleHorizontal,
  Shapes,
  Sparkles,
  Triangle,
} from "lucide-react";
import { useMagneticDrag } from "@/lib/use-magnetic-drag";
import { useSpiderWeb } from "@/lib/use-spider-web";
import "@/app/pro-features/pro-features.css";

export type ShapeKind = "circle" | "rectangle" | "parallelogram" | "trapezoid" | "triangle" | "diamond";

export const SHAPE_OPTIONS: {
  kind: ShapeKind;
  label: string;
  tone: string;
  icon: React.ComponentType<{ className?: string }>;
  styleClass: string;
  clipPath?: string;
}[] = [
  {
    kind: "circle",
    label: "Circle",
    tone: "bg-primary",
    icon: Circle,
    styleClass: "h-16 w-16 rounded-full",
  },
  {
    kind: "rectangle",
    label: "Rectangle",
    tone: "bg-slate-700 dark:bg-slate-600",
    icon: RectangleHorizontal,
    styleClass: "h-14 w-28 rounded-lg",
  },
  {
    kind: "parallelogram",
    label: "Parallelogram",
    tone: "bg-violet-600",
    icon: Boxes,
    styleClass: "h-14 w-32 -skew-x-12 rounded-md",
  },
  {
    kind: "trapezoid",
    label: "Trapezoid",
    tone: "bg-cyan-600",
    icon: Shapes,
    styleClass: "h-14 w-32",
    clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
  },
  {
    kind: "triangle",
    label: "Triangle",
    tone: "bg-emerald-600",
    icon: Triangle,
    styleClass: "h-16 w-20",
    clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
  },
  {
    kind: "diamond",
    label: "Diamond",
    tone: "bg-amber-600",
    icon: Sparkles,
    styleClass: "h-16 w-16",
    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  },
];

function ShapeNode({
  data,
}: NodeProps<
  Node<{ shape: ShapeKind; label: string; tone?: string }>
>) {
  const shapeDef = SHAPE_OPTIONS.find((s) => s.kind === data.shape) || SHAPE_OPTIONS[1];
  const isTriangle = data.shape === "triangle";
  const bgTone = data.tone || shapeDef.tone;

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Top handles */}
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

      {/* Left handles */}
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

      {/* Shape Body with solid clip-path geometry */}
      <div
        style={shapeDef.clipPath ? { clipPath: shapeDef.clipPath } : undefined}
        className={`${shapeDef.styleClass} ${bgTone} flex items-center justify-center border border-white/20 shadow-md transition-all hover:shadow-lg ${
          isTriangle ? "pt-4" : ""
        }`}
      >
        <span className="text-[11px] font-semibold text-white select-none px-1 text-center">
          {data.label}
        </span>
      </div>

      {/* Right handles */}
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

      {/* Bottom handles */}
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
  );
}

function AddEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  data,
}: EdgeProps<Edge<{ actionBadge?: "add" | "remove" }>>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const isRemove = data?.actionBadge === "remove" || style?.stroke === "#f43f5e";
  const isAdd = data?.actionBadge === "add" || style?.stroke === "#10b981";

  const strokeColor = isRemove
    ? "#f43f5e"
    : isAdd
    ? "#10b981"
    : (style?.stroke as string) || "hsl(var(--primary))";

  const strokeDasharray = isRemove
    ? "6 4"
    : isAdd
    ? "4 4"
    : style?.strokeDasharray;

  return (
    <>
      <path
        d={path}
        markerEnd={markerEnd}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isRemove || isAdd ? 2.5 : 2}
        strokeDasharray={strokeDasharray}
        style={{
          ...style,
          stroke: strokeColor,
          strokeDasharray,
        }}
        className={`react-flow__edge-path transition-colors ${
          isRemove
            ? "!stroke-rose-500 opacity-90"
            : isAdd
            ? "!stroke-emerald-500 opacity-90"
            : "!stroke-primary"
        }`}
      />
      <EdgeLabelRenderer>
        {isRemove ? (
          <div
            className="nodrag nopan pointer-events-none absolute flex items-center gap-1 rounded-full border border-rose-500/60 bg-background/95 px-2 py-0.5 text-[10px] font-bold text-rose-500 shadow-md backdrop-blur -translate-x-1/2 -translate-y-1/2 ring-2 ring-rose-500/20"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            <Minus className="w-3 h-3" /> Disconnect
          </div>
        ) : isAdd ? (
          <div
            className="nodrag nopan pointer-events-none absolute flex items-center gap-1 rounded-full border border-emerald-500/60 bg-background/95 px-2 py-0.5 text-[10px] font-bold text-emerald-500 shadow-md backdrop-blur -translate-x-1/2 -translate-y-1/2 ring-2 ring-emerald-500/20"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            <Plus className="w-3 h-3" /> Connect
          </div>
        ) : (
          <button
            type="button"
            aria-label="Add node on edge"
            className="absolute flex items-center justify-center transition -translate-x-1/2 -translate-y-1/2 border rounded-full shadow-sm nodrag nopan h-7 w-7 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("pro-add-edge-node", { detail: { id } }),
              )
            }
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { shape: ShapeNode };
const edgeTypes = { add: AddEdge };

const initialNodes: Node[] = [
  {
    id: "circle",
    type: "shape",
    position: { x: 80, y: 80 },
    data: { shape: "circle", label: "A", tone: "bg-primary" },
  },
  {
    id: "rectangle",
    type: "shape",
    position: { x: 270, y: 220 },
    data: { shape: "rectangle", label: "Rectangle", tone: "bg-slate-700 dark:bg-slate-600" },
  },
  {
    id: "parallelogram",
    type: "shape",
    position: { x: 520, y: 80 },
    data: { shape: "parallelogram", label: "Transform", tone: "bg-violet-600" },
  },
  {
    id: "trapezoid",
    type: "shape",
    position: { x: 750, y: 220 },
    data: { shape: "trapezoid", label: "Output", tone: "bg-cyan-600" },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e-circle-rectangle",
    source: "circle",
    target: "rectangle",
    sourceHandle: "bottom-source",
    targetHandle: "top-target",
    type: "add",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-rectangle-parallelogram",
    source: "rectangle",
    target: "parallelogram",
    sourceHandle: "right-source",
    targetHandle: "left-target",
    type: "add",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-parallelogram-trapezoid",
    source: "parallelogram",
    target: "trapezoid",
    sourceHandle: "bottom-source",
    targetHandle: "top-target",
    type: "add",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

const nestedNodes = [
  {
    id: "root",
    label: "Project",
    children: [
      { id: "api", label: "API" },
      { id: "ui", label: "UI", children: [{ id: "canvas", label: "Canvas" }] },
    ],
  },
];

export function ProFeaturesCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [expanded, setExpanded] = useState<string[]>(["root"]);
  const [activeFeature, setActiveFeature] = useState<string>("shapes");
  const [selectedShapeKind, setSelectedShapeKind] = useState<ShapeKind>("circle");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const magnetic = useMagneticDrag(setNodes, { gap: 24 });

  // Handle outside click to close dropdown cleanly
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as globalThis.Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isDropdownOpen]);

  // Spider Web hook with dynamic strategy based on activeFeature
  const isRewire = activeFeature === "rewire";
  const spider = useSpiderWeb(nodes, edges, setEdges, {
    reach: 350,
    maxThreads: 8,
    keepOnDrop: isRewire ? 8 : 2,
    strategy: isRewire ? "rewire" : "accumulate",
    isolatedLimit: 1,
  });

  // Render candidate addition edges (Green for rewire, primary for spider)
  const spiderEdges = useMemo(
    () =>
      spider.threads.map((thread) => ({
        id: thread.id,
        source: thread.source,
        target: thread.target,
        sourceHandle: `${thread.sourceSide}-source`,
        targetHandle: `${thread.targetSide}-target`,
        type: "add",
        animated: true,
        data: { actionBadge: isRewire ? ("add" as const) : undefined },
        style: isRewire
          ? {
              stroke: "#10b981", // emerald-500
              strokeWidth: 2.5,
              opacity: 0.9,
              strokeDasharray: "4 4",
            }
          : {
              stroke: "hsl(var(--primary))",
              strokeWidth: 1.5 + thread.strength * 2.5,
              opacity: 0.35 + thread.strength * 0.65,
              strokeDasharray: "4 4",
            },
      })),
    [spider.threads, isRewire],
  );

  // Set of edge IDs marked for candidate removal in rewire mode
  const removalSet = useMemo(() => new Set(spider.removalEdgeIds), [spider.removalEdgeIds]);

  // Transform existing edges when candidate removals are active
  const baseEdges = useMemo(
    () =>
      edges.map((edge) => {
        if (isRewire && removalSet.has(edge.id)) {
          return {
            ...edge,
            type: "add",
            data: { actionBadge: "remove" as const },
            style: {
              stroke: "#f43f5e", // rose-500
              strokeWidth: 2.5,
              opacity: 0.85,
              strokeDasharray: "6 4",
            },
          };
        }
        return {
          ...edge,
          type: "add",
          data: undefined,
        };
      }),
    [edges, isRewire, removalSet],
  );

  // Handle "+ Add node on edge" event
  useEffect(() => {
    const onAddNodeOnEdge = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      const edgeId = customEvent.detail?.id;
      if (!edgeId) return;

      const edge = edges.find((ed) => ed.id === edgeId);
      if (!edge) return;

      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      const newNodeId = `shape-${nodes.length + 1}`;
      const midX = (sourceNode.position.x + targetNode.position.x) / 2;
      const midY = (sourceNode.position.y + targetNode.position.y) / 2;

      setNodes((nds) => [
        ...nds,
        {
          id: newNodeId,
          type: "shape",
          position: { x: midX, y: midY },
          data: { shape: "diamond", label: "Split", tone: "bg-amber-600" },
        },
      ]);

      setEdges((eds) => [
        ...eds.filter((ed) => ed.id !== edgeId),
        {
          id: `edge-${edge.source}-${newNodeId}`,
          source: edge.source,
          target: newNodeId,
          sourceHandle: edge.sourceHandle ?? "bottom-source",
          targetHandle: "top-target",
          type: "add",
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
          id: `edge-${newNodeId}-${edge.target}`,
          source: newNodeId,
          target: edge.target,
          sourceHandle: "bottom-source",
          targetHandle: edge.targetHandle ?? "top-target",
          type: "add",
          markerEnd: { type: MarkerType.ArrowClosed },
        },
      ]);
    };

    window.addEventListener("pro-add-edge-node", onAddNodeOnEdge);
    return () => window.removeEventListener("pro-add-edge-node", onAddNodeOnEdge);
  }, [edges, nodes, setEdges, setNodes]);

  const expandTree = useCallback(
    (id: string) =>
      setExpanded((current) =>
        current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id],
      ),
    [],
  );

  const addShapeNode = useCallback(
    (kind: ShapeKind) => {
      const shapeDef = SHAPE_OPTIONS.find((s) => s.kind === kind) || SHAPE_OPTIONS[0];
      setSelectedShapeKind(kind);
      setIsDropdownOpen(false);

      setNodes((current) => {
        // If a node on the canvas is selected, update its shape
        const hasSelected = current.some((n) => n.selected);
        if (hasSelected) {
          return current.map((n) => {
            if (n.selected) {
              return {
                ...n,
                data: {
                  ...n.data,
                  shape: kind,
                  label: `${shapeDef.label} (Updated)`,
                  tone: shapeDef.tone,
                },
              };
            }
            return n;
          });
        }

        // Otherwise create a new shape node
        const id = `shape-${current.length + 1}`;
        const offsetX = 350 + ((current.length * 35) % 240);
        const offsetY = 160 + ((current.length * 35) % 200);
        return [
          ...current,
          {
            id,
            type: "shape",
            position: { x: offsetX, y: offsetY },
            data: { shape: kind, label: `${shapeDef.label} ${current.length + 1}`, tone: shapeDef.tone },
          },
        ];
      });
    },
    [setNodes],
  );

  const tree = useMemo(() => nestedNodes[0], []);

  const displayedEdges = useMemo(() => {
    if (activeFeature === "spider" || activeFeature === "rewire") {
      return [...baseEdges, ...spiderEdges];
    }
    return baseEdges;
  }, [activeFeature, baseEdges, spiderEdges]);

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <aside className="p-3 border rounded-xl border-border bg-card">
        <p className="px-2 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Feature lab
        </p>
        {[
          { id: "shapes", label: "Custom shapes", icon: Circle },
          { id: "edge", label: "Add-node edges", icon: Plus },
          { id: "tree", label: "Expand / collapse", icon: GitBranch },
          { id: "magnetic", label: "Magnetic drag", icon: Magnet },
          { id: "spider", label: "Spider web", icon: Radio },
          { id: "rewire", label: "Spider Web (Balanced)", icon: ArrowLeftRight },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveFeature(id)}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
              activeFeature === id
                ? "bg-primary/10 font-semibold text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
        <div className="pt-4 mt-5 text-xs border-t border-border text-muted-foreground">
          <p className="font-semibold text-foreground">Interactive Modes</p>
          <p className="mt-1">
            {activeFeature === "rewire"
              ? "Degree-balanced multi-edge swapping with real-time green/red visual cues."
              : activeFeature === "spider"
              ? "Greedy multi-edge generation connecting nearby nodes."
              : "React Flow v12 pro patterns."}
          </p>
        </div>
      </aside>

      <div className="min-h-[560px] overflow-hidden rounded-xl border border-border bg-card">
        {activeFeature === "tree" ? (
          <div className="flex h-[560px] items-center justify-center p-8">
            <div className="w-full max-w-md space-y-3">
              <button
                type="button"
                onClick={() => expandTree(tree.id)}
                className="flex items-center w-full gap-3 p-4 font-semibold text-left border rounded-xl border-primary/40 bg-primary/10 text-foreground"
              >
                {expanded.includes(tree.id) ? (
                  <ChevronDown className="w-4 h-4 text-primary" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-primary" />
                )}{" "}
                {tree.label}
                <span className="ml-auto text-xs text-muted-foreground">root</span>
              </button>
              {expanded.includes("root") &&
                tree.children?.map((child) => (
                  <div key={child.id} className="ml-8 space-y-2">
                    <button
                      type="button"
                      onClick={() => expandTree(child.id)}
                      className="flex items-center w-full gap-3 p-3 text-sm text-left border rounded-xl border-border bg-background"
                    >
                      <span className="text-primary">
                        {expanded.includes(child.id) ? "−" : "+"}
                      </span>
                      {child.label}
                    </button>
                    {expanded.includes(child.id) &&
                      child.children?.map((leaf) => (
                        <div
                          key={leaf.id}
                          className="p-3 ml-8 text-sm border rounded-lg border-border bg-muted text-muted-foreground"
                        >
                          {leaf.label}
                        </div>
                      ))}
                  </div>
                ))}
              <p className="pt-4 text-xs text-center text-muted-foreground">
                Click any node to reveal or collapse its children.
              </p>
            </div>
          </div>
        ) : (
          <div ref={magnetic.hostRef} className="h-[560px] flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b nodrag nopan border-border bg-background/80 backdrop-blur">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {activeFeature === "shapes" && "Shape node gallery"}
                  {activeFeature === "edge" && "Insert nodes on edges"}
                  {activeFeature === "magnetic" && "Magnetic repulsion drag"}
                  {activeFeature === "spider" && "Dynamic spider web connections (Greedy)"}
                  {activeFeature === "rewire" && "Adaptive rewire (Degree-balanced swap)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeFeature === "shapes" && "Six geometry primitives with 4-way typed handles"}
                  {activeFeature === "edge" && "Click the + control on any edge to insert a node"}
                  {activeFeature === "magnetic" && "Drag any shape — adjacent nodes are smoothly repelled"}
                  {activeFeature === "spider" && "Drag a shape near others to spawn magnetic spider threads"}
                  {activeFeature === "rewire" && "Drag a shape to snap to closer nodes while pruning furthest edges (Green = Add, Red = Remove)"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {activeFeature === "rewire" && (
                  <div className="items-center hidden gap-3 text-xs sm:flex">
                    <span className="flex items-center gap-1.5 font-medium text-emerald-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                      + Connect
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-rose-500">
                      <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
                      − Disconnect
                    </span>
                  </div>
                )}

                {/* Shape Selector Dropdown Menu */}
                <div
                  ref={dropdownRef}
                  className="relative nodrag nopan nowheel"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="inline-flex rounded-lg shadow-sm">
                    {(() => {
                      const currentShape = SHAPE_OPTIONS.find((s) => s.kind === selectedShapeKind) || SHAPE_OPTIONS[0];
                      const CurrentIcon = currentShape.icon;
                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => addShapeNode(selectedShapeKind)}
                            className="inline-flex items-center gap-1.5 rounded-l-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
                          >
                            <CurrentIcon className="h-3.5 w-3.5" /> Add {currentShape.label}
                          </button>
                          <button
                            type="button"
                            aria-label="Select shape"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsDropdownOpen((prev) => !prev);
                            }}
                            className="inline-flex items-center rounded-r-lg border-l border-primary-foreground/20 bg-primary px-2 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
                          >
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                          </button>
                        </>
                      );
                    })()}
                  </div>

                  {isDropdownOpen && (
                    <div
                      className="rrelative right-0 top-full z-50 mt-1.5 w-52 rounded-xl border border-border bg-black/50 p-1.5 shadow-2xl backdrop-blur-md hover:cursor-pointer nodrag nopan nowheel"
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
                        Select Shape Geometry
                      </p>
                      <div className="space-y-0.5">
                        {SHAPE_OPTIONS.map((shape) => {
                          const Icon = shape.icon;
                          return (
                            <button
                              key={shape.kind}
                              type="button"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                addShapeNode(shape.kind);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                addShapeNode(shape.kind);
                              }}
                              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition select-none ${
                                selectedShapeKind === shape.kind
                                  ? "bg-primary/10 font-semibold text-primary"
                                  : "text-foreground hover:bg-muted"
                              }`}
                            >
                              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${shape.tone} text-white shadow-xs`}>
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <span className="flex-1 font-medium">{shape.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="relative flex-1">
              <ReactFlow
                nodes={nodes}
                edges={displayedEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDragStart={
                  activeFeature === "spider" || activeFeature === "rewire"
                    ? spider.onNodeDragStart
                    : activeFeature === "magnetic"
                    ? magnetic.onNodeDragStart
                    : undefined
                }
                onNodeDrag={
                  activeFeature === "spider" || activeFeature === "rewire"
                    ? spider.onNodeDrag
                    : activeFeature === "magnetic"
                    ? magnetic.onNodeDrag
                    : undefined
                }
                onNodeDragStop={
                  activeFeature === "spider" || activeFeature === "rewire"
                    ? spider.onNodeDragStop
                    : activeFeature === "magnetic"
                    ? magnetic.onNodeDragStop
                    : undefined
                }
                onConnect={(connection) =>
                  setEdges((current) =>
                    addEdge(
                      {
                        ...connection,
                        type: "add",
                        markerEnd: { type: MarkerType.ArrowClosed },
                      },
                      current,
                    ),
                  )
                }
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
        )}
      </div>
    </div>
  );
}

export const proFeatureShapeIcons = { Circle, RectangleHorizontal, Triangle, Boxes, Shapes, Sparkles };
