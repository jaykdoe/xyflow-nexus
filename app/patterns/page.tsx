import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  Sparkles,
  Edit3,
  GitMerge,
  Network,
  Users,
  Palette,
  ArrowUpRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { StudioPatternsCanvas } from "@/components/studio-patterns-canvas";

const featureHighlights = [
  {
    icon: Compass,
    title: "Smart Orthogonal Routing",
    body: "Sparse-grid A* pathfinding that dynamically calculates obstacle bounds and routes around intermediate nodes.",
  },
  {
    icon: Sparkles,
    title: "Particle Flow Streams",
    body: "Glowing SVG animateMotion particle paths that render animated data transfer with runtime speed control.",
  },
  {
    icon: Edit3,
    title: "Editable Waypoints & Sketching",
    body: "Interactive Catmull-Rom bezier curves with draggable handles, double-click insertion, and freeform line drawing.",
  },
  {
    icon: GitMerge,
    title: "Edge Intersection & Splicing",
    body: "Real-time distance projection from node centers to edge segments with automatic connection splicing on drop.",
  },
  {
    icon: Network,
    title: "DAG Hierarchical Auto-Layout",
    body: "Longest-path topological layering algorithm with smooth cubic easing interpolation between graph arrangements.",
  },
  {
    icon: Users,
    title: "Live Multiplayer Presence",
    body: "Simulated peer cursors with labeled identity badges, glow trails, and dynamic node halo glow on selection.",
  },
];

export default function PatternsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-12 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to overview
        </Link>

        <div className="mt-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Advanced Patterns
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            xyflow-studio patterns for React Flow v12.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Production-ready workflow builder patterns upgraded from xyflow-studio to React Flow v12 (@xyflow/react)
            with obstacle dodging, particle flows, waypoint curves, edge splicing, auto-layout, and multiplayer presence.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureHighlights.map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-semibold text-card-foreground">{title}</h2>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>

        {/* Studio Patterns Interactive Canvas Showcase */}
        <div className="mt-10">
          <StudioPatternsCanvas />
        </div>

        {/* Integration Code Guide */}
        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">
            How to use Studio Patterns in your canvas
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Register custom edge types, connection lines, and layout algorithms in your flow configuration.
          </p>

          <div className="mt-5 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                1. Particle Streams &amp; Editable Waypoint Edges
              </p>
              <div className="mt-2 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs font-mono text-zinc-200">
                <pre>{`import { ReactFlow } from '@xyflow/react'
import { ParticleEdge } from '@/components/edges/particle-edge'
import { EditableEdge } from '@/components/edges/editable-edge'
import { SmartEdge } from '@/components/edges/smart-edge'

const edgeTypes = {
  particle: ParticleEdge,
  editable: EditableEdge,
  smart: SmartEdge,
}

const edges = [
  { id: 'e1', source: 'a', target: 'b', type: 'particle', data: { speed: 2.5 } },
  { id: 'e2', source: 'b', target: 'c', type: 'editable', data: { points: [{ x: 300, y: 150 }] } },
]

export function StudioFlow() {
  return <ReactFlow nodes={nodes} edges={edges} edgeTypes={edgeTypes} />
}`}</pre>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                2. Freeform Sketch Connection Line &amp; DAG Auto-Layout
              </p>
              <div className="mt-2 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs font-mono text-zinc-200">
                <pre>{`import { ReactFlow } from '@xyflow/react'
import { FreeformConnection } from '@/components/connection/freeform-connection'
import { hierarchicalLayout } from '@/lib/hierarchical-layout'

export function LayoutFlow() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)

  // Hold Space while dragging to draw freehand curves
  const handleAutoLayout = () => {
    const layout = hierarchicalLayout(nodes, edges, { nodeSpacing: 80, rankSpacing: 180 })
    setNodes(layout.nodes)
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      connectionLineComponent={FreeformConnection}
    />
  )
}`}</pre>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 p-5 mt-10 text-sm border rounded-xl border-border bg-card text-muted-foreground">
          <span>React Flow v12 Studio Patterns</span>
          <code className="px-2 py-1 font-mono text-xs rounded bg-muted text-foreground">
            components/edges/* &amp; lib/smart-router.ts
          </code>
          <span className="hidden sm:inline">→</span>
          <span>xyflow-studio architecture</span>
          <a
            href="https://github.com/xyflow/xyflow"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 ml-auto text-primary hover:underline"
          >
            xyflow <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>
    </main>
  );
}
