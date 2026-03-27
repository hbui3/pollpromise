import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { Heart } from "lucide-react"
import { VisitorTracker } from "@/components/visitor-tracker"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://pollpromise.com"),
  title: "PollPromise – Umfragen für den guten Zweck",
  description:
    "Kostenlose Plattform für Forscher: Pro Umfrage-Teilnahme wird an eine gemeinnützige Organisation gespendet. Mehr Rücklauf, mehr Wirkung.",
  openGraph: {
    title: "PollPromise – Umfragen für den guten Zweck",
    description:
      "Pro Umfrage-Teilnahme wird gespendet. Mehr Rücklauf, mehr Wirkung.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Heart className="h-6 w-6 text-primary fill-primary" />
              <span>
                Poll<span className="text-primary">Promise</span>
              </span>
            </Link>
            <nav className="flex items-center gap-4 sm:gap-6">
              <Link
                href="/kampagnen"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              >
                Kampagnen
              </Link>
              <Link
                href="/charities"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              >
                Organisationen
              </Link>
              <Link
                href="/anleitung"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              >
                Anleitung
              </Link>
              <Link
                href="/create"
                className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Kampagne erstellen
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t py-8 mt-auto">
          <div className="container mx-auto px-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="text-center sm:text-left">
                <p>
                  © {new Date().getFullYear()} PollPromise – Umfragen mit Wirkung.
                </p>
              </div>
              <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                <Link
                  href="/kampagnen"
                  className="hover:text-foreground transition-colors"
                >
                  Kampagnen
                </Link>
                <Link
                  href="/anleitung"
                  className="hover:text-foreground transition-colors"
                >
                  Anleitung
                </Link>
                <Link
                  href="/kontakt"
                  className="hover:text-foreground transition-colors"
                >
                  Kontakt
                </Link>
                <Link
                  href="/datenschutz"
                  className="hover:text-foreground transition-colors"
                >
                  Datenschutz
                </Link>
                <Link
                  href="/impressum"
                  className="hover:text-foreground transition-colors"
                >
                  Impressum
                </Link>
              </nav>
            </div>
            <div className="flex justify-center items-center gap-3 text-xs text-muted-foreground">
              <VisitorTracker />
              <span>·</span>
              <a
                href="https://github.com/hbui3/pollpromise"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Open Source auf GitHub
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
