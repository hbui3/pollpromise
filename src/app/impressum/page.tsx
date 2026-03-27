import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Impressum – PollPromise',
}

export default function ImpressumPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Impressum</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Angaben gemäss Schweizer Recht und &sect;5 DDG</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <div>
            <p className="font-medium">PollPromise</p>
            <p>Nicht-kommerzielles Open-Source-Projekt</p>
            <p>Hendrik Buisker</p>
            <p>Schweiz</p>
          </div>

          <div>
            <p className="font-medium">Kontakt</p>
            <p><a href="/kontakt" className="text-primary hover:underline">Kontaktformular</a></p>
          </div>

          <div className="text-xs text-muted-foreground border-t pt-3">
            <p>
              PollPromise ist ein privates, nicht-kommerzielles Open-Source-Projekt ohne
              Gewinnerzielungsabsicht. Es werden keine Einnahmen generiert und keine Spenden
              durch die Plattform abgewickelt. Die Angabe einer postalischen Anschrift
              entfällt gemäss Art. 5 Abs. 1 lit. c DSGVO (Datensparsamkeit) in Verbindung
              mit dem nicht-kommerziellen Charakter dieses Angebots.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Haftungsausschluss</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">Haftung für Inhalte</p>
            <p>
              Die Inhalte unserer Seiten wurden mit grösster Sorgfalt erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">Haftung für Links</p>
            <p>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
              Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
              Seiten verantwortlich.
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">Keine Spendenabwicklung</p>
            <p>
              PollPromise wickelt selbst keine Spenden oder Zahlungen ab. Die Plattform dient
              ausschliesslich der Organisation und Dokumentation von Spendenkampagnen. Spenden werden
              direkt durch die jeweiligen Kampagnen-Ersteller an die genannten Organisationen überwiesen.
              PollPromise übernimmt keine Haftung für die tatsächliche Durchführung von Spenden durch
              die Kampagnen-Ersteller.
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">Keine Garantie für Organisationsdaten</p>
            <p>
              Die auf PollPromise gelisteten Organisationen stammen teilweise aus der öffentlichen
              Datenbank von betterplace.org. Wir übernehmen keine Gewähr für die Richtigkeit,
              Vollständigkeit oder Aktualität dieser Daten. Kampagnen-Ersteller sind selbst dafür
              verantwortlich, die Angaben zur Spendenorganisation vor einer Überweisung zu prüfen.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Urheberrecht</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          <p>
            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
            Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung
            ausserhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen
            Autors bzw. Erstellers.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
