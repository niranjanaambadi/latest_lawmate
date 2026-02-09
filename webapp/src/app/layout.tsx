import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import { CommandPalette } from "@/components/layout/CommandPalette"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Lawmate - Kerala High Court Case Management",
  description: "Professional case management system for Kerala High Court advocates",
  keywords: ["legal", "case management", "Kerala High Court", "KHC"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <CommandPalette />
        </Providers>
      </body>
    </html>
  )
}