'use client'

import { useState, useRef, useCallback } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { ExternalLink, CheckCircle, Upload, Loader2, AlertCircle, ImageIcon, Camera, Copy } from 'lucide-react'

interface CampaignActionsProps {
  campaignId: string
  slug: string
  surveyUrl: string
  verificationMethod: string
}

export function CampaignActions({ campaignId, slug, surveyUrl, verificationMethod }: CampaignActionsProps) {
  const [showVerify, setShowVerify] = useState(false)

  // Code verification state
  const [code, setCode] = useState('')
  const [codeSubmitting, setCodeSubmitting] = useState(false)

  // Screenshot verification state
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [screenshotSubmitting, setScreenshotSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // URL verification state
  const [urlEntered, setUrlEntered] = useState('')
  const [urlSubmitting, setUrlSubmitting] = useState(false)

  // Result state
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const showCode = verificationMethod === 'code' || verificationMethod === 'both'
  const showScreenshot = verificationMethod === 'screenshot' || verificationMethod === 'both'
  const showUrl = verificationMethod === 'url'

  const needsScreenshot = showScreenshot

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

  const handleCodeSubmit = async () => {
    if (!code.trim()) return
    setCodeSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId, verification_type: 'code', code_entered: code.trim() }),
      })
      if (res.ok) { markCompleted(); setSuccess(true) }
      else { handleErrorResponse(await res.json()) }
    } catch { setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.') }
    finally { setCodeSubmitting(false) }
  }

  const handleFileChange = (file: File | null) => {
    if (!file) return
    setScreenshotFile(file)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => setScreenshotPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFileChange(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault() }, [])

  const handleScreenshotSubmit = async () => {
    if (!screenshotPreview) return
    setScreenshotSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId, verification_type: 'screenshot', screenshot_data: screenshotPreview }),
      })
      if (res.ok) { markCompleted(); setSuccess(true) }
      else { handleErrorResponse(await res.json()) }
    } catch { setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.') }
    finally { setScreenshotSubmitting(false) }
  }

  const handleUrlSubmit = async () => {
    if (!urlEntered.trim()) return
    setUrlSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId, verification_type: 'url', url_entered: urlEntered.trim() }),
      })
      if (res.ok) { markCompleted(); setSuccess(true) }
      else { handleErrorResponse(await res.json()) }
    } catch { setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.') }
    finally { setUrlSubmitting(false) }
  }

  // Success state
  if (success) {
    const pageUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : `/s/${slug}`
    return (
      <div className="space-y-4 pt-2">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center space-y-3">
          <div className="rounded-full bg-green-100 w-12 h-12 mx-auto flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-green-800">Vielen Dank für deine Teilnahme!</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p>Deine Teilnahme wurde erfasst. Sobald das Spendenziel erreicht ist, wird der Spendenbeleg hier veröffentlicht.</p>
          </div>
          <div className="rounded-lg border bg-white/50 p-2 space-y-1">
            <p className="text-xs text-muted-foreground">Speichere diesen Link, um den Status zu prüfen:</p>
            <div className="flex gap-2">
              <Input readOnly value={pageUrl} className="text-xs" />
              <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(pageUrl)} title="Link kopieren">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 pt-2">
      {/* Hint about screenshot before survey */}
      {needsScreenshot && !showVerify && (
        <div className="flex items-start gap-2 text-sm rounded-lg bg-amber-50 border border-amber-200 p-3">
          <Camera className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-amber-800">
            <span className="font-medium">Wichtig:</span> Mache am Ende der Umfrage einen Screenshot der Abschlussseite. Diesen brauchst du anschließend zur Verifizierung deiner Teilnahme.
          </p>
        </div>
      )}

      {/* Survey button */}
      <a href={surveyUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ size: "lg" }), "w-full text-base")}>
        Zur Umfrage
        <ExternalLink className="h-4 w-4 ml-2" />
      </a>

      {/* Toggle verification */}
      {!showVerify ? (
        <div className="text-center">
          <button
            onClick={() => setShowVerify(true)}
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Umfrage abgeschlossen? Hier verifizieren &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-4 pt-2 border-t">
          <h3 className="font-semibold text-base pt-2">Teilnahme verifizieren</h3>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Code verification */}
          {showCode && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="code">Abschlusscode</Label>
                <p className="text-sm text-muted-foreground">Gib den Code ein, den du am Ende der Umfrage erhalten hast.</p>
                <Input id="code" placeholder="Code eingeben..." value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleCodeSubmit() }} />
              </div>
              <Button onClick={handleCodeSubmit} disabled={!code.trim() || codeSubmitting} className="w-full">
                {codeSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Wird überprüft...</> : 'Code überprüfen'}
              </Button>
            </div>
          )}

          {/* Separator */}
          {showCode && showScreenshot && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">oder</span></div>
            </div>
          )}

          {/* Screenshot verification */}
          {showScreenshot && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Screenshot hochladen</Label>
                <p className="text-sm text-muted-foreground">Lade einen Screenshot deiner abgeschlossenen Umfrage hoch.</p>
              </div>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {screenshotPreview ? (
                  <div className="space-y-2">
                    <img src={screenshotPreview} alt="Screenshot Vorschau" className="max-h-48 mx-auto rounded-md object-contain" />
                    <p className="text-sm text-muted-foreground">{screenshotFile?.name}</p>
                    <p className="text-xs text-muted-foreground">Klicken zum Ersetzen</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Bild hierher ziehen oder klicken</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
              <Button onClick={handleScreenshotSubmit} disabled={!screenshotPreview || screenshotSubmitting} className="w-full">
                {screenshotSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Wird eingereicht...</> : <><Upload className="h-4 w-4" /> Screenshot einreichen</>}
              </Button>
            </div>
          )}

          {/* URL verification */}
          {showUrl && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="url">Umfrage-URL eingeben</Label>
                <p className="text-sm text-muted-foreground">Gib die URL der Umfrage ein, die du abgeschlossen hast.</p>
                <Input id="url" type="url" placeholder="https://..." value={urlEntered} onChange={(e) => setUrlEntered(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleUrlSubmit() }} />
              </div>
              <Button onClick={handleUrlSubmit} disabled={!urlEntered.trim() || urlSubmitting} className="w-full">
                {urlSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Wird überprüft...</> : 'URL überprüfen'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
