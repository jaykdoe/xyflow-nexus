---
name: xyflow-nexus
description: >-
  Build node-based editors, workflow builders, DAG pipelines, interactive
  graphs, and diagram tools with xyflow-nexus and React Flow v12 (@xyflow/react).
  Provides a tool suite covering smart obstacle-avoiding edges, adaptive
  degree-balanced rewiring, magnetic repulsion physics, animated particle
  streams, editable waypoint curves, freeform connections, Kahn topological
  DAG auto-layout, geometry shape nodes, studio nodes, and ngraph builders.
license: MIT
allowed-tools:
  - smart_edges
  - adaptive_rewire
  - magnetic_drag
  - particle_edges
  - editable_edges
  - freeform_connections
  - geometry_shape_nodes
  - studio_nodes
  - hierarchical_layout
  - ngraph_builder
  - theme_tokens
metadata:
  v0.kind: "design-system"
  "v0.design-system":
    appearance:
      light:
        background: "#ffffff"
        foreground: "#1a192b"
      dark:
        background: "#1a192b"
        foreground: "#f5f5f5"
  description: An expansive, production-ready node-based design system, workflow pattern library, and component suite built exclusively for React Flow v12 (@xyflow/react) and Next.js.
compatibility: xyflow-nexus^1.1.2
---

# XYFlow Nexus Design System & Component Suite

| 
Package | Version | React Flow Compatibility |
| :--- | :--- | :--- |
| `xyflow-nexus` | `1.0.0` | `@xyflow/react@^12.0.0` |

`xyflow-nexus` is the production-ready design system, workflow pattern library, and tool suite built exclusively for **React Flow v12** (`@xyflow/react`) and **Next.js**.

---

## 🛠️ Allowed Tools Registry

The following 11 tools are available in `xyflow-nexus` for building graph interfaces:

| Tool ID | Capability & Focus | Primary Export(s) | Subpath |
| :--- | :--- | :--- | :--- |
| `smart_edges` | 5 collision-free A* / Jump Point Search edge presets | `SmartBezierEdge`, `SmartSmoothStepEdge`, `SmartStepEdge`, `SmartStraightEdge`, `SmartSimpleBezierEdge`, `createSmartEdge` | `xyflow-nexus/smart-edges` |
| `adaptive_rewire` | Degree-balanced $N$-for-$N$ edge swapping & proximity cues | `useSpiderWeb`, `AddEdge` | `xyflow-nexus/hooks` |
| `magnetic_drag` | Real-time collision avoidance repulsion physics | `useMagneticDrag`, `computeRepulsion` | `xyflow-nexus/hooks` |
| `particle_edges` | Animated SVG data stream edges with speed controls | `ParticleEdge` | `xyflow-nexus` |
| `editable_edges` | Interactive Catmull-Rom spline curves with waypoints | `EditableEdge`, `smoothPath` | `xyflow-nexus` |
| `freeform_connections` | Space-bar interactive sketch connection line | `FreeformConnection` | `xyflow-nexus` |
| `geometry_shape_nodes` | 6 geometric primitives with 8 directional handles | `ShapeNode`, `SHAPE_OPTIONS` | `xyflow-nexus` |
| `studio_nodes` | Production node UI with status rings & badges | `StudioNode` | `xyflow-nexus` |
| `hierarchical_layout` | Kahn-style longest-path topological DAG auto-layout | `hierarchicalLayout` | `xyflow-nexus/layout` |
| `ngraph_builder` | Declarative schema-driven typed node builder | `NgraphEditor` | `xyflow-nexus` |
| `theme_tokens` | Semantic design token palette & CSS variable bridge | `ThemeProvider`, `useTheme` | `xyflow-nexus` |

---

## 🏗️ Core Principles & Golden Rules

1. **Explicit Canvas Height Required**: `<ReactFlow>` expands to fill $100\%$ of its parent container. The container **must** have an explicit height (e.g. `h-[600px]`, `h-screen`, `h-full`), or the canvas renders blank with zero height.
2. **Global CSS Import**: The base stylesheet `@xyflow/react/dist/style.css` must be imported once globally (or in the root layout), or handles and nodes will not layout correctly.
3. **Define `nodeTypes` and `edgeTypes` Outside Render**: Always define `nodeTypes` and `edgeTypes` outside the React component (or memoize them with `useMemo`), otherwise React Flow re-mounts all nodes and edges on every re-render, destroying dragging performance.
4. **React Flow v12 Node Dimensions**: In v12, measured dimensions reside on `node.measured?.width` and `node.measured?.height` (fallback to `node.width` / `node.height`).
5. **Strict Handle ID & Type Mapping**: If an edge specifies `sourceHandle` or `targetHandle`, it **must** match the exact `id` and corresponding handle `type` (`type="source"` vs `type="target"`) on the source/target `<Handle />` elements.
6. **Coordinate Transformation**: Always use `screenToFlowPosition({ x, y })` from `useReactFlow()` to project client mouse/pointer coordinates into canvas coordinates (do not use legacy `project()`).

---

## 📦 Package Installation & Subpaths

```bash
pnpm add xyflow-nexus @xyflow/react
# or
npm install xyflow-nexus @xyflow/react
```

### Subpath Entry Points

- `xyflow-nexus`: Root bundle exporting all tools, components, canvases, and utilities.
- `xyflow-nexus/smart-edges`: Smart edges presets, factory, and pathfinding functions.
- `xyflow-nexus/hooks`: `useSpiderWeb`, `useMagneticDrag`, and `computeRepulsion`.
- `xyflow-nexus/layout`: `hierarchicalLayout` DAG auto-layout engine.
- `xyflow-nexus/router`: `routeOrthogonal` and `polylineToRoundedPath`.

---

## 🔧 Tool Specifications & Implementation Recipes

### Tool 1: `smart_edges`
**Purpose**: Computes dynamic collision-free paths around intermediate canvas nodes using A* grid pathfinding and Jump Point Search.

- **Exports**: `SmartBezierEdge`, `SmartSmoothStepEdge`, `SmartStepEdge`, `SmartStraightEdge`, `SmartSimpleBezierEdge`, `createSmartEdge`, `getSmartEdge`.
- **Import**: `import { SmartBezierEdge, createSmartEdge } from "xyflow-nexus/smart-edges";`
- **Options**:
  - `gridRatio`: Grid resolution in px (default: `10`).
  - `nodePadding`: Clearance boundary around obstacle nodes in px (default: `10`).

```tsx
import { ReactFlow, useNodesState, useEdgesState } from "@xyflow/react";
import {
  SmartBezierEdge,
  SmartSmoothStepEdge,
  SmartStepEdge,
  SmartStraightEdge,
  SmartSimpleBezierEdge,
  createSmartEdge,
} from "xyflow-nexus/smart-edges";

const edgeTypes = {
  smartBezier: SmartBezierEdge,
  smartSmoothStep: SmartSmoothStepEdge,
  smartStep: SmartStepEdge,
  smartStraight: SmartStraightEdge,
  smartSimpleBezier: SmartSimpleBezierEdge,
  customSmart: createSmartEdge("bezier", { gridRatio: 10, nodePadding: 20 }),
};

export function SmartFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: "e1-2", source: "1", target: "2", type: "smartBezier" },
  ]);

  return (
    <div className="h-[600px] w-full">
      <ReactFlow nodes={nodes} edges={edges} edgeTypes={edgeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView />
    </div>
  );
}
```

---

### Tool 2: `adaptive_rewire`
**Purpose**: Proximity-based dynamic edge generation and degree-balanced $N$-for-$N$ edge swapping when dragging nodes near new clusters.

- **Exports**: `useSpiderWeb`, `AddEdge`.
- **Import**: `import { useSpiderWeb } from "xyflow-nexus/hooks"; import { AddEdge } from "xyflow-nexus";`
- **Options**:
  - `reach`: Proximity radius in px (default: `350`).
  - `strategy`: `"rewire"` (balanced swap with green/red cues) or `"accumulate"` (greedy multi-edge).
  - `maxThreads`: Max candidate connections (default: `8`).
  - `keepOnDrop`: Number of candidate connections committed on drag stop.
  - `isolatedLimit`: Connection limit for degree-0 isolated nodes.

```tsx
import { ReactFlow, useNodesState, useEdgesState } from "@xyflow/react";
import { useSpiderWeb } from "xyflow-nexus/hooks";
import { AddEdge } from "xyflow-nexus";

const edgeTypes = { add: AddEdge };

export function RewireFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const spider = useSpiderWeb(nodes, edges, setEdges, {
    reach: 350,
    strategy: "rewire",
    maxThreads: 8,
    keepOnDrop: 8,
    isolatedLimit: 1,
  });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStart={spider.onNodeDragStart}
      onNodeDrag={spider.onNodeDrag}
      onNodeDragStop={spider.onNodeDragStop}
    />
  );
}
```

---

### Tool 3: `magnetic_drag`
**Purpose**: Real-time physics vector calculations that smoothly repel neighboring nodes during drag to prevent overlap and occlusion.

- **Exports**: `useMagneticDrag`, `computeRepulsion`, `MagneticOptions`.
- **Import**: `import { useMagneticDrag, computeRepulsion } from "xyflow-nexus/hooks";`
- **Options**:
  - `gap`: Minimum separation buffer in px (default: `20`).
  - `step`: Minimum displacement threshold before shifting (default: `4`).
  - `fallbackSize`: Fallback node dimensions `{ w: number, h: number }`.

```tsx
import { ReactFlow, useNodesState } from "@xyflow/react";
import { useMagneticDrag } from "xyflow-nexus/hooks";

export function MagneticFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const magnetic = useMagneticDrag(setNodes, { gap: 24, step: 4 });

  return (
    <div ref={magnetic.hostRef} className="h-[600px] w-full">
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        onNodeDragStart={magnetic.onNodeDragStart}
        onNodeDrag={magnetic.onNodeDrag}
        onNodeDragStop={magnetic.onNodeDragStop}
      />
    </div>
  );
}
```

---

### Tool 4: `particle_edges`
**Purpose**: Renders animated SVG data stream particle pulses along edge bezier curves using native SVG `<animateMotion>`.

- **Exports**: `ParticleEdge`, `ParticleEdgeData`, `ParticleEdgeType`.
- **Import**: `import { ParticleEdge } from "xyflow-nexus";`
- **Edge Data**: `{ speed?: number }` (duration in seconds per animation cycle, e.g. `2.0`).

```tsx
const edgeTypes = { particle: ParticleEdge };
const edges = [
  { id: "e1", source: "a", target: "b", type: "particle", data: { speed: 2.2 } }
];
```

---

### Tool 5: `editable_edges`
**Purpose**: Interactive Catmull-Rom smoothed spline curves with draggable control points, midpoint hover insertion hints, and double-click deletion.

- **Exports**: `EditableEdge`, `smoothPath`, `EditableEdgeData`, `EditableEdgeType`.
- **Import**: `import { EditableEdge } from "xyflow-nexus";`
- **Edge Data**: `{ points: Array<{ x: number, y: number }> }`.

```tsx
const edgeTypes = { editable: EditableEdge };
const edges = [
  { id: "e2", source: "b", target: "c", type: "editable", data: { points: [{ x: 300, y: 150 }] } }
];
```

---

### Tool 6: `freeform_connections`
**Purpose**: Interactive freehand connection line component activated when users hold the **Space** key while dragging a new edge.

- **Exports**: `FreeformConnection`.
- **Import**: `import { FreeformConnection } from "xyflow-nexus";`

```tsx
<ReactFlow
  connectionLineComponent={FreeformConnection}
  // ...
/>
```

---

### Tool 7: `geometry_shape_nodes`
**Purpose**: 6 solid CSS clip-path geometric primitives with 8 directional typed handles (`top-source`, `top-target`, `left-source`, `left-target`, `right-source`, `right-target`, `bottom-source`, `bottom-target`).

- **Exports**: `ShapeNode`, `SHAPE_OPTIONS`, `ShapeKind`.
- **Import**: `import { ShapeNode, SHAPE_OPTIONS, type ShapeKind } from "xyflow-nexus";`
- **Supported Geometries**:
  1. `circle`: Rounded circle primitive
  2. `rectangle`: Standard card rectangle
  3. `parallelogram`: Skewed transform primitive (`-skew-x-12`)
  4. `trapezoid`: Polygon clip-path geometry
  5. `triangle`: Top-pointing polygon geometry
  6. `diamond`: 4-point rotated polygon geometry

```tsx
const nodeTypes = { shape: ShapeNode };
const nodes = [
  { id: "s1", type: "shape", position: { x: 100, y: 100 }, data: { shape: "diamond", label: "Router", tone: "bg-amber-600" } }
];
```

---

### Tool 8: `studio_nodes`
**Purpose**: High-polish production studio node featuring active live status indicators, pulsing glow rings, semantic badge indicators, and left/right handles.

- **Exports**: `StudioNode`, `StudioNodeData`, `StudioNodeType`.
- **Import**: `import { StudioNode } from "xyflow-nexus";`
- **Node Data**: `{ label: string, kind?: "source" | "sink" | "process" | "active", sublabel?: string }`.

```tsx
const nodeTypes = { studio: StudioNode };
const nodes = [
  { id: "n1", type: "studio", position: { x: 80, y: 80 }, data: { label: "Worker Node", kind: "active", sublabel: "PID 410" } }
];
```

---

### Tool 9: `hierarchical_layout`
**Purpose**: Kahn-style longest-path topological DAG auto-layout algorithm for automatically positioning nodes in columns and rows.

- **Exports**: `hierarchicalLayout`, `LayoutOptions`.
- **Import**: `import { hierarchicalLayout, type LayoutOptions } from "xyflow-nexus/layout";`
- **Options**:
  - `nodeWidth`: Bounding width per node (default: `200`).
  - `nodeHeight`: Bounding height per node (default: `80`).
  - `colGap`: Horizontal column gap between layers (default: `100`).
  - `rowGap`: Vertical row gap within layers (default: `30`).

```tsx
import { hierarchicalLayout } from "xyflow-nexus/layout";

export function layoutGraph(nodes, edges) {
  return hierarchicalLayout(nodes, edges, { nodeWidth: 200, nodeHeight: 80, colGap: 100, rowGap: 30 });
}
```

---

### Tool 10: `ngraph_builder`
**Purpose**: Declarative schema-driven typed node builder powered by `@clarkmcc/ngraph` for generating configurable node editors without hand-writing individual components.

- **Exports**: `NgraphEditor`.
- **Import**: `import { NgraphEditor } from "xyflow-nexus";`

```tsx
import { NgraphEditor } from "xyflow-nexus";

export function ConfigBuilder() {
  return <NgraphEditor />;
}
```

---

### Tool 11: `theme_tokens`
**Purpose**: Theme provider and design token bridge mapping semantic tokens to React Flow's `--xy-*` CSS custom properties.

- **Exports**: `ThemeProvider`, `useTheme`, `cn`.
- **Import**: `import { ThemeProvider, useTheme, cn } from "xyflow-nexus";`
- **Themes Supported**: `light`, `dark`, `sepia`, `mint`.

```css
.react-flow {
  --xy-edge-stroke-default: hsl(var(--muted-foreground));
  --xy-edge-stroke-selected-default: hsl(var(--primary));
  --xy-connectionline-stroke-default: hsl(var(--primary));
  --xy-handle-background-color-default: hsl(var(--primary));
  --xy-handle-border-color-default: hsl(var(--background));
  --xy-attribution-background-color-default: transparent;
}
```

---

## 🛠️ Validation Checklist for Agents

Before completing code or creating canvases:

- [ ] Parent element has explicit CSS height (`h-[500px]`, `h-full`, `h-screen`).
- [ ] Base stylesheet `@xyflow/react/dist/style.css` is imported.
- [ ] `nodeTypes` and `edgeTypes` maps are defined outside the component (or memoized).
- [ ] Node handle IDs on edges strictly match actual handle IDs on nodes.
- [ ] Coordinates project via `screenToFlowPosition` (not legacy `project`).
- [ ] Canvas state updates use immutable state setters (`setNodes((nds) => ...)`, `setEdges((eds) => ...)`).
- [ ] `pnpm run build:lib` or `pnpm run typecheck` passes with zero errors.
