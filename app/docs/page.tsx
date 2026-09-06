import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import {
  componentGroups,
  hookGroups,
  ngraphComponentGroups,
  ngraphHookGroups,
  studioPatternGroups,
  smartEdgeApiGroups,
  type ApiGroup,
} from "@/lib/api-reference"

const componentCount = componentGroups.reduce((n, g) => n + g.entries.length, 0)
const hookCount = hookGroups.reduce((n, g) => n + g.entries.length, 0)
const studioPatternCount = studioPatternGroups.reduce((n, g) => n + g.entries.length, 0)
const smartEdgeCount = smartEdgeApiGroups.reduce((n, g) => n + g.entries.length, 0)
const ngraphCount =
  ngraphComponentGroups.reduce((n, g) => n + g.entries.length, 0) +
  ngraphHookGroups.reduce((n, g) => n + g.entries.length, 0)

function ApiCard({ group }: { group: ApiGroup }) {
  return (
    <div className="scroll-mt-24" id={group.id}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{group.title}</h3>
        <span className="font-mono text-xs text-muted-foreground">{group.entries.length}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{group.blurb}</p>
      <ul className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {group.entries.map((entry) => (
          <li key={entry.name + entry.signature} className="p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <code className="w-fit rounded-md bg-primary/10 px-2 py-0.5 font-mono text-sm font-semibold text-primary">
                {entry.name}
              </code>
              <code className="max-w-full overflow-x-auto whitespace-pre rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground sm:max-w-[55%]">
                {entry.signature}
              </code>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">{entry.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TocLink({ group }: { group: ApiGroup }) {
  return (
    <a
      href={`#${group.id}`}
      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <span>{group.title}</span>
      <span className="font-mono text-xs">{group.entries.length}</span>
    </a>
  )
}

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      <section className="py-12 sm:py-16">
        <div className="container">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">API reference</p>
          <h1 className="max-w-3xl text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Components &amp; hooks
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
            The core {componentCount} components and {hookCount} hooks below are named exports of{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">@xyflow/react</code>. The
            sections below also cover {smartEdgeCount} smart routing exports and {studioPatternCount} studio patterns.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {componentCount} components
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {smartEdgeCount} smart edges
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {studioPatternCount} studio patterns
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {ngraphCount} ngraph exports
            </span>
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              &larr; Back to overview
            </Link>
          </div>
        </div>
      </section>

      <div className="container grid gap-10 pb-20 lg:grid-cols-[220px_1fr]">
        {/* Sticky table of contents */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-4">
            <div>
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-foreground">Components</p>
              <div className="mt-1">
                {componentGroups.map((g) => (
                  <TocLink key={g.id} group={g} />
                ))}
              </div>
            </div>
            <div>
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-foreground">Hooks</p>
              <div className="mt-1">
                {hookGroups.map((g) => (
                  <TocLink key={g.id} group={g} />
                ))}
              </div>
            </div>
            <div>
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-foreground">Smart Edges</p>
              <div className="mt-1">
                {smartEdgeApiGroups.map((g) => (
                  <TocLink key={g.id} group={g} />
                ))}
              </div>
            </div>
            <div>
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-foreground">Studio Patterns</p>
              <div className="mt-1">
                {studioPatternGroups.map((g) => (
                  <TocLink key={g.id} group={g} />
                ))}
              </div>
            </div>
            <div>
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-foreground">ngraph</p>
              <div className="mt-1">
                {[...ngraphComponentGroups, ...ngraphHookGroups].map((g) => (
                  <TocLink key={g.id} group={g} />
                ))}
              </div>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 space-y-12">
          <div className="space-y-8">
            <div className="border-b border-border pb-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Components</h2>
            </div>
            {componentGroups.map((g) => (
              <ApiCard key={g.id} group={g} />
            ))}
          </div>

          <div className="space-y-8">
            <div className="border-b border-border pb-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Hooks</h2>
            </div>
            {hookGroups.map((g) => (
              <ApiCard key={g.id} group={g} />
            ))}
          </div>

          <div className="space-y-8">
            <div className="border-b border-border pb-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Smart Edges
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A* and Jump Point Search obstacle-avoiding edge suite for React Flow v12. See the{" "}
                <Link href="/smart-edges" className="text-primary underline-offset-4 hover:underline">
                  interactive smart edges playground
                </Link>
                .
              </p>
            </div>
            {smartEdgeApiGroups.map((g) => (
              <ApiCard key={g.id} group={g} />
            ))}
          </div>

          <div className="space-y-8">
            <div className="border-b border-border pb-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Studio Patterns
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Advanced edge routing, particle flows, waypoint editing, auto-layout, and presence ported from xyflow-studio. See the{" "}
                <Link href="/patterns" className="text-primary underline-offset-4 hover:underline">
                  interactive studio patterns showcase
                </Link>
                .
              </p>
            </div>
            {studioPatternGroups.map((g) => (
              <ApiCard key={g.id} group={g} />
            ))}
          </div>

          <div className="space-y-8">
            <div className="border-b border-border pb-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                ngraph <span className="font-mono text-sm font-normal text-muted-foreground">@clarkmcc/ngraph</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A config-driven node-building layer on top of React Flow. See the{" "}
                <Link href="/ngraph" className="text-primary underline-offset-4 hover:underline">
                  live editor demo
                </Link>
                .
              </p>
            </div>
            {[...ngraphComponentGroups, ...ngraphHookGroups].map((g) => (
              <ApiCard key={g.id} group={g} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
