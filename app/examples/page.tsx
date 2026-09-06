'use client';

import React, { memo, ReactElement } from 'react';
import { SiteHeader } from "@/components/site-header"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  useStore,
  getBezierPath,
  BaseEdge,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
  type Connection,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
ArrowRight,
  Cpu,
  Database,
  GitBranch,
  Mail,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Globe,
  Server,
  ShieldCheck,
  FileText,
  Send,
  Inbox,
  Package,
  HardDrive,
  ArrowLeftRight,
  Network,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";


/* ---------- Shared helpers ---------- */

const baseEdgeStyle = { stroke: "hsl(var(--flow-edge))", strokeWidth: 2 };

function FlowWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full overflow-hidden border rounded-xl border-primary bg-primary/[0.02]">
      {children}
    </div>
  );
}

type FlowStoreNode = {
  internals: { positionAbsolute: { x: number; y: number } };
  measured?: { width?: number; height?: number };
  width?: number;
  height?: number;
};

function nodeSize(node: FlowStoreNode) {
  return {
    w: node.measured?.width ?? node.width ?? 80,
    h: node.measured?.height ?? node.height ?? 36,
  };
}

/** Where a center-to-center line exits a node's bounding box (for floating-style edges). */
function getNodeIntersection(node: FlowStoreNode, other: FlowStoreNode) {
  const { w: iw, h: ih } = nodeSize(node);
  const { w: ow, h: oh } = nodeSize(other);
  const ip = node.internals.positionAbsolute;
  const op = other.internals.positionAbsolute;

  const w = iw / 2;
  const h = ih / 2;
  const cx = ip.x + w;
  const cy = ip.y + h;
  const tx = op.x + ow / 2;
  const ty = op.y + oh / 2;

  if (w === 0 || h === 0) return { x: cx, y: cy };

  const xx1 = (tx - cx) / (2 * w) - (ty - cy) / (2 * h);
  const yy1 = (tx - cx) / (2 * w) + (ty - cy) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  return { x: w * (xx3 + yy3) + cx, y: h * (-xx3 + yy3) + cy };
}

function getEdgePosition(node: FlowStoreNode, point: { x: number; y: number }): Position {
  const { w, h } = nodeSize(node);
  const nx = node.internals.positionAbsolute.x;
  const ny = node.internals.positionAbsolute.y;
  const cx = nx + w / 2;
  const cy = ny + h / 2;
  const dx = Math.abs(point.x - cx) / (w / 2);
  const dy = Math.abs(point.y - cy) / (h / 2);
  if (dx > dy) return point.x < cx ? Position.Left : Position.Right;
  return point.y < cy ? Position.Top : Position.Bottom;
}

/** Shared floating edge: bezier from node boundary to node boundary. */
const FloatingEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
}: EdgeProps) => {
  const params = useStore((s) => {
    const sn = s.nodeLookup.get(source);
    const tn = s.nodeLookup.get(target);
    if (!sn || !tn) return null;
    const sp = getNodeIntersection(sn, tn);
    const tp = getNodeIntersection(tn, sn);
    return {
      sx: sp.x,
      sy: sp.y,
      tx: tp.x,
      ty: tp.y,
      sourcePos: getEdgePosition(sn, sp),
      targetPos: getEdgePosition(tn, tp),
    };
  });

  const [path] = getBezierPath({
    sourceX: params?.sx ?? sourceX,
    sourceY: params?.sy ?? sourceY,
    targetX: params?.tx ?? targetX,
    targetY: params?.ty ?? targetY,
    sourcePosition: params?.sourcePos ?? Position.Right,
    targetPosition: params?.targetPos ?? Position.Left,
  });
  return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
};

/* ============================================================
 * 1. Basic Flow
 * ============================================================ */
const StepNode = memo(
  ({
    data,
  }: NodeProps<
    Node<{
      icon: React.ReactNode;
      label: string;
      sub: string;
      color: string;
      isFirst?: boolean;
      isLast?: boolean;
    }>
  >) => (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm min-w-[185px] hover:shadow-md hover:-translate-y-0.5 transition-all">
      {!data.isFirst && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !bg-primary !border-2 !border-background"
        />
      )}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${data.color}`}
      >
        {data.icon}
      </div>
      <div>
        <div className="text-sm font-semibold leading-tight text-foreground">
          {data.label}
        </div>
        <div className="text-[11px] text-muted-foreground">{data.sub}</div>
      </div>
      {!data.isLast && (
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !bg-primary !border-2 !border-background"
        />
      )}
    </div>
  )
);

export function BasicFlow() {
  const nodeTypes = { step: StepNode };
  const [nodes, , onNodesChange] = useNodesState<Node>([
    {
      id: "1",
      type: "step",
      position: { x: 0, y: 130 },
      data: {
        icon: <Inbox size={17} />,
        label: "Receive",
        sub: "HTTP request",
        color: "bg-sky-500/15 text-sky-600",
        isFirst: true,
      },
    },
    {
      id: "2",
      type: "step",
      position: { x: 240, y: 40 },
      data: {
        icon: <ShieldCheck size={17} />,
        label: "Auth",
        sub: "JWT verify",
        color: "bg-violet-500/15 text-violet-600",
      },
    },
    {
      id: "3",
      type: "step",
      position: { x: 240, y: 220 },
      data: {
        icon: <Database size={17} />,
        label: "Cache",
        sub: "Redis lookup",
        color: "bg-amber-500/15 text-amber-600",
      },
    },
    {
      id: "4",
      type: "step",
      position: { x: 490, y: 130 },
      data: {
        icon: <Cpu size={17} />,
        label: "Process",
        sub: "Business logic",
        color: "bg-emerald-500/15 text-emerald-600",
      },
    },
    {
      id: "5",
      type: "step",
      position: { x: 740, y: 130 },
      data: {
        icon: <Send size={17} />,
        label: "Respond",
        sub: "JSON response",
        color: "bg-primary/15 text-primary",
        isLast: true,
      },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([
    {
      id: "e1-2",
      source: "1",
      target: "2",
      type: "smoothstep",
      style: baseEdgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e1-3",
      source: "1",
      target: "3",
      type: "smoothstep",
      style: baseEdgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e2-4",
      source: "2",
      target: "4",
      type: "smoothstep",
      style: baseEdgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e3-4",
      source: "3",
      target: "4",
      type: "smoothstep",
      style: baseEdgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e4-5",
      source: "4",
      target: "5",
      animated: true,
      style: { ...baseEdgeStyle, stroke: "var(--primary)", strokeWidth: 2.5 },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ]);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(c) => setEdges((e) => addEdge({ ...c, style: baseEdgeStyle }, e))}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1.2} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 2. Custom Branded Nodes
 * ============================================================ */
const IconNode = memo(
  ({
    data,
  }: NodeProps<Node<{ icon: React.ReactNode; label: string; desc: string }>>) => (
    <div className="group relative flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm min-w-[180px] transition hover:shadow-md hover:-translate-y-0.5">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !bg-primary !border-none"
      />
      <div className="flex items-center justify-center rounded-lg h-9 w-9 bg-primary/10 text-primary">
        {data.icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">{data.label}</div>
        <div className="text-xs text-muted-foreground">{data.desc}</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !bg-primary !border-none"
      />
    </div>
  )
);

export function CustomNodesFlow() {
  const nodeTypes = { icon: IconNode };
  const [nodes, , onNodesChange] = useNodesState<Node>([
    {
      id: "1",
      type: "icon",
      position: { x: 30, y: 60 },
      data: { icon: <Database size={18} />, label: "Database", desc: "PostgreSQL" },
    },
    {
      id: "2",
      type: "icon",
      position: { x: 300, y: 10 },
      data: { icon: <Cpu size={18} />, label: "API", desc: "Edge function" },
    },
    {
      id: "3",
      type: "icon",
      position: { x: 300, y: 140 },
      data: { icon: <Sparkles size={18} />, label: "AI", desc: "LLM enrich" },
    },
    {
      id: "4",
      type: "icon",
      position: { x: 580, y: 80 },
      data: { icon: <Mail size={18} />, label: "Notify", desc: "Send email" },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([
    { id: "a", source: "1", target: "2", style: baseEdgeStyle, animated: true },
    { id: "b", source: "1", target: "3", style: baseEdgeStyle, animated: true },
    { id: "c", source: "2", target: "4", style: baseEdgeStyle },
    { id: "d", source: "3", target: "4", style: baseEdgeStyle },
  ]);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(c) => setEdges((e) => addEdge({ ...c, style: baseEdgeStyle }, e))}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 3. Animated Pipeline
 * ============================================================ */
export function AnimatedPipeline() {
  const mk = (id: string, x: number, label: string, type?: "input" | "output"): Node => ({
    id,
    position: { x, y: 100 },
    data: { label },
    type,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  });
  const [nodes, , onNodesChange] = useNodesState<Node>([
    mk("s", 30, "Source", "input"),
    mk("t1", 220, "Transform"),
    mk("t2", 410, "Aggregate"),
    mk("t3", 600, "Sink", "output"),
  ]);
  const pipeStyle = { stroke: "var(--primary)", strokeWidth: 2.5 };
  const [edges, , onEdgesChange] = useEdgesState<Edge>([
    {
      id: "1",
      source: "s",
      target: "t1",
      animated: true,
      style: pipeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "2",
      source: "t1",
      target: "t2",
      animated: true,
      style: pipeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "3",
      source: "t2",
      target: "t3",
      animated: true,
      style: pipeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ]);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background variant={BackgroundVariant.Lines} gap={32} lineWidth={0.5} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 4. Status Nodes
 * ============================================================ */
const StatusNode = memo(
  ({
    data,
  }: NodeProps<Node<{ label: string; status: "ok" | "warn" | "wait" }>>) => {
    const map = {
      ok: {
        c: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
        i: <CheckCircle2 size={16} />,
      },
      warn: {
        c: "text-amber-600 bg-amber-500/10 border-amber-500/30",
        i: <AlertTriangle size={16} />,
      },
      wait: {
        c: "text-sky-600 bg-sky-500/10 border-sky-500/30",
        i: <Clock size={16} />,
      },
    }[data.status];
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${map.c}`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-current !border-none !h-1.5 !w-1.5"
        />
        {map.i}
        {data.label}
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-current !border-none !h-1.5 !w-1.5"
        />
      </div>
    );
  }
);

export function StatusFlow() {
  const nodeTypes = { status: StatusNode };
  const [nodes, , onNodesChange] = useNodesState<Node>([
    {
      id: "1",
      type: "status",
      position: { x: 30, y: 30 },
      data: { label: "Build", status: "ok" },
    },
    {
      id: "2",
      type: "status",
      position: { x: 230, y: 30 },
      data: { label: "Test", status: "ok" },
    },
    {
      id: "3",
      type: "status",
      position: { x: 430, y: 30 },
      data: { label: "Lint", status: "warn" },
    },
    {
      id: "4",
      type: "status",
      position: { x: 230, y: 130 },
      data: { label: "Deploy", status: "wait" },
    },
    {
      id: "5",
      type: "status",
      position: { x: 430, y: 130 },
      data: { label: "Smoke test", status: "wait" },
    },
  ]);
  const [edges, , onEdgesChange] = useEdgesState<Edge>([
    { id: "a", source: "1", target: "2", style: baseEdgeStyle },
    { id: "b", source: "2", target: "3", style: baseEdgeStyle },
    { id: "c", source: "2", target: "4", style: baseEdgeStyle },
    { id: "d", source: "4", target: "5", style: baseEdgeStyle },
  ]);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={18} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 5. Radial Mind Map
 * ============================================================ */

const MindNode = memo(
  ({
    data,
  }: NodeProps<Node<{ label: string; root?: boolean; level?: number }>>) => (
    <div
      className={`relative flex items-center justify-center rounded-full font-semibold border shadow-sm select-none transition-all hover:scale-105 ${
        data.root
          ? "px-6 py-3 bg-primary text-primary-foreground border-primary/30 shadow-lg text-base"
          : data.level === 2
          ? "px-4 py-2 bg-card text-foreground border-border text-sm hover:border-primary/50 hover:shadow-md"
          : "px-3 py-1 bg-muted/60 text-muted-foreground border-border/60 text-xs"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !pointer-events-none"
        style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !pointer-events-none"
        style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
      />
    </div>
  )
);

/** Bezier edge that stops at node boundaries — lines never draw over node labels. */
const MindEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
}: EdgeProps) => {
  const params = useStore((s) => {
    const sn = s.nodeLookup.get(source);
    const tn = s.nodeLookup.get(target);
    if (!sn || !tn) return null;
    const sp = getNodeIntersection(sn, tn);
    const tp = getNodeIntersection(tn, sn);
    return {
      sx: sp.x,
      sy: sp.y,
      tx: tp.x,
      ty: tp.y,
      sourcePos: getEdgePosition(sn, sp),
      targetPos: getEdgePosition(tn, tp),
    };
  });

  const [path] = getBezierPath({
    sourceX: params?.sx ?? sourceX,
    sourceY: params?.sy ?? sourceY,
    targetX: params?.tx ?? targetX,
    targetY: params?.ty ?? targetY,
    sourcePosition: params?.sourcePos ?? Position.Top,
    targetPosition: params?.targetPos ?? Position.Bottom,
    curvature: 0.2,
  });
  return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
};

export function MindMapFlow() {
  const nodeTypes = { mind: MindNode };
  const edgeTypes = { mind: MindEdge };
  const cx = 400;
  const cy = 280;
  const mainBranches = ["Design", "Build", "Test", "Deploy", "Monitor", "Iterate"];
  const subMap: Record<string, string[]> = {
    Design: ["Figma", "Tokens"],
    Build: ["React", "API"],
    Deploy: ["CI/CD", "Docker"],
    Monitor: ["Logs", "Alerts"],
  };
  const r1 = 200;
  const r2 = 100;

  const nodes: Node[] = [
    {
      id: "root",
      type: "mind",
      position: { x: cx - 40, y: cy - 20 },
      data: { label: "Product", root: true },
    },
  ];
  const edges: Edge[] = [];

  mainBranches.forEach((b, i) => {
    const angle = (i / mainBranches.length) * Math.PI * 2 - Math.PI / 2;
    const bx = cx + Math.cos(angle) * r1 - 36;
    const by = cy + Math.sin(angle) * r1 - 16;
    nodes.push({
      id: `b${i}`,
      type: "mind",
      position: { x: bx, y: by },
      data: { label: b, level: 2 },
    });
    edges.push({
      id: `re${i}`,
      source: "root",
      target: `b${i}`,
      type: "mind",
      style: { stroke: "hsl(var(--flow-edge))", strokeWidth: 1.8, opacity: 0.65 },
    });

    const subs = subMap[b];
    if (subs) {
      subs.forEach((s, j) => {
        const sa = angle + (j === 0 ? -0.38 : 0.38);
        const sid = `s${i}_${j}`;
        nodes.push({
          id: sid,
          type: "mind",
          position: {
            x: cx + Math.cos(sa) * (r1 + r2) - 28,
            y: cy + Math.sin(sa) * (r1 + r2) - 12,
          },
          data: { label: s, level: 3 },
        });
        edges.push({
          id: `be${i}_${j}`,
          source: `b${i}`,
          target: sid,
          type: "mind",
          style: { stroke: "hsl(var(--flow-edge))", strokeWidth: 1.2, opacity: 0.4 },
        });
      });
    }
  });

  const [n, , onN] = useNodesState(nodes);
  const [e, , onE] = useEdgesState(edges);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={n}
        edges={e}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onN}
        onEdgesChange={onE}
        fitView
        fitViewOptions={{ padding: 0.18 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 6. Decision Tree
 * ============================================================ */
export function DecisionTree() {
  const [nodes, , onN] = useNodesState<Node>([
    {
      id: "q",
      position: { x: 260, y: 20 },
      data: { label: "Is user logged in?" },
      type: "input",
    },
    { id: "yes", position: { x: 80, y: 140 }, data: { label: "Show dashboard" } },
    { id: "no", position: { x: 440, y: 140 }, data: { label: "Redirect to login" } },
    {
      id: "a1",
      position: { x: 0, y: 260 },
      data: { label: "Profile" },
      type: "output",
    },
    {
      id: "a2",
      position: { x: 160, y: 260 },
      data: { label: "Reports" },
      type: "output",
    },
    {
      id: "b1",
      position: { x: 440, y: 260 },
      data: { label: "Auth form" },
      type: "output",
    },
  ]);
  const [edges, , onE] = useEdgesState<Edge>([
    {
      id: "1",
      source: "q",
      target: "yes",
      label: "yes",
      type: "smoothstep",
      style: baseEdgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "2",
      source: "q",
      target: "no",
      label: "no",
      type: "smoothstep",
      style: baseEdgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    { id: "3", source: "yes", target: "a1", type: "smoothstep", style: baseEdgeStyle },
    { id: "4", source: "yes", target: "a2", type: "smoothstep", style: baseEdgeStyle },
    { id: "5", source: "no", target: "b1", type: "smoothstep", style: baseEdgeStyle },
  ]);
  return (
    <FlowWrap>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onN} onEdgesChange={onE} fitView>
        <Background variant={BackgroundVariant.Dots} gap={18} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 7. Org Chart
 * ============================================================ */
const PersonNode = memo(
  ({ data }: NodeProps<Node<{ name: string; role: string }>>) => (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 shadow-sm min-w-[170px]">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !bg-primary !border-none"
      />
      <div className="flex items-center justify-center rounded-full h-9 w-9 bg-primary/10 text-primary">
        <User size={16} />
      </div>
      <div>
        <div className="text-sm font-semibold leading-tight text-foreground">{data.name}</div>
        <div className="text-xs text-muted-foreground">{data.role}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !bg-primary !border-none"
      />
    </div>
  )
);

export function OrgChart() {
  const nodeTypes = { person: PersonNode };
  const [n, , onN] = useNodesState<Node>([
    {
      id: "ceo",
      type: "person",
      position: { x: 300, y: 0 },
      data: { name: "Ava Chen", role: "CEO" },
    },
    {
      id: "cto",
      type: "person",
      position: { x: 80, y: 130 },
      data: { name: "Liam Park", role: "CTO" },
    },
    {
      id: "cmo",
      type: "person",
      position: { x: 320, y: 130 },
      data: { name: "Noah Kim", role: "CMO" },
    },
    {
      id: "cfo",
      type: "person",
      position: { x: 560, y: 130 },
      data: { name: "Mia Tan", role: "CFO" },
    },
    {
      id: "e1",
      type: "person",
      position: { x: 0, y: 260 },
      data: { name: "Sam Hall", role: "Eng Lead" },
    },
    {
      id: "e2",
      type: "person",
      position: { x: 200, y: 260 },
      data: { name: "Eli Cruz", role: "Designer" },
    },
  ]);
  const [e, , onE] = useEdgesState<Edge>([
    { id: "1", source: "ceo", target: "cto", type: "smoothstep", style: baseEdgeStyle },
    { id: "2", source: "ceo", target: "cmo", type: "smoothstep", style: baseEdgeStyle },
    { id: "3", source: "ceo", target: "cfo", type: "smoothstep", style: baseEdgeStyle },
    { id: "4", source: "cto", target: "e1", type: "smoothstep", style: baseEdgeStyle },
    { id: "5", source: "cto", target: "e2", type: "smoothstep", style: baseEdgeStyle },
  ]);
  return (
    <FlowWrap>
      <ReactFlow nodes={n} edges={e} nodeTypes={nodeTypes} onNodesChange={onN} onEdgesChange={onE} fitView>
        <Background variant={BackgroundVariant.Dots} gap={18} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 8. Grouped Subflows
 * ============================================================ */
export function SubflowGroups() {
  const [n, , onN] = useNodesState<Node>([
    {
      id: "g1",
      position: { x: 20, y: 20 },
      data: { label: "Frontend" },
      style: {
        width: 260,
        height: 200,
        background: "color-mix(in srgb, var(--primary) 6%, transparent)",
        border: "1px dashed color-mix(in srgb, var(--primary) 40%, transparent)",
        borderRadius: 12,
      },
    },
    {
      id: "f1",
      parentId: "g1",
      extent: "parent",
      position: { x: 20, y: 50 },
      data: { label: "React" },
    },
    {
      id: "f2",
      parentId: "g1",
      extent: "parent",
      position: { x: 130, y: 120 },
      data: { label: "Vite" },
    },
    {
      id: "g2",
      position: { x: 340, y: 20 },
      data: { label: "Backend" },
      style: {
        width: 260,
        height: 200,
        background: "hsl(160 80% 40% / 0.07)",
        border: "1px dashed hsl(160 80% 40% / 0.5)",
        borderRadius: 12,
      },
    },
    {
      id: "b1",
      parentId: "g2",
      extent: "parent",
      position: { x: 20, y: 50 },
      data: { label: "API" },
    },
    {
      id: "b2",
      parentId: "g2",
      extent: "parent",
      position: { x: 130, y: 120 },
      data: { label: "DB" },
    },
  ]);
  const [e, , onE] = useEdgesState<Edge>([
    { id: "1", source: "f1", target: "b1", style: baseEdgeStyle, animated: true },
    { id: "2", source: "b1", target: "b2", style: baseEdgeStyle },
  ]);
  return (
    <FlowWrap>
      <ReactFlow nodes={n} edges={e} onNodesChange={onN} onEdgesChange={onE} fitView>
        <Background variant={BackgroundVariant.Dots} gap={18} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 9. Horizontal Workflow
 * ============================================================ */
export function HorizontalWorkflow() {
  const items = ["Trigger", "Filter", "Enrich", "Branch", "Send"];
  const [n, , onN] = useNodesState<Node>(
    items.map((label, i) => ({
      id: `${i}`,
      position: { x: i * 170, y: 80 },
      data: { label },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      type: i === 0 ? "input" : i === items.length - 1 ? "output" : undefined,
    }))
  );
  const [e, , onE] = useEdgesState<Edge>(
    items.slice(1).map((_, i) => ({
      id: `${i}-${i + 1}`,
      source: `${i}`,
      target: `${i + 1}`,
      type: "smoothstep",
      animated: true,
      style: baseEdgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    }))
  );
  return (
    <FlowWrap>
      <ReactFlow nodes={n} edges={e} onNodesChange={onN} onEdgesChange={onE} fitView>
        <Background variant={BackgroundVariant.Lines} gap={32} lineWidth={0.5} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 10. Mini Map Overview
 * ============================================================ */
export function MiniMapFlow() {
  const mk = (
    id: string,
    x: number,
    y: number,
    label: string,
    dir: "lr" | "default" = "lr"
  ): Node => ({
    id,
    position: { x, y },
    data: { label },
    sourcePosition: dir === "lr" ? Position.Right : undefined,
    targetPosition: dir === "lr" ? Position.Left : undefined,
  });
  const [n, , onN] = useNodesState<Node>([
    mk("web", 0, 0, "Web App"),
    mk("mob", 0, 90, "Mobile"),
    mk("cli", 0, 180, "CLI"),
    mk("gw", 200, 80, "API Gateway"),
    mk("auth", 410, 0, "Auth"),
    mk("users", 410, 80, "Users"),
    mk("orders", 410, 160, "Orders"),
    mk("notif", 410, 240, "Notify"),
    mk("redis", 620, 0, "Redis"),
    mk("pg", 620, 80, "Postgres"),
    mk("mongo", 620, 160, "MongoDB"),
    mk("queue", 620, 240, "RabbitMQ"),
    mk("logs", 830, 60, "Logs"),
    mk("metrics", 830, 160, "Metrics"),
    mk("dash", 1040, 110, "Dashboard"),
  ]);
  const lk = (id: string, s: string, t: string, anim = false): Edge => ({
    id,
    source: s,
    target: t,
    style: baseEdgeStyle,
    animated: anim,
  });
  const [e, setE, onE] = useEdgesState<Edge>([
    lk("w-gw", "web", "gw"),
    lk("m-gw", "mob", "gw"),
    lk("c-gw", "cli", "gw"),
    lk("gw-a", "gw", "auth"),
    lk("gw-u", "gw", "users"),
    lk("gw-o", "gw", "orders"),
    lk("gw-n", "gw", "notif"),
    lk("a-r", "auth", "redis"),
    lk("u-p", "users", "pg"),
    lk("o-m", "orders", "mongo"),
    lk("n-q", "notif", "queue"),
    lk("p-l", "pg", "logs", true),
    lk("m-me", "mongo", "metrics", true),
    lk("l-d", "logs", "dash"),
    lk("me-d", "metrics", "dash"),
  ]);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={n}
        edges={e}
        onNodesChange={onN}
        onEdgesChange={onE}
        onConnect={(c: Connection) => setE((x) => addEdge({ ...c, style: baseEdgeStyle }, x))}
        fitView
        fitViewOptions={{ padding: 0.15 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} />
        <MiniMap pannable zoomable className="!bg-card !border !border-border !rounded-lg" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 11. Multi-Handle Gate
 * ============================================================ */
const GateNode = memo(
  ({
    data,
  }: NodeProps<Node<{ op: string; color: string; border: string }>>) => (
    <div
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 ${data.border} bg-card w-[88px] h-[68px] shadow-sm`}
    >
      <Handle
        id="in-a"
        type="target"
        position={Position.Left}
        style={{ top: "30%" }}
        className="!h-2.5 !w-2.5 !bg-primary !border-2 !border-background"
      />
      <Handle
        id="in-b"
        type="target"
        position={Position.Left}
        style={{ top: "70%" }}
        className="!h-2.5 !w-2.5 !bg-primary !border-2 !border-background"
      />
      <div className={`flex flex-col items-center gap-0.5 ${data.color}`}>
        <Zap size={13} />
        <span className="text-[11px] font-bold">{data.op}</span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !bg-primary !border-2 !border-background"
      />
    </div>
  )
);

const InputPinNode = memo(({ data }: NodeProps<Node<{ label: string }>>) => (
  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-mono font-semibold text-foreground">
    {data.label}
    <Handle
      type="source"
      position={Position.Right}
      className="!h-2 !w-2 !bg-muted-foreground !border-none"
    />
  </div>
));

export function LogicGateFlow() {
  const nodeTypes = { gate: GateNode, pin: InputPinNode };
  const [n, , onN] = useNodesState<Node>([
    { id: "ia", type: "pin", position: { x: 0, y: 62 }, data: { label: "A=1" } },
    { id: "ib", type: "pin", position: { x: 0, y: 130 }, data: { label: "B=0" } },
    { id: "ic", type: "pin", position: { x: 0, y: 220 }, data: { label: "C=1" } },
    { id: "id", type: "pin", position: { x: 0, y: 288 }, data: { label: "D=1" } },
    {
      id: "and",
      type: "gate",
      position: { x: 185, y: 78 },
      data: { op: "AND", color: "text-violet-600", border: "border-violet-300" },
    },
    {
      id: "or",
      type: "gate",
      position: { x: 185, y: 228 },
      data: { op: "OR", color: "text-emerald-600", border: "border-emerald-300" },
    },
    {
      id: "nand",
      type: "gate",
      position: { x: 375, y: 153 },
      data: { op: "NAND", color: "text-amber-600", border: "border-amber-300" },
    },
    { id: "out", position: { x: 560, y: 170 }, data: { label: "Q" }, type: "output" },
  ]);
  const [e, , onE] = useEdgesState<Edge>([
    { id: "1", source: "ia", target: "and", targetHandle: "in-a", style: baseEdgeStyle },
    { id: "2", source: "ib", target: "and", targetHandle: "in-b", style: baseEdgeStyle },
    { id: "3", source: "ic", target: "or", targetHandle: "in-a", style: baseEdgeStyle },
    { id: "4", source: "id", target: "or", targetHandle: "in-b", style: baseEdgeStyle },
    {
      id: "5",
      source: "and",
      target: "nand",
      targetHandle: "in-a",
      style: baseEdgeStyle,
    },
    {
      id: "6",
      source: "or",
      target: "nand",
      targetHandle: "in-b",
      style: baseEdgeStyle,
    },
    {
      id: "7",
      source: "nand",
      target: "out",
      animated: true,
      style: { ...baseEdgeStyle, stroke: "var(--primary)", strokeWidth: 2.5 },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ]);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={n}
        edges={e}
        nodeTypes={nodeTypes}
        onNodesChange={onN}
        onEdgesChange={onE}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 12. Git Branch Flow
 * ============================================================ */
const CommitNode = memo(
  ({ data }: NodeProps<Node<{ label: string; branch: string }>>) => {
    const tone =
      data.branch === "main"
        ? "border-primary text-primary"
        : data.branch === "feature"
        ? "border-emerald-500 text-emerald-600"
        : "border-amber-500 text-amber-600";
    return (
      <div
        className={`flex items-center gap-2 rounded-full border-2 bg-card px-3 py-1.5 text-xs font-mono shadow-sm ${tone}`}
      >
        <Handle type="target" position={Position.Left} className="!opacity-0" />
        <GitBranch size={12} />
        {data.label}
        <Handle type="source" position={Position.Right} className="!opacity-0" />
      </div>
    );
  }
);

export function GitFlow() {
  const nodeTypes = { commit: CommitNode };
  const [n, , onN] = useNodesState<Node>([
    {
      id: "m1",
      type: "commit",
      position: { x: 20, y: 100 },
      data: { label: "init", branch: "main" },
    },
    {
      id: "m2",
      type: "commit",
      position: { x: 180, y: 100 },
      data: { label: "v0.1", branch: "main" },
    },
    {
      id: "f1",
      type: "commit",
      position: { x: 340, y: 30 },
      data: { label: "feat:ui", branch: "feature" },
    },
    {
      id: "f2",
      type: "commit",
      position: { x: 500, y: 30 },
      data: { label: "feat:api", branch: "feature" },
    },
    {
      id: "h1",
      type: "commit",
      position: { x: 340, y: 170 },
      data: { label: "fix:auth", branch: "hotfix" },
    },
    {
      id: "m3",
      type: "commit",
      position: { x: 660, y: 100 },
      data: { label: "v0.2", branch: "main" },
    },
  ]);
  const [e, , onE] = useEdgesState<Edge>([
    { id: "1", source: "m1", target: "m2", style: baseEdgeStyle },
    {
      id: "2",
      source: "m2",
      target: "f1",
      type: "smoothstep",
      style: { ...baseEdgeStyle, stroke: "rgb(16 185 129)" },
    },
    {
      id: "3",
      source: "f1",
      target: "f2",
      type: "smoothstep",
      style: { ...baseEdgeStyle, stroke: "rgb(16 185 129)" },
    },
    {
      id: "4",
      source: "m2",
      target: "h1",
      type: "smoothstep",
      style: { ...baseEdgeStyle, stroke: "rgb(245 158 11)" },
    },
    { id: "5", source: "f2", target: "m3", type: "smoothstep", style: baseEdgeStyle },
    { id: "6", source: "h1", target: "m3", type: "smoothstep", style: baseEdgeStyle },
  ]);
  return (
    <FlowWrap>
      <ReactFlow nodes={n} edges={e} nodeTypes={nodeTypes} onNodesChange={onN} onEdgesChange={onE} fitView>
        <Background variant={BackgroundVariant.Dots} gap={18} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 13. Floating Edge
 * ============================================================ */
// FloatingEdge edge type is defined in shared helpers above.
// edgeTypes={{ floating: FloatingEdge }} — edges connect from node centers.

const FloatNode = memo(
  ({ data }: NodeProps<Node<{ label: string; color: string }>>) => (
    <div
      className={`relative rounded-2xl border-2 px-5 py-3 text-sm font-semibold shadow-md min-w-[120px] text-center select-none hover:scale-105 transition-transform ${data.color}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !pointer-events-none"
        style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !pointer-events-none"
        style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
      />
    </div>
  )
);

export function FloatingEdgeFlow() {
  const edgeTypes = { floating: FloatingEdge };
  const nodeTypes = { float: FloatNode };
  const [n, , onN] = useNodesState<Node>([
    {
      id: "a",
      type: "float",
      position: { x: 40, y: 120 },
      data: { label: "Design", color: "border-sky-400 bg-sky-500/10 text-sky-700" },
    },
    {
      id: "b",
      type: "float",
      position: { x: 270, y: 30 },
      data: {
        label: "Frontend",
        color: "border-violet-400 bg-violet-500/10 text-violet-700",
      },
    },
    {
      id: "c",
      type: "float",
      position: { x: 270, y: 220 },
      data: {
        label: "Backend",
        color: "border-emerald-400 bg-emerald-500/10 text-emerald-700",
      },
    },
    {
      id: "d",
      type: "float",
      position: { x: 510, y: 30 },
      data: { label: "Deploy", color: "border-amber-400 bg-amber-500/10 text-amber-700" },
    },
    {
      id: "e",
      type: "float",
      position: { x: 510, y: 220 },
      data: {
        label: "Database",
        color: "border-rose-400 bg-rose-500/10 text-rose-700",
      },
    },
    {
      id: "f",
      type: "float",
      position: { x: 740, y: 125 },
      data: { label: "Live", color: "border-primary bg-primary/10 text-primary" },
    },
  ]);
  const fStyle = { stroke: "hsl(var(--flow-edge))", strokeWidth: 1.8, strokeDasharray: "5 3" };
  const [eg, , onE] = useEdgesState<Edge>([
    {
      id: "1",
      source: "a",
      target: "b",
      type: "floating",
      style: fStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "2",
      source: "a",
      target: "c",
      type: "floating",
      style: fStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "3",
      source: "b",
      target: "d",
      type: "floating",
      style: fStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "4",
      source: "c",
      target: "d",
      type: "floating",
      style: fStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "5",
      source: "c",
      target: "e",
      type: "floating",
      style: fStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "6",
      source: "d",
      target: "f",
      type: "floating",
      style: fStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "7",
      source: "e",
      target: "f",
      type: "floating",
      animated: true,
      style: { stroke: "var(--primary)", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ]);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={n}
        edges={eg}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onN}
        onEdgesChange={onE}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 14. State Machine
 * ============================================================ */
const StateNode = memo(
  ({
    data,
  }: NodeProps<
    Node<{ label: string; status: "idle" | "loading" | "success" | "error" }>
  >) => {
    const s = {
      idle: "border-border bg-muted text-muted-foreground",
      loading: "border-sky-400 bg-sky-500/10 text-sky-700",
      success: "border-emerald-400 bg-emerald-500/10 text-emerald-700",
      error: "border-rose-400 bg-rose-500/10 text-rose-700",
    }[data.status];
    const icons = {
      idle: <Clock size={14} />,
      loading: <Sparkles size={14} />,
      success: <CheckCircle2 size={14} />,
      error: <AlertTriangle size={14} />,
    }[data.status];
    return (
      <div
        className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold min-w-[140px] justify-center shadow-sm ${s}`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!h-2 !w-2 !bg-current !opacity-60 !border-none"
        />
        {icons}
        {data.label}
        <Handle
          type="source"
          position={Position.Right}
          className="!h-2 !w-2 !bg-current !opacity-60 !border-none"
        />
      </div>
    );
  }
);

export function StateMachineFlow() {
  const nodeTypes = { state: StateNode };
  const [n, , onN] = useNodesState<Node>([
    {
      id: "idle",
      type: "state",
      position: { x: 0, y: 90 },
      data: { label: "Idle", status: "idle" },
    },
    {
      id: "auth",
      type: "state",
      position: { x: 230, y: 90 },
      data: { label: "Authenticating", status: "loading" },
    },
    {
      id: "ok",
      type: "state",
      position: { x: 500, y: 20 },
      data: { label: "Authenticated", status: "success" },
    },
    {
      id: "err",
      type: "state",
      position: { x: 500, y: 170 },
      data: { label: "Error", status: "error" },
    },
    {
      id: "active",
      type: "state",
      position: { x: 760, y: 20 },
      data: { label: "Session Active", status: "success" },
    },
  ]);
  const [e, , onE] = useEdgesState<Edge>([
    {
      id: "1",
      source: "idle",
      target: "auth",
      label: "login",
      type: "smoothstep",
      style: baseEdgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "2",
      source: "auth",
      target: "ok",
      label: "success",
      type: "smoothstep",
      style: { ...baseEdgeStyle, stroke: "rgb(16 185 129)" },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "3",
      source: "auth",
      target: "err",
      label: "failure",
      type: "smoothstep",
      style: { ...baseEdgeStyle, stroke: "rgb(239 68 68)" },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "4",
      source: "err",
      target: "auth",
      label: "retry",
      type: "smoothstep",
      style: { ...baseEdgeStyle, stroke: "rgb(245 158 11)", strokeDasharray: "5 3" },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "5",
      source: "ok",
      target: "active",
      label: "token ok",
      type: "smoothstep",
      animated: true,
      style: { ...baseEdgeStyle, stroke: "rgb(16 185 129)" },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "6",
      source: "active",
      target: "idle",
      label: "logout",
      type: "smoothstep",
      style: { ...baseEdgeStyle, strokeDasharray: "5 3" },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ]);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={n}
        edges={e}
        nodeTypes={nodeTypes}
        onNodesChange={onN}
        onEdgesChange={onE}
        fitView
        fitViewOptions={{ padding: 0.25 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 15. Approval Workflow
 * ============================================================ */
const DocNode = memo(
  ({
    data,
  }: NodeProps<
    Node<{
      label: string;
      status: "draft" | "review" | "approved" | "rejected" | "live";
    }>
  >) => {
    const cfg = {
      draft: { wrap: "border-border bg-muted/60 text-foreground", badge: "bg-muted text-muted-foreground" },
      review: { wrap: "border-amber-300 bg-amber-500/8 text-amber-800", badge: "bg-amber-100 text-amber-700" },
      approved: { wrap: "border-emerald-300 bg-emerald-500/8 text-emerald-800", badge: "bg-emerald-100 text-emerald-700" },
      rejected: { wrap: "border-rose-300 bg-rose-500/8 text-rose-800", badge: "bg-rose-100 text-rose-700" },
      live: { wrap: "border-primary/40 bg-primary/6 text-primary", badge: "bg-primary/10 text-primary" },
    }[data.status];
    return (
      <div className={`rounded-xl border px-4 py-3 shadow-sm min-w-[148px] ${cfg.wrap}`}>
        <Handle
          type="target"
          position={Position.Left}
          className="!h-2 !w-2 !bg-current !opacity-50 !border-none"
        />
        <div className="flex items-start gap-2">
          <FileText size={15} className="mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-semibold leading-tight">{data.label}</div>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.badge}`}>
              {data.status}
            </span>
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Right}
          className="!h-2 !w-2 !bg-current !opacity-50 !border-none"
        />
      </div>
    );
  }
);

export function ApprovalFlow() {
  const nodeTypes = { doc: DocNode };
  const [n, , onN] = useNodesState<Node>([
    {
      id: "draft",
      type: "doc",
      position: { x: 0, y: 90 },
      data: { label: "Feature Doc", status: "draft" },
    },
    {
      id: "review",
      type: "doc",
      position: { x: 240, y: 90 },
      data: { label: "Under Review", status: "review" },
    },
    {
      id: "approved",
      type: "doc",
      position: { x: 490, y: 20 },
      data: { label: "Approved", status: "approved" },
    },
    {
      id: "rejected",
      type: "doc",
      position: { x: 490, y: 180 },
      data: { label: "Needs Work", status: "rejected" },
    },
    {
      id: "live",
      type: "doc",
      position: { x: 740, y: 20 },
      data: { label: "Published", status: "live" },
    },
  ]);
  const [e, , onE] = useEdgesState<Edge>([
    {
      id: "1",
      source: "draft",
      target: "review",
      label: "submit",
      type: "smoothstep",
      style: baseEdgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "2",
      source: "review",
      target: "approved",
      label: "approve ✓",
      type: "smoothstep",
      style: { ...baseEdgeStyle, stroke: "rgb(16 185 129)" },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "3",
      source: "review",
      target: "rejected",
      label: "reject ✗",
      type: "smoothstep",
      style: { ...baseEdgeStyle, stroke: "rgb(239 68 68)" },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "4",
      source: "rejected",
      target: "draft",
      label: "revise",
      type: "smoothstep",
      style: { ...baseEdgeStyle, stroke: "rgb(245 158 11)", strokeDasharray: "5 3" },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "5",
      source: "approved",
      target: "live",
      label: "publish",
      type: "smoothstep",
      animated: true,
      style: { ...baseEdgeStyle, stroke: "var(--primary)" },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ]);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={n}
        edges={e}
        nodeTypes={nodeTypes}
        onNodesChange={onN}
        onEdgesChange={onE}
        fitView
        fitViewOptions={{ padding: 0.25 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 16. Network Topology
 * ============================================================ */
const NetNode = memo(
  ({
    data,
  }: NodeProps<
    Node<{ label: string; kind: "internet" | "firewall" | "lb" | "server" | "db" | "cdn" }>
  >) => {
    const cfg = {
      internet: { icon: <Globe size={16} />, c: "border-sky-400 bg-sky-500/10 text-sky-700" },
      firewall: { icon: <ShieldCheck size={16} />, c: "border-rose-400 bg-rose-500/10 text-rose-700" },
      lb: { icon: <ArrowLeftRight size={16} />, c: "border-amber-400 bg-amber-500/10 text-amber-700" },
      server: { icon: <Server size={16} />, c: "border-emerald-400 bg-emerald-500/10 text-emerald-700" },
      db: { icon: <Database size={16} />, c: "border-violet-400 bg-violet-500/10 text-violet-700" },
      cdn: { icon: <Network size={16} />, c: "border-cyan-400 bg-cyan-500/10 text-cyan-700" },
    }[data.kind];
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium shadow-sm ${cfg.c}`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!h-2 !w-2 !bg-current !opacity-60 !border-none"
        />
        {cfg.icon}
        <span>{data.label}</span>
        <Handle
          type="source"
          position={Position.Right}
          className="!h-2 !w-2 !bg-current !opacity-60 !border-none"
        />
      </div>
    );
  }
);

export function NetworkTopologyFlow() {
  const nodeTypes = { net: NetNode };
  const mk = (
    id: string,
    x: number,
    y: number,
    label: string,
    kind: "internet" | "firewall" | "lb" | "server" | "db" | "cdn"
  ): Node => ({
    id,
    type: "net",
    position: { x, y },
    data: { label, kind },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  });
  const [n, , onN] = useNodesState<Node>([
    mk("net", 0, 130, "Internet", "internet"),
    mk("cdn", 170, 30, "CDN", "cdn"),
    mk("fw", 170, 130, "Firewall", "firewall"),
    mk("lb", 360, 130, "Load Balancer", "lb"),
    mk("web1", 570, 60, "Web Server 1", "server"),
    mk("web2", 570, 140, "Web Server 2", "server"),
    mk("api", 570, 220, "API Server", "server"),
    mk("db1", 790, 100, "DB Primary", "db"),
    mk("db2", 790, 200, "DB Replica", "db"),
  ]);
  const [e, , onE] = useEdgesState<Edge>([
    { id: "1", source: "net", target: "cdn", style: baseEdgeStyle },
    { id: "2", source: "net", target: "fw", style: baseEdgeStyle },
    {
      id: "3",
      source: "fw",
      target: "lb",
      animated: true,
      style: { ...baseEdgeStyle, stroke: "var(--primary)" },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    { id: "4", source: "lb", target: "web1", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "5", source: "lb", target: "web2", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "6", source: "lb", target: "api", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "7", source: "api", target: "db1", style: baseEdgeStyle },
    {
      id: "8",
      source: "db1",
      target: "db2",
      label: "replica",
      style: { ...baseEdgeStyle, strokeDasharray: "5 3" },
    },
  ]);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={n}
        edges={e}
        nodeTypes={nodeTypes}
        onNodesChange={onN}
        onEdgesChange={onE}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 17. Swimlane
 * ============================================================ */
export function SwimlaneFlow() {
  const LW = 720;
  const LH = 130;
  const GAP = 18;
  const [n, , onN] = useNodesState<Node>([
    {
      id: "lane-fe",
      position: { x: 0, y: 0 },
      data: { label: "Frontend" },
      style: {
        width: LW,
        height: LH,
        background: "hsl(210 80% 55% / 0.05)",
        border: "1px dashed hsl(210 80% 55% / 0.45)",
        borderRadius: 14,
      },
    },
    {
      id: "lane-be",
      position: { x: 0, y: LH + GAP },
      data: { label: "Backend" },
      style: {
        width: LW,
        height: LH,
        background: "hsl(160 60% 40% / 0.06)",
        border: "1px dashed hsl(160 60% 40% / 0.45)",
        borderRadius: 14,
      },
    },
    {
      id: "lane-db",
      position: { x: 0, y: (LH + GAP) * 2 },
      data: { label: "Database" },
      style: {
        width: LW,
        height: LH,
        background: "hsl(270 55% 55% / 0.05)",
        border: "1px dashed hsl(270 55% 55% / 0.45)",
        borderRadius: 14,
      },
    },
    {
      id: "fe1",
      parentId: "lane-fe",
      extent: "parent",
      position: { x: 50, y: 48 },
      data: { label: "User Form" },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: "fe2",
      parentId: "lane-fe",
      extent: "parent",
      position: { x: 260, y: 48 },
      data: { label: "Validation" },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: "fe3",
      parentId: "lane-fe",
      extent: "parent",
      position: { x: 470, y: 48 },
      data: { label: "HTTP Call" },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: "be1",
      parentId: "lane-be",
      extent: "parent",
      position: { x: 260, y: 48 },
      data: { label: "Route Handler" },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: "be2",
      parentId: "lane-be",
      extent: "parent",
      position: { x: 470, y: 48 },
      data: { label: "Service Layer" },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: "db1",
      parentId: "lane-db",
      extent: "parent",
      position: { x: 370, y: 48 },
      data: { label: "SQL Query" },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: "db2",
      parentId: "lane-db",
      extent: "parent",
      position: { x: 560, y: 48 },
      data: { label: "Result Set" },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
  ]);
  const [e, , onE] = useEdgesState<Edge>([
    { id: "f1", source: "fe1", target: "fe2", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "f2", source: "fe2", target: "fe3", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
    {
      id: "f3",
      source: "fe3",
      target: "be1",
      type: "smoothstep",
      animated: true,
      style: baseEdgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    { id: "b1", source: "be1", target: "be2", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
    {
      id: "b2",
      source: "be2",
      target: "db1",
      type: "smoothstep",
      animated: true,
      style: baseEdgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    { id: "d1", source: "db1", target: "db2", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
  ]);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={n}
        edges={e}
        onNodesChange={onN}
        onEdgesChange={onE}
        fitView
        fitViewOptions={{ padding: 0.12 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 18. Timeline
 * ============================================================ */
const TimelineNode = memo(
  ({
    data,
  }: NodeProps<Node<{ date: string; event: string; color: string; dot: string }>>) => (
    <div className="flex flex-col items-center gap-2 min-w-[120px]">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !bg-primary !border-2 !border-background"
      />
      <div className={`w-3 h-3 rounded-full border-2 ${data.dot}`} />
      <div className={`rounded-xl border px-3 py-2.5 text-center shadow-sm ${data.color}`}>
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">{data.date}</div>
        <div className="text-xs font-semibold leading-tight mt-0.5">{data.event}</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !bg-primary !border-2 !border-background"
      />
    </div>
  )
);

export function TimelineFlow() {
  const nodeTypes = { tl: TimelineNode };
  const events = [
    { date: "Jan 2020", event: "Founded", color: "border-sky-300 bg-sky-500/8 text-sky-800", dot: "border-sky-400 bg-sky-400" },
    { date: "Jun 2020", event: "MVP Launch", color: "border-violet-300 bg-violet-500/8 text-violet-800", dot: "border-violet-400 bg-violet-400" },
    { date: "Mar 2021", event: "Beta · 1k Users", color: "border-emerald-300 bg-emerald-500/8 text-emerald-800", dot: "border-emerald-400 bg-emerald-400" },
    { date: "Nov 2021", event: "Series A · $5M", color: "border-amber-300 bg-amber-500/8 text-amber-800", dot: "border-amber-400 bg-amber-400" },
    { date: "Apr 2022", event: "10k Users", color: "border-rose-300 bg-rose-500/8 text-rose-800", dot: "border-rose-400 bg-rose-400" },
    { date: "2024", event: "Series B · $20M", color: "border-primary/50 bg-primary/8 text-primary", dot: "border-primary bg-primary" },
  ];
  const [n, , onN] = useNodesState<Node>(
    events.map((ev, i) => ({
      id: `t${i}`,
      type: "tl",
      position: { x: i * 195, y: 80 },
      data: ev,
    }))
  );
  const [e, , onE] = useEdgesState<Edge>(
    events.slice(1).map((_, i) => ({
      id: `e${i}`,
      source: `t${i}`,
      target: `t${i + 1}`,
      style: { ...baseEdgeStyle, strokeDasharray: "4 3" },
      markerEnd: { type: MarkerType.ArrowClosed },
    }))
  );
  return (
    <FlowWrap>
      <ReactFlow
        nodes={n}
        edges={e}
        nodeTypes={nodeTypes}
        onNodesChange={onN}
        onEdgesChange={onE}
        fitView
        fitViewOptions={{ padding: 0.25 }}
      >
        <Background variant={BackgroundVariant.Lines} gap={32} lineWidth={0.4} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 19. Microservices
 * ============================================================ */
const ServiceNode = memo(
  ({
    data,
  }: NodeProps<Node<{ label: string; sub: string; icon: React.ReactNode; color: string }>>) => (
    <div
      className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 shadow-sm min-w-[155px] ${data.color}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !bg-current !opacity-60 !border-none"
      />
      <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-current/10">
        {data.icon}
      </div>
      <div>
        <div className="text-sm font-semibold leading-tight">{data.label}</div>
        <div className="text-[10px] opacity-60 font-medium">{data.sub}</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !bg-current !opacity-60 !border-none"
      />
    </div>
  )
);

export function MicroservicesFlow() {
  const nodeTypes = { svc: ServiceNode };
  const mk = (
    id: string,
    x: number,
    y: number,
    label: string,
    sub: string,
    icon: React.ReactNode,
    color: string
  ): Node => ({
    id,
    type: "svc",
    position: { x, y },
    data: { label, sub, icon, color },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  });
  const [n, , onN] = useNodesState<Node>([
    mk("client", 0, 160, "Client", "Web / Mobile", <Globe size={16} />, "border-sky-400 text-sky-700"),
    mk("gw", 200, 160, "API Gateway", "nginx / kong", <Layers size={16} />, "border-amber-400 text-amber-700"),
    mk("auth", 430, 40, "Auth Service", "JWT / OAuth2", <ShieldCheck size={16} />, "border-violet-400 text-violet-700"),
    mk("user", 430, 140, "User Service", "CRUD · Postgres", <User size={16} />, "border-emerald-400 text-emerald-700"),
    mk("order", 430, 240, "Order Service", "Events · Mongo", <Package size={16} />, "border-rose-400 text-rose-700"),
    mk("notify", 430, 340, "Notify Service", "Email · SMS", <Mail size={16} />, "border-cyan-400 text-cyan-700"),
    mk("pg", 680, 140, "PostgreSQL", "Primary DB", <Database size={16} />, "border-blue-400 text-blue-700"),
    mk("mongo", 680, 240, "MongoDB", "Document store", <HardDrive size={16} />, "border-green-400 text-green-700"),
  ]);
  const [e, , onE] = useEdgesState<Edge>([
    {
      id: "c-gw",
      source: "client",
      target: "gw",
      animated: true,
      style: { ...baseEdgeStyle, stroke: "var(--primary)", strokeWidth: 2.5 },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    { id: "gw-a", source: "gw", target: "auth", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "gw-u", source: "gw", target: "user", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "gw-o", source: "gw", target: "order", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "gw-n", source: "gw", target: "notify", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "u-p", source: "user", target: "pg", style: baseEdgeStyle },
    { id: "o-m", source: "order", target: "mongo", style: baseEdgeStyle },
  ]);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={n}
        edges={e}
        nodeTypes={nodeTypes}
        onNodesChange={onN}
        onEdgesChange={onE}
        fitView
        fitViewOptions={{ padding: 0.18 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 20. Dependency Graph
 * ============================================================ */
const PkgNode = memo(
  ({
    data,
  }: NodeProps<Node<{ name: string; version: string; color: string }>>) => (
    <div
      className={`rounded-lg border px-3 py-2 text-center shadow-sm min-w-[110px] ${data.color}`}
    >
      <Handle type="target" position={Position.Left} className="!h-1.5 !w-1.5 !bg-current !opacity-50 !border-none" />
      <div className="text-xs font-bold">{data.name}</div>
      <div className="text-[10px] opacity-55 font-mono mt-0.5">{data.version}</div>
      <Handle type="source" position={Position.Right} className="!h-1.5 !w-1.5 !bg-current !opacity-50 !border-none" />
    </div>
  )
);

export function DependencyGraphFlow() {
  const nodeTypes = { pkg: PkgNode };
  const mk = (id: string, x: number, y: number, name: string, version: string, color: string): Node => ({
    id,
    type: "pkg",
    position: { x, y },
    data: { name, version, color },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  });
  const [n, , onN] = useNodesState<Node>([
    mk("app", 0, 170, "my-app", "1.0.0", "border-primary/50 bg-primary/8 text-primary"),
    mk("react", 200, 80, "react", "^19.0", "border-sky-400 bg-sky-500/8 text-sky-700"),
    mk("xyflow", 200, 170, "@xyflow/react", "^12.11", "border-violet-400 bg-violet-500/8 text-violet-700"),
    mk("tw", 200, 260, "tailwindcss", "^4.0", "border-cyan-400 bg-cyan-500/8 text-cyan-700"),
    mk("lucide", 200, 350, "lucide-react", "^0.x", "border-amber-400 bg-amber-500/8 text-amber-700"),
    mk("rdm", 430, 30, "react-dom", "^19.0", "border-sky-300 bg-sky-500/6 text-sky-600"),
    mk("zustand", 430, 130, "zustand", "^4.x", "border-violet-300 bg-violet-500/6 text-violet-600"),
    mk("d3", 430, 220, "d3-zoom", "^3.0", "border-emerald-400 bg-emerald-500/8 text-emerald-700"),
    mk("postcss", 430, 310, "postcss", "^8.x", "border-cyan-300 bg-cyan-500/6 text-cyan-600"),
  ]);
  const es: Edge[] = [
    { id: "1", source: "app", target: "react", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "2", source: "app", target: "xyflow", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "3", source: "app", target: "tw", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "4", source: "app", target: "lucide", style: baseEdgeStyle, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "5", source: "react", target: "rdm", style: { ...baseEdgeStyle, opacity: 0.5 } },
    { id: "6", source: "xyflow", target: "zustand", style: { ...baseEdgeStyle, opacity: 0.5 } },
    { id: "7", source: "xyflow", target: "d3", style: { ...baseEdgeStyle, opacity: 0.5 } },
    { id: "8", source: "tw", target: "postcss", style: { ...baseEdgeStyle, opacity: 0.5 } },
  ];
  const [e, , onE] = useEdgesState<Edge>(es);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={n}
        edges={e}
        nodeTypes={nodeTypes}
        onNodesChange={onN}
        onEdgesChange={onE}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 21. Kanban Flow
 * ============================================================ */
const KanbanCard = memo(
  ({
    data,
  }: NodeProps<Node<{ title: string; tag: string; tagColor: string }>>) => (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm min-w-[150px] hover:shadow-md transition-shadow">
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-primary !border-none !opacity-0" />
      <div className="text-sm font-medium leading-tight text-foreground">{data.title}</div>
      <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${data.tagColor}`}>
        {data.tag}
      </span>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-primary !border-none !opacity-0" />
    </div>
  )
);

export function KanbanFlow() {
  const nodeTypes = { card: KanbanCard };
  const COL_W = 200;
  const COL_H = 340;
  const GAP_X = 40;
  const cols = [
    { id: "todo", label: "Todo", x: 0, color: "hsl(220 15% 55% / 0.08)", border: "hsl(220 15% 55% / 0.35)" },
    { id: "wip", label: "In Progress", x: COL_W + GAP_X, color: "hsl(210 80% 55% / 0.06)", border: "hsl(210 80% 55% / 0.4)" },
    { id: "review", label: "Review", x: (COL_W + GAP_X) * 2, color: "hsl(38 80% 50% / 0.07)", border: "hsl(38 80% 50% / 0.4)" },
    { id: "done", label: "Done", x: (COL_W + GAP_X) * 3, color: "hsl(160 60% 40% / 0.07)", border: "hsl(160 60% 40% / 0.4)" },
  ];
  const tasks = [
    { id: "t1", col: "todo", y: 60, title: "Design system", tag: "UI", tagColor: "bg-sky-100 text-sky-700" },
    { id: "t2", col: "todo", y: 150, title: "Auth flow", tag: "Feature", tagColor: "bg-violet-100 text-violet-700" },
    { id: "t3", col: "wip", y: 60, title: "API routes", tag: "Backend", tagColor: "bg-emerald-100 text-emerald-700" },
    { id: "t4", col: "wip", y: 160, title: "Dashboard UI", tag: "UI", tagColor: "bg-sky-100 text-sky-700" },
    { id: "t5", col: "review", y: 60, title: "Unit tests", tag: "Testing", tagColor: "bg-amber-100 text-amber-700" },
    { id: "t6", col: "review", y: 160, title: "DB migrations", tag: "Backend", tagColor: "bg-emerald-100 text-emerald-700" },
    { id: "t7", col: "done", y: 60, title: "Project setup", tag: "Infra", tagColor: "bg-rose-100 text-rose-700" },
    { id: "t8", col: "done", y: 160, title: "CI/CD pipeline", tag: "Infra", tagColor: "bg-rose-100 text-rose-700" },
  ];
  const colMap = Object.fromEntries(cols.map((c) => [c.id, c.x]));
  const [n, , onN] = useNodesState<Node>([
    ...cols.map((c) => ({
      id: c.id,
      position: { x: c.x, y: 0 },
      data: { label: c.label },
      style: {
        width: COL_W,
        height: COL_H,
        background: c.color,
        border: `1px dashed ${c.border}`,
        borderRadius: 14,
      },
      selectable: false,
      draggable: false,
    })),
    ...tasks.map((t) => ({
      id: t.id,
      type: "card",
      parentId: t.col,
      extent: "parent" as const,
      position: { x: 20, y: t.y },
      data: { title: t.title, tag: t.tag, tagColor: t.tagColor },
    })),
  ]);
  const [e, , onE] = useEdgesState<Edge>([
    { id: "e1", source: "t2", target: "t3", type: "smoothstep", animated: true, style: { ...baseEdgeStyle, strokeDasharray: "5 3" } },
    { id: "e2", source: "t3", target: "t5", type: "smoothstep", animated: true, style: { ...baseEdgeStyle, strokeDasharray: "5 3" } },
    { id: "e3", source: "t5", target: "t7", type: "smoothstep", style: { ...baseEdgeStyle, stroke: "rgb(16 185 129)" } },
  ]);
  return (
    <FlowWrap>
      <ReactFlow
        nodes={n}
        edges={e}
        nodeTypes={nodeTypes}
        onNodesChange={onN}
        onEdgesChange={onE}
        fitView
        fitViewOptions={{ padding: 0.12 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ============================================================
 * 22. Entity Relationship Diagram
 * ============================================================ */
const TableNode = memo(
  ({
    data,
  }: NodeProps<Node<{ name: string; fields: { name: string; type: string; pk?: boolean; fk?: boolean }[] }>>) => (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden min-w-[165px]">
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-primary !opacity-60 !border-none" />
      <div className="px-3 py-2 text-xs font-bold tracking-wide bg-primary text-primary-foreground">
        {data.name}
      </div>
      <div className="px-3 py-2 space-y-1.5">
        {data.fields.map((f) => (
          <div key={f.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {f.pk && (
                <span className="text-[9px] font-bold text-amber-600 bg-amber-100 rounded px-1">PK</span>
              )}
              {f.fk && (
                <span className="text-[9px] font-bold text-sky-600 bg-sky-100 rounded px-1">FK</span>
              )}
              <span className="text-xs font-medium text-foreground">{f.name}</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{f.type}</span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-primary !opacity-60 !border-none" />
    </div>
  )
);

export function ERDFlow() {
  const nodeTypes = { table: TableNode };
  const [n, , onN] = useNodesState<Node>([
    {
      id: "users",
      type: "table",
      position: { x: 0, y: 80 },
      data: {
        name: "users",
        fields: [
          { name: "id", type: "uuid", pk: true },
          { name: "email", type: "text" },
          { name: "name", type: "text" },
          { name: "created_at", type: "timestamptz" },
        ],
      },
    },
    {
      id: "orders",
      type: "table",
      position: { x: 300, y: 0 },
      data: {
        name: "orders",
        fields: [
          { name: "id", type: "uuid", pk: true },
          { name: "user_id", type: "uuid", fk: true },
          { name: "total", type: "numeric" },
          { name: "status", type: "text" },
        ],
      },
    },
    {
      id: "products",
      type: "table",
      position: { x: 580, y: 0 },
      data: {
        name: "products",
        fields: [
          { name: "id", type: "uuid", pk: true },
          { name: "name", type: "text" },
          { name: "price", type: "numeric" },
          { name: "stock", type: "int" },
        ],
      },
    },
    {
      id: "order_items",
      type: "table",
      position: { x: 300, y: 230 },
      data: {
        name: "order_items",
        fields: [
          { name: "id", type: "uuid", pk: true },
          { name: "order_id", type: "uuid", fk: true },
          { name: "product_id", type: "uuid", fk: true },
          { name: "qty", type: "int" },
        ],
      },
    },
  ]);
  const relStyle = { stroke: "hsl(var(--flow-edge))", strokeWidth: 1.8 };
  const [e, , onE] = useEdgesState<Edge>([
    {
      id: "u-o",
      source: "users",
      target: "orders",
      label: "1 → N",
      type: "smoothstep",
      style: relStyle,
    },
    {
      id: "o-oi",
      source: "orders",
      target: "order_items",
      label: "1 → N",
      type: "smoothstep",
      style: relStyle,
    },
    {
      id: "p-oi",
      source: "products",
      target: "order_items",
      label: "1 → N",
      type: "smoothstep",
      style: relStyle,
    },
  ]);
  return ( 
    <FlowWrap>
      <ReactFlow
        nodes={n}
        edges={e}
        nodeTypes={nodeTypes}
        onNodesChange={onN}
        onEdgesChange={onE}
        fitView
        fitViewOptions={{ padding: 0.25 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </FlowWrap>
  );
}

/* ---------- Registry ---------- */

export type ExampleProps = {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>; // Explicitly type ExampleComponent as a React component
};

export const EXAMPLES: ExampleProps[] = [
  { id: "basic", title: "Basic Flow", description: "HTTP request pipeline: receive → auth → cache → process → respond.", component: BasicFlow },
  { id: "custom", title: "Custom Branded Nodes", description: "Iconed card nodes with shadows, descriptions, and handles.", component: CustomNodesFlow },
  { id: "pipeline", title: "Animated Pipeline", description: "Stream-style left-to-right pipeline with flowing animated edges.", component: AnimatedPipeline },
  { id: "status", title: "Status Nodes", description: "Color-coded nodes for CI/CD job states: ok, warn, waiting.", component: StatusFlow },
  { id: "mindmap", title: "Radial Mind Map", description: "2-level radial branches with invisible handles and sub-topics.", component: MindMapFlow },
  { id: "decision", title: "Decision Tree", description: "Smoothstep edges with yes/no labels and branching paths.", component: DecisionTree },
  { id: "org", title: "Org Chart", description: "Top-down hierarchy with avatar-style person nodes.", component: OrgChart },
  { id: "subflow", title: "Grouped Subflows", description: "Parent container groups that clip and constrain child nodes.", component: SubflowGroups },
  { id: "horizontal", title: "Horizontal Workflow", description: "Left-to-right automation pipeline with animated arrows.", component: HorizontalWorkflow },
  { id: "minimap", title: "Mini Map Overview", description: "Full tech-stack architecture navigable via the mini map.", component: MiniMapFlow },
  { id: "gate", title: "Multi-Handle Gate", description: "AND / OR / NAND logic circuit with per-handle wiring.", component: LogicGateFlow },
  { id: "git", title: "Git Branch Flow", description: "Branch, feature, hotfix and merge commit visualization.", component: GitFlow },
  { id: "floating", title: "Floating Edges", description: "Custom bezier edges drawn from node centers — no fixed handles.", component: FloatingEdgeFlow },
  { id: "state", title: "State Machine", description: "Auth state transitions: idle → authenticating → success / error.", component: StateMachineFlow },
  { id: "approval", title: "Approval Workflow", description: "Document lifecycle: draft → review → approved / rejected → live.", component: ApprovalFlow },
  { id: "network", title: "Network Topology", description: "Internet → CDN / firewall → load balancer → servers → databases.", component: NetworkTopologyFlow },
  { id: "swimlane", title: "Swimlane", description: "Three horizontal lanes: Frontend, Backend and Database layers.", component: SwimlaneFlow },
  { id: "timeline", title: "Timeline", description: "Chronological product milestone nodes with colored date badges.", component: TimelineFlow },
  { id: "microservices", title: "Microservices", description: "API gateway routing to auth, user, order, and notify services.", component: MicroservicesFlow },
  { id: "deps", title: "Dependency Graph", description: "Package dependency tree from app root to transitive deps.", component: DependencyGraphFlow },
  { id: "kanban", title: "Kanban Board", description: "Todo → In Progress → Review → Done with card task nodes.", component: KanbanFlow },
  { id: "erd", title: "ERD", description: "Entity relationship diagram with PK/FK badges and relation labels.", component: ERDFlow },
];

const ExamplesPage = () => {
const ExampleCard = ({ example }: { example: ExampleProps }): ReactElement => {
        const ExampleComponent = example.component;
      const Example = example.component;
      return (
        <div className="flex gap-2 min-w-[50vw] mx-auto">
             <Accordion type="multiple">
                {/* {EXAMPLES.map((example) => ( */}
                    <AccordionItem key={example.id} value={example.id}>
                        <AccordionTrigger className="text-left min-w-[50vw] hover:bg-primary/10 hover:border-primary hover:border hover:text-magenta-300 pl-6 text-2xl">{example.title}</AccordionTrigger>
                        <AccordionContent>
                         <p className="py-3 pl-6 text-sm text-xl border-0 text-muted-foreground">{example.description}</p>
                        <div className="h-[500px] col-span-1 col-start-2 mr-2">
                        <Example />
                        </div>
                        </AccordionContent>
                    </AccordionItem>
                {/* ))} */}
             </Accordion>
        </div>

      );    
    }
  return (
            <>
            <SiteHeader />
            <div className="flex flex-col gap-2">
            {EXAMPLES.map((ex) => (
                <ExampleCard key={ex.id} example={ex} />
                
                
            ))}
            {/* <div className="w-full h-[500px]">
                <BasicFlow />
            </div>
            <div className="w-full h-[500px]">
                <CustomNodesFlow />
            </div>
            <div className="w-full h-[500px]">
                <AnimatedPipeline />
            </div>
            <div className="w-full h-[500px]">
                <StatusFlow />
            </div>
            <div className="w-full h-[500px]">
                <MindMapFlow />
            </div>
            <div className="w-full h-[500px]">
                <DecisionTree />
            </div>
            <div className="w-full h-[500px]">
                <OrgChart />
            </div>
            <div className="w-full h-[500px]">
                <SubflowGroups />
            </div>
            <div className="w-full h-[500px]">
                <HorizontalWorkflow />
            </div>
            <div className="w-full h-[500px]">
                <MiniMapFlow />
            </div>
            <div className="w-full h-[500px]">
                <LogicGateFlow />
            </div>
            <div className="w-full h-[500px]">
                <GitFlow />
            </div>
            <div className="w-full h-[500px]">
                <FloatingEdgeFlow />
            </div>
            <div className="w-full h-[500px]">
                <StateMachineFlow />
            </div>
            <div className="w-full h-[500px]">
                <ApprovalFlow />
            </div>
            <div className="w-full h-[500px]">
                <NetworkTopologyFlow />
            </div>
            <div className="w-full h-[500px]">
                <SwimlaneFlow />
            </div>
            <div className="w-full h-[500px]">
                <TimelineFlow />
            </div>
            <div className="w-full h-[500px]">
                <MicroservicesFlow />
            </div>
            <div className="w-full h-[500px]">
                <DependencyGraphFlow />
            </div>
            <div className="w-full h-[500px]">
                <KanbanFlow />
            </div>
            <div className="w-full h-[500px]">
                <ERDFlow />
            </div> */}
        </div>
    </>
  );
}

export default ExamplesPage;

        {/* <div className="w-[30vw] col-span-1 col-start-1 h-[300px] hover:bg-primary/10 border border-primary max-w-[500px] rounded-lg ml-6 p-3">
        <Link href={`/examples#${example.id}`} className="flex flex-col gap-2 border-0">
          <div className="flex items-center justify-between gap-2 border-0">
            <h2 className="text-lg font-semibold border-0">{example.title}</h2>
            <ArrowRight className="w-4 h-4" />
          </div>
          <p className="text-sm border-0 text-muted-foreground">{example.description}</p>
          <Example />
        </Link>
        </div>
        <div className="w-[70vw] h-[300px] col-span-1 col-start-2 mr-2">
          <ExampleComponent />
          </div>
        </div> */}