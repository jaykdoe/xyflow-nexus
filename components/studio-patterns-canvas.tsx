"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useTheme } from "@/app/theme";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type NodeTypes,
  type EdgeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";
import {
  Compass,
  Sparkles,
  Edit3,
  GitMerge,
  Network,
  Users,
  Palette,
  RotateCcw,
  Play,
  Pause,
  Shuffle,
  Plus,
  Trash2,
} from "lucide-react";

import { StudioNode, type StudioNodeData } from "@/components/nodes/studio-node";
import { SmartEdge } from "@/components/edges/smart-edge";
import { ParticleEdge } from "@/components/edges/particle-edge";
import { EditableEdge, type Point } from "@/components/edges/editable-edge";
import { FreeformConnection } from "@/components/connection/freeform-connection";
import { hierarchicalLayout } from "@/lib/hierarchical-layout";
import { cn } from "@/lib/utils";

const nodeTypes: NodeTypes = {
  studio: StudioNode,
};

const edgeTypes: EdgeTypes = {
  smart: SmartEdge,
  particle: ParticleEdge,
  editable: EditableEdge,
};

// Distance from point to line segment for intersection detection
function distPointToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// -------------------------------------------------------------
// 1. Smart Routing Sub-Canvas
// -------------------------------------------------------------
const routingInitialNodes: Node[] = [
  { id: "a", type: "studio", position: { x: 60, y: 80 }, data: { label: "Ingest source", kind: "source", sublabel: "Source" } },
  { id: "b", type: "studio", position: { x: 360, y: 20 }, data: { label: "Validate schema", sublabel: "Process" } },
  { id: "c", type: "studio", position: { x: 360, y: 220 }, data: { label: "Enrich payload", sublabel: "Process" } },
  { id: "d", type: "studio", position: { x: 680, y: 120 }, data: { label: "Route by tenant", sublabel: "Router" } },
  { id: "e", type: "studio", position: { x: 680, y: 320 }, data: { label: "Quarantine", sublabel: "Sink", kind: "sink" } },
  { id: "f", type: "studio", position: { x: 1000, y: 60 }, data: { label: "Warehouse sink", sublabel: "Sink", kind: "sink" } },
  { id: "g", type: "studio", position: { x: 1000, y: 260 }, data: { label: "Stream consumer", sublabel: "Sink", kind: "sink" } },
];

const routingInitialEdges: Edge[] = [
  { id: "a-b", source: "a", target: "b", type: "smart" },
  { id: "a-c", source: "a", target: "c", type: "smart" },
  { id: "b-d", source: "b", target: "d", type: "smart" },
  { id: "c-d", source: "c", target: "d", type: "smart" },
  { id: "c-e", source: "c", target: "e", type: "smart" },
  { id: "d-f", source: "d", target: "f", type: "smart" },
  { id: "d-g", source: "d", target: "g", type: "smart" },
  { id: "a-g", source: "a", target: "g", type: "smart" },
];

function SmartRoutingCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(routingInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(routingInitialEdges);
  const [obstacleCount, setObstacleCount] = useState(0);

  const onConnect = useCallback(
    (c: Connection) => setEdges((eds) => addEdge({ ...c, type: "smart" }, eds)),
    [setEdges],
  );

  const addObstacle = () => {
    const id = `obs-${obstacleCount + 1}`;
    setObstacleCount((n) => n + 1);
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "studio",
        position: { x: 240 + Math.random() * 500, y: 80 + Math.random() * 200 },
        data: { label: `Obstacle ${obstacleCount + 1}`, sublabel: "Drag me", kind: "active" },
      },
    ]);
  };

  const reset = () => {
    setNodes(routingInitialNodes);
    setEdges(routingInitialEdges);
    setObstacleCount(0);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute z-10 flex gap-2 right-4 top-4">
        <button
          onClick={addObstacle}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" /> Drop obstacle
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls className="!rounded-lg !border !border-border !shadow-sm" />
        <MiniMap
          nodeColor="hsl(var(--primary))"
          maskColor="hsl(var(--muted) / 0.6)"
          className="!rounded-lg !border !border-border"
        />
      </ReactFlow>
    </div>
  );
}

// -------------------------------------------------------------
// 2. Particle Edge Sub-Canvas
// -------------------------------------------------------------
const flowInitialNodes: Node[] = [
  { id: "1", type: "studio", position: { x: 40, y: 140 }, data: { label: "Event Producer", kind: "source", sublabel: "Source" } },
  { id: "2", type: "studio", position: { x: 380, y: 40 }, data: { label: "Transform A", sublabel: "Process" } },
  { id: "3", type: "studio", position: { x: 380, y: 240 }, data: { label: "Transform B", sublabel: "Process" } },
  { id: "4", type: "studio", position: { x: 720, y: 140 }, data: { label: "Aggregator", kind: "active", sublabel: "Reducer" } },
  { id: "5", type: "studio", position: { x: 1040, y: 140 }, data: { label: "Subscribers", kind: "sink", sublabel: "Sink" } },
];

const flowInitialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", type: "particle" },
  { id: "e1-3", source: "1", target: "3", type: "particle" },
  { id: "e2-4", source: "2", target: "4", type: "particle" },
  { id: "e3-4", source: "3", target: "4", type: "particle" },
  { id: "e4-5", source: "4", target: "5", type: "particle" },
];

function ParticleFlowCanvas() {
  const [nodes, , onNodesChange] = useNodesState(flowInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowInitialEdges);
  const [speed, setSpeed] = useState(1);

  const onConnect = useCallback(
    (c: Connection) => setEdges((eds) => addEdge({ ...c, type: "particle" }, eds)),
    [setEdges],
  );

  const dur = 2.4 / speed;
  const spedEdges = useMemo(
    () => edges.map((e) => ({ ...e, data: { ...(e.data ?? {}), speed: dur } })),
    [edges, dur],
  );

  return (
    <div className="relative w-full h-full">
      <div className="absolute z-10 flex items-center gap-3 p-2 border rounded-lg shadow-sm right-4 top-4 border-border bg-background/90 backdrop-blur">
        <span className="text-xs font-medium text-muted-foreground">Speed:</span>
        <input
          type="range"
          min={0.25}
          max={3}
          step={0.05}
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="h-1.5 w-24 accent-primary"
        />
        <span className="w-10 font-mono text-xs font-semibold text-primary">
          {speed.toFixed(2)}×
        </span>
        <div className="flex gap-1">
          {[0.5, 1, 2].map((v) => (
            <button
              key={v}
              onClick={() => setSpeed(v)}
              className={cn(
                "rounded px-1.5 py-0.5 font-mono text-[10px]",
                Math.abs(speed - v) < 0.05
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {v}x
            </button>
          ))}
        </div>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={spedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls className="!rounded-lg !border !border-border !shadow-sm" />
      </ReactFlow>
    </div>
  );
}

// -------------------------------------------------------------
// 3. Editable Waypoint Edges Sub-Canvas
// -------------------------------------------------------------
const editableInitialNodes: Node[] = [
  { id: "a", type: "studio", position: { x: 80, y: 80 }, data: { label: "Input Flow", kind: "source", sublabel: "Source" } },
  { id: "b", type: "studio", position: { x: 500, y: 220 }, data: { label: "Reshape Edge", sublabel: "Process" } },
  { id: "c", type: "studio", position: { x: 900, y: 80 }, data: { label: "Output Stream", kind: "sink", sublabel: "Sink" } },
];

const editableInitialEdges: Edge[] = [
  {
    id: "a-b",
    source: "a",
    target: "b",
    type: "editable",
    data: {
      points: [
        { x: 260, y: 80 },
        { x: 380, y: 260 },
      ],
    },
  },
  {
    id: "b-c",
    source: "b",
    target: "c",
    type: "editable",
    data: {
      points: [
        { x: 720, y: 240 },
        { x: 820, y: 120 },
      ],
    },
  },
];

function EditableEdgesCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(editableInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(editableInitialEdges);

  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...c,
            type: "editable",
            data: { points: [] },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const straightenAll = () =>
    setEdges((eds) => eds.map((e) => ({ ...e, data: { ...(e.data ?? {}), points: [] } })));

  const reset = () => {
    setNodes(editableInitialNodes);
    setEdges(editableInitialEdges);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute z-10 flex gap-2 right-4 top-4">
        <button
          onClick={straightenAll}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          Straighten edges
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineComponent={FreeformConnection}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls className="!rounded-lg !border !border-border !shadow-sm" />
      </ReactFlow>
    </div>
  );
}

// -------------------------------------------------------------
// 4. Edge Intersection Splice Sub-Canvas
// -------------------------------------------------------------
const intersectionInitialNodes: Node[] = [
  { id: "a", type: "studio", position: { x: 80, y: 200 }, data: { label: "Source", kind: "source", sublabel: "Source" } },
  { id: "b", type: "studio", position: { x: 650, y: 200 }, data: { label: "Destination", kind: "sink", sublabel: "Sink" } },
  { id: "drag", type: "studio", position: { x: 340, y: 400 }, data: { label: "Drag over edge", kind: "active", sublabel: "Splice node" } },
];

const intersectionInitialEdges: Edge[] = [{ id: "a-b", source: "a", target: "b" }];

function IntersectionCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(intersectionInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(intersectionInitialEdges);
  const [hoverEdge, setHoverEdge] = useState<string | null>(null);
  const { getNode } = useReactFlow();

  const styledEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        type: "smoothstep",
        animated: true,
        style: {
          stroke:
            hoverEdge === e.id
              ? "hsl(var(--primary))"
              : "hsl(var(--primary) / 0.4)",
          strokeWidth: hoverEdge === e.id ? 3.5 : 2,
          filter: hoverEdge === e.id ? "drop-shadow(0 0 8px hsl(var(--primary)))" : undefined,
          transition: "stroke-width 120ms ease, stroke 120ms ease",
        },
      })),
    [edges, hoverEdge],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      const dragChange = changes.find(
        (c) => c.type === "position" && c.dragging && c.id === "drag",
      );
      if (dragChange && dragChange.type === "position") {
        const dn = getNode("drag");
        if (!dn) return;
        const dw = dn.measured?.width ?? dn.width ?? 180;
        const dh = dn.measured?.height ?? dn.height ?? 60;
        const cx = (dragChange.position?.x ?? dn.position.x) + dw / 2;
        const cy = (dragChange.position?.y ?? dn.position.y) + dh / 2;
        let closest: { id: string; d: number } | null = null;
        for (const e of edges) {
          if (e.source === "drag" || e.target === "drag") continue;
          const s = getNode(e.source);
          const t = getNode(e.target);
          if (!s || !t) continue;
          const sw = s.measured?.width ?? s.width ?? 180;
          const sh = s.measured?.height ?? s.height ?? 60;
          const tw = t.measured?.width ?? t.width ?? 180;
          const th = t.measured?.height ?? t.height ?? 60;
          const sx = s.position.x + sw / 2;
          const sy = s.position.y + sh / 2;
          const tx = t.position.x + tw / 2;
          const ty = t.position.y + th / 2;
          const d = distPointToSegment(cx, cy, sx, sy, tx, ty);
          if (!closest || d < closest.d) closest = { id: e.id, d };
        }
        setHoverEdge(closest && closest.d < 70 ? closest.id : null);
      }
      const dropChange = changes.find(
        (c) => c.type === "position" && c.dragging === false && c.id === "drag",
      );
      if (dropChange && hoverEdge) {
        const edge = edges.find((e) => e.id === hoverEdge);
        if (edge) {
          setEdges((eds) => [
            ...eds.filter((e) => e.id !== edge.id),
            { id: `${edge.source}-drag-${Date.now()}`, source: edge.source, target: "drag" },
            { id: `drag-${edge.target}-${Date.now()}`, source: "drag", target: edge.target },
          ]);
        }
        setHoverEdge(null);
      }
    },
    [onNodesChange, edges, getNode, hoverEdge, setEdges],
  );

  const reset = () => {
    setNodes(intersectionInitialNodes);
    setEdges(intersectionInitialEdges);
    setHoverEdge(null);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute z-10 right-4 top-4">
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset graph
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls className="!rounded-lg !border !border-border !shadow-sm" />
      </ReactFlow>
    </div>
  );
}

// -------------------------------------------------------------
// 5. Hierarchical DAG Layout Sub-Canvas
// -------------------------------------------------------------
const layoutSeedNodes: Node[] = [
  { id: "1", type: "studio", position: { x: 0, y: 0 }, data: { label: "Webhook Ingest", kind: "source", sublabel: "Source" } },
  { id: "2", type: "studio", position: { x: 0, y: 0 }, data: { label: "Auth & Decrypt", sublabel: "Process" } },
  { id: "3", type: "studio", position: { x: 0, y: 0 }, data: { label: "Rate Limiter", sublabel: "Process" } },
  { id: "4", type: "studio", position: { x: 0, y: 0 }, data: { label: "Payload Parser", sublabel: "Process" } },
  { id: "5", type: "studio", position: { x: 0, y: 0 }, data: { label: "Tenant Router", sublabel: "Router" } },
  { id: "6", type: "studio", position: { x: 0, y: 0 }, data: { label: "Standard Queue", sublabel: "Sink", kind: "sink" } },
  { id: "7", type: "studio", position: { x: 0, y: 0 }, data: { label: "Priority Queue", sublabel: "Sink", kind: "sink" } },
  { id: "8", type: "studio", position: { x: 0, y: 0 }, data: { label: "Audit Logger", sublabel: "Sink", kind: "sink" } },
];

const layoutSeedEdges: Edge[] = [
  { id: "e1", source: "1", target: "2", type: "smart" },
  { id: "e2", source: "2", target: "3", type: "smart" },
  { id: "e3", source: "3", target: "4", type: "smart" },
  { id: "e4", source: "4", target: "5", type: "smart" },
  { id: "e5", source: "5", target: "6", type: "smart" },
  { id: "e6", source: "5", target: "7", type: "smart" },
  { id: "e7", source: "2", target: "8", type: "smart" },
  { id: "e8", source: "4", target: "8", type: "smart" },
];

function AutoLayoutCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(hierarchicalLayout(layoutSeedNodes, layoutSeedEdges));
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutSeedEdges);
  const { fitView } = useReactFlow();
  const [animating, setAnimating] = useState(false);

  const animateTo = useCallback(
    (targets: Map<string, { x: number; y: number }>, duration = 600) => {
      setAnimating(true);
      const start = performance.now();
      const startPos = new Map<string, { x: number; y: number }>();
      setNodes((nds) => {
        nds.forEach((n) => startPos.set(n.id, { ...n.position }));
        return nds;
      });
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      let raf = 0;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const k = ease(t);
        setNodes((nds) =>
          nds.map((n) => {
            const tgt = targets.get(n.id);
            const src = startPos.get(n.id) ?? n.position;
            if (!tgt) return n;
            return {
              ...n,
              position: { x: src.x + (tgt.x - src.x) * k, y: src.y + (tgt.y - src.y) * k },
            };
          }),
        );
        if (t < 1) raf = requestAnimationFrame(tick);
        else {
          setAnimating(false);
          fitView({ padding: 0.2, duration: 350 });
        }
      };
      raf = requestAnimationFrame(tick);
    },
    [setNodes, fitView],
  );

  const relayout = useCallback(() => {
    const laid = hierarchicalLayout(layoutSeedNodes, edges);
    const targets = new Map(laid.map((n) => [n.id, n.position]));
    animateTo(targets);
  }, [edges, animateTo]);

  const shuffle = useCallback(() => {
    const targets = new Map<string, { x: number; y: number }>();
    nodes.forEach((n) => {
      targets.set(n.id, { x: Math.random() * 600, y: Math.random() * 400 });
    });
    animateTo(targets, 500);
  }, [nodes, animateTo]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute z-10 flex gap-2 right-4 top-4">
        <button
          onClick={relayout}
          disabled={animating}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
        >
          <Network className="h-3.5 w-3.5" /> Auto-arrange
        </button>
        <button
          onClick={shuffle}
          disabled={animating}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <Shuffle className="h-3.5 w-3.5" /> Shuffle
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls className="!rounded-lg !border !border-border !shadow-sm" />
      </ReactFlow>
    </div>
  );
}

// -------------------------------------------------------------
// 6. Collaborative Multiplayer Sub-Canvas
// -------------------------------------------------------------
type Peer = {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  nextAt: number;
  holding: string | null;
};

const peersConfig = [
  { id: "p1", name: "Alex", color: "#EC4899" },
  { id: "p2", name: "Sam", color: "#8B5CF6" },
  { id: "p3", name: "Jordan", color: "#06B6D4" },
];

const collabInitialNodes: Node[] = [
  { id: "a", type: "studio", position: { x: 80, y: 80 }, data: { label: "Product Spec", kind: "source", sublabel: "Draft" } },
  { id: "b", type: "studio", position: { x: 380, y: 60 }, data: { label: "Design System", sublabel: "Component" } },
  { id: "c", type: "studio", position: { x: 380, y: 220 }, data: { label: "Prototyping", sublabel: "Active", kind: "active" } },
  { id: "d", type: "studio", position: { x: 700, y: 140 }, data: { label: "Production Release", sublabel: "Deploy", kind: "sink" } },
];

const collabInitialEdges: Edge[] = [
  { id: "a-b", source: "a", target: "b", animated: true },
  { id: "a-c", source: "a", target: "c", animated: true },
  { id: "b-d", source: "b", target: "d", animated: true },
  { id: "c-d", source: "c", target: "d", animated: true },
];

function MultiplayerCollabCanvas() {
  const [nodes, , onNodesChange] = useNodesState(collabInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(collabInitialEdges);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 500 });
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  const [state, setState] = useState<Peer[]>(() =>
    peersConfig.map((p, i) => ({
      ...p,
      x: 200 + i * 180,
      y: 200 + i * 30,
      tx: 200 + i * 180,
      ty: 200 + i * 30,
      nextAt: 0,
      holding: null,
    })),
  );

  useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!pausedRef.current) {
        setState((cur) =>
          cur.map((p) => {
            let { tx, ty, nextAt, holding } = p;
            if (now > nextAt) {
              tx = 40 + Math.random() * (size.w - 80);
              ty = 40 + Math.random() * (size.h - 80);
              nextAt = now + 1400 + Math.random() * 1800;
              holding =
                Math.random() < 0.5
                  ? collabInitialNodes[Math.floor(Math.random() * collabInitialNodes.length)].id
                  : null;
            }
            const k = 1 - Math.exp(-dt / 220);
            return {
              ...p,
              tx,
              ty,
              nextAt,
              holding,
              x: p.x + (tx - p.x) * k,
              y: p.y + (ty - p.y) * k,
            };
          }),
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [size.w, size.h]);

  const presence = useMemo(() => {
    const m = new Map<string, string>();
    state.forEach((p) => {
      if (p.holding) m.set(p.holding, p.color);
    });
    return m;
  }, [state]);

  const decoratedNodes = useMemo(
    () =>
      nodes.map((n) => {
        const c = presence.get(n.id);
        if (!c) return n;
        return {
          ...n,
          style: {
            ...n.style,
            boxShadow: `0 0 0 2px ${c}, 0 0 24px -4px ${c}`,
            borderRadius: 12,
            transition: "box-shadow 200ms ease",
          },
        };
      }),
    [nodes, presence],
  );

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      <div className="absolute z-20 flex items-center gap-3 p-2 border rounded-lg shadow-sm right-4 top-4 border-border bg-background/90 backdrop-blur">
        <div className="flex items-center gap-2">
          {state.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ backgroundColor: p.color }}
            >
              <span className="size-1.5 rounded-full bg-white/80" /> {p.name}
            </span>
          ))}
        </div>
        <button
          onClick={() => setPaused((v) => !v)}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs transition border rounded-md border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          {paused ? "Resume" : "Pause"}
        </button>
      </div>

      <ReactFlow
        nodes={decoratedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls className="!rounded-lg !border !border-border !shadow-sm" />
      </ReactFlow>

      {/* Cursors Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {state.map((p) => (
          <div
            key={p.id}
            className="absolute transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${p.x}px, ${p.y}px)`,
              filter: `drop-shadow(0 4px 10px ${p.color}66)`,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <path
                d="M3 2 L19 11 L11 12 L8 19 Z"
                fill={p.color}
                stroke="#000"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <div
              className="ml-3 mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium text-white shadow"
              style={{ backgroundColor: p.color }}
            >
              {p.holding && <span className="size-1.5 rounded-full bg-white animate-ping" />}
              {p.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. Visual Node Palette Sub-Canvas
// -------------------------------------------------------------
const paletteItems: { kind: StudioNodeData["kind"]; label: string; sublabel: string }[] = [
  { kind: "source", label: "New Source", sublabel: "Source" },
  { kind: "process", label: "Transformer", sublabel: "Process" },
  { kind: "active", label: "Live Worker", sublabel: "Active" },
  { kind: "sink", label: "New Sink", sublabel: "Sink" },
];

const paletteInitialNodes: Node[] = [
  {
    id: "seed-1",
    type: "studio",
    position: { x: 80, y: 120 },
    data: { label: "Drag from left panel →", sublabel: "Tip", kind: "source" },
  },
];

let nextNodeId = 1;

function NodePaletteCanvas() {
  const [rf, setRf] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(paletteInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((eds) => addEdge({ ...c, animated: true }, eds)),
    [setEdges],
  );

  const onDragStart = (e: DragEvent, item: (typeof paletteItems)[0]) => {
    e.dataTransfer.setData("application/xyflow-studio", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/xyflow-studio");
      if (!raw || !rf) return;
      const item = JSON.parse(raw) as (typeof paletteItems)[0];
      const position = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id = `node-${++nextNodeId}`;
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: "studio",
          position,
          data: { label: item.label, sublabel: item.sublabel, kind: item.kind },
        },
      ]);
    },
    [rf, setNodes],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      setNodes((nds) =>
        applyNodeChanges(
          nds.filter((n) => n.selected).map((n) => ({ id: n.id, type: "remove" as const })),
          nds,
        ),
      );
      setEdges((eds) =>
        applyEdgeChanges(
          eds.filter((e) => e.selected).map((e) => ({ id: e.id, type: "remove" as const })),
          eds,
        ),
      );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setNodes, setEdges]);

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
  };

  return (
    <div className="grid h-full grid-cols-[200px_1fr]">
      <aside className="flex flex-col gap-2 p-3 border-r border-border bg-muted/30">
        <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Drag onto canvas
        </p>
        {paletteItems.map((p) => (
          <div
            key={p.kind}
            draggable
            onDragStart={(e) => onDragStart(e, p)}
            className="cursor-grab rounded-lg border border-border bg-card p-2.5 shadow-sm transition hover:border-primary/50 hover:shadow active:cursor-grabbing"
          >
            <span className="font-mono text-[9px] uppercase tracking-wider text-primary">
              {p.sublabel}
            </span>
            <p className="text-xs font-semibold text-card-foreground">{p.label}</p>
          </div>
        ))}

        <div className="pt-4 mt-auto space-y-2">
          <button
            onClick={clearCanvas}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-card py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear canvas
          </button>
          <p className="text-center font-mono text-[10px] text-muted-foreground">
            {nodes.length} nodes · {edges.length} edges
          </p>
        </div>
      </aside>

      <div className="relative w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setRf}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls className="!rounded-lg !border !border-border !shadow-sm" />
        </ReactFlow>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Unified Studio Patterns Showcase Container
// -------------------------------------------------------------
const tabs = [
  { id: "routing", label: "Smart Routing", icon: Compass, desc: "A* orthogonal routing that dynamically navigates around node obstacles" },
  { id: "particles", label: "Particle Flows", icon: Sparkles, desc: "Animated SVG particles flowing along bezier curves with speed throttle" },
  { id: "editable", label: "Editable Waypoints", icon: Edit3, desc: "Draggable waypoint handles, Catmull-Rom smoothing, and freehand connection sketching" },
  { id: "intersection", label: "Drop Splicing", icon: GitMerge, desc: "Edge proximity detection and automatic node insertion on drop" },
  { id: "layout", label: "DAG Auto-Layout", icon: Network, desc: "Longest-path hierarchical layering with cubic easing animations" },
  { id: "collab", label: "Live Multiplayer", icon: Users, desc: "Real-time collaborative cursors with selection halos and peer presence" },
  { id: "palette", label: "Drag & Drop Palette", icon: Palette, desc: "Visual canvas builder palette with screen-to-flow coordinate mapping" },
];

export function StudioPatternsCanvas() {
  const [activeTab, setActiveTab] = useState("routing");
  const activeMeta = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      {/* Sidebar Navigation */}
      <aside className="flex flex-col gap-1 p-3 border shadow-sm rounded-xl border-border bg-card">
        <p className="px-2 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Studio Patterns
        </p>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition",
              activeTab === id
                ? "bg-primary/10 font-semibold text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}

        <div className="pt-4 mt-auto text-xs border-t border-border text-muted-foreground">
          <p className="font-semibold text-foreground">XY Flow Ecosystem</p>
          <p className="mt-0.5 font-mono text-[10px]">React Flow v12.11.6</p>
        </div>
      </aside>

      {/* Main Canvas Viewport */}
      <div className="flex min-h-[580px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-foreground">{activeMeta.label}</p>
            <p className="text-xs text-muted-foreground">{activeMeta.desc}</p>
          </div>
        </div>

        {/* Interactive canvas area */}
        <div className="h-[530px] w-full">
          <ReactFlowProvider key={activeTab}>
            {activeTab === "routing" && <SmartRoutingCanvas />}
            {activeTab === "particles" && <ParticleFlowCanvas />}
            {activeTab === "editable" && <EditableEdgesCanvas />}
            {activeTab === "intersection" && <IntersectionCanvas />}
            {activeTab === "layout" && <AutoLayoutCanvas />}
            {activeTab === "collab" && <MultiplayerCollabCanvas />}
            {activeTab === "palette" && <NodePaletteCanvas />}
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}
