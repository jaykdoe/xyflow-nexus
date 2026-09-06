"use client"

import { useMemo } from "react"
import { Background, BackgroundVariant, type Node, type Edge } from "@xyflow/react"
import { NodeGraphEditor, useBuildGraphConfig, DagreLayoutEngine } from "@clarkmcc/ngraph"

/**
 * A working ngraph (@clarkmcc/ngraph) demo.
 *
 * ngraph builds a config-driven node-building layer on top of @xyflow/react:
 * you declare `valueTypes`, `nodeKinds`, and `nodeTypes`, and ngraph renders
 * the node headers, typed input fields, and linked input/output handles for you.
 * Styles are auto-injected by the package at runtime (SSR-safe).
 */
export function NgraphEditor() {
  // `useBuildGraphConfig` turns a plain config object into a validated GraphConfig.
  // Declared inline so the string literals keep their expected union types.
  const config = useBuildGraphConfig({
    valueTypes: {
      number: {
        name: "Number",
        color: "#f59e0b",
        shape: "circle",
        inputEditor: "number",
        defaultValue: 0,
      },
      string: {
        name: "String",
        color: "#ec4899",
        shape: "circle",
        inputEditor: "text",
        defaultValue: "",
      },
      boolean: {
        name: "Boolean",
        color: "#22c55e",
        shape: "diamond",
        inputEditor: "checkbox",
        defaultValue: false,
      },
    },
    nodeKinds: {
      input: { name: "Input", color: "#ec4899" },
      operator: { name: "Operator", color: "#8b5cf6" },
      output: { name: "Output", color: "#3b82f6" },
    },
    nodeTypes: {
      number: {
        kind: "input",
        name: "Number",
        inputs: [{ name: "Value", id: "value", valueType: "number" }],
        outputs: [{ name: "Out", id: "out", valueType: "number" }],
      },
      label: {
        kind: "input",
        name: "Label",
        inputs: [{ name: "Text", id: "text", valueType: "string" }],
        outputs: [{ name: "Out", id: "out", valueType: "string" }],
      },
      add: {
        kind: "operator",
        name: "Add",
        inputs: [
          { name: "A", id: "a", valueType: "number" },
          { name: "B", id: "b", valueType: "number" },
        ],
        outputs: [{ name: "Sum", id: "sum", valueType: "number" }],
      },
      gate: {
        kind: "operator",
        name: "Gate",
        inputs: [
          { name: "Value", id: "value", valueType: "number" },
          { name: "Enabled", id: "enabled", valueType: "boolean" },
        ],
        outputs: [{ name: "Out", id: "out", valueType: "number" }],
      },
      result: {
        kind: "output",
        name: "Result",
        inputs: [{ name: "Value", id: "value", valueType: "number" }],
      },
    },
  })

  const nodes = useMemo<Node[]>(
    () => [
      { id: "n1", type: "number", position: { x: 0, y: 0 }, data: { value: 8 } },
      { id: "n2", type: "number", position: { x: 0, y: 180 }, data: { value: 34 } },
      { id: "n3", type: "add", position: { x: 320, y: 60 }, data: {} },
      { id: "n4", type: "gate", position: { x: 320, y: 260 }, data: { enabled: true } },
      { id: "n5", type: "result", position: { x: 640, y: 120 }, data: {} },
    ],
    [],
  )

  const edges = useMemo<Edge[]>(() => [], [])

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-xl border border-border bg-card">
      <NodeGraphEditor
        config={config}
        defaultNodes={nodes}
        defaultEdges={edges}
        layoutEngine={new DagreLayoutEngine()}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--muted-foreground))" />
      </NodeGraphEditor>
    </div>
  )
}
