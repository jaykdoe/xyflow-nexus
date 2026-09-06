import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  Boxes,
  Cpu,
  GitBranch,
  Layers,
  MoveDiagonal,
  Spline,
  Tangent,
  Zap,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SmartEdgesCanvas } from "@/components/smart-edges-canvas"

const features = [
  {
    icon: Tangent,
    title: "A* Obstacle Avoidance",
    body: "Intelligent grid-based pathfinding dynamically navigates around node bounding boxes with configurable safety padding.",
  },
  {
    icon: GitBranch,
    title: "5 Edge Styles",
    body: "Support for Bezier curves, Simple Beziers with directional controls, Orthogonal Steps, Rounded Smooth Steps, and Straight polylines.",
  },
  {
    icon: Zap,
    title: "Real-time React Flow v12",
    body: "Fully optimized for XYFlow v12 measured dimensions and reactive node drags with instantaneous recalculations.",
  },
]

export default function SmartEdgesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="px-6 pt-12 pb-16 mx-auto max-w-7xl lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm transition text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to overview
        </Link>

        <div className="max-w-3xl mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Routing & Geometry
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Smart Obstacle-Avoiding Edges
          </h1>
          <p className="max-w-2xl mt-5 text-lg leading-8 text-muted-foreground">
            A high-performance routing engine for React Flow v12 that computes clean, collision-free paths between nodes using grid A* and Jump Point Search algorithms.
          </p>
        </div>

        <div className="grid gap-4 mt-12 md:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <article key={title} className="p-5 border rounded-xl border-border bg-card">
              <Icon className="w-5 h-5 text-primary" />
              <h2 className="mt-5 font-semibold text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 min-h-[600px]">
          <SmartEdgesCanvas />
        </div>

        {/* Integration Code Guide */}
        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">
            How to use Smart Edges in your canvas
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Import <code className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 text-foreground">createSmartEdge</code> or the ready-to-use edge components directly in your XYFlow v12 setup.
          </p>
          <div className="mt-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs font-mono text-zinc-200">
            <pre>{`import { ReactFlow } from '@xyflow/react'
import { createSmartEdge, SmartBezierEdge, SmartSmoothStepEdge } from '@/app/smart-edges'

const edgeTypes = {
  smartBezier: SmartBezierEdge,
  smartSmoothStep: SmartSmoothStepEdge,
  customSmart: createSmartEdge('bezier', {
    gridRatio: 10,
    nodePadding: 20,
  }),
}

export function MyFlow() {
  return <ReactFlow nodes={nodes} edges={edges} edgeTypes={edgeTypes} />
}`}</pre>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 p-5 mt-10 text-sm border rounded-xl border-border bg-card text-muted-foreground">
          <span>React Flow v12 Smart Edges</span>
          <code className="px-2 py-1 font-mono text-xs rounded bg-muted text-foreground">
            app/smart-edges
          </code>
          <span className="hidden sm:inline">→</span>
          <span>A* & Jump Point Search Pathfinding</span>
          <a
            href="https://github.com/tisoap/react-flow-smart-edge"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 ml-auto text-primary hover:underline"
          >
            react-flow-smart-edge <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>
    </main>
  )
}
