"use client"

// import { useTheme } from "next-themes"
import { useTheme, useThemeValue, ScopedTheme } from '@/app/theme';
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      aria-label="Toggle color mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center justify-center transition-colors border rounded-md h-9 w-9 border-border bg-card text-foreground hover:bg-muted"
    >
      {mounted && isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
