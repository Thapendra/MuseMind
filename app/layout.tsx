import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import MusicalBackground from "@/components/musical-background"
import { ThemeProvider } from "@/components/theme-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MuseMind - AI Music Generator",
  description: "Create complete songs powered by AI - from lyrics to vocals",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased relative`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MusicalBackground />
          <div className="relative z-10">{children}</div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
