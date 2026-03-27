import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  ClipboardList,
  Link2,
  Shield,
  Users,
  Heart,
  Camera,
  KeyRound,
  Globe,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Upload,
  FileCheck,
  Eye,
  BookOpen,
} from 'lucide-react'

export const metadata = {
  title: 'Anleitung – PollPromise',
}

export default function AnleitungPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12 space-y-10">
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="px-4 py-1.5 text-sm">
          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
          Anleitung
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold">So funktioniert PollPromise</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Eine Schritt-für-Schritt-Anleitung für Forscher und Teilnehmer.
        </p>
      </div>

      {/* ─── Für Forscher ─────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Für Forscher / Kampagnen-Ersteller
        </h2>

        {/* Step 1 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <CardTitle className="text-lg">Kampagne erstellen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Gehe auf <Link href="/create" className="text-primary hover:underline font-medium">Kampagne erstellen</Link> und
              fülle das Formular aus:
            </p>
            <ul className="space-y-2 ml-1">
              <li className="flex items-start gap-2">
                <Link2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>Umfrage-URL</strong> – Der Link zu deiner externen Umfrage (z.B. Google Forms, LimeSurvey, SoSci Survey)</span>
              </li>
              <li className="flex items-start gap-2">
                <Heart className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>Spendenbudget</strong> – Wie viel du insgesamt spenden möchtest und wie viel pro Teilnahme</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>Verifizierungsmethode</strong> – Wie Teilnehmer ihre Teilnahme nachweisen sollen</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Step 2: Verification methods */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <CardTitle className="text-lg">Verifizierungsmethode wählen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Abschluss-Code</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Zeige am Ende deiner Umfrage einen Code an (z.B. &quot;DANKE2024&quot;).
                  Teilnehmer geben diesen Code ein, um die Teilnahme automatisch zu bestätigen.
                  <strong> Empfohlen</strong> – schnell und ohne manuellen Aufwand.
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Screenshot</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Teilnehmer laden einen Screenshot der abgeschlossenen Umfrage hoch.
                  Du prüfst jeden Screenshot manuell im Admin-Dashboard.
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">URL-Eingabe</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Teilnehmer geben eine bestimmte URL ein (z.B. die &quot;Danke&quot;-Seite deiner Umfrage).
                  Du legst die erwartete URL beim Erstellen der Kampagne fest.
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <span className="mr-1 font-medium text-sm">+</span>
                  <Camera className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Code oder Screenshot</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Kombiniert: Teilnehmer können entweder einen Code eingeben oder einen Screenshot
                  hochladen. Maximale Flexibilität.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Share */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <CardTitle className="text-lg">Links speichern & Kampagne teilen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Nach dem Erstellen erhältst du zwei Links:</p>
            <div className="space-y-2 ml-1">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0 text-xs">Admin-Link</Badge>
                <span>Dein geheimer Verwaltungslink. Nicht teilen! Damit verwaltest du die Kampagne.</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="shrink-0 text-xs bg-primary">Teilnehmer-Link</Badge>
                <span>Diesen Link teilst du mit den Teilnehmern deiner Umfrage.</span>
              </div>
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 p-3 mt-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  <strong>Wichtig:</strong> Speichere den Admin-Link sicher ab! Er kann nicht erneut
                  angezeigt werden und ist der einzige Zugang zu deinem Dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Manage */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                4
              </div>
              <CardTitle className="text-lg">Kampagne verwalten & Spende bestätigen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Im Admin-Dashboard kannst du:</p>
            <ul className="space-y-2 ml-1">
              <li className="flex items-start gap-2">
                <Eye className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Einreichungen prüfen und genehmigen oder ablehnen</span>
              </li>
              <li className="flex items-start gap-2">
                <FileCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Budget-Fortschritt und Statistiken einsehen</span>
              </li>
              <li className="flex items-start gap-2">
                <Upload className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Am Ende die Spende bestätigen und einen Nachweis hochladen</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* ─── Für Teilnehmer ───────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Für Teilnehmer
        </h2>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <CardTitle className="text-lg">Umfrage ausfüllen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Klicke auf der Kampagnenseite auf &quot;Zur Umfrage&quot;. Du wirst zur externen Umfrage
              weitergeleitet. Fülle die Umfrage vollständig aus. Am Ende erhältst du je nach
              Verifizierungsmethode einen Code, eine URL oder die Aufforderung, einen Screenshot zu machen.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <CardTitle className="text-lg">Teilnahme verifizieren</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Kehre zur Kampagnenseite zurück und klicke auf &quot;Umfrage abgeschlossen? Hier verifizieren&quot;.
              Gib deinen Code ein, lade deinen Screenshot hoch oder gib die geforderte URL ein.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <CardTitle className="text-lg">Spende nachverfolgen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Speichere den Kampagnen-Link. Sobald die Kampagne beendet ist und der Ersteller die
              Spende bestätigt hat, wird der Spendennachweis auf der Kampagnenseite veröffentlicht.
              So kannst du nachverfolgen, dass deine Teilnahme wirklich zu einer Spende geführt hat.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ─── Beispiel ─────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-primary" />
          Beispiel-Ablauf
        </h2>

        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="pt-6">
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-medium text-foreground">Anna erstellt eine Kampagne</p>
                  <p className="text-muted-foreground">
                    Titel: &quot;Studie zum Onlinekaufverhalten&quot;, Budget: 50,00 EUR, pro Teilnahme: 1,00 EUR,
                    Verifizierung: Abschluss-Code &quot;KAUFSTUDIE24&quot;, Organisation: UNICEF
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-medium text-foreground">Anna teilt den Teilnehmer-Link</p>
                  <p className="text-muted-foreground">
                    Sie postet den Link in einer Studierenden-Gruppe und in ihrem Kurs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-medium text-foreground">Max nimmt teil</p>
                  <p className="text-muted-foreground">
                    Max öffnet die Kampagnenseite, klickt &quot;Zur Umfrage&quot;, füllt die Umfrage aus und
                    sieht am Ende den Code &quot;KAUFSTUDIE24&quot;. Er geht zurück, klickt &quot;Hier verifizieren&quot;
                    und gibt den Code ein. Fertig!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
                <div>
                  <p className="font-medium text-foreground">50 Teilnehmer, Budget erreicht</p>
                  <p className="text-muted-foreground">
                    Das Budget von 50,00 EUR ist aufgebraucht. Anna beendet die Kampagne im Dashboard.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">5</div>
                <div>
                  <p className="font-medium text-foreground">Anna spendet und lädt den Beleg hoch</p>
                  <p className="text-muted-foreground">
                    Anna überweist 50,00 EUR an UNICEF, macht ein Foto des Belegs (mit
                    geschwärzter IBAN!), und lädt es im Dashboard hoch. Alle Teilnehmer können
                    den Nachweis auf der Kampagnenseite sehen.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold">Häufige Fragen</h2>

        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Fließt Geld über die Plattform?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Nein. PollPromise wickelt keine Zahlungen ab. Die Plattform dokumentiert
                die Spendenversprechen transparent. Die Überweisung erfolgt direkt durch den
                Kampagnen-Ersteller an die gemeinnützige Organisation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Kann ich mehrfach an einer Kampagne teilnehmen?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Nein. Die Plattform erkennt Mehrfachteilnahmen anhand eines anonymisierten
                Fingerprints (gehashte IP-Adresse + Browser-Informationen) und lokalem Speicher.
                Es werden dabei keine persönlichen Daten gespeichert.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Was passiert, wenn der Ersteller nicht spendet?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                PollPromise kann Spenden nicht erzwingen. Allerdings ist für alle Teilnehmer
                öffentlich sichtbar, ob ein Spendennachweis hochgeladen wurde oder nicht. Diese
                Transparenz motiviert Ersteller, ihr Versprechen einzuhalten.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Kostet die Nutzung etwas?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Nein. PollPromise ist komplett kostenlos und quelloffen. Die Plattform verdient
                kein Geld an deinen Kampagnen.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center pt-4 space-y-4">
        <p className="text-muted-foreground">Bereit loszulegen?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/create" className={cn(buttonVariants({ size: 'lg' }), 'text-base px-8')}>
            Kampagne erstellen
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
          <Link href="/kontakt" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'text-base px-8')}>
            Feedback geben
          </Link>
        </div>
      </div>
    </div>
  )
}
