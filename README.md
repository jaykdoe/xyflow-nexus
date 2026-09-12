# XYFlow Nexus v0.1.0

### An expansive, production-ready design system, workflow pattern library, and component suite built exclusively for **React Flow v12** (`@xyflow/react`) and **Next.js**.

![npm version](https://img.shields.io/badge/npm-v0.1.0-cb3837?style=flat-square)![React Flow v12](https://img.shields.io/badge/React%20Flow-v12.11.6-ff0072?style=flat-square)![Next.js](https://img.shields.io/badge/Next.js-16.3.4-000000?style=flat-square)![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Feature Highlights](#-feature-highlights)
- [Installation & Quickstart](#-installation--quickstart)
  - [Install as an npm package](#install-as-an-npm-package)
  - [Clone & Run Locally](#clone--run-locally)
- [Exports & Modular Subpaths](#-exports--modular-subpaths)
- [How-To Guides](#-how-to-guides)
  - [1. Setting Up a Base Tokenized Flow Canvas](#1-setting-up-a-base-tokenized-flow-canvas)
  - [2. Using Smart Obstacle-Avoiding Edges](#2-using-smart-obstacle-avoiding-edges)
  - [3. Using Adaptive Edge Rewiring & Spider Web](#3-using-adaptive-edge-rewiring--spider-web)
  - [4. Using Magnetic Repulsion Drag](#4-using-magnetic-repulsion-drag)
  - [5. Using Studio Workflow Patterns (Particles, Waypoints, Freeform)](#5-using-studio-workflow-patterns)
  - [6. Config-Driven Node Building with ngraph](#6-config-driven-node-building-with-ngraph)
- [Route Directory](#-route-directory)
- [Key React Flow v12 Upgrade Notes](#-key-react-flow-v12-upgrade-notes)
- [Development & Build Scripts](#-development--build-scripts)
- [License](#-license)

---

## 🚀 Overview

**XYFlow Nexus** provides a complete design system, component suite, and interactive playground for building node-based applications. It combines:

- Modern UI foundations (token palettes, light/dark/sepia/mint modes, and typography scale).
- **5 Smart Obstacle-Avoiding Routing Presets** using A\* pathfinding and Jump Point Search.
- **Interactive Physics & Geometry**: Magnetic node repulsion and degree-balanced adaptive edge rewiring.
- **7 Advanced Workflow Patterns** ported to React Flow v12 (particle streams, editable waypoint curves, freeform sketch lines, DAG layout, multiplayer presence).
- **Geometry Node Primitives**: 6 shapes (Circle, Rectangle, Parallelogram, Trapezoid, Triangle, Diamond) with 4-way typed handles and split dropdown selection.
- Declarative node graph builder powered by `@clarkmcc/ngraph`.

---

## ✨ Feature Highlights

| Module | Features | Primary Files / Exports |
| --- | --- | --- |
| **Smart Edges** | Diagonal A\* & Jump Point Search obstacle avoidance across 5 presets (`Bezier`, `SimpleBezier`, `SmoothStep`, `Step`, `Straight`). Dynamic `gridRatio` and `nodePadding` configuration. | `xyflow-nexus/smart-edges`, `app/smart-edges/` |
| **Adaptive Rewiring** | Degree-balanced $N$-for-$N$ edge swapping when dragging nodes near new clusters (green addition cues, red removal cues) and greedy spider web generation. | `xyflow-nexus/hooks`, `lib/use-spider-web.ts` |
| **Magnetic Drag** | Real-time physics vector calculation that smoothly repels neighboring nodes during drag. | `xyflow-nexus/hooks`, `lib/use-magnetic-drag.ts` |
| **Studio Patterns** | Animated SVG particle streams (`<animateMotion>`), interactive Catmull-Rom editable waypoint curves, freeform sketch connections, DAG hierarchical layout, and multiplayer presence. | `xyflow-nexus`, `lib/smart-router.ts`, `lib/hierarchical-layout.ts` |
| **Geometry Nodes** | 6 shape primitives (Circle, Rectangle, Parallelogram, Trapezoid, Triangle, Diamond) with 4-way typed source/target handles and split dropdown selector. | `xyflow-nexus`, `components/pro-features-canvas.tsx` |
| **ngraph Builder** | Declarative schema-driven nodes (headers, typed handles, select/checkbox/input fields). | `xyflow-nexus`, `components/ngraph-editor.tsx` |

---

## 🛠️ Installation & Quickstart

### Install as an npm package

Install `xyflow-nexus` along with `@xyflow/react`:

```bash
# Using pnpm
pnpm add xyflow-nexus @xyflow/react

# Using npm
npm install xyflow-nexus @xyflow/react

# Using yarn
yarn add xyflow-nexus @xyflow/react
```

### Clone & Run Locally

```bash
# Clone the repository
git clone https://github.com/jaykdoe/xyflow-nexus.git
cd xyflow-nexus

# Install dependencies
pnpm install

# Start local development server (Next.js showcase playground)
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the interactive showcase and labs.

---

## 📦 Exports & Modular Subpaths

`xyflow-nexus` supports both unified root imports and modular subpaths:

```tsx
// 1. Root bundle import
import { 
  SmartBezierEdge, 
  ParticleEdge, 
  EditableEdge, 
  ShapeNode, 
  useSpiderWeb, 
  useMagneticDrag,
  hierarchicalLayout 
} from "xyflow-nexus";

// 2. Dedicated Smart Edges subpath
import { 
  SmartBezierEdge, 
  SmartSmoothStepEdge, 
  SmartStepEdge, 
  SmartStraightEdge, 
  SmartSimpleBezierEdge, 
  createSmartEdge 
} from "xyflow-nexus/smart-edges";

// 3. Pro Feature Hooks subpath
import { useSpiderWeb, useMagneticDrag, computeRepulsion } from "xyflow-nexus/hooks";

// 4. Hierarchical Layout subpath
import { hierarchicalLayout } from "xyflow-nexus/layout";

// 5. Orthogonal Router subpath
import { routeOrthogonal, polylineToRoundedPath } from "xyflow-nexus/router";
```

---

## 📖 How-To Guides

### 1. Setting Up a Base Tokenized Flow Canvas

Import `@xyflow/react/dist/style.css` and wire the basic canvas controls with your theme tokens:

```tsx
import "@xyflow/react/dist/style.css";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
} from "@xyflow/react";
import { useCallback } from "react";

const initialNodes = [
  { id: "1", position: { x: 100, y: 100 }, data: { label: "Input Node" } },
  { id: "2", position: { x: 400, y: 200 }, data: { label: "Output Node" } },
];

const initialEdges = [{ id: "e1-2", source: "1", target: "2", animated: true }];

export function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background gap={16} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
```

---

### 2. Using Smart Obstacle-Avoiding Edges

Smart Edges dynamically calculate bounding boxes of all nodes on the canvas and route collision-free paths around intermediate nodes.

```tsx
import { ReactFlow, useNodesState, useEdgesState } from "@xyflow/react";
import {
  createSmartEdge,
  SmartBezierEdge,
  SmartSmoothStepEdge,
  SmartStraightEdge,
  SmartStepEdge,
  SmartSimpleBezierEdge,
} from "xyflow-nexus/smart-edges";

// Option A: Use ready-to-use edge components
const edgeTypes = {
  smartBezier: SmartBezierEdge,
  smartSmoothStep: SmartSmoothStepEdge,
  smartStraight: SmartStraightEdge,
  smartStep: SmartStepEdge,
  smartSimpleBezier: SmartSimpleBezierEdge,
  // Option B: Configure custom grid granularity & obstacle padding
  customSmart: createSmartEdge("bezier", {
    gridRatio: 10,     // Pathfinding grid resolution in px
    nodePadding: 20,   // Clearance boundary around obstacle nodes in px
  }),
};

export function SmartFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: "e1", source: "1", target: "2", type: "customSmart" },
  ]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    />
  );
}
```

---

### 3. Using Adaptive Edge Rewiring & Spider Web

The `useSpiderWeb` hook supports two strategies:

1. `strategy: "rewire"`: Degree-balanced edge swapping. Moving a node near new neighbors proposes connecting the closest eligible node (**green** `+ Connect`) while pruning the furthest existing connected edge (**red** `− Disconnect`).
2. `strategy: "accumulate"`: Classic greedy spider web connecting to all nodes within reach.

```tsx
import { ReactFlow, useNodesState, useEdgesState } from "@xyflow/react";
import { useSpiderWeb } from "xyflow-nexus/hooks";

export function RewireFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const spider = useSpiderWeb(nodes, edges, setEdges, {
    reach: 350,            // Proximity radius in px to trigger candidates
    strategy: "rewire",    // 'rewire' for balanced swap, 'accumulate' for multi-thread
    maxThreads: 8,         // Maximum concurrent candidate connections
    isolatedLimit: 1,      // Initial connections allowed for degree-0 nodes
  });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
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

### 4. Using Magnetic Repulsion Drag

Attach `useMagneticDrag` to smoothly push neighboring nodes out of the way when dragging:

```tsx
import { ReactFlow, useNodesState } from "@xyflow/react";
import { useMagneticDrag } from "xyflow-nexus/hooks";

export function MagneticFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const magnetic = useMagneticDrag(setNodes, { gap: 24, step: 4 });

  return (
    <div ref={magnetic.hostRef} className="h-full w-full">
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

### 5. Using Studio Workflow Patterns

#### Particle Stream Edges, Waypoint Curves & Freeform Connections

```tsx
import { ReactFlow } from "@xyflow/react";
import { ParticleEdge, EditableEdge, FreeformConnection, hierarchicalLayout } from "xyflow-nexus";

const edgeTypes = {
  particle: ParticleEdge,
  editable: EditableEdge,
};

const edges = [
  // Animated data particles with controllable flow speed
  { id: "e1", source: "a", target: "b", type: "particle", data: { speed: 2.5 } },
  // Interactive waypoints: drag control points to shape curves
  { id: "e2", source: "b", target: "c", type: "editable", data: { points: [{ x: 300, y: 150 }] } },
];

export function StudioPatternsFlow() {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      edgeTypes={edgeTypes}
      connectionLineComponent={FreeformConnection} // Hold Space while connecting to sketch freehand
    />
  );
}

// Automatic DAG layout helper
export function applyDAGLayout(nodes, edges) {
  return hierarchicalLayout(nodes, edges, { nodeWidth: 200, nodeHeight: 80, colGap: 100, rowGap: 30 });
}
```

---

### 6. Config-Driven Node Building with ngraph

Generate complete, typed node editors from declarative schemas without hand-writing individual components:

```tsx
import { NgraphEditor } from "xyflow-nexus";

export function MyNgraphFlow() {
  return <NgraphEditor />;
}
```

---

## 🗺️ Route Directory

| Route | Description |
| --- | --- |
| `/` | **Overview & Foundations**: Live flow editor, token color palettes, typography scale, and quick navigation. |
| `/smart-edges` | **Smart Edges Lab**: Interactive obstacle avoidance playground with real-time parameter tuning (grid ratio, node padding) across 5 routing presets. |
| `/pro-features` | **Pro Features Lab**: Magnetic repulsion drag, Adaptive degree-balanced rewiring, Spider web multi-threading, custom shape selector (Circle, Rectangle, Parallelogram, Trapezoid, Triangle, Diamond), and tree nesting. |
| `/patterns` | **Studio Patterns Showcase**: 7 interactive tabs demonstrating particle flow streams, editable waypoint curves, drop-splicing, freeform sketching, auto-layout, multiplayer cursors, and drag-and-drop palette. |
| `/ngraph` | **Node Builder**: Config-driven node graph editor built with `@clarkmcc/ngraph`. |
| `/docs` | **API Reference**: Comprehensive documentation and signatures for all `@xyflow/react` v12 components, hooks, smart routing utilities, and studio patterns. |

---

## ⚡ Key React Flow v12 Upgrade Notes

When building on this design system with `@xyflow/react` v12:

1. **Package Namespace**: Always import from `@xyflow/react` (do not import from legacy `reactflow`).
2. **Node Dimensions**: In v12, node sizes are stored in `node.measured?.width` and `node.measured?.height` rather than `node.width` / `node.height`.
3. **Handle Mapping**: Every edge with `sourceHandle` or `targetHandle` must map to an existing `<Handle />` with an exact matching ID and matching type (`type="source"` vs `type="target"`).
4. **Coordinate Transformation**: Use `screenToFlowPosition({ x, y })` from `useReactFlow()` instead of legacy `project()`.
5. **Generics**: Generic types have been streamlined to `Node<Data>` and `Edge<Data>` (e.g., `NodeProps<Node<{ label: string }>>`).

---

## 💻 Development & Build Scripts

| Command | Description |
| --- | --- |
| `pnpm run dev` | Starts the Next.js local development server with Turbopack |
| `pnpm run build:lib` | Compiles ESM, CJS, and TypeScript declaration (`.d.ts`, `.d.cts`) files into `dist/` |
| `pnpm run build:app` | Builds the Next.js production showcase app |
| `pnpm run build` | Runs both `build:lib` and `build:app` in sequence |
| `pnpm run typecheck` | Validates TypeScript types across the entire project (`tsc --noEmit`) |
| `npm pack --dry-run` | Inspects tarball contents before publishing to npm |

---

## 📄 License

MIT © [mfmedia](https://github.com/jaykdoe)