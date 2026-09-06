const scale = [
  { cls: "text-4xl font-bold tracking-tight", label: "Display / 4xl" },
  { cls: "text-2xl font-semibold", label: "Heading / 2xl" },
  { cls: "text-lg font-medium", label: "Subhead / lg" },
  { cls: "text-base", label: "Body / base" },
  { cls: "text-sm text-muted-foreground", label: "Caption / sm" },
]

export function TypeScale() {
  return (
    <div className="grid gap-5">
      {scale.map((s) => (
        <div key={s.label} className="flex flex-col gap-1 border-b border-border pb-4 last:border-0 last:pb-0">
          <span className="font-mono text-xs text-muted-foreground">{s.label}</span>
          <p className={`${s.cls} font-sans text-foreground`}>Build node-based editors</p>
        </div>
      ))}
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <span className="font-mono text-xs text-muted-foreground">Mono / Fira Mono</span>
        <p className="mt-1 font-mono text-sm text-foreground">const [nodes, setNodes] = useNodesState([])</p>
      </div>
    </div>
  )
}
