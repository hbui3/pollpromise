'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  MessageSquare,
  Building2,
  Trash2,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  Send,
  Mail,
} from 'lucide-react'

type Category = 'general' | 'charity_update' | 'charity_new' | 'proof_delete' | 'bug' | 'other'

const categories: { value: Category; label: string; icon: React.ElementType; description: string }[] = [
  {
    value: 'charity_update',
    label: 'Organisationsdaten aktualisieren',
    icon: Building2,
    description: 'Eine Spendenorganisation hat falsche oder veraltete Daten (Name, Website, etc.).',
  },
  {
    value: 'charity_new',
    label: 'Neue Organisation vorschlagen',
    icon: PlusCircle,
    description: 'Du möchtest eine neue gemeinnützige Organisation zur Auswahl hinzufügen.',
  },
  {
    value: 'proof_delete',
    label: 'Spendennachweis löschen',
    icon: Trash2,
    description: 'Ein Spendennachweis enthält sensible oder persönliche Daten, die entfernt werden müssen.',
  },
  {
    value: 'bug',
    label: 'Fehler melden',
    icon: AlertTriangle,
    description: 'Du hast einen technischen Fehler auf der Website gefunden.',
  },
  {
    value: 'general',
    label: 'Allgemeine Anfrage',
    icon: MessageSquare,
    description: 'Sonstige Fragen, Anregungen oder Feedback.',
  },
]

export default function KontaktPage() {
  const [category, setCategory] = useState<Category | ''>('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [campaignUrl, setCampaignUrl] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const selectedCategory = categories.find((c) => c.value === category)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Build mailto link as simple solution (no backend needed)
    const categoryLabel = selectedCategory?.label || 'Allgemein'
    const fullSubject = `[PollPromise] ${categoryLabel}: ${subject}`
    const body = [
      `Kategorie: ${categoryLabel}`,
      campaignUrl ? `Kampagnen-URL: ${campaignUrl}` : '',
      email ? `Antwort an: ${email}` : '',
      '',
      message,
    ]
      .filter(Boolean)
      .join('\n')

    window.location.href = `mailto:kontakt@pollpromise.de?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(body)}`
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="rounded-full bg-green-100 dark:bg-green-950 w-16 h-16 mx-auto flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">Dein E-Mail-Programm wurde geöffnet</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Bitte sende die vorausgefüllte E-Mail ab. Wir melden uns so schnell wie möglich bei dir.
            </p>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Neues Anliegen
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 sm:py-12 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Kontakt & Feedback</h1>
        <p className="text-muted-foreground mt-2">
          Hilf uns, PollPromise besser zu machen. Melde veraltete Daten, schlage neue
          Organisationen vor oder berichte Probleme.
        </p>
      </div>

      {/* Category quick-select cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isSelected = category === cat.value
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/30 hover:bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 shrink-0 ${isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{cat.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Specific hints per category */}
      {category === 'proof_delete' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Löschung von Spendennachweisen:</strong> Wenn ein veröffentlichter Spendennachweis
            sensible Daten wie IBAN, Kontonummern oder persönliche Informationen enthält, haben wir die
            Pflicht, diesen umgehend zu entfernen. Bitte gib die betroffene Kampagnen-URL an.
          </AlertDescription>
        </Alert>
      )}

      {category === 'charity_new' && (
        <Alert>
          <PlusCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Neue Organisation:</strong> Bitte nenne den Namen, eine kurze Beschreibung
            und die offizielle Website der Organisation. Wir prüfen den Vorschlag und fügen
            die Organisation ggf. zur Auswahl hinzu.
          </AlertDescription>
        </Alert>
      )}

      {/* Contact form */}
      {category && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Nachricht senden
            </CardTitle>
            <CardDescription>
              Deine Nachricht wird als E-Mail über dein E-Mail-Programm gesendet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Deine E-Mail-Adresse (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="fuer@rueckfragen.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {(category === 'proof_delete' || category === 'charity_update') && (
                <div className="space-y-2">
                  <Label htmlFor="campaignUrl">Betroffene Kampagnen-/Organisationsseite</Label>
                  <Input
                    id="campaignUrl"
                    placeholder="https://pollpromise.de/s/..."
                    value={campaignUrl}
                    onChange={(e) => setCampaignUrl(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="subject">Betreff</Label>
                <Input
                  id="subject"
                  placeholder="Kurze Beschreibung deines Anliegens"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Nachricht</Label>
                <Textarea
                  id="message"
                  placeholder="Beschreibe dein Anliegen so genau wie möglich..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4" />
                E-Mail öffnen & senden
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Direct email fallback */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Du kannst uns auch direkt per E-Mail erreichen:{' '}
          <a href="mailto:kontakt@pollpromise.de" className="text-primary hover:underline font-medium">
            kontakt@pollpromise.de
          </a>
        </p>
      </div>
    </div>
  )
}
