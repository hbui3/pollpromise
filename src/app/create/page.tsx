"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Copy,
  Check,
  Loader2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Search,
  X,
  Globe,
  Info,
} from "lucide-react"

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative inline-flex items-center group ml-1">
      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-md border bg-white text-gray-700 text-xs p-2.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-normal leading-relaxed">
        {text}
      </span>
    </span>
  )
}
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectOption } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn, sanitizeUrl } from "@/lib/utils"

interface SuccessData {
  adminUrl: string
  participantUrl: string
}

interface BetterplaceCharity {
  betterplace_id: number
  name: string
  description: string | null
  city: string | null
  country: string | null
  logo_url: string | null
  website_url: string | null
  betterplace_url: string | null
}

export default function CreateCampaignPage() {
  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [surveyUrl, setSurveyUrl] = useState("")
  const [estimatedMinutes, setEstimatedMinutes] = useState("")
  const [totalBudget, setTotalBudget] = useState("")
  const [perParticipation, setPerParticipation] = useState("1.00")
  const [verificationMethod, setVerificationMethod] = useState("code")
  const [completionCode, setCompletionCode] = useState("")
  const [verificationUrl, setVerificationUrl] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [isPublic, setIsPublic] = useState(false)

  // Charity picker state
  const [charitySource, setCharitySource] = useState<"custom" | "betterplace">("betterplace")
  const [charitySearchQuery, setCharitySearchQuery] = useState("")
  const [newCharityDescription, setNewCharityDescription] = useState("")
  const [newCharityWebsite, setNewCharityWebsite] = useState("")

  // Betterplace search state
  const [bpResults, setBpResults] = useState<BetterplaceCharity[]>([])
  const [bpLoading, setBpLoading] = useState(false)
  const [bpQuery, setBpQuery] = useState("")
  const [bpDropdownOpen, setBpDropdownOpen] = useState(false)
  const [selectedBpCharity, setSelectedBpCharity] = useState<BetterplaceCharity | null>(null)
  const bpSearchRef = useRef<HTMLDivElement>(null)
  const bpDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<SuccessData | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Whether the selected charity is from betterplace (allows public listing)
  const isExistingCharity = selectedBpCharity !== null

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bpSearchRef.current && !bpSearchRef.current.contains(e.target as Node)) {
        setBpDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Debounced betterplace search
  useEffect(() => {
    if (bpQuery.trim().length < 2) {
      setBpResults([])
      return
    }
    setBpLoading(true)
    if (bpDebounceRef.current) clearTimeout(bpDebounceRef.current)
    bpDebounceRef.current = setTimeout(() => {
      fetch(`/api/betterplace/search?q=${encodeURIComponent(bpQuery.trim())}&limit=15`)
        .then(r => r.json())
        .then((data: BetterplaceCharity[]) => {
          if (Array.isArray(data)) setBpResults(data)
        })
        .catch(() => {})
        .finally(() => setBpLoading(false))
    }, 300)
    return () => { if (bpDebounceRef.current) clearTimeout(bpDebounceRef.current) }
  }, [bpQuery])

  function selectBpCharity(bp: BetterplaceCharity) {
    setSelectedBpCharity(bp)
    setBpQuery("")
    setBpDropdownOpen(false)
    setNewCharityDescription("")
    setNewCharityWebsite("")
  }

  function clearCharity() {
    setSelectedBpCharity(null)
    setCharitySearchQuery("")
    setBpQuery("")
    setNewCharityDescription("")
    setNewCharityWebsite("")
  }

  // Normalize URL: add https:// if missing protocol
  function normalizeUrl(url: string): string {
    const trimmed = url.trim()
    if (!trimmed) return trimmed
    if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`
    return trimmed
  }

  function isValidUrl(url: string): boolean {
    try {
      new URL(normalizeUrl(url))
      return true
    } catch {
      return false
    }
  }

  // Determine the "effective" charity name for validation/submit
  const effectiveCharityName = selectedBpCharity?.name ?? (charitySource === "custom" ? charitySearchQuery.trim() : "")

  function validate(): boolean {
    const errors: Record<string, string> = {}

    if (!title.trim()) {
      errors.title = "Titel ist erforderlich."
    } else if (title.length > 200) {
      errors.title = "Titel darf maximal 200 Zeichen lang sein."
    }

    if (!surveyUrl.trim()) {
      errors.surveyUrl = "Umfrage-URL ist erforderlich."
    } else if (!isValidUrl(surveyUrl)) {
      errors.surveyUrl = "Bitte gib eine gültige URL ein."
    }

    const budgetNum = parseFloat(totalBudget)
    if (!totalBudget.trim() || isNaN(budgetNum)) {
      errors.totalBudget = "Spendenbudget ist erforderlich."
    } else if (budgetNum < 0) {
      errors.totalBudget = "Budget darf nicht negativ sein."
    }

    const perNum = parseFloat(perParticipation)
    if (!perParticipation.trim() || isNaN(perNum)) {
      errors.perParticipation = "Spende pro Teilnahme ist erforderlich."
    } else if (perNum < 0.01) {
      errors.perParticipation = "Mindestens 0,01 EUR pro Teilnahme."
    }

    if (
      (verificationMethod === "code" || verificationMethod === "both") &&
      !completionCode.trim()
    ) {
      errors.completionCode = "Abschluss-Code ist erforderlich bei dieser Verifizierungsmethode."
    }

    if (verificationMethod === "url") {
      if (!verificationUrl.trim()) {
        errors.verificationUrl = "Verifikations-URL ist erforderlich bei URL-Eingabe."
      } else if (!isValidUrl(verificationUrl)) {
        errors.verificationUrl = "Bitte eine gültige URL eingeben."
      }
    }

    if (!effectiveCharityName) {
      errors.charityName = "Bitte wähle eine Organisation aus oder lege eine neue an."
    }

    if (newCharityWebsite.trim() && !isValidUrl(newCharityWebsite)) {
      errors.charityWebsite = "Bitte eine gültige URL eingeben."
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        targetAudience: targetAudience.trim() || null,
        surveyUrl: normalizeUrl(surveyUrl),
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null,
        totalBudgetCents: Math.round(parseFloat(totalBudget) * 100),
        perParticipationCents: Math.round(parseFloat(perParticipation) * 100),
        verificationMethod,
        completionCode:
          verificationMethod === "code" || verificationMethod === "both"
            ? completionCode.trim()
            : null,
        verificationUrl:
          verificationMethod === "url" ? normalizeUrl(verificationUrl) : null,
        isPublic: isExistingCharity ? isPublic : false,
        fixedCharityName: effectiveCharityName || null,
        fixedCharityDescription:
          selectedBpCharity ? selectedBpCharity.description || null
          : newCharityDescription.trim() || null,
        fixedCharityWebsite:
          selectedBpCharity ? selectedBpCharity.website_url || null
          : newCharityWebsite.trim() ? normalizeUrl(newCharityWebsite) : null,
      }

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(
          data?.error || `Fehler beim Erstellen der Kampagne (${res.status})`
        )
      }

      const data = await res.json()
      setSuccess({
        adminUrl: data.adminUrl,
        participantUrl: data.participantUrl,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function copyToClipboard(text: string, field: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // Fallback: select the text in the input
    }
  }

  // Build full URLs with current domain
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const fullAdminUrl = success ? `${origin}${success.adminUrl}` : ''
  const fullParticipantUrl = success ? `${origin}${success.participantUrl}` : ''

  // Success view
  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-7 w-7 text-green-700" />
            </div>
            <CardTitle className="text-2xl">
              Kampagne erfolgreich erstellt!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Teile den Teilnehmer-Link mit deinen Studienteilnehmern und
              verwalte die Kampagne über den Admin-Link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Admin Link */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
                Admin-Link
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={fullAdminUrl}
                  className="bg-white font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(fullAdminUrl, "admin")}
                  title="Admin-Link kopieren"
                >
                  {copiedField === "admin" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Participant Link */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Badge className="text-xs">Teilnehmer</Badge>
                Teilnehmer-Link
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={fullParticipantUrl}
                  className="bg-white font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(fullParticipantUrl, "participant")
                  }
                  title="Teilnehmer-Link kopieren"
                >
                  {copiedField === "participant" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Warning */}
            <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">
                Bewahre den Admin-Link sicher auf -- er ist der einzige Zugang
                zum Dashboard. Ohne diesen Link kannst du die Kampagne nicht
                mehr verwalten.
              </p>
            </div>

            {/* Action */}
            <div className="pt-2">
              <Link href={success.adminUrl} className={cn(buttonVariants(), "w-full")}>
                  Zum Admin-Dashboard
                  <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Form view
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
      <div className="space-y-2 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Neue Kampagne erstellen
        </h1>
        <p className="text-muted-foreground text-lg">
          Erstelle eine Kampagne und motiviere Teilnehmer mit einer Spende an
          eine gemeinnützige Organisation.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titel */}
            <div className="space-y-2">
              <Label htmlFor="title" className="inline-flex items-center">
                Titel <span className="text-red-500 ml-0.5">*</span>
                <InfoTooltip text="Der Name deiner Kampagne – wird den Teilnehmern auf der Umfrageseite angezeigt." />
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="z.B. Studie zur Nutzung von KI im Alltag"
                required
              />
              <div className="flex justify-between">
                {fieldErrors.title && (
                  <p className="text-sm text-red-500">{fieldErrors.title}</p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {title.length}/200
                </p>
              </div>
            </div>

            {/* Beschreibung */}
            <div className="space-y-2">
              <Label htmlFor="description" className="inline-flex items-center">
                Beschreibung
                <InfoTooltip text="Kurze Erklärung, worum es in deiner Studie geht. Hilft Teilnehmern zu entscheiden, ob sie mitmachen wollen." />
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Worum geht es in der Studie?"
                rows={3}
              />
            </div>

            {/* Umfrage-URL */}
            <div className="space-y-2">
              <Label htmlFor="surveyUrl" className="inline-flex items-center">
                Umfrage-URL <span className="text-red-500 ml-0.5">*</span>
                <InfoTooltip text="Der direkte Link zu deiner Umfrage, z.B. bei SurveyMonkey, Google Forms oder LimeSurvey. Teilnehmer werden zu dieser URL weitergeleitet." />
              </Label>
              <Input
                id="surveyUrl"
                type="url"
                value={surveyUrl}
                onChange={(e) => setSurveyUrl(e.target.value)}
                placeholder="https://..."
                required
              />
              {fieldErrors.surveyUrl && (
                <p className="text-sm text-red-500">{fieldErrors.surveyUrl}</p>
              )}
            </div>

            {/* Geschätzte Dauer */}
            <div className="space-y-2">
              <Label htmlFor="estimatedMinutes" className="inline-flex items-center">
                Geschätzte Dauer in Minuten
                <InfoTooltip text="Gibt Teilnehmern eine Erwartung zur Bearbeitungszeit. Wird auf der Kampagnenseite angezeigt." />
              </Label>
              <Input
                id="estimatedMinutes"
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="z.B. 10"
                min={1}
              />
            </div>

            {/* Zielgruppe */}
            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="inline-flex items-center">
                Zielgruppe
                <InfoTooltip text="Beschreibe, wer an deiner Umfrage teilnehmen soll (z.B. 'Studierende', 'Eltern mit Kindern unter 10', 'Berufstätige im IT-Bereich'). Hilft den richtigen Teilnehmern, deine Kampagne zu finden." />
              </Label>
              <Input
                id="targetAudience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                maxLength={300}
                placeholder="z.B. Studierende, Eltern, Berufstätige im Gesundheitswesen…"
              />
              <p className="text-xs text-muted-foreground ml-auto">
                {targetAudience.length}/300
              </p>
            </div>

            {/* Budget fields side by side */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Spendenbudget gesamt */}
              <div className="space-y-2">
                <Label htmlFor="totalBudget" className="inline-flex items-center">
                  Spendenbudget gesamt (EUR){" "}
                  <span className="text-red-500 ml-0.5">*</span>
                  <InfoTooltip text="Der Gesamtbetrag, den du für Spenden bereitstellst. Wenn das Budget ausgeschöpft ist, werden keine weiteren Teilnahmen akzeptiert." />
                </Label>
                <Input
                  id="totalBudget"
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="z.B. 50.00"
                  step="0.01"
                  min={0}
                  required
                />
                {fieldErrors.totalBudget && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.totalBudget}
                  </p>
                )}
              </div>

              {/* Spende pro Teilnahme */}
              <div className="space-y-2">
                <Label htmlFor="perParticipation" className="inline-flex items-center">
                  Spende pro Teilnahme (EUR){" "}
                  <span className="text-red-500 ml-0.5">*</span>
                  <InfoTooltip text="Dieser Betrag wird pro verifizierter Teilnahme für die Spende freigeschaltet. Motiviert Teilnehmer, die Umfrage vollständig abzuschließen." />
                </Label>
                <Input
                  id="perParticipation"
                  type="number"
                  value={perParticipation}
                  onChange={(e) => setPerParticipation(e.target.value)}
                  step="0.01"
                  min={0.01}
                  required
                />
                {fieldErrors.perParticipation && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.perParticipation}
                  </p>
                )}
              </div>
            </div>

            {/* Max Teilnehmer Info */}
            {totalBudget && perParticipation && parseFloat(perParticipation) > 0 && (
              <div className="text-sm text-muted-foreground bg-green-50 rounded-lg px-4 py-3 border border-green-100">
                Maximale Teilnehmeranzahl:{" "}
                <span className="font-semibold text-foreground">
                  {Math.floor(
                    parseFloat(totalBudget) / parseFloat(perParticipation)
                  )}
                </span>{" "}
                Teilnahmen
              </div>
            )}

            {/* Verifizierungsmethode */}
            <div className="space-y-2">
              <Label htmlFor="verificationMethod" className="inline-flex items-center">
                Verifizierungsmethode
                <InfoTooltip text="Abschluss-Code: Teilnehmer tippen einen geheimen Code ein. Screenshot: Teilnehmer laden ein Bild hoch (manuelle Prüfung). URL-Eingabe: Teilnehmer tippen die Umfrage-URL ein." />
              </Label>
              <Select
                id="verificationMethod"
                value={verificationMethod}
                onChange={(e) => setVerificationMethod(e.target.value)}
              >
                <SelectOption value="code">Abschluss-Code</SelectOption>
                <SelectOption value="screenshot">Screenshot-Upload</SelectOption>
                <SelectOption value="both">Code + Screenshot</SelectOption>
                <SelectOption value="url">URL-Eingabe</SelectOption>
              </Select>
            </div>

            {/* Verification URL (conditional) */}
            {verificationMethod === "url" && (
              <div className="space-y-2">
                <Label htmlFor="verificationUrl" className="inline-flex items-center">
                  Verifikations-URL <span className="text-red-500 ml-0.5">*</span>
                  <InfoTooltip text="Gib die URL ein, die Teilnehmer nach Abschluss der Umfrage eingeben müssen. Kann z.B. die Abschlussseite oder eine bestimmte Dankeseite sein." />
                </Label>
                <Input
                  id="verificationUrl"
                  value={verificationUrl}
                  onChange={(e) => setVerificationUrl(e.target.value)}
                  placeholder="z.B. umfrage-tool.de/danke"
                />
                <p className="text-xs text-muted-foreground">
                  Teilnehmer müssen diese URL eingeben, um ihre Teilnahme zu verifizieren.
                </p>
                {fieldErrors.verificationUrl && (
                  <p className="text-sm text-red-500">{fieldErrors.verificationUrl}</p>
                )}
              </div>
            )}

            {/* Abschluss-Code (conditional) */}
            {(verificationMethod === "code" ||
              verificationMethod === "both") && (
              <div className="space-y-2">
                <Label htmlFor="completionCode" className="inline-flex items-center">
                  Abschluss-Code <span className="text-red-500 ml-0.5">*</span>
                  <InfoTooltip text="Ein geheimer Code, den du ans Ende deiner Umfrage schreibst (z.B. als letzte Frage oder Abschlussseite). Nur Teilnehmer die wirklich bis zum Ende kommen, sehen ihn." />
                </Label>
                <Input
                  id="completionCode"
                  value={completionCode}
                  onChange={(e) => setCompletionCode(e.target.value)}
                  placeholder="z.B. DANKE2024"
                />
                <p className="text-xs text-muted-foreground">
                  Dieser Code wird am Ende der Umfrage angezeigt und muss von
                  Teilnehmern eingegeben werden.
                </p>
                {fieldErrors.completionCode && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.completionCode}
                  </p>
                )}
              </div>
            )}

            {/* Spendenorganisation */}
            <div className="space-y-2">
              <Label className="inline-flex items-center">
                Spendenorganisation *
                <InfoTooltip text="Wähle eine bestehende Organisation aus der Liste, um die Kampagne öffentlich machen zu können. Du kannst auch eine eigene Organisation angeben — diese bleibt dann privat." />
              </Label>
            </div>

            <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
              {/* Source tabs */}
              <div className="flex gap-1 rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => { setCharitySource("betterplace"); clearCharity() }}
                  className={cn(
                    "flex-1 text-sm font-medium rounded-md px-3 py-1.5 transition-colors",
                    charitySource === "betterplace"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Organisation suchen
                </button>
                <button
                  type="button"
                  onClick={() => { setCharitySource("custom"); clearCharity(); setIsPublic(false) }}
                  className={cn(
                    "flex-1 text-sm font-medium rounded-md px-3 py-1.5 transition-colors",
                    charitySource === "custom"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Eigene Organisation
                </button>
              </div>

              {/* Selected charity card (shared for both sources) */}
              {selectedBpCharity ? (
                <div className="rounded-lg border bg-background p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {selectedBpCharity.logo_url && (
                        <img
                          src={selectedBpCharity.logo_url}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover shrink-0 bg-gray-100"
                        />
                      )}
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="font-semibold">{selectedBpCharity.name}</p>
                        {selectedBpCharity.description && (
                          <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
                            {selectedBpCharity.description}
                          </p>
                        )}
                        {selectedBpCharity.website_url && (
                          <a
                            href={sanitizeUrl(selectedBpCharity.website_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Globe className="h-3 w-3" />
                            {selectedBpCharity.website_url}
                          </a>
                        )}
                        {selectedBpCharity.city && (
                          <p className="text-xs text-muted-foreground">{selectedBpCharity.city}{selectedBpCharity.country ? `, ${selectedBpCharity.country}` : ''}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearCharity}
                      className="text-muted-foreground hover:text-foreground shrink-0 p-1 rounded"
                      title="Auswahl aufheben"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : charitySource === "betterplace" ? (
                /* Betterplace search */
                <div ref={bpSearchRef} className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      value={bpQuery}
                      onChange={(e) => {
                        setBpQuery(e.target.value)
                        setBpDropdownOpen(true)
                      }}
                      onFocus={() => bpQuery.trim().length >= 2 && setBpDropdownOpen(true)}
                      placeholder="Organisation suchen (z.B. UNICEF, Caritas, WWF)…"
                      className="pl-9"
                    />
                    {bpLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {bpDropdownOpen && bpQuery.trim().length >= 2 && (
                    <div className="absolute z-50 w-full mt-1 rounded-lg border bg-background shadow-lg max-h-64 overflow-y-auto">
                      {bpLoading && bpResults.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Suche bei betterplace.org…
                        </div>
                      ) : bpResults.length > 0 ? (
                        bpResults.map((bp) => (
                          <button
                            key={bp.betterplace_id}
                            type="button"
                            className="w-full text-left px-4 py-3 bg-white hover:bg-gray-100 transition-colors border-b last:border-b-0 flex items-center gap-3"
                            onMouseDown={() => selectBpCharity(bp)}
                          >
                            {bp.logo_url ? (
                              <img src={bp.logo_url} alt="" className="h-8 w-8 rounded object-cover shrink-0 bg-gray-100" />
                            ) : (
                              <div className="h-8 w-8 rounded bg-gray-100 shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{bp.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {[bp.city, bp.country].filter(Boolean).join(', ')}
                                {bp.description && ` · ${bp.description.substring(0, 80)}`}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-muted-foreground">
                          Keine Treffer für &quot;{bpQuery}&quot;.
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Durchsuche über 55.000 Organisationen von betterplace.org
                  </p>
                </div>
              ) : (
                /* Custom organisation — free text, stored only in campaign */
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="customCharityName">Name der Organisation *</Label>
                    <Input
                      id="customCharityName"
                      value={charitySearchQuery}
                      onChange={(e) => setCharitySearchQuery(e.target.value)}
                      placeholder="z.B. Lokaler Tierschutzverein e.V."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newCharityDescription">Kurzbeschreibung</Label>
                    <Textarea
                      id="newCharityDescription"
                      value={newCharityDescription}
                      onChange={(e) => setNewCharityDescription(e.target.value)}
                      placeholder="Was macht diese Organisation? (optional)"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newCharityWebsite">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="newCharityWebsite"
                        type="url"
                        value={newCharityWebsite}
                        onChange={(e) => setNewCharityWebsite(e.target.value)}
                        placeholder="https://..."
                        className="pl-9"
                      />
                    </div>
                    {fieldErrors.charityWebsite && (
                      <p className="text-sm text-red-500">{fieldErrors.charityWebsite}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Die Organisation wird nur in dieser Kampagne gespeichert. Der Spendenbetrag
                    wird in der Gesamtstatistik unter &quot;Eigene Organisationen&quot; gezählt.
                  </p>
                </div>
              )}

              {fieldErrors.charityName && (
                <p className="text-sm text-red-500">{fieldErrors.charityName}</p>
              )}
            </div>

            {/* Public visibility — only for betterplace charities */}
            {charitySource === "betterplace" && (
              <div className={cn(
                "flex items-start gap-3 rounded-lg border p-4",
                isExistingCharity ? "bg-muted/30" : "bg-muted/10 opacity-60"
              )}>
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic && isExistingCharity}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  disabled={!isExistingCharity}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-green-600"
                />
                <div className="space-y-1">
                  <Label htmlFor="isPublic" className={cn("cursor-pointer", !isExistingCharity && "cursor-not-allowed")}>
                    Kampagne öffentlich auf der Kampagnenseite anzeigen
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isExistingCharity
                      ? "Wenn aktiviert, wird deine Kampagne öffentlich gelistet, sodass weitere Personen teilnehmen können."
                      : "Wähle zuerst eine Organisation aus der Suche aus."
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-900">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                <>
                  Kampagne erstellen
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
