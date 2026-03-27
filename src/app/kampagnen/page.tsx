import Link from 'next/link'
import {
  ArrowRight,
  Heart,
  Clock,
  CheckCircle2,
  ExternalLink,
  ClipboardList,
  UserCheck,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn, formatCents, sanitizeUrl } from '@/lib/utils'
import { getPublicCampaigns } from '@/lib/campaigns'

export const revalidate = 60

export default async function KampagnenPage() {
  const { active, completed } = await getPublicCampaigns()
  const hasNoCampaigns = active.length === 0 && completed.length === 0

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl space-y-10 md:space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <ClipboardList className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Kampagnen
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Nimm an einer Umfrage teil und unterstütze eine gemeinnützige Organisation.
        </p>
      </div>

      {hasNoCampaigns && (
        <div className="text-center py-12 space-y-4">
          <p className="text-muted-foreground">
            Aktuell sind keine öffentlichen Kampagnen verfügbar.
          </p>
          <Link
            href="/create"
            className={cn(buttonVariants(), 'inline-flex items-center')}
          >
            Erste Kampagne erstellen
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      )}

      {/* Active Campaigns */}
      {active.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Clock className="h-3 w-3 mr-1" />
              Aktiv
            </Badge>
            <h2 className="text-xl font-semibold">
              {active.length} aktive {active.length === 1 ? 'Kampagne' : 'Kampagnen'}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {active.map((campaign) => {
              const maxParticipants =
                campaign.donation_per_completion_cents > 0
                  ? Math.floor(
                      campaign.budget_cents /
                        campaign.donation_per_completion_cents
                    )
                  : 0
              const progress =
                maxParticipants > 0
                  ? Math.min(
                      (campaign.verified_count / maxParticipants) * 100,
                      100
                    )
                  : 0

              return (
                <Card
                  key={campaign.id}
                  className="border-green-100 hover:border-green-300 transition-all hover:shadow-lg group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-snug">
                        {campaign.title}
                      </CardTitle>
                      <Badge className="shrink-0 bg-green-100 text-green-800 border-green-200">
                        Aktiv
                      </Badge>
                    </div>
                    {campaign.description && (
                      <CardDescription className="text-sm leading-relaxed line-clamp-2 mt-1">
                        {campaign.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {campaign.verified_count} / {maxParticipants}{' '}
                          Teilnahmen
                        </span>
                        <span className="font-medium text-primary">
                          {formatCents(campaign.budget_cents)} Spendenziel
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-green-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Charity target */}
                    {campaign.charity && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Heart className="h-3.5 w-3.5 text-green-600" />
                        <span>
                          Spende an:{' '}
                          <strong className="text-foreground">
                            {campaign.charity.name}
                          </strong>
                        </span>
                      </div>
                    )}

                    {/* Target audience */}
                    {campaign.target_audience && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UserCheck className="h-3 w-3 text-blue-500 shrink-0" />
                        <span className="truncate">{campaign.target_audience}</span>
                      </div>
                    )}

                    {/* Info row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {formatCents(
                          campaign.donation_per_completion_cents
                        )}{' '}
                        pro Teilnahme
                      </span>
                      {campaign.estimated_minutes > 0 && (
                        <span>ca. {campaign.estimated_minutes} Min.</span>
                      )}
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/s/${campaign.slug}`}
                      className={cn(
                        buttonVariants({ size: 'sm' }),
                        'w-full group-hover:bg-green-700 transition-colors'
                      )}
                    >
                      Jetzt teilnehmen
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Completed Campaigns */}
      {completed.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Badge className="bg-green-600 text-white border-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Abgeschlossen
            </Badge>
            <h2 className="text-xl font-semibold">Erreichte Spendenziele</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.map((campaign) => (
              <Card
                key={campaign.id}
                className="border-green-200 bg-green-50/30 hover:shadow-lg transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-snug">
                      {campaign.title}
                    </CardTitle>
                    <Badge className="shrink-0 bg-green-600 text-white border-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Fertig
                    </Badge>
                  </div>
                  {campaign.description && (
                    <CardDescription className="text-sm leading-relaxed line-clamp-2 mt-1">
                      {campaign.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Donation amount */}
                  <div className="rounded-lg bg-white border border-green-200 p-4 text-center space-y-1">
                    <p className="text-2xl font-bold text-green-700">
                      {formatCents(
                        campaign.verified_count *
                          campaign.donation_per_completion_cents
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      gespendet ({campaign.verified_count} Teilnahmen &times;{' '}
                      {formatCents(campaign.donation_per_completion_cents)})
                    </p>
                  </div>

                  {/* Charity */}
                  {campaign.charity && (
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-3.5 w-3.5 text-green-600 fill-green-600" />
                      <span>
                        Gespendet an:{' '}
                        {campaign.charity.website_url ? (
                          <a
                            href={sanitizeUrl(campaign.charity.website_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {campaign.charity.name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <strong>{campaign.charity.name}</strong>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Donation confirmed */}
                  {campaign.donation_confirmed && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">Spende bestätigt</span>
                      </div>
                      {campaign.donation_proof_url &&
                        (campaign.donation_proof_url.startsWith(
                          'data:image'
                        ) ? (
                          <img
                            src={campaign.donation_proof_url}
                            alt="Spendenbeleg"
                            className="w-full max-h-48 rounded-md object-contain border border-green-200"
                          />
                        ) : (
                          <a
                            href={sanitizeUrl(campaign.donation_proof_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              buttonVariants({
                                variant: 'outline',
                                size: 'sm',
                              }),
                              'w-full text-green-700 border-green-300 hover:bg-green-50'
                            )}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            Spendenbeleg ansehen
                          </a>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
