import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Boxes, MoveDiagonal, MousePointer2, Magnet, Radio, ArrowLeftRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { ProFeaturesCanvas } from "@/components/pro-features-canvas"

const features = [
  { icon: Boxes, title: "Custom shape nodes", body: "Circle, rectangle, parallelogram, trapezoid, and triangle nodes with 4-way source and target handles." },
  { icon: MoveDiagonal, title: "Insert on edges", body: "Custom edge labels turn graph connections into an action surface for adding nodes between steps." },
  { icon: ArrowLeftRight, title: "Adaptive Rewire & Spider Web", body: "Dynamic snapping with degree-balanced edge swapping (green additions / red removals) or greedy multi-threading." },
  { icon: Magnet, title: "Magnetic repulsion", body: "Real-time physics vector calculation that smoothly repels neighboring nodes when dragging." },
  { icon: MousePointer2, title: "Expand and collapse", body: "Progressively reveal hierarchical children without losing the surrounding graph context." },
]

export default function ProFeaturesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="px-6 pt-12 pb-16 mx-auto max-w-7xl lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm transition text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to overview
        </Link>
        <div className="max-w-3xl mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Pro features</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">Build graphs that feel alive.</h1>
          <p className="max-w-2xl mt-5 text-lg leading-8 text-muted-foreground">
            A React Flow v12 design system extension — geometry, adaptive topology rewiring, magnetic physics repulsion, and progressive disclosure in one focused lab.
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

        <div className="mt-12"><ProFeaturesCanvas /></div>

        {/* Integration Code Guide */}
        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">
            How to use Pro Features in your canvas
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Wire magnetic physics and adaptive edge rewiring directly into your React Flow v12 event handlers.
          </p>

          <div className="mt-5 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">1. Adaptive Rewire & Spider Web Snapping</p>
              <div className="mt-2 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs font-mono text-zinc-200">
                <pre>{`import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react'
import { useSpiderWeb } from '@/lib/use-spider-web'

export function MyFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // 'rewire' = degree-balanced swap (green add / red remove); 'accumulate' = greedy spider web
  const spider = useSpiderWeb(nodes, edges, setEdges, {
    reach: 350,
    strategy: 'rewire', // or 'accumulate'
    maxThreads: 8,
  })

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
  )
}`}</pre>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">2. Magnetic Repulsion Drag</p>
              <div className="mt-2 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs font-mono text-zinc-200">
                <pre>{`import { ReactFlow, useNodesState } from '@xyflow/react'
import { useMagneticDrag } from '@/lib/use-magnetic-drag'

export function MagneticFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const magnetic = useMagneticDrag(setNodes, { gap: 24 })

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
  )
}`}</pre>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 p-5 mt-10 text-sm border rounded-xl border-border bg-card text-muted-foreground">
          <span>Source-backed port</span>
          <code className="px-2 py-1 font-mono text-xs rounded bg-muted text-foreground">lib/use-spider-web.ts &amp; lib/use-magnetic-drag.ts</code>
          <span className="hidden sm:inline">→</span>
          <span>React Flow v12 APIs</span>
          <a href="https://github.com/kumarabhishek008/ReactFlowProFeatures" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 ml-auto text-primary hover:underline">
            View source <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>
    </main>
  )
}
