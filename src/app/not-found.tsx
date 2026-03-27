import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SearchX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <SearchX className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-2">Seite nicht gefunden</h1>
      <p className="text-muted-foreground mb-8">
        Die angeforderte Seite existiert nicht oder wurde entfernt.
      </p>
      <Link href="/" className={cn(buttonVariants())}>Zur Startseite</Link>
    </div>
  )
}
