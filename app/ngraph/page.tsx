import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { NgraphEditor } from "@/components/ngraph-editor"

const buildingBlocks = [
  { name: "NodeContainer", role: "Node shell — border, background, selection, drag" },
  { name: "NodeHeader", role: "Editable title bar with kind color + collapse toggle" },
  { name: "NodeInputField", role: "Text / number input bound to a node data field" },
  { name: "NodeCheckboxField", role: "Boolean input row" },
  { name: "NodeSelectField", role: "Dropdown / button-group input row" },
  { name: "NodeLinkedField", role: "Input row with a connectable target handle" },
  { name: "NodeDenseLinkedField", role: "Compact linked-input variant" },
  { name: "NodeOutputField", role: "Output row with a connectable source handle" },
  { name: "Handle", role: "Typed, value-type-aware handle (diamond / circle)" },
]

export default function NgraphPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="py-12 sm:py-16">
        <div className="container">
          <p className="mb-2 font-mono text-xs tracking-widest uppercase text-primary">Node builder</p>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
            Config-driven node building with <span className="text-primary">ngraph</span>
          </h1>
          <p className="max-w-2xl mt-3 text-pretty text-muted-foreground">
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">@clarkmcc/ngraph</code> adds
            a declarative node-building layer on top of React Flow. You describe your{" "}
            <span className="text-foreground">value types</span>, <span className="text-foreground">node kinds</span>, and{" "}
            <span className="text-foreground">node types</span>, and ngraph generates the node headers, typed input
            fields, and connectable handles for you.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs border rounded-full border-border bg-card text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Built on @xyflow/react v12
            </span>
            <Link
              href="/docs#ngraph-editor"
              className="inline-flex items-center px-3 py-1 text-xs transition-colors border rounded-full border-border text-muted-foreground hover:text-foreground"
            >
              ngraph API reference &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 border-t border-border sm:py-16">
        <div className="container">
          <p className="mb-2 font-mono text-xs tracking-widest uppercase text-primary">Live editor</p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Generated node graph</h2>
          <p className="max-w-2xl mt-2 text-muted-foreground">
            Every node below is rendered from a single <code className="font-mono text-sm text-foreground">GraphConfig</code>{" "}
            — no hand-written node components. Drag nodes, connect the typed handles, and pan / zoom the canvas.
          </p>
          <div className="mt-8">
            <NgraphEditor />
          </div>
        </div>
      </section>

      <section className="py-12 border-t border-border sm:py-16">
        <div className="container">
          <p className="mb-2 font-mono text-xs tracking-widest uppercase text-primary">Building blocks</p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            The node-building components
          </h2>
          <p className="max-w-2xl mt-2 text-muted-foreground">
            These are the ngraph exports that compose a node. The config-driven editor above wires them for you, but you
            can also use them directly to build fully custom nodes.
          </p>
          <ul className="grid gap-px mt-8 overflow-hidden border rounded-xl border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {buildingBlocks.map((b) => (
              <li key={b.name} className="p-4 bg-card">
                <code className="font-mono text-sm font-semibold text-primary">{b.name}</code>
                <p className="mt-1 text-sm text-muted-foreground">{b.role}</p>
              </li>
            ))}
          </ul>

          {/* Integration Code Guide */}
          <div className="mt-12 rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">
              How to use ngraph in your canvas
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Define typed schemas and pass them to <code className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 text-foreground">NgraphCanvas</code> to auto-generate full node editors.
            </p>
            <div className="mt-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs font-mono text-zinc-200">
              <pre>{`import { NgraphCanvas, type GraphConfig } from '@clarkmcc/ngraph'

const config: GraphConfig = {
  valueTypes: {
    string: { label: 'String', color: '#38bdf8' },
    number: { label: 'Number', color: '#f59e0b' },
  },
  kinds: {
    transform: { label: 'Transformation', color: '#a855f7' },
  },
  nodeTypes: {
    filter: {
      kind: 'transform',
      label: 'Filter Rows',
      inputs: [{ id: 'in', label: 'Dataset', type: 'string' }],
      outputs: [{ id: 'out', label: 'Filtered', type: 'string' }],
    },
  },
}

export function MyConfigFlow() {
  return <NgraphCanvas config={config} initialNodes={nodes} initialEdges={edges} />
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-border">
        <div className="container flex flex-col items-start justify-between gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <span>
            <span className="font-mono font-bold text-foreground">
              <span className="text-primary">xy</span>flow
            </span>{" "}
            · React Flow design system
          </span>
          <span>ngraph · @clarkmcc/ngraph</span>
        </div>
      </footer>
    </main>
  )
}
