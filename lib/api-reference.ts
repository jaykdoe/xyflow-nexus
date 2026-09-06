/**
 * API reference data for the React Flow design system.
 * Names and signatures verified against the installed @xyflow/react v12 package exports.
 * Every symbol below is imported from "@xyflow/react".
 */

export type ApiEntry = {
  name: string
  signature: string
  description: string
}

export type ApiGroup = {
  id: string
  title: string
  blurb: string
  entries: ApiEntry[]
}

export const componentGroups: ApiGroup[] = [
  {
    id: "core",
    title: "Core",
    blurb: "The canvas and the context that every other piece plugs into.",
    entries: [
      {
        name: "ReactFlow",
        signature: "<ReactFlow nodes={} edges={} onNodesChange={} onEdgesChange={} />",
        description:
          "The root canvas. Renders nodes and edges, and handles panning, zooming, selection, and drag. Wrap its parent in a sized container — it fills 100% of its parent.",
      },
      {
        name: "ReactFlowProvider",
        signature: "<ReactFlowProvider>{children}</ReactFlowProvider>",
        description:
          "Provides the flow store to the tree. Required when you call hooks (e.g. useReactFlow) outside of the ReactFlow component, or render multiple flows.",
      },
      {
        name: "Panel",
        signature: '<Panel position="top-left">{children}</Panel>',
        description:
          "Pins arbitrary UI (toolbars, legends, buttons) to a corner of the viewport without it scrolling or zooming with the canvas.",
      },
      {
        name: "ViewportPortal",
        signature: "<ViewportPortal>{children}</ViewportPortal>",
        description:
          "Renders children into the viewport coordinate system so they pan and zoom together with the nodes — useful for custom overlays or annotations.",
      },
    ],
  },
  {
    id: "plugins",
    title: "Plugin components",
    blurb: "Drop-in UI you compose as children of <ReactFlow>.",
    entries: [
      {
        name: "Background",
        signature: '<Background variant="dots" gap={16} />',
        description:
          "Renders the canvas background pattern. Use the BackgroundVariant enum for dots, lines, or cross.",
      },
      {
        name: "Controls",
        signature: "<Controls showInteractive />",
        description: "Zoom-in / zoom-out / fit-view / lock buttons anchored to the canvas.",
      },
      {
        name: "ControlButton",
        signature: "<ControlButton onClick={}>{icon}</ControlButton>",
        description: "A custom button styled to match Controls — add it as a child of <Controls> for extra actions.",
      },
      {
        name: "MiniMap",
        signature: "<MiniMap nodeColor={} pannable zoomable />",
        description: "A scaled overview of the whole graph; pannable and zoomable to navigate large flows.",
      },
      {
        name: "MiniMapNode",
        signature: "<MiniMapNode x={} y={} width={} height={} />",
        description: "The primitive used to render a single node inside the MiniMap; override for fully custom minimap rendering.",
      },
    ],
  },
  {
    id: "node-building-blocks",
    title: "Node building blocks",
    blurb: "Primitives you place inside your own custom node components.",
    entries: [
      {
        name: "Handle",
        signature: '<Handle type="source" position={Position.Right} id="a" />',
        description:
          "The connection point on a node. type is 'source' or 'target'; position comes from the Position enum. Give multiple handles unique ids.",
      },
      {
        name: "NodeResizer",
        signature: "<NodeResizer minWidth={100} minHeight={40} />",
        description: "Adds drag handles around a selected node so users can resize it. Place inside the custom node.",
      },
      {
        name: "NodeResizeControl",
        signature: '<NodeResizeControl position="bottom-right" />',
        description: "A single resize control for fine-grained placement when you don't want the full NodeResizer frame.",
      },
      {
        name: "NodeToolbar",
        signature: "<NodeToolbar isVisible position={Position.Top}>{actions}</NodeToolbar>",
        description:
          "A toolbar that floats next to a node (e.g. on selection) and stays a fixed screen size regardless of zoom.",
      },
    ],
  },
  {
    id: "edges",
    title: "Edges",
    blurb: "The default edge path components plus the labeling primitives.",
    entries: [
      {
        name: "BaseEdge",
        signature: "<BaseEdge id={id} path={edgePath} />",
        description: "The low-level SVG path renderer that every edge type builds on; use it when authoring a custom edge.",
      },
      {
        name: "BezierEdge",
        signature: "type edgeTypes = { default: BezierEdge }",
        description: "Default smooth curved edge (the built-in 'default' type).",
      },
      {
        name: "SimpleBezierEdge",
        signature: 'edges=[{ type: "simplebezier" }]',
        description: "A bezier curve with a simpler control-point calculation for flatter, less pronounced curves.",
      },
      {
        name: "SmoothStepEdge",
        signature: 'edges=[{ type: "smoothstep" }]',
        description: "Right-angle edge with rounded corners — common for org charts and pipelines.",
      },
      {
        name: "StepEdge",
        signature: 'edges=[{ type: "step" }]',
        description: "Right-angle edge with sharp corners.",
      },
      {
        name: "StraightEdge",
        signature: 'edges=[{ type: "straight" }]',
        description: "A direct straight line between two handles.",
      },
      {
        name: "EdgeText",
        signature: "<EdgeText x={} y={} label={} />",
        description: "Renders a positioned, background-filled label on an edge.",
      },
      {
        name: "EdgeLabelRenderer",
        signature: "<EdgeLabelRenderer>{htmlLabel}</EdgeLabelRenderer>",
        description: "Portals HTML (not SVG) labels into the edge layer so you can use normal DOM/interactive labels on edges.",
      },
      {
        name: "EdgeToolbar",
        signature: "<EdgeToolbar>{actions}</EdgeToolbar>",
        description: "A floating toolbar anchored to an edge, mirroring NodeToolbar for edge-level actions.",
      },
    ],
  },
]

export const hookGroups: ApiGroup[] = [
  {
    id: "instance-viewport",
    title: "Instance & viewport",
    blurb: "Imperative access to the flow instance and its camera.",
    entries: [
      {
        name: "useReactFlow",
        signature: "const rf = useReactFlow()",
        description:
          "The main instance handle: fitView(), setNodes(), setEdges(), getNode(), screenToFlowPosition(), zoomIn/Out(), and more. Requires ReactFlowProvider.",
      },
      {
        name: "useViewport",
        signature: "const { x, y, zoom } = useViewport()",
        description: "Reactive current pan/zoom of the canvas — re-renders as the user moves the viewport.",
      },
      {
        name: "useOnViewportChange",
        signature: "useOnViewportChange({ onChange })",
        description: "Registers start / change / end callbacks for viewport movement without triggering re-renders.",
      },
      {
        name: "useStore",
        signature: "const val = useStore(selector)",
        description: "Subscribe to any slice of the internal Zustand store with a selector for advanced/derived state.",
      },
      {
        name: "useStoreApi",
        signature: "const store = useStoreApi()",
        description: "Returns the store API for reading/updating state imperatively outside of render.",
      },
    ],
  },
  {
    id: "state",
    title: "State management",
    blurb: "Controlled state helpers for nodes and edges.",
    entries: [
      {
        name: "useNodesState",
        signature: "const [nodes, setNodes, onNodesChange] = useNodesState(initial)",
        description: "Convenience hook that wires controlled node state plus the onNodesChange handler for you.",
      },
      {
        name: "useEdgesState",
        signature: "const [edges, setEdges, onEdgesChange] = useEdgesState(initial)",
        description: "The edge counterpart to useNodesState.",
      },
      {
        name: "useNodes",
        signature: "const nodes = useNodes()",
        description: "Reactive array of all nodes; re-renders on any node change.",
      },
      {
        name: "useEdges",
        signature: "const edges = useEdges()",
        description: "Reactive array of all edges.",
      },
      {
        name: "useNodesData",
        signature: "const data = useNodesData(nodeIds)",
        description: "Subscribe to just the data of one or more nodes by id — efficient for reading upstream node values.",
      },
      {
        name: "useNodesInitialized",
        signature: "const ready = useNodesInitialized()",
        description: "True once all nodes have been measured; use before running layout or fitView on mount.",
      },
    ],
  },
  {
    id: "node-context",
    title: "Node context & connections",
    blurb: "Hooks intended for use inside custom node components.",
    entries: [
      {
        name: "useNodeId",
        signature: "const id = useNodeId()",
        description: "Returns the id of the node currently being rendered — only valid inside a custom node.",
      },
      {
        name: "useInternalNode",
        signature: "const node = useInternalNode(id)",
        description: "Access a node's internal, measured representation (absolute position, dimensions, handle bounds).",
      },
      {
        name: "useNodeConnections",
        signature: "const conns = useNodeConnections({ handleType })",
        description:
          "Reactive list of connections attached to the current node, optionally filtered by handle — pair with useNodesData to read upstream values in data-flow graphs.",
      },
      {
        name: "useConnection",
        signature: "const connection = useConnection()",
        description: "Reactive state of the connection line the user is currently dragging.",
      },
      {
        name: "useHandleConnections",
        signature: "const c = useHandleConnections({ type, id })",
        description: "Connections for a specific handle on the current node (superseded by useNodeConnections but still exported).",
      },
      {
        name: "useUpdateNodeInternals",
        signature: "const update = useUpdateNodeInternals()",
        description: "Call update(nodeId) after you add/move handles dynamically so edges re-attach to the right spots.",
      },
    ],
  },
  {
    id: "events",
    title: "Events & input",
    blurb: "Selection and keyboard helpers.",
    entries: [
      {
        name: "useOnSelectionChange",
        signature: "useOnSelectionChange({ onChange })",
        description: "Fires with the currently selected nodes and edges whenever the selection changes.",
      },
      {
        name: "useKeyPress",
        signature: 'const pressed = useKeyPress("Delete")',
        description: "Returns true while the given key (or key combo) is held — handy for custom shortcuts.",
      },
    ],
  },
]

/**
 * The ngraph node-building layer (@clarkmcc/ngraph v0.4.0).
 * A config-driven set of components, layout engines, and hooks built on top of
 * @xyflow/react. Names and signatures verified against the installed package's
 * type definitions (dist/types/index.d.ts). Every symbol is imported from
 * "@clarkmcc/ngraph".
 */
export const ngraphComponentGroups: ApiGroup[] = [
  {
    id: "ngraph-editor",
    title: "Editor & config",
    blurb: "The config-driven editor plus the provider, context, and GraphConfig that describe your node types.",
    entries: [
      {
        name: "NodeGraphEditor",
        signature: "<NodeGraphEditor config={config} defaultNodes={} defaultEdges={} />",
        description:
          "The top-level editor. Renders a full @xyflow/react canvas whose node types are generated from your GraphConfig. Accepts a ref (NodeGraphHandle) for imperative serialize/layout/CRUD.",
      },
      {
        name: "GraphProvider",
        signature: "<GraphProvider config={config} initialNodes={} initialEdges={}>",
        description:
          "Provides the ngraph zustand store to a subtree when you compose your own canvas instead of using NodeGraphEditor.",
      },
      {
        name: "GraphConfig",
        signature: "new GraphConfig({ valueTypes, nodeKinds, nodeTypes })",
        description:
          "The class describing your graph: value types (with editors and handle shapes), node kinds (color groups), and node types (inputs/outputs). Usually built for you by useBuildGraphConfig.",
      },
      {
        name: "GraphContext",
        signature: "const store = useContext(GraphContext)",
        description: "The React context holding the ngraph store — the escape hatch behind useGraphStore / useGraphApi.",
      },
      {
        name: "HEADER_FIELD_NAME",
        signature: 'node.data[HEADER_FIELD_NAME] = "Title"',
        description: "The reserved key in a node's data where its editable header title is stored.",
      },
    ],
  },
  {
    id: "ngraph-fields",
    title: "Node building blocks",
    blurb: "The pieces that render inside a node — headers, typed input fields, linked handles, and outputs.",
    entries: [
      {
        name: "NodeContainer",
        signature: "<NodeContainer node={node}>{children}</NodeContainer>",
        description: "The outer node shell — border, background, selection state, and drag affordance for a custom node.",
      },
      {
        name: "NodeHeader",
        signature: "<NodeHeader defaultTitle={} color={} collapsed={} toggleCollapsed={} />",
        description: "The node's title bar. Editable label, kind color accent, and an optional collapse toggle.",
      },
      {
        name: "NodeInputField",
        signature: "<NodeInputField id={} name={} defaultValue={} onFocus onBlur />",
        description: "A single text/number input row bound to a node data field via useNodeFieldValue.",
      },
      {
        name: "NodeCheckboxField",
        signature: "<NodeCheckboxField id={} name={} valueType={} />",
        description: "A boolean input row, used for value types whose inputEditor is 'checkbox'.",
      },
      {
        name: "NodeSelectField",
        signature: "<NodeSelectField id={} options={} defaultValue={} />",
        description: "A dropdown input row for 'options' / 'buttonGroup' value types.",
      },
      {
        name: "NodeLinkedField",
        signature: "<NodeLinkedField id={} valueType={} shape={} color={} />",
        description: "An input row that exposes a connectable target handle so the value can come from another node.",
      },
      {
        name: "NodeDenseLinkedField",
        signature: "<NodeDenseLinkedField id={} valueType={} shape={} color={} />",
        description: "A compact variant of NodeLinkedField for nodes with many linked inputs.",
      },
      {
        name: "NodeOutputField",
        signature: "<NodeOutputField id={} name={} valueType={} />",
        description: "An output row rendering a connectable source handle for the node's produced value.",
      },
      {
        name: "Handle",
        signature: "<Handle id={} handleType={} position={} shape={} color={} />",
        description:
          "ngraph's typed handle — a value-type-aware wrapper over @xyflow/react's Handle with diamond/circle shapes.",
      },
    ],
  },
  {
    id: "ngraph-layout",
    title: "Layout engines",
    blurb: "Auto-layout strategies for positioning nodes when they have no coordinates.",
    entries: [
      {
        name: "LayoutEngine",
        signature: "class MyLayout extends LayoutEngine { apply(nodes, edges) {} }",
        description: "Abstract base class. Implement name() and apply() to build a custom auto-layout strategy.",
      },
      {
        name: "DagreLayoutEngine",
        signature: "layoutEngine={new DagreLayoutEngine()}",
        description: "Directed-graph layout powered by dagre — a solid general-purpose default.",
      },
      {
        name: "PipelineLayoutEngine",
        signature: "layoutEngine={new PipelineLayoutEngine()}",
        description: "Left-to-right pipeline layout for linear, stage-based graphs.",
      },
      {
        name: "PipelineCenteredLayoutEngine",
        signature: "layoutEngine={new PipelineCenteredLayoutEngine()}",
        description: "Pipeline layout that vertically centers each stage around its connections.",
      },
    ],
  },
]

export const ngraphHookGroups: ApiGroup[] = [
  {
    id: "ngraph-hooks",
    title: "ngraph hooks",
    blurb: "Hooks for building the config, reading the store, and wiring node fields.",
    entries: [
      {
        name: "useBuildGraphConfig",
        signature: "const config = useBuildGraphConfig(rawConfig, extensions?)",
        description: "Memoizes and validates a plain config object into a GraphConfig instance. The usual entry point.",
      },
      {
        name: "useGraphStore",
        signature: "const nodes = useGraphStore((s) => s.nodes)",
        description: "Selector hook into the ngraph zustand store — nodes, edges, config, slots, and CRUD actions.",
      },
      {
        name: "useGraphApi",
        signature: "const api = useGraphApi()",
        description: "Returns the store API for imperative reads/writes outside of render (addNode, serialize, etc.).",
      },
      {
        name: "useNodeFieldValue",
        signature: "const [value, setValue] = useNodeFieldValue(field, defaultValue?)",
        description: "Two-way binding to a single field in the current node's data — the hook behind the input fields.",
      },
      {
        name: "useNodeCollapsed",
        signature: "const [collapsed, toggle] = useNodeCollapsed()",
        description: "Reads and toggles the current node's collapsed state (used by NodeHeader).",
      },
      {
        name: "useNodesEdges",
        signature: "const edges = useNodesEdges(nodeId)",
        description: "Returns the edges connected to a given node.",
      },
    ],
  },
]

export const studioPatternGroups: ApiGroup[] = [
  {
    id: "studio-patterns",
    title: "Studio patterns",
    blurb: "Advanced authoring, routing, layout, and multiplayer patterns ported from xyflow-studio to React Flow v12.",
    entries: [
      {
        name: "SmartEdge",
        signature: '<SmartEdge {...props} />',
        description: "Obstacle-avoiding orthogonal edge component that dynamically calculates bounding boxes of all nodes and paths around them using A*.",
      },
      {
        name: "ParticleEdge",
        signature: '<ParticleEdge {...props} data={{ speed: 2.4 }} />',
        description: "Animated SVG particle stream edge rendered using <animateMotion> along bezier curves with customizable particle speed.",
      },
      {
        name: "EditableEdge",
        signature: '<EditableEdge {...props} data={{ points: [...] }} />',
        description: "Interactive waypoint edge allowing users to click and drag control points to reshape curves, double click to add/remove points, and sample midpoints.",
      },
      {
        name: "FreeformConnection",
        signature: '<ReactFlow connectionLineComponent={FreeformConnection} />',
        description: "Connection line component that captures freehand sketch paths when holding Space during drag-to-connect.",
      },
      {
        name: "hierarchicalLayout",
        signature: 'const laidNodes = hierarchicalLayout(nodes, edges, options)',
        description: "Kahn-style longest-path layering algorithm that positions directed acyclic graphs (DAGs) into clean hierarchical columns.",
      },
      {
        name: "StudioNode",
        signature: '<StudioNode data={{ label, kind, sublabel }} selected />',
        description: "Design-system node shell with live pulse indicators, kind-specific styling, and typed handles.",
      },
    ],
  },
]

export const smartEdgeApiGroups: ApiGroup[] = [
  {
    id: "smart-edges",
    title: "Smart obstacle-avoiding edges",
    blurb: "Grid-based A* and Jump Point Search pathfinding edges ported and optimized for React Flow v12.",
    entries: [
      {
        name: "createSmartEdge",
        signature: "createSmartEdge(preset, { gridRatio?: 10, nodePadding?: 20 })",
        description: "Factory function creating a configured Smart Edge component with customized grid granularity, obstacle clearance padding, and fallback behaviors.",
      },
      {
        name: "SmartBezierEdge",
        signature: "<SmartBezierEdge {...props} />",
        description: "Obstacle-avoiding edge using diagonal A* pathfinding and quadratic Bézier curve smoothing around nodes.",
      },
      {
        name: "SmartSmoothStepEdge",
        signature: "<SmartSmoothStepEdge {...props} />",
        description: "Obstacle-avoiding edge using orthogonal Jump Point Search with rounded corner bends.",
      },
      {
        name: "SmartStepEdge",
        signature: "<SmartStepEdge {...props} />",
        description: "Obstacle-avoiding edge using orthogonal Jump Point Search with crisp 90-degree right-angled turns.",
      },
      {
        name: "SmartStraightEdge",
        signature: "<SmartStraightEdge {...props} />",
        description: "Obstacle-avoiding edge using diagonal A* pathfinding with direct polyline segments between waypoints.",
      },
      {
        name: "SmartSimpleBezierEdge",
        signature: "<SmartSimpleBezierEdge {...props} />",
        description: "Obstacle-avoiding edge using diagonal A* with chained cubic Bézier segments aligned to handle orientations.",
      },
      {
        name: "getSmartEdge",
        signature: "const result = getSmartEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, nodes, options })",
        description: "Low-level geometry calculation function returning { svgPathString, edgeCenterX, edgeCenterY } or null if direct fallback is required.",
      },
    ],
  },
]



