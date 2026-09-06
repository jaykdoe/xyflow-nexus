"use client"

import type * as React from "react"
import { ThemeProvider as NextThemesProvider } from "@teispace/next-themes"
import { ThemeToggle } from "@/components/theme-toggle"
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
