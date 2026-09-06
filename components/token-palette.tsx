const brandTokens = [
  { name: "react", label: "React", className: "bg-react" },
  { name: "svelte", label: "Svelte", className: "bg-svelte" },
  { name: "primary", label: "Primary", className: "bg-primary" },
  { name: "foreground", label: "Foreground", className: "bg-foreground" },
]

const surfaceTokens = [
  { name: "background", className: "bg-background border border-border" },
  { name: "card", className: "bg-card border border-border" },
  { name: "muted", className: "bg-muted" },
  { name: "accent", className: "bg-accent" },
  { name: "border", className: "bg-border" },
  { name: "destructive", className: "bg-destructive" },
]

const radii = [
  { name: "sm", className: "rounded-sm" },
  { name: "md", className: "rounded-md" },
  { name: "lg", className: "rounded-lg" },
]

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`h-14 w-full rounded-md ${className}`} />
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export function TokenPalette() {
  return (
    <div className="grid gap-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Brand accents</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {brandTokens.map((t) => (
            <Swatch key={t.name} className={t.className} label={t.label} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Surfaces</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {surfaceTokens.map((t) => (
            <Swatch key={t.name} className={t.className} label={t.name} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Radii · --radius 0.5rem</h3>
        <div className="flex flex-wrap gap-4">
          {radii.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-1.5">
              <div className={`h-14 w-14 border-2 border-primary bg-primary/10 ${r.className}`} />
              <span className="font-mono text-xs text-muted-foreground">{r.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
