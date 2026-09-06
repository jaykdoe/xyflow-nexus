import type React from "react"
import type { Metadata } from "next"
import { Inter, Fira_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { getTheme } from '@teispace/next-themes/server';
import { useTheme, useThemeValue, ScopedTheme } from '@/app/theme';

// xyflow ships with a proprietary display sans (NTDapper); Inter is used here
// as an accessible, metrics-similar substitute. [VERIFY] swap for the licensed
// brand font if available. Mono matches xyflow's Fira Mono.
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" })
const mono = Fira_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-mono", display: "swap" })

export const metadata: Metadata = {
  title: "React Flow — Node-Based Editor Design System",
  description:
    "A highly customizable React library for building node-based editors, flow charts, and interactive diagrams.",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const initialTheme = await getTheme();

  return (
    <html lang="en" suppressHydrationWarning className={`h-full scroll-smooth` + " " + (initialTheme === "dark" ? "dark" : "")} style={{ colorScheme: (initialTheme as "light" | "dark") || undefined }}>
      <body className={`${sans.variable} ${mono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" initialTheme={initialTheme || "dark"} enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
