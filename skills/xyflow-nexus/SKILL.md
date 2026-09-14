---

## name: xyflow-nexus description: &gt;- Build node-based editors, workflow builders, DAG pipelines, interactive graphs, and diagram tools with xyflow-nexus and React Flow v12 (@xyflow/react). Use whenever an application needs custom nodes, 5 obstacle-avoiding smart edges, adaptive degree-balanced rewiring, magnetic repulsion drag physics, animated particle streams, editable waypoint curves, freeform sketch connections, Kahn topological auto-layout, geometry shape nodes, or declarative ngraph schema editors. version: "1.1.0" package: "xyflow-nexus" react_flow_version: "^12.0.0"

# XYFlow Nexus Design System & Component Suite

| Package | Version | React Flow Compatibility |
| --- | --- | --- |
| `xyflow-nexus` | `1.0.0` | `@xyflow/react@^12.0.0` |

`xyflow-nexus` is the production-ready design system, workflow pattern library, and component suite built exclusively for **React Flow v12** (`@xyflow/react`) and **Next.js**.

---

## 🏗️ Core Principles & Golden Rules

When building or modifying node-based canvases:

1. **Explicit Canvas Height Required**: `<ReactFlow>` expands to fill $100%$ of its parent container. The container **must** have an explicit height (e.g. `h-[600px]`, `h-screen`, `h-full`), or the canvas will render blank with zero height.
2. **Global CSS Import**: The base stylesheet `@xyflow/react/dist/style.css` must be imported once globally (or in the root layout), or handles and nodes will not layout correctly.
3. **Define** `nodeTypes` and `edgeTypes` Outside Render: Always define `nodeTypes` and `edgeTypes` outside the React component (or memoize them with `useMemo`), otherwise React Flow re-mounts all nodes and edges on every re-render, destroying internal focus and dragging performance.
4. **React Flow v12 Node Dimensions**: In v12, measured dimensions reside on `node.measured?.width` and `node.measured?.height` (fallback to `node.width` / `node.height`).
5. **Strict Handle ID & Type Mapping**: If an edge specifies `sourceHandle` or `targetHandle`, it **must** match the exact `id` and corresponding handle `type` (`type="source"` vs `type="target"`) on the source/target `<Handle />` elements.
6. **Coordinate Transformation**: Always use `screenToFlowPosition({ x, y })` from `useReactFlow()` to project client mouse/pointer coordinates into canvas coordinates (do not use legacy `project()`).

---

## 📦 Package Installation & Subpath Exports

```bash
pnpm add xyflow-nexus @xyflow/react
# or
npm install xyflow-nexus @xyflow/react
```

### Subpath Entry Points

| Subpath | Description | Key Exports |
| --- | --- | --- |
| `xyflow-nexus` | Root unified bundle | Everything (Smart Edges, Nodes, Hooks, Layout, Routers, Canvases, Theme) |
| `xyflow-nexus/smart-edges` | Smart obstacle-avoiding edges | `SmartBezierEdge`, `SmartSmoothStepEdge`, `SmartStepEdge`, `SmartStraightEdge`, `SmartSimpleBezierEdge`, `createSmartEdge`, `getSmartEdge`, pathfinding utilities |
| `xyflow-nexus/hooks` | Advanced physics & rewiring hooks | `useSpiderWeb`, `useMagneticDrag`, `computeRepulsion` |
| `xyflow-nexus/layout` | Topological DAG auto-layout | `hierarchicalLayout`, `LayoutOptions` |
| `xyflow-nexus/router` | Orthogonal A\* path router | `routeOrthogonal`, `polylineToRoundedPath` |

---

## 🧩 Key Modules & Implementation Recipes

### 1\. Smart Obstacle-Avoiding Edges

Smart edges dynamically evaluate the bounding boxes of all intermediate nodes on the canvas and compute collision-free orthogonal or curved trajectories using A\* and Jump Point Search.

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

// 1. Define edge types outside the component
const edgeTypes = {
  smartBezier: SmartBezierEdge,
  smartSmoothStep: SmartSmoothStepEdge,
  smartStep: SmartStepEdge,
  smartStraight: SmartStraightEdge,
  smartSimpleBezier: SmartSimpleBezierEdge,
  // Custom fine-tuned collision clearance:
  customSmart: createSmartEdge("bezier", {
    gridRatio: 10,    // Pathfinding grid resolution in px (lower = finer, default = 10)
    nodePadding: 20,  // Clearance boundary around obstacle nodes in px (default = 10)
  }),
};

export function SmartEdgeFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    { id: "1", position: { x: 50, y: 150 }, data: { label: "Source" } },
    { id: "obstacle", position: { x: 250, y: 130 }, data: { label: "Obstacle Node" } },
    { id: "2", position: { x: 500, y: 150 }, data: { label: "Target" } },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: "e1-2", source: "1", target: "2", type: "smartBezier" },
  ]);

  return (
    <div className="h-[600px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      />
    </div>
  );
}
```

---

### 2\. Adaptive Degree-Balanced Rewiring (`useSpiderWeb`)

Provides dynamic proximity-based connection suggestions. Supports two strategies:

- `"rewire"`: **Degree-balanced $N$-for-$N$ edge swapping**. When dragging a node toward a new cluster, it highlights the closest eligible connection in green (`+ Connect`) while identifying the furthest existing edge for pruning in red (`− Disconnect`), preventing graph clutter.
- `"accumulate"`: Greedy multi-edge generation connecting to all nodes within reach.

```tsx
import { ReactFlow, useNodesState, useEdgesState } from "@xyflow/react";
import { useSpiderWeb } from "xyflow-nexus/hooks";
import { AddEdge } from "xyflow-nexus";

const edgeTypes = { add: AddEdge };

export function RewireFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const spider = useSpiderWeb(nodes, edges, setEdges, {
    reach: 350,            // Proximity detection radius in px
    strategy: "rewire",    // 'rewire' for balanced swap, 'accumulate' for greedy connections
    maxThreads: 8,         // Maximum concurrent candidate threads
    keepOnDrop: 8,         // Threads committed upon dropping the node
    isolatedLimit: 1,      // Connections allowed for degree-0 nodes
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

### 3\. Magnetic Repulsion Drag Physics (`useMagneticDrag`)

Real-time collision avoidance vector calculations that smoothly repel neighboring nodes when dragging a node into their bounding box.

```tsx
import { ReactFlow, useNodesState } from "@xyflow/react";
import { useMagneticDrag } from "xyflow-nexus/hooks";

export function MagneticFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const magnetic = useMagneticDrag(setNodes, {
    gap: 24,              // Minimum separation buffer in px
    step: 4,               // Minimum displacement threshold before moving
    fallbackSize: { w: 140, h: 80 },
  });

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

### 4\. Studio Workflow Patterns

#### Particle Stream Edges (`ParticleEdge`)

Renders smooth animated data flow particles using native SVG `<animateMotion>`.

```tsx
// Edge data signature: { speed?: number } (speed in seconds per cycle, e.g. 2.4)
{ id: "e1", source: "a", target: "b", type: "particle", data: { speed: 2.0 } }
```

#### Interactive Waypoint Curves (`EditableEdge`)

Catmull-Rom smoothed spline edge with interactive waypoint handles. Users can double-click to add/remove control points or drag intermediate points to shape curves around canvas obstacles.

```tsx
// Edge data signature: { points: Array<{ x: number, y: number }> }
{ id: "e2", source: "b", target: "c", type: "editable", data: { points: [{ x: 320, y: 180 }] } }
```

#### Freeform Connection Line (`FreeformConnection`)

Allows users to sketch custom freehand connection lines when holding the **Space** key during edge creation.

```tsx
<ReactFlow
  connectionLineComponent={FreeformConnection}
  // ...
/>
```

#### Production Studio Node (`StudioNode`)

High-polish node design featuring active live pulsing status rings, semantic badge indicators (`source`, `sink`, `process`, `active`), and clean input/output handles.

```tsx
// Node data signature: { label: string, kind?: "source" | "sink" | "process" | "active", sublabel?: string }
{ id: "n1", type: "studio", position: { x: 100, y: 100 }, data: { label: "API Gateway", kind: "active", sublabel: "REST" } }
```

---

### 5\. Geometry Shape Nodes (`ShapeNode` & `SHAPE_OPTIONS`)

Renders 6 geometric primitives with solid CSS clip-paths and 8 typed directional handles (`top-source`, `top-target`, `left-source`, `left-target`, `right-source`, `right-target`, `bottom-source`, `bottom-target`):

- **Circle** (`circle`): Rounded full geometry
- **Rectangle** (`rectangle`): Standard card geometry
- **Parallelogram** (`parallelogram`): Skewed transform geometry (`-skew-x-12`)
- **Trapezoid** (`trapezoid`): Polygon clip-path geometry
- **Triangle** (`triangle`): Top-pointing polygon clip-path geometry
- **Diamond** (`diamond`): 4-point rotated polygon clip-path geometry

```tsx
import { ShapeNode, SHAPE_OPTIONS, type ShapeKind } from "xyflow-nexus";

const nodeTypes = { shape: ShapeNode };

const nodes = [
  {
    id: "shape-1",
    type: "shape",
    position: { x: 120, y: 100 },
    data: { shape: "diamond", label: "Decision Branch", tone: "bg-amber-600" },
  },
];
```

---

### 6\. Kahn Topological DAG Layout (`hierarchicalLayout`)

Calculates collision-free hierarchical DAG column/row layouts with longest-path layering:

```tsx
import { hierarchicalLayout, type LayoutOptions } from "xyflow-nexus/layout";

export function autoLayoutDAG(nodes, edges) {
  const options: LayoutOptions = {
    nodeWidth: 200,   // Assumed node bounding width
    nodeHeight: 80,   // Assumed node bounding height
    colGap: 100,      // Horizontal column spacing between layers
    rowGap: 30,       // Vertical row spacing within a layer
  };

  return hierarchicalLayout(nodes, edges, options);
}
```

---

### 7\. Declarative Node Builder with ngraph (`NgraphEditor`)

For apps that require dynamic, user-configurable schema-driven nodes (with typed input editors, live select boxes, number spinners, checkboxes, and automatic handle wiring):

```tsx
import { NgraphEditor } from "xyflow-nexus";

export function SchemaBuilderCanvas() {
  return <NgraphEditor />;
}
```

---

## 🎨 Theme Tokens & Canvas Customization

XYFlow Nexus maps semantic design tokens (`bg-card`, `text-foreground`, `border-border`, `bg-primary`, etc.) to React Flow's CSS custom properties:

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

Built-in themes support **Light**, **Dark**, **Sepia**, and **Mint** via the provided `ThemeProvider` and `useTheme()` hook.

---

## 🛠️ Validation Checklist for Future Agents

Before delivering code or creating canvases:

- [ ] Parent element has explicit CSS height (`h-[500px]`, `h-full`, `h-screen`).

- [ ] Base stylesheet `@xyflow/react/dist/style.css` is imported.

- [ ] `nodeTypes` and `edgeTypes` objects are defined outside the component or memoized.

- [ ] Node handle IDs on edges match actual handle element IDs.

- [ ] All coordinates project via `screenToFlowPosition` (not legacy `project`).

- [ ] Canvas state updates use immutable state setters (`setNodes((nds) => ...)`, `setEdges((eds) => ...)`).

- [ ] `pnpm run build:lib` or `pnpm run typecheck` passes with zero errors.