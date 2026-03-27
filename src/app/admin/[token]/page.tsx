'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { sanitizeUrl } from '@/lib/utils'
import {
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Users,
  Euro,
  Image as ImageIcon,
  ShieldCheck,
  XCircle,
  CalendarDays,
  Link2,
  Share2,
  Heart,
  Upload,
  Loader2,
  UserCheck,
  Trash2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Campaign {
  id: string
  admin_token: string
  slug: string
  title: string
  description: string
  target_audience: string | null
  survey_url: string
  estimated_minutes: number
  budget_cents: number
  donation_per_completion_cents: number
  verification_method: string
  completion_code: string | null
  locked_charity_id: string | null
  status: string
  donation_confirmed: boolean
  donation_proof_url: string | null
  created_at: string
  expires_at: string | null
  stats: {
    completions_verified: number
    completions_pending: number
    completions_rejected: number
    total_completions: number
  }
}

interface Completion {
  id: string
  campaign_id: string
  ip_hash: string
  verification_type: string
  screenshot_url: string | null
  code_entered: string | null
  status: string
  created_at: string
}

interface Charity {
  id: string
  name: string
  description: string | null
  website_url: string | null
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function centsToEur(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function verificationLabel(method: string): string {
  switch (method) {
    case 'code': return 'Abschluss-Code'
    case 'screenshot': return 'Screenshot'
    case 'url': return 'URL-Eingabe'
    case 'both': return 'Code oder Screenshot'
    default: return method
  }
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  extra,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  extra?: React.ReactNode
}) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    blue: 'bg-blue-50 text-blue-700',
  }
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
          <div className={`rounded-lg p-1.5 sm:p-2 shrink-0 ${colorMap[color] ?? 'bg-gray-50 text-gray-700'}`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight truncate">{label}</p>
            <p className="text-lg sm:text-2xl font-bold">{value}</p>
          </div>
        </div>
        {extra}
      </CardContent>
    </Card>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'verified':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Verifiziert
        </Badge>
      )
    case 'pending':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" /> Ausstehend
        </Badge>
      )
    case 'rejected':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="h-3 w-3 mr-1" /> Abgelehnt
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function CampaignStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Aktiv</Badge>
    case 'completed':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Abgeschlossen</Badge>
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800 border-red-200">Abgebrochen</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const params = useParams()
  const token = params.token as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [completions, setCompletions] = useState<Completion[]>([])
  const [charity, setCharity] = useState<Charity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all')
  const [copied, setCopied] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Screenshot lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Donation confirmation dialog
  const [showDonationDialog, setShowDonationDialog] = useState(false)
  const [donationProofFile, setDonationProofFile] = useState<File | null>(null)
  const [donationProofPreview, setDonationProofPreview] = useState<string | null>(null)
  const [uploadingProof, setUploadingProof] = useState(false)
  const proofFileInputRef = useRef<HTMLInputElement>(null)

  // ─ Fetch campaign ─
  const fetchCampaign = useCallback(async () => {
    try {
      const res = await fetch(`/api/campaigns?admin_token=${encodeURIComponent(token)}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Kampagne nicht gefunden')
        } else {
          setError('Fehler beim Laden der Kampagne')
        }
        return null
      }
      const data: Campaign = await res.json()
      setCampaign(data)
      return data
    } catch {
      setError('Netzwerkfehler')
      return null
    }
  }, [token])

  // ─ Fetch completions ─
  const fetchCompletions = useCallback(
    async (campaignId: string) => {
      try {
        const res = await fetch(
          `/api/completions?campaign_id=${campaignId}&admin_token=${encodeURIComponent(token)}`
        )
        if (res.ok) {
          const data: Completion[] = await res.json()
          setCompletions(data)
        }
      } catch {
        // silent
      }
    },
    [token]
  )

  // ─ Fetch charity info ─
  const fetchCharity = useCallback(async (charityId: string) => {
    try {
      const res = await fetch(`/api/charities?id=${charityId}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setCharity(data[0])
        } else if (data && !Array.isArray(data)) {
          setCharity(data)
        }
      }
    } catch {
      // silent
    }
  }, [])

  // ─ Initial load ─
  useEffect(() => {
    async function load() {
      setLoading(true)
      const c = await fetchCampaign()
      if (c) {
        const promises: Promise<void>[] = [fetchCompletions(c.id)]
        if (c.locked_charity_id) {
          promises.push(fetchCharity(c.locked_charity_id))
        }
        await Promise.all(promises)
      }
      setLoading(false)
    }
    load()
  }, [fetchCampaign, fetchCompletions, fetchCharity])

  // ─ Actions ─

  async function handleEndCampaign() {
    if (!campaign) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_token: token, status: 'completed' }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCampaign((prev) => (prev ? { ...prev, ...updated } : prev))
      }
    } catch {
      // silent
    }
    setActionLoading(false)
  }

  function handleProofFileChange(file: File | null) {
    if (!file) return
    setDonationProofFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setDonationProofPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleConfirmDonation() {
    if (!campaign) return
    setUploadingProof(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_token: token,
          donation_confirmed: true,
          donation_proof_url: donationProofPreview || null,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCampaign((prev) => (prev ? { ...prev, ...updated } : prev))
        setShowDonationDialog(false)
        setDonationProofFile(null)
        setDonationProofPreview(null)
      }
    } catch {
      // silent
    }
    setUploadingProof(false)
  }

  async function handleReview(completionId: string, newStatus: 'verified' | 'rejected') {
    if (!campaign) return
    try {
      const res = await fetch('/api/completions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completion_id: completionId,
          status: newStatus,
          admin_token: token,
        }),
      })
      if (res.ok) {
        await Promise.all([fetchCompletions(campaign.id), fetchCampaign()])
      }
    } catch {
      // silent
    }
  }

  async function handleDeleteCampaign() {
    if (!campaign) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_token: token }),
      })
      if (res.ok) {
        window.location.href = '/kampagnen'
      }
    } catch {
      // silent
    }
    setActionLoading(false)
  }

  function handleCopyLink() {
    if (!campaign) return
    const url = `${window.location.origin}/s/${campaign.slug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ─── Loading Skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-40" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  // ─── Error ──────────────────────────────────────────────────────────────────

  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{error ?? 'Kampagne nicht gefunden'}</h1>
        <p className="text-muted-foreground">
          Bitte überprüfe den Link oder versuche es später erneut.
        </p>
      </div>
    )
  }

  // ─── Derived values ─────────────────────────────────────────────────────────

  const { stats } = campaign
  const spentCents = stats.completions_verified * campaign.donation_per_completion_cents
  const budgetPercent =
    campaign.budget_cents > 0 ? Math.min(100, (spentCents / campaign.budget_cents) * 100) : 0
  const remainingCents = Math.max(0, campaign.budget_cents - spentCents)

  const filteredCompletions = completions.filter((c) => {
    if (filter === 'pending') return c.status === 'pending'
    if (filter === 'verified') return c.status === 'verified'
    return true
  })

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{campaign.title}</h1>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="text-muted-foreground/50 hover:text-destructive transition-colors shrink-0"
              title="Kampagne löschen"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">Admin-Dashboard</p>
        </div>
        <CampaignStatusBadge status={campaign.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Left Column ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard
              label="Verifiziert"
              value={stats.completions_verified}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              label="Ausstehend"
              value={stats.completions_pending}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              label="Budget"
              value={`${Math.round(budgetPercent)}%`}
              icon={Euro}
              color="blue"
              extra={<Progress value={budgetPercent} className="mt-2" />}
            />
          </div>

          {/* Budget Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Budget-Übersicht</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gesamtbudget</span>
                <span className="font-medium">{centsToEur(campaign.budget_cents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fälliger Spendenbetrag</span>
                <span className="font-medium">{centsToEur(spentCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verbleibend</span>
                <span className="font-medium">{centsToEur(remainingCents)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Pro Teilnahme</span>
                <span className="font-medium">
                  {centsToEur(campaign.donation_per_completion_cents)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Charity Info */}
          {charity && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Spendenorganisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{charity.name}</p>
                {charity.description && (
                  <p className="text-muted-foreground text-xs leading-relaxed">{charity.description}</p>
                )}
                {charity.website_url && (
                  <a
                    href={sanitizeUrl(charity.website_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
                  >
                    {charity.website_url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Campaign Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Kampagnen-Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {campaign.description && (
                <p className="text-muted-foreground">{campaign.description}</p>
              )}
              {campaign.target_audience && (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Zielgruppe: {campaign.target_audience}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <a
                  href={sanitizeUrl(campaign.survey_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                >
                  {campaign.survey_url}
                </a>
                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Verifizierung: {verificationLabel(campaign.verification_method)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Erstellt: {formatDate(campaign.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Share */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Share2 className="h-4 w-4" /> Teilen
              </CardTitle>
              <CardDescription>Teilnehmer-Link</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/s/${campaign.slug}`
                      : `/s/${campaign.slug}`
                  }
                  className="text-sm"
                />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-1">Link kopiert!</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {campaign.donation_confirmed && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-green-800">Spende bestätigt! Vielen Dank!</p>
                    {campaign.donation_proof_url && (
                      <div>
                        <button type="button" onClick={() => setLightboxUrl(campaign.donation_proof_url!)} className="block">
                          <img
                            src={campaign.donation_proof_url}
                            alt="Spendennachweis"
                            className="mt-2 max-h-48 rounded-md object-contain hover:opacity-90 transition-opacity cursor-pointer"
                          />
                        </button>
                      </div>
                    )}
                    {charity?.website_url && (
                      <a
                        href={sanitizeUrl(charity.website_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-700 hover:underline inline-flex items-center gap-1"
                      >
                        {charity.name} besuchen
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {!campaign.donation_confirmed && campaign.status === 'active' && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleEndCampaign}
                  disabled={actionLoading}
                >
                  Kampagne beenden
                </Button>
              )}

              {!campaign.donation_confirmed && campaign.status === 'completed' && (
                <div className="space-y-3">
                  {charity && (
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Spendenorganisation</span>
                      </div>
                      <p className="text-blue-900 font-semibold">{charity.name}</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Spendenbetrag: {centsToEur(spentCents)}
                      </p>
                      {charity.website_url && (
                        <a
                          href={sanitizeUrl(charity.website_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-700 hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          Website besuchen
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => setShowDonationDialog(true)}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="h-4 w-4" /> Spende bestätigen
                  </Button>
                </div>
              )}

              {campaign.status === 'active' && !campaign.donation_confirmed && (
                <p className="text-xs text-muted-foreground">
                  Beende die Kampagne, wenn alle Teilnahmen eingegangen sind. Danach kannst du
                  die Spende bestätigen.
                </p>
              )}

            </CardContent>
          </Card>
        </div>

        {/* ─── Right Column ────────────────────────────────────────────────── */}
        <div>
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" /> Einreichungen ({completions.length})
          </h3>
          <div className="flex gap-2 mb-4 flex-wrap">
            {(['all', 'pending', 'verified'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Alle' : f === 'pending' ? 'Ausstehend' : 'Verifiziert'}
              </Button>
            ))}
          </div>

          {filteredCompletions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Keine Einreichungen{filter !== 'all' ? ' in dieser Kategorie' : ''}.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredCompletions.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={c.status} />
                          <Badge variant="outline" className="text-xs">
                            {c.verification_type === 'code'
                              ? 'Code'
                              : c.verification_type === 'url'
                              ? 'URL'
                              : 'Screenshot'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(c.created_at)}
                        </p>
                        {c.verification_type === 'code' && c.code_entered && (
                          <p className="text-xs text-muted-foreground">
                            Code: <code className="bg-muted px-1 rounded">{c.code_entered}</code>
                          </p>
                        )}
                        {c.verification_type === 'url' && c.code_entered && (
                          <p className="text-xs text-muted-foreground truncate">
                            URL: <code className="bg-muted px-1 rounded">{c.code_entered}</code>
                          </p>
                        )}
                        {c.verification_type === 'screenshot' && (
                          <div className="space-y-2">
                            {c.screenshot_url ? (
                              <button type="button" onClick={() => setLightboxUrl(c.screenshot_url)} className="block text-left">
                                <img
                                  src={c.screenshot_url}
                                  alt="Screenshot-Nachweis"
                                  className="rounded-md border max-h-48 w-auto hover:opacity-90 transition-opacity cursor-pointer"
                                />
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ImageIcon className="h-3 w-3" />
                                <span>Kein Screenshot</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {c.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleReview(c.id, 'verified')}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleReview(c.id, 'rejected')}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Donation Confirmation Dialog ─────────────────────────────────── */}
      <Dialog open={showDonationDialog} onOpenChange={setShowDonationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Spende bestätigen</DialogTitle>
            <DialogDescription>
              Bestätige, dass die Spende überwiesen wurde.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {charity && (
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">Organisation:</span>{' '}
                  <span className="font-medium">{charity.name}</span>
                </div>
                {charity.website_url && (
                  <a
                    href={sanitizeUrl(charity.website_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
                  >
                    {charity.website_url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
            <div className="text-sm">
              <span className="text-muted-foreground">Betrag:</span>{' '}
              <span className="font-medium">{centsToEur(spentCents)}</span>
            </div>

            {/* Privacy warning */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs leading-relaxed">
                <strong>Wichtig:</strong> {campaign?.is_public
                  ? 'Der Spendennachweis wird öffentlich auf der Kampagnenseite angezeigt. Bitte schwärze vor dem Hochladen alle sensiblen Daten (IBAN, Kontonummern, vollständige Namen, Adressen) auf dem Bild.'
                  : 'Bitte schwärze vor dem Hochladen alle sensiblen Daten (IBAN, Kontonummern, vollständige Namen, Adressen) auf dem Bild. Der Nachweis ist nur über deinen Admin-Link sichtbar.'
                }
              </AlertDescription>
            </Alert>

            {/* Photo upload for proof */}
            <div className="space-y-2">
              <Label>Spendennachweis (Foto)</Label>
              <div
                onClick={() => proofFileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {donationProofPreview ? (
                  <div className="space-y-2">
                    <img
                      src={donationProofPreview}
                      alt="Spendennachweis Vorschau"
                      className="max-h-40 mx-auto rounded-md object-contain"
                    />
                    <p className="text-xs text-muted-foreground">{donationProofFile?.name}</p>
                    <p className="text-xs text-muted-foreground">Klicken zum Ersetzen</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Foto vom Spendenbeleg hochladen
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Persönliche Daten vorher schwärzen!
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={proofFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleProofFileChange(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDonationDialog(false)
                setDonationProofFile(null)
                setDonationProofPreview(null)
              }}
              disabled={uploadingProof}
            >
              Abbrechen
            </Button>
            <Button onClick={handleConfirmDonation} disabled={uploadingProof}>
              {uploadingProof ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Wird bestätigt...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" /> Bestätigen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Screenshot Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 z-50 rounded-full bg-white/20 hover:bg-white/40 p-2 transition-colors"
          >
            <XCircle className="h-6 w-6 text-white" />
          </button>
          <img
            src={lightboxUrl}
            alt="Screenshot-Nachweis"
            className="max-h-[90vh] max-w-[95vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete Campaign Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kampagne löschen</DialogTitle>
            <DialogDescription className="space-y-2">
              <span className="block">Bist du sicher? Die Kampagne und alle zugehörigen Einreichungen werden unwiderruflich gelöscht.</span>
              {campaign?.status === 'completed' && (
                <span className="block text-amber-600 font-medium">
                  Hinweis: Abgeschlossene Kampagnen sollten bestehen bleiben – sie zeigen anderen, was bereits erreicht wurde, und können als Motivation dienen.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={actionLoading}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDeleteCampaign} disabled={actionLoading}>
              {actionLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Wird gelöscht...</>
              ) : (
                <><Trash2 className="h-4 w-4" /> Endgültig löschen</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
