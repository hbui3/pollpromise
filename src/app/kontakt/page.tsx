'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Send,
  Mail,
} from 'lucide-react'

type Category = 'general' | 'bug'

const categories: { value: Category; label: string; icon: React.ElementType; description: string }[] = [
  {
    value: 'general',
    label: 'Allgemeine Anfrage',
    icon: MessageSquare,
    description: 'Fragen, Anregungen, Feedback oder sonstige Anliegen.',
  },
  {
    value: 'bug',
    label: 'Fehler melden',
    icon: AlertTriangle,
    description: 'Du hast einen technischen Fehler auf der Website gefunden.',
  },
]

export default function KontaktPage() {
  const [category, setCategory] = useState<Category>('general')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const selectedCategory = categories.find((c) => c.value === category)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Build mailto link as simple solution (no backend needed)
    const categoryLabel = selectedCategory?.label || 'Allgemein'
    const fullSubject = `[PollPromise] ${categoryLabel}: ${subject}`
    const body = [
      `Kategorie: ${categoryLabel}`,
      email ? `Antwort an: ${email}` : '',
      '',
      message,
    ]
      .filter(Boolean)
      .join('\n')

    window.location.href = `mailto:kontakt@pollpromise.com?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(body)}`
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8 sm:py-12 min-h-[60vh] flex items-center justify-center">
        <Card className="w-full">
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
          Hilf uns, PollPromise besser zu machen – oder melde einen Fehler.
        </p>
      </div>

      {/* Contact form */}
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
                <Label htmlFor="category">Kategorie</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

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

    </div>
  )
}
