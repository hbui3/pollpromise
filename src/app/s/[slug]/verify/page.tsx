'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { CheckCircle, Upload, Loader2, AlertCircle, ImageIcon, Copy } from 'lucide-react'

interface Campaign {
  id: string
  title: string
  slug: string
  verification_method: string
}

export default function VerifyPage() {
  const params = useParams()
  const slug = params.slug as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)

  // Code verification state
  const [code, setCode] = useState('')
  const [codeSubmitting, setCodeSubmitting] = useState(false)

  // URL verification state
  const [urlEntered, setUrlEntered] = useState('')
  const [urlSubmitting, setUrlSubmitting] = useState(false)

  // Screenshot verification state
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [screenshotSubmitting, setScreenshotSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Result state
  const [success, setSuccess] = useState(false)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check localStorage for previous completion
  useEffect(() => {
    try {
      const completed = JSON.parse(localStorage.getItem('pp_completed') || '[]')
      if (Array.isArray(completed) && completed.includes(slug)) {
        setAlreadyCompleted(true)
      }
    } catch {
      // ignore
    }
  }, [slug])

  // Mark campaign as completed in localStorage
  function markCompleted() {
    try {
      const completed = JSON.parse(localStorage.getItem('pp_completed') || '[]')
      if (Array.isArray(completed) && !completed.includes(slug)) {
        completed.push(slug)
        localStorage.setItem('pp_completed', JSON.stringify(completed))
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const res = await fetch(`/api/campaigns?slug=${slug}`)
        if (res.ok) {
          const data = await res.json()
          setCampaign(data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchCampaign()
  }, [slug])

  const showCode = campaign?.verification_method === 'code' || campaign?.verification_method === 'both'
  const showScreenshot = campaign?.verification_method === 'screenshot' || campaign?.verification_method === 'both'
  const showUrl = campaign?.verification_method === 'url'

  const handleCodeSubmit = async () => {
    if (!campaign || !code.trim()) return
    setCodeSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          verification_type: 'code',
          code_entered: code.trim(),
        }),
      })

      if (res.ok) {
        markCompleted()
        setSuccess(true)
      } else {
        const data = await res.json()
        handleErrorResponse(data)
      }
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    } finally {
      setCodeSubmitting(false)
    }
  }

  const handleFileChange = (file: File | null) => {
    if (!file) return
    setScreenshotFile(file)
    setError(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      setScreenshotPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleScreenshotSubmit = async () => {
    if (!campaign || !screenshotPreview) return
    setScreenshotSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          verification_type: 'screenshot',
          screenshot_data: screenshotPreview,
        }),
      })

      if (res.ok) {
        markCompleted()
        setSuccess(true)
      } else {
        const data = await res.json()
        handleErrorResponse(data)
      }
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    } finally {
      setScreenshotSubmitting(false)
    }
  }

  const handleUrlSubmit = async () => {
    if (!campaign || !urlEntered.trim()) return
    setUrlSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          verification_type: 'url',
          url_entered: urlEntered.trim(),
        }),
      })

      if (res.ok) {
        markCompleted()
        setSuccess(true)
      } else {
        const data = await res.json()
        handleErrorResponse(data)
      }
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    } finally {
      setUrlSubmitting(false)
    }
  }

  const handleErrorResponse = (data: { error?: string }) => {
    const msg = data.error ?? ''
    if (msg.includes('duplicate') || msg.includes('already')) {
      setError('Du hast bereits an dieser Kampagne teilgenommen.')
    } else if (msg === 'wrong_url' || msg.includes('url')) {
      setError('Die eingegebene URL stimmt nicht mit der Umfrage-URL überein.')
    } else if (msg.includes('code') || msg.includes('wrong') || msg.includes('invalid')) {
      setError('Der eingegebene Code ist leider falsch.')
    } else if (msg.includes('budget') || msg.includes('exhausted')) {
      setError('Das Budget dieser Kampagne ist leider erschöpft.')
    } else {
      setError(msg || 'Ein Fehler ist aufgetreten.')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (alreadyCompleted && !success) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <h2 className="text-xl font-bold">Bereits teilgenommen</h2>
            <p className="text-muted-foreground">
              Du hast bereits an dieser Kampagne teilgenommen. Vielen Dank für deine Unterstützung!
            </p>
            <Link
              href={`/s/${slug}`}
              className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}
            >
              Zur Kampagnenseite
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">Kampagne nicht gefunden.</p>
      </div>
    )
  }

  // Success state
  if (success) {
    const pageUrl = typeof window !== 'undefined' ? window.location.origin + `/s/${slug}` : `/s/${slug}`

    return (
      <div className="container mx-auto max-w-lg px-4 py-16">
        <Card>
          <CardContent className="pt-6 text-center space-y-5">
            <div className="rounded-full bg-green-100 dark:bg-green-950 w-16 h-16 mx-auto flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">
              Vielen Dank für deine Teilnahme!
            </h2>
            <div className="text-muted-foreground space-y-2 text-sm leading-relaxed">
              <p>
                Mit deiner Teilnahme verpflichtet sich der Ersteller dieser Umfrage zu einer Spende.
                Sobald das Spendenziel erreicht ist, wird der Ersteller benachrichtigt und aufgefordert,
                einen Spendenbeleg einzureichen.
              </p>
              <p>
                Der Beleg wird dann auf der Kampagnenseite veröffentlicht, damit du die Spende nachverfolgen kannst.
              </p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <p className="text-xs text-muted-foreground">Speichere diesen Link, um den Status später zu prüfen:</p>
              <div className="flex gap-2">
                <Input readOnly value={pageUrl} className="text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(pageUrl)}
                  title="Link kopieren"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Link href={`/s/${slug}`} className={cn(buttonVariants(), "w-full")}>
              Zur Kampagnenseite
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Teilnahme verifizieren</CardTitle>
          <p className="text-sm text-muted-foreground">{campaign.title}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Code verification */}
          {showCode && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Abschlusscode</Label>
                <p className="text-sm text-muted-foreground">
                  Gib den Code ein, den du am Ende der Umfrage erhalten hast.
                </p>
                <Input
                  id="code"
                  placeholder="Code eingeben..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCodeSubmit()
                  }}
                />
              </div>
              <Button
                onClick={handleCodeSubmit}
                disabled={!code.trim() || codeSubmitting}
                className="w-full"
              >
                {codeSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Wird überprüft...
                  </>
                ) : (
                  'Code überprüfen'
                )}
              </Button>
            </div>
          )}

          {/* URL verification */}
          {showUrl && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Umfrage-URL eingeben</Label>
                <p className="text-sm text-muted-foreground">
                  Gib die URL der Umfrage ein, die du abgeschlossen hast.
                </p>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://..."
                  value={urlEntered}
                  onChange={(e) => setUrlEntered(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUrlSubmit() }}
                />
              </div>
              <Button
                onClick={handleUrlSubmit}
                disabled={!urlEntered.trim() || urlSubmitting}
                className="w-full"
              >
                {urlSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Wird überprüft...
                  </>
                ) : (
                  'URL überprüfen'
                )}
              </Button>
            </div>
          )}

          {/* Separator if both methods */}
          {showCode && showScreenshot && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">oder</span>
              </div>
            </div>
          )}

          {/* Screenshot verification */}
          {showScreenshot && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Screenshot hochladen</Label>
                <p className="text-sm text-muted-foreground">
                  Lade einen Screenshot deiner abgeschlossenen Umfrage hoch.
                </p>
              </div>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {screenshotPreview ? (
                  <div className="space-y-3">
                    <img
                      src={screenshotPreview}
                      alt="Screenshot Vorschau"
                      className="max-h-48 mx-auto rounded-md object-contain"
                    />
                    <p className="text-sm text-muted-foreground">
                      {screenshotFile?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Klicken zum Ersetzen
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Bild hierher ziehen oder klicken zum Auswählen
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />

              <Button
                onClick={handleScreenshotSubmit}
                disabled={!screenshotPreview || screenshotSubmitting}
                className="w-full"
              >
                {screenshotSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Wird eingereicht...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Screenshot einreichen
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
