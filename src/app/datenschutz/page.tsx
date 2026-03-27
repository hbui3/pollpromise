import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Datenschutzerklärung – PollPromise',
}

export default function DatenschutzPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Datenschutzerklärung</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Verantwortlicher</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-2">
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Website ist:
          </p>
          <p>
            Hendrik Buisker<br />
            Schweiz<br />
            <a href="/kontakt" className="text-primary hover:underline">Kontaktformular</a>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Geltungsbereich</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-2">
          <p>
            Diese Datenschutzerklärung gilt für die Website pollpromise.com. Der Betreiber hat seinen
            Sitz in der Schweiz; es gilt das Schweizer Datenschutzgesetz (DSG). Da sich die Website
            auch an Nutzer in der Europäischen Union richtet, werden zusätzlich die Anforderungen
            der EU-Datenschutz-Grundverordnung (DSGVO) berücksichtigt.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3. Erhebung und Verarbeitung personenbezogener Daten</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-4">
          <div>
            <p className="font-medium text-foreground">3.1 Keine Nutzerkonten</p>
            <p>
              PollPromise erfordert keine Registrierung oder Erstellung eines Nutzerkontos.
              Die Verwaltung von Kampagnen erfolgt über zufällig generierte, geheime Links (Tokens).
              Es werden keine E-Mail-Adressen, Passwörter oder persönliche Nutzerdaten gespeichert.
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">3.2 Schutz vor Doppelteilnahme</p>
            <p>
              Um Mehrfachteilnahmen an Kampagnen zu verhindern, wird beim Einreichen einer
              Verifizierung ein sogenannter Hash-Wert berechnet. Dieser Hash-Wert wird aus
              der IP-Adresse und dem User-Agent des Browsers abgeleitet und mittels SHA-256
              unwiderruflich verschlüsselt. Es ist <strong>nicht</strong> möglich, aus dem
              gespeicherten Hash-Wert die ursprüngliche IP-Adresse oder den User-Agent
              zurückzuberechnen.
            </p>
            <p className="mt-2">
              Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Verhinderung
              von Missbrauch) bzw. Art. 31 DSG.
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">3.3 Lokale Speicherung (localStorage)</p>
            <p>
              Zusätzlich speichert die Website im localStorage deines Browsers, an welchen Kampagnen
              du bereits teilgenommen hast. Diese Daten werden <strong>nicht</strong> an unseren
              Server übertragen und verbleiben ausschliesslich auf deinem Gerät. Du kannst diese
              Daten jederzeit über die Browser-Einstellungen löschen.
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">3.4 Seitenaufrufe</p>
            <p>
              PollPromise erfasst anonymisierte Seitenaufrufe (Seitenname und ein gehashter
              Besucher-Identifikator). Es werden keine Tracking-Cookies gesetzt und keine
              Drittanbieter-Analysedienste verwendet. Die Daten dienen ausschliesslich der
              Anzeige aggregierter Besucherzahlen.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">4. Hochladen von Spendennachweisen</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-2">
          <p>
            Kampagnen-Ersteller können einen Spendennachweis (z.B. Foto eines Überweisungsbelegs)
            hochladen, um die getätigte Spende zu dokumentieren. Dieser Nachweis wird auf der
            Kampagnenseite öffentlich angezeigt, damit Teilnehmer die Spende nachvollziehen können.
          </p>
          <p>
            <strong>Wichtig:</strong> Kampagnen-Ersteller sind selbst dafür verantwortlich, vor dem
            Hochladen alle persönlichen und sensiblen Daten (z.B. IBAN, Kontonummern, vollständige
            Namen, Adressen) auf dem Bild zu schwärzen oder unkenntlich zu machen.
          </p>
          <p>
            Sollte ein bereits veröffentlichter Spendennachweis sensible Daten enthalten,
            kannst du über unsere <a href="/kontakt" className="text-primary hover:underline">Kontaktseite</a> eine
            Löschung beantragen.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">5. Hosting und Datenübermittlung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-2">
          <p>
            Die Website wird über <strong>Vercel Inc.</strong> (San Francisco, USA) gehostet.
            Die Datenbank wird bei <strong>Supabase Inc.</strong> betrieben, wobei der Datenbankserver
            in der <strong>EU (Irland)</strong> steht.
          </p>
          <p>
            Soweit Daten in die USA übermittelt werden (Vercel-Hosting), erfolgt dies auf Grundlage
            des EU-U.S. Data Privacy Framework bzw. der Standardvertragsklauseln gemäss Art. 46 DSGVO.
            Für die Schweiz gelten die Angemessenheitsbeschlüsse des EDÖB.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">6. Cookies</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          <p>
            Diese Website setzt <strong>keine Cookies</strong>. Es werden keine Tracking-Cookies,
            Analyse-Cookies oder Werbe-Cookies verwendet. Die Funktionalität zur Erkennung bereits
            abgeschlossener Kampagnen basiert ausschliesslich auf localStorage, welches nicht unter
            die Cookie-Richtlinie fällt.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">7. Deine Rechte</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-2">
          <p>
            Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung
            deiner Daten (DSGVO Art. 15–21; DSG Art. 25–32). Wende dich dazu an unser{' '}
            <a href="/kontakt" className="text-primary hover:underline">Kontaktformular</a>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">8. Änderungen dieser Datenschutzerklärung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den
            aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen
            umzusetzen. Für deinen erneuten Besuch gilt dann die neue Datenschutzerklärung.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Stand: März 2026
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
