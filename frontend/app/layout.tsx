import type { Metadata, Viewport } from "next"
import { Caveat, Cormorant_Garamond, IBM_Plex_Mono, Manrope, Marck_Script, Playfair_Display } from "next/font/google"
import { AppProvider, THEME_SCRIPT } from "@/src/components/providers/AppProvider"
import { QueryProvider } from "@/src/components/providers/QueryProvider"
import { Toaster } from "@/src/components/ui/Toaster"
import "./globals.css"
import "./gift.css"

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin", "cyrillic"] })
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
})
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
})
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin", "cyrillic"], weight: ["400", "500", "600", "700"] })
const marck = Marck_Script({ variable: "--font-marck", subsets: ["latin", "cyrillic"], weight: "400" })
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin", "cyrillic"], weight: ["400", "500", "600"] })

export const metadata: Metadata = {
  title: {
    default: "Memoria — фотоколлажи с историей",
    template: "%s · Memoria",
  },
  description: "Превращай любимые фотографии в красивые истории: шаблоны коллажей для путешествий, любви, праздников и воспоминаний.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f1e9" },
    { media: "(prefers-color-scheme: dark)", color: "#141210" },
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fonts = [manrope, cormorant, playfair, caveat, marck, plexMono].map((f) => f.variable).join(" ")
  return (
    <html lang="ru" data-theme="light" className={`${fonts} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <QueryProvider>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
