'use client'

import { useEffect, useState } from 'react'
import { sanitizeUrl, formatCents } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ExternalLink,
  Heart,
  TrendingUp,
  HandHeart,
  Search,
  Building2,
  MapPin,
  Loader2,
} from 'lucide-react'

type DonationSummary = {
  charity_id: string | null
  charity_name: string
  total_donated_cents: number
  campaign_count: number
  website_url: string | null
}

type BetterplaceCharity = {
  betterplace_id: number
  name: string
  description: string | null
  city: string | null
  logo_url: string | null
  website_url: string | null
  betterplace_url: string | null
}

export default function CharitiesPage() {
  // Donation data
  const [donationSummaries, setDonationSummaries] = useState<DonationSummary[]>([])
  const [totalDonated, setTotalDonated] = useState(0)

  // Betterplace search
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BetterplaceCharity[]>([])
  const [topOrgs, setTopOrgs] = useState<BetterplaceCharity[]>([])
  const [searching, setSearching] = useState(false)
  const [loadingDonations, setLoadingDonations] = useState(true)

  // Load donation data
  useEffect(() => {
    fetch('/api/donations')
      .then((r) => r.json())
      .then((data) => {
        setDonationSummaries(data.charities || [])
        setTotalDonated(data.total_donated_cents || 0)
      })
      .finally(() => setLoadingDonations(false))
  }, [])

  // Load top 20 orgs on mount
  useEffect(() => {
    fetch('/api/betterplace/top')
      .then((r) => r.json())
      .then((data) => setTopOrgs(data))
  }, [])

  // Search with debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    const timeout = setTimeout(() => {
      fetch(`/api/betterplace/search?q=${encodeURIComponent(query)}&limit=20`)
        .then((r) => r.json())
        .then((data) => {
          setResults(Array.isArray(data) ? data : [])
          setSearching(false)
        })
        .catch(() => setSearching(false))
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  const displayedOrgs = query.length >= 2 ? results : topOrgs
  const sonstigesDonation = donationSummaries.find((d) => d.charity_id === null)
  const namedDonations = donationSummaries.filter((d) => d.charity_id !== null)

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
          Organisationen
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Durchsuche über 55.000 gemeinnützige Organisationen von betterplace.org
          – oder sieh dir an, wohin bereits gespendet wurde.
        </p>
      </div>

      {/* Donation Overview */}
      {!loadingDonations && totalDonated > 0 && (
        <section>
          <div className="text-center mb-6 space-y-2">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-2.5">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Bisherige Spenden
            </h2>
            <p className="text-muted-foreground">
              Insgesamt{' '}
              <strong className="text-green-700">
                {formatCents(totalDonated)}
              </strong>{' '}
              durch PollPromise-Kampagnen gespendet.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {namedDonations.map((summary, index) => (
              <Card
                key={summary.charity_id}
                className="border-green-100 hover:border-green-300 transition-all"
              >
                <CardContent className="pt-5 pb-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <HandHeart className="h-4 w-4 text-green-600 shrink-0" />
                      <span className="font-medium text-sm truncate">
                        {summary.charity_name}
                      </span>
                    </div>
                    {index === 0 && (
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

            {sonstigesDonation && (
              <Card className="border-dashed">
                <CardContent className="pt-5 pb-4 space-y-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <HandHeart className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm text-muted-foreground truncate">
                      Sonstiges
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCents(sonstigesDonation.total_donated_cents)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    aus{' '}
                    {sonstigesDonation.campaign_count === 1
                      ? '1 Kampagne'
                      : `${sonstigesDonation.campaign_count} Kampagnen`}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Organization Search */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">
            Organisation suchen
          </h2>
          <p className="text-muted-foreground text-sm">
            Finde gemeinnützige Organisationen, die bei einer Kampagne als Spendenziel gewählt werden können.
          </p>
        </div>

        <div className="max-w-lg mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="z.B. WWF, UNICEF, Tierschutz..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {searching && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!searching && (
          <>
            {query.length >= 2 && results.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Keine Organisationen für &quot;{query}&quot; gefunden.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedOrgs.map((org) => (
                    <Card key={org.betterplace_id} className="flex flex-col hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          {org.logo_url ? (
                            <img
                              src={org.logo_url}
                              alt=""
                              className="h-10 w-10 rounded-lg object-contain bg-gray-50 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <Building2 className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <CardTitle className="text-sm leading-tight">{org.name}</CardTitle>
                            {org.city && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {org.city}
                              </div>
                            )}
                          </div>
                        </div>
                        {org.description && (
                          <CardDescription className="line-clamp-2 text-xs mt-2">
                            {org.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="mt-auto pt-0">
                        <div className="flex items-center gap-3">
                          {org.website_url && (
                            <a
                              href={sanitizeUrl(org.website_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              Website
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {org.betterplace_url && (
                            <a
                              href={sanitizeUrl(org.betterplace_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
                            >
                              betterplace.org
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}
