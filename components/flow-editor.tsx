"use client"

import { useCallback } from "react"
import { useTheme } from "@/app/theme"
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react"
import { nodeTypes } from "@/components/nodes/custom-nodes"

const initialNodes: Node[] = [
  { id: "1", type: "trigger", position: { x: 0, y: 120 }, data: { label: "On message" } },
  {
    id: "2",
    type: "process",
    position: { x: 260, y: 40 },
    data: { label: "Fetch context", subtitle: "Vector search", icon: "database" },
  },
  {
    id: "3",
    type: "textInput",
    position: { x: 260, y: 200 },
    data: { value: "Summarize the thread" },
  },
  {
    id: "4",
    type: "process",
    position: { x: 540, y: 120 },
    data: { label: "Route", subtitle: "Branch on intent", icon: "branch" },
  },
  { id: "5", type: "output", position: { x: 820, y: 120 }, data: { label: "Reply" } },
]

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3" },
  { id: "e2-4", source: "2", target: "4" },
  { id: "e3-4", source: "3", target: "4" },
  { id: "e4-5", source: "4", target: "5", animated: true },
]

function FlowCanvas() {
  const { resolvedTheme } = useTheme()
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    [setEdges],
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      colorMode={(resolvedTheme as "light" | "dark") ?? "light"}
      fitView
      proOptions={{ hideAttribution: true }}
      className="bg-muted/30"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} />
      <Controls className="!rounded-lg !border !border-border !shadow-sm" />
      <MiniMap
        pannable
        zoomable
        className="!rounded-lg !border !border-border"
        nodeColor="hsl(var(--primary))"
        maskColor="hsl(var(--muted) / 0.6)"
      />
      <Panel position="top-left">
        <span className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          Drag to connect handles · scroll to zoom
        </span>
      </Panel>
    </ReactFlow>
  )
}

export function FlowEditor() {
  return (
    <div className="h-[520px] w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </div>
  )
}
