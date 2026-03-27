export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { cn, formatCents, sanitizeUrl } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Clock, Heart, Users, ExternalLink, CheckCircle, UserCheck } from 'lucide-react'

interface PageProps {
  params: { slug: string }
}

export default async function CampaignPage({ params }: PageProps) {
  const { slug } = params

  // Fetch campaign by slug
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!campaign) {
    notFound()
  }

  // Fetch verified completion count
  const { count: completionCount } = await supabase
    .from('completions')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaign.id)
    .eq('status', 'verified')

  const verifiedCount = completionCount ?? 0

  // Calculate budget progress
  const usedBudgetCents = verifiedCount * campaign.donation_per_completion_cents
  const budgetProgress = campaign.budget_cents > 0
    ? Math.min(100, (usedBudgetCents / campaign.budget_cents) * 100)
    : 0
  const budgetExhausted = usedBudgetCents >= campaign.budget_cents

  // Fetch charity info
  let charityName: string | null = null
  let charityWebsite: string | null = null
  if (campaign.locked_charity_id) {
    const { data: charity } = await supabase
      .from('charities')
      .select('name, website_url')
      .eq('id', campaign.locked_charity_id)
      .single()
    charityName = charity?.name ?? null
    charityWebsite = charity?.website_url ?? null
  }

  // Campaign ended check
  const isEnded = campaign.status !== 'active' || budgetExhausted

  if (isEnded) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{campaign.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {campaign.donation_confirmed ? (
              <div className="rounded-full bg-green-100 dark:bg-green-950 w-16 h-16 mx-auto flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <p className="text-lg text-muted-foreground">
              Diese Kampagne ist beendet.
            </p>
            <p className="text-sm text-muted-foreground">
              Insgesamt wurden {formatCents(usedBudgetCents)} gespendet
              {charityName ? (
                <>
                  {' an '}
                  {charityWebsite ? (
                    <a href={sanitizeUrl(charityWebsite)} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline inline-flex items-center gap-1">
                      {charityName}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <strong>{charityName}</strong>
                  )}
                </>
              ) : ''}.
            </p>

            {/* Donation proof */}
            {campaign.donation_confirmed && campaign.donation_proof_url && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Spende bestätigt</span>
                </div>
                {campaign.donation_proof_url.startsWith('data:image') ? (
                  <img
                    src={campaign.donation_proof_url}
                    alt="Spendennachweis"
                    className="max-w-full max-h-96 mx-auto rounded-lg border object-contain"
                  />
                ) : (
                  <a
                    href={sanitizeUrl(campaign.donation_proof_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Spendennachweis ansehen
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Campaign Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{campaign.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">
            {campaign.description}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm">
            {campaign.estimated_minutes > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Geschätzte Dauer: ~{campaign.estimated_minutes} Minuten</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{verifiedCount} Teilnahmen</span>
            </div>
          </div>

          {/* Target audience */}
          {campaign.target_audience && (
            <div className="flex items-start gap-2 text-sm rounded-lg bg-blue-50 border border-blue-100 p-3">
              <UserCheck className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-blue-800">Zielgruppe:</span>{' '}
                <span className="text-blue-700">{campaign.target_audience}</span>
              </div>
            </div>
          )}

          {/* Donation info */}
          <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-green-800 dark:text-green-300">
                  Pro Teilnahme werden {formatCents(campaign.donation_per_completion_cents)} gespendet
                </p>
                {charityName && (
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Spendenziel:{' '}
                    {charityWebsite ? (
                      <a href={sanitizeUrl(charityWebsite)} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline inline-flex items-center gap-1">
                        {charityName}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <strong>{charityName}</strong>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Budget progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Spendenfortschritt</span>
              <span className="font-medium">
                {formatCents(usedBudgetCents)} / {formatCents(campaign.budget_cents)}
              </span>
            </div>
            <Progress value={budgetProgress} />
          </div>

          {/* CTA */}
          <div className="space-y-3 pt-2">
            <a href={sanitizeUrl(campaign.survey_url)} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ size: "lg" }), "w-full text-base")}>
                Zur Umfrage
                <ExternalLink className="h-4 w-4 ml-2" />
            </a>

            <div className="text-center">
              <Link
                href={`/s/${slug}/verify`}
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                Umfrage abgeschlossen? Hier verifizieren →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
