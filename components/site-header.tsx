'use client';

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
// import ShiningDiv from "@/components/ui/shining-div"
import { Shield } from "lucide-react"
/** xyflow wordmark — the brand renders "xy" in the React pink accent. */
function Wordmark() {
  return (
    <div className="items-center block gap-2 ">
    <span className="flex font-mono text-lg font-bold tracking-tight text-foreground">
      <span className="text-primary">xy</span>flow
      {/* <ShiningDiv> */}
      <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 h-5 mt-1 ml-3 text-xs text-muted-foreground sm:inline border-flash">
            React Flow · v12
       </span>
      {/* </ShiningDiv> */}
    </span>
    <span className="flex font-mono text-xs font-light tracking-tight text-foreground">
      An expansive <span className="text-primary">&nbsp;design system&nbsp;</span> exclsuively for React Flow <span className="text-primary">&nbsp;v12&nbsp;</span>
    </span>
    </div>
  )
}

export function SiteHeader() {
    const pathname = usePathname()
  return (
    <header className="sticky top-0 z-10 flex border-b border-border bg-background/80 backdrop-blur">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <Wordmark />
          <span className="hidden rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground sm:inline">
            React Flow · v12
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className={cn("text-sm transition-colors text-muted-foreground hover:text-primary active:text-primary sm:inline",
            pathname === "/" && "text-primary hover:text-muted-foreground")}
          >
            Overview
          </Link>
          <Link
            href="/ngraph"
            className={cn("text-sm transition-colors text-muted-foreground hover:text-primary active:text-primary sm:inline",
            pathname === "/ngraph" && "text-primary hover:text-muted-foreground")}
          >
            Node builder
          </Link>
          <Link
            href="/pro-features"
            className={cn("text-sm transition-colors text-muted-foreground hover:text-primary active:text-primary sm:inline",
            pathname === "/pro-features" && "text-primary hover:text-muted-foreground")}
          >
            Pro features
          </Link>
          <Link
            href="/smart-edges"
            className={cn("text-sm transition-colors text-muted-foreground hover:text-primary active:text-primary sm:inline",
            pathname === "/smart-edges" && "text-primary hover:text-muted-foreground")}
          >
            Smart Edges
          </Link>
          <Link
            href="/patterns"
            className={cn("text-sm transition-colors text-muted-foreground hover:text-primary active:text-primary sm:inline",
            pathname === "/patterns" && "text-primary hover:text-muted-foreground")}
          >
            Studio patterns
          </Link>
          <Link
            href="/docs"
            className={cn("text-sm transition-colors text-muted-foreground hover:text-primary active:text-primary sm:inline",
            pathname === "/docs" && "text-primary hover:text-muted-foreground")}
          >
            Docs
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
