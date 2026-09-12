// ============================================================================
// xyflow-nexus / xyflow-design-studio
// Complete Design System, Smart Edges, and Patterns for @xyflow/react
// ============================================================================

// 1. Smart Edges (Presets, Core Edge, Routing Algorithms & Path Utilities)
export * from "./app/smart-edges";

// 2. Custom Edges & Connectors
export { ParticleEdge } from "./components/edges/particle-edge";
export type { ParticleEdgeData, ParticleEdgeType } from "./components/edges/particle-edge";

export { EditableEdge, smoothPath } from "./components/edges/editable-edge";
export type { EditableEdgeData, EditableEdgeType } from "./components/edges/editable-edge";

export { SmartEdge as CustomSmartEdge } from "./components/edges/smart-edge";
export { FreeformConnection } from "./components/connection/freeform-connection";

// 3. Custom Nodes & Node Galleries
export {
  TriggerNode,
  ProcessNode,
  TextInputNode,
  OutputNode,
  nodeTypes as defaultNodeTypes,
} from "./components/nodes/custom-nodes";

export { StudioNode } from "./components/nodes/studio-node";
export type { StudioNodeData, StudioNodeType } from "./components/nodes/studio-node";

// 4. Interactive Canvases & Showcases
export { StudioPatternsCanvas } from "./components/studio-patterns-canvas";
export { SmartEdgesCanvas } from "./components/smart-edges-canvas";
export { FlowEditor } from "./components/flow-editor";
export { NgraphEditor, NgraphEditor as NGraphEditor } from "./components/ngraph-editor";
export {
  ProFeaturesCanvas,
  ShapeNode,
  AddEdge,
  SHAPE_OPTIONS,
} from "./components/pro-features-canvas";
export type { ShapeKind } from "./components/pro-features-canvas";

// 5. Advanced Pro Feature Hooks & Algorithms
export { useSpiderWeb } from "./lib/use-spider-web";
export type {
  SpiderSide,
  SpiderStrategy,
  SpiderThread,
  SpiderOptions,
} from "./lib/use-spider-web";

export { useMagneticDrag, computeRepulsion } from "./lib/use-magnetic-drag";
export type { MagneticOptions } from "./lib/use-magnetic-drag";

export { routeOrthogonal, polylineToRoundedPath } from "./lib/smart-router";
export type { Point, Rect } from "./lib/smart-router";

export { hierarchicalLayout } from "./lib/hierarchical-layout";
export type { LayoutOptions } from "./lib/hierarchical-layout";

export { cn } from "./lib/utils";

// 6. Theme Utilities
export {
  ThemeProvider,
  useTheme,
  useThemeValue,
  useThemeEffect,
  ThemedImage,
  ThemedIcon,
  ScopedTheme,
} from "./app/theme";

// 7. UI Components
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./components/ui/accordion";
export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./components/ui/collapsible";
