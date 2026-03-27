import { supabase } from '@/lib/supabase'
import { sanitizeUrl, formatCents } from '@/lib/utils'
import { getDonationsByCharity } from '@/lib/donations'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Heart, TrendingUp, HandHeart } from 'lucide-react'

export const revalidate = 60

export default async function CharitiesPage() {
  const [{ data: charities, error }, { charities: donationSummaries, total_donated_cents }] =
    await Promise.all([
      supabase.from('charities').select('*').order('name'),
      getDonationsByCharity(),
    ])

  // Create a map for quick lookup: charity_id -> donation summary
  const donationMap = new Map(
    donationSummaries
      .filter((d) => d.charity_id !== null)
      .map((d) => [d.charity_id!, d])
  )
  const sonstigesDonation = donationSummaries.find(
    (d) => d.charity_id === null
  )

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl space-y-10 md:space-y-14">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <Heart className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Spendenorganisationen
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Diese Organisationen können bei Kampagnen gewählt werden.
        </p>
      </div>

      {/* Donation Overview */}
      {total_donated_cents > 0 && (
        <section>
          <div className="text-center mb-6 space-y-2">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-2.5">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Spenden pro Organisation
            </h2>
            <p className="text-muted-foreground">
              Insgesamt{' '}
              <strong className="text-green-700">
                {formatCents(total_donated_cents)}
              </strong>{' '}
              durch PollPromise-Kampagnen gespendet.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {donationSummaries.map((summary, index) => (
              <Card
                key={summary.charity_id ?? 'sonstiges'}
                className={
                  summary.charity_id
                    ? 'border-green-100 hover:border-green-300 transition-all'
                    : 'border-dashed'
                }
              >
                <CardContent className="pt-5 pb-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <HandHeart className="h-4 w-4 text-green-600 shrink-0" />
                      <span className="font-medium text-sm truncate">
                        {summary.charity_name}
                      </span>
                    </div>
                    {index === 0 && summary.charity_id && (
                      <Badge
                        variant="outline"
                        className="text-[10px] shrink-0 border-green-300 text-green-700"
                      >
                        #1
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCents(summary.total_donated_cents)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    aus{' '}
                    {summary.campaign_count === 1
                      ? '1 Kampagne'
                      : `${summary.campaign_count} Kampagnen`}
                  </p>
                  {summary.website_url && (
                    <a
                      href={sanitizeUrl(summary.website_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Charities */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Alle Organisationen</h2>
        {error ? (
          <p className="text-center text-destructive">
            Fehler beim Laden der Organisationen. Bitte versuchen Sie es später
            erneut.
          </p>
        ) : !charities || charities.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Noch keine Organisationen vorhanden.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {charities.map((charity) => {
              const donation = donationMap.get(charity.id)
              return (
                <Card key={charity.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{charity.name}</CardTitle>
                      {donation && (
                        <Badge
                          variant="outline"
                          className="shrink-0 text-xs border-green-300 text-green-700"
                        >
                          {formatCents(donation.total_donated_cents)}
                        </Badge>
                      )}
                    </div>
                    {charity.description && (
                      <CardDescription className="line-clamp-3">
                        {charity.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="mt-auto pt-0">
                    <div className="flex items-center justify-between">
                      {charity.website_url && (
                        <a
                          href={sanitizeUrl(charity.website_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Website besuchen
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {donation && (
                        <span className="text-xs text-muted-foreground">
                          {donation.campaign_count === 1
                            ? '1 Kampagne'
                            : `${donation.campaign_count} Kampagnen`}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Sonstiges at the bottom */}
        {sonstigesDonation && (
          <div className="mt-6">
            <Card className="border-dashed">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-muted-foreground">
                      Sonstiges (nicht-öffentliche Kampagnen)
                    </p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCents(sonstigesDonation.total_donated_cents)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sonstigesDonation.campaign_count === 1
                      ? '1 Kampagne'
                      : `${sonstigesDonation.campaign_count} Kampagnen`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  )
}
