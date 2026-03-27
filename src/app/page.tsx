import { GlobalStats } from "@/components/global-stats"
import Link from "next/link"
import {
  ClipboardList,
  Users,
  Heart,
  Sparkles,
  Zap,
  Eye,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  TrendingUp,
  HandHeart,
  Target,
  GraduationCap,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ScrollLink } from "@/components/scroll-link"

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-100/40 via-transparent to-transparent" />
        <div className="relative container mx-auto px-4 py-10 md:py-32 lg:py-40">
          <div className="max-w-3xl mx-auto text-center space-y-5 md:space-y-8">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm">
              <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
              Für Forschende &amp; Studierende
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              Deine Umfrage.{" "}
              <span className="text-primary">Deine Spende.</span>{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Mehr Teilnehmer.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Zu wenig Teilnehmer bei deiner Studie? Mit PollPromise spendest du
              pro ausgefüllter Umfrage an eine gemeinnützige <a href="/charities" className="underline decoration-primary/50 hover:decoration-primary transition-colors">Organisation</a> –
              und steigerst so deine Teilnahmequote.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/create" className={cn(buttonVariants({ size: "lg" }), "text-base px-8 inline-flex items-center justify-center")}>
                  Kampagne erstellen
                  <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <ScrollLink href="#so-funktionierts" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-base px-8 w-full sm:w-auto inline-flex items-center justify-center no-underline")}>
                  So funktioniert&apos;s
                  <ChevronDown className="h-4 w-4 ml-2" />
              </ScrollLink>
            </div>
            <p className="text-sm text-muted-foreground pt-1">
              Kostenlos · Kein Account nötig · In 2 Minuten startklar
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Global Stats */}
      <GlobalStats />

      {/* Problem → Solution */}
      <section className="py-8 md:py-24 bg-gradient-to-b from-transparent via-green-50/30 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 md:mb-12 space-y-3 md:space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                120 Antworten gebraucht. 12 bekommen.
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                E-Mails werden ignoriert, Social-Media-Posts gehen unter –
                und deine Abgabe ist in zwei Wochen. Kommt dir bekannt vor?
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-2 md:gap-8">
              <div className="text-center space-y-2 md:space-y-3 p-4 md:p-6">
                <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
                  <Target className="h-7 w-7 text-red-400" />
                </div>
                <h3 className="font-semibold text-lg">Zu wenig Rücklauf</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ohne Anreiz liegt die Rücklaufquote oft unter 10%.
                  Jede fehlende Antwort kostet dich Datenqualität.
                </p>
              </div>

              <div className="text-center space-y-2 md:space-y-3 p-4 md:p-6">
                <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto">
                  <TrendingUp className="h-7 w-7 text-amber-500" />
                </div>
                <h3 className="font-semibold text-lg">Die Lösung: ein Anreiz</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Eine Spende pro Teilnahme – das motiviert, ohne zu bestechen.
                  Und es fühlt sich für alle gut an.
                </p>
              </div>

              <div className="text-center space-y-2 md:space-y-3 p-4 md:p-6">
                <div className="h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto">
                  <HandHeart className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Alle gewinnen</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Du bekommst deine Daten. Teilnehmer bewirken etwas Gutes.
                  Die Organisation erhält Unterstützung. Dreifach sinnvoll.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="so-funktionierts" className="py-8 md:py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-16 space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              So funktioniert&apos;s
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              In drei einfachen Schritten von der Umfrage zur Spende.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative group">
              <div className="flex flex-col items-center text-center space-y-3 md:space-y-4 p-4 md:p-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-200 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
                  <div className="relative h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center">
                    <ClipboardList className="h-8 w-8 text-green-700" />
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary">Schritt 1</span>
                <h3 className="text-xl font-semibold">Kampagne anlegen</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Füge deinen Umfrage-Link ein, wähle eine Organisation
                  und lege dein Spendenbudget fest. Dauert keine 2 Minuten.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="flex flex-col items-center text-center space-y-3 md:space-y-4 p-4 md:p-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-200 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
                  <div className="relative h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center">
                    <Users className="h-8 w-8 text-green-700" />
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary">Schritt 2</span>
                <h3 className="text-xl font-semibold">Teilnehmer füllen aus</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Teile deinen Kampagnen-Link. Teilnehmer füllen die Umfrage
                  aus und bestätigen ihre Teilnahme – fertig.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="flex flex-col items-center text-center space-y-3 md:space-y-4 p-4 md:p-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-200 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
                  <div className="relative h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-green-700" />
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary">Schritt 3</span>
                <h3 className="text-xl font-semibold">Spende wird ausgelöst</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nach Kampagnenende wird die Gesamtsumme an die gewählte
                  Organisation gespendet. Mit Nachweis für alle sichtbar.
                </p>
              </div>
            </div>
          </div>

          {/* CTA after steps */}
          <div className="text-center mt-8 md:mt-12">
            <Link href="/create" className={cn(buttonVariants({ size: "lg" }), "text-base px-8")}>
              Jetzt in 2 Minuten starten
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 md:py-24 bg-gradient-to-b from-transparent via-green-50/50 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-16 space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Warum PollPromise?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Alles, was du brauchst – nichts, was du nicht brauchst.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            <Card className="border-green-100 hover:border-green-200 transition-colors hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                  <Sparkles className="h-5 w-5 text-green-700" />
                </div>
                <CardTitle className="text-lg">100% kostenlos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  Keine Gebühren, keine Provision. Dein gesamtes
                  Budget fließt in die Spende.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:border-green-200 transition-colors hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                  <Zap className="h-5 w-5 text-green-700" />
                </div>
                <CardTitle className="text-lg">Sofort loslegen</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  Kein Login, keine Registrierung. Alles funktioniert
                  über Links – für Forschende und Teilnehmer.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:border-green-200 transition-colors hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                  <Eye className="h-5 w-5 text-green-700" />
                </div>
                <CardTitle className="text-lg">Transparent</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  Nachvollziehbare Spenden mit Belegen. Jeder kann
                  sehen, wohin das Geld fließt.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:border-green-200 transition-colors hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                  <ShieldCheck className="h-5 w-5 text-green-700" />
                </div>
                <CardTitle className="text-lg">Datenschutzfreundlich</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  Keine Tracking-Cookies, minimale Datenerhebung.
                  Entwickelt mit Blick auf DSGVO-Konformität.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:border-green-200 transition-colors hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                  <ClipboardList className="h-5 w-5 text-green-700" />
                </div>
                <CardTitle className="text-lg">Einfache Verifizierung</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  Teilnehmer bestätigen ihre Teilnahme per Code
                  oder Screenshot. Du entscheidest.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Campaigns CTA */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="border-green-200 bg-gradient-to-br from-green-50/80 to-emerald-50/50 hover:shadow-lg transition-all">
            <CardContent className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6 md:p-8">
              <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                <Heart className="h-7 w-7 text-green-700" />
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <h3 className="text-xl font-bold">An einer Umfrage teilnehmen</h3>
                <p className="text-sm text-muted-foreground">
                  Such dir eine Kampagne aus, füll eine Umfrage aus –
                  und lös damit eine echte Spende aus.
                </p>
              </div>
              <Link
                href="/kampagnen"
                className={cn(
                  buttonVariants({ size: "default" }),
                  "shrink-0 whitespace-nowrap"
                )}
              >
                Jetzt teilnehmen
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-8 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-4 md:space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-green-700 fill-green-700" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Mehr Teilnehmer, mehr Wirkung
            </h2>
            <p className="text-muted-foreground text-lg">
              Verwandle deine nächste Umfrage in eine Spendenaktion.
              Kostenlos, in wenigen Minuten eingerichtet, und komplett transparent.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/create" className={cn(buttonVariants({ size: "lg" }), "text-base px-8")}>
                  Jetzt Kampagne erstellen
                  <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <Link href="/kampagnen" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-base px-8")}>
                  Oder: Kampagnen ansehen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
