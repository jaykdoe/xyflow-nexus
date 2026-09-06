import { SiteHeader } from "@/components/site-header"
import { FlowEditor } from "@/components/flow-editor"
import { TokenPalette } from "@/components/token-palette"
import { TypeScale } from "@/components/type-scale"


function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="py-12 border-t border-border sm:py-16">
      <div className="container">
        <p className="mb-2 font-mono text-xs tracking-widest uppercase text-primary">{eyebrow}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
        {description ? <p className="max-w-2xl mt-2 text-muted-foreground">{description}</p> : null}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="py-14 sm:py-20">
        <div className="container">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border rounded-full border-border bg-card text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Node-based editor design system
          </span>
          <h1 className="max-w-3xl mt-5 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl">
            Build node-based editors and interactive diagrams with{" "}
            <span className="text-primary">React Flow</span>
          </h1>
          <p className="max-w-2xl mt-4 text-lg text-pretty text-muted-foreground">
            A highly customizable React library for flow charts, workflow builders, and node graphs — with
            draggable nodes, connectable handles, controls, a minimap, and full light / dark theming.
          </p>
        </div>
      </section>

      <Section
        eyebrow="Live canvas"
        title="Interactive flow editor"
        description="Custom node types wired with typed handles and animated edges. Drag nodes, connect handles, zoom, pan, and use the minimap — all powered by @xyflow/react."
      >
        <FlowEditor />

        {/* Getting Started Guide */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">
            Quickstart: Setting up a styled React Flow canvas
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Install <code className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 text-foreground">@xyflow/react</code> and import the base stylesheet to start building with theme tokens.
          </p>
          <div className="mt-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs font-mono text-zinc-200">
            <pre>{`import '@xyflow/react/dist/style.css'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from '@xyflow/react'

export function Editor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background gap={16} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}`}</pre>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Advanced patterns"
        title="Production workflow extensions"
        description="Explore specialized labs built for React Flow v12: smart obstacle-avoiding edges, geometry & physics labs, and 7 studio authoring patterns."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col justify-between p-6 border shadow-sm rounded-xl border-border bg-card">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Routing</span>
              <h3 className="text-base font-semibold text-card-foreground">Smart Obstacle Edges</h3>
              <p className="text-sm text-muted-foreground">Grid A* and Jump Point Search pathfinding across 5 edge geometry presets.</p>
            </div>
            <a
              href="/smart-edges"
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Explore Smart Edges &rarr;
            </a>
          </div>

          <div className="flex flex-col justify-between p-6 border shadow-sm rounded-xl border-border bg-card">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Geometry & Physics</span>
              <h3 className="text-base font-semibold text-card-foreground">Pro Features Lab</h3>
              <p className="text-sm text-muted-foreground">Magnetic repulsion forces, dynamic spider web multi-edges, and shape geometries.</p>
            </div>
            <a
              href="/pro-features"
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Explore Pro Features &rarr;
            </a>
          </div>

          <div className="flex flex-col justify-between p-6 border shadow-sm rounded-xl border-border bg-card">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Studio Lab</span>
              <h3 className="text-base font-semibold text-card-foreground">7 Studio Patterns</h3>
              <p className="text-sm text-muted-foreground">Particle throttles, editable waypoint curves, DAG auto-layout, and drag-and-drop palette.</p>
            </div>
            <a
              href="/patterns"
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Launch Studio Patterns &rarr;
            </a>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Foundations"
        title="Color & radius tokens"
        description="Brand accents and semantic surface tokens drive both the UI chrome and the flow canvas, adapting across light and dark modes."
      >
        <TokenPalette />
      </Section>

      <Section eyebrow="Foundations" title="Typography" description="A compact type scale in the brand sans, with Fira Mono for code.">
        <div className="max-w-2xl">
          <TypeScale />
        </div>
      </Section>

      <footer className="py-8 border-t border-border">
        <div className="container flex flex-col items-start justify-between gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <span>
            <span className="font-mono font-bold text-foreground">
              <span className="text-primary">xy</span>flow
            </span>{" "}
            · React Flow design system
          </span>
          <span>MIT · reactflow.dev</span>
        </div>
      </footer>
    </main>
  )
}
