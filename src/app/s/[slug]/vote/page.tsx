'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { sanitizeUrl } from '@/lib/utils'
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
  Heart,
  Vote,
  Plus,
} from 'lucide-react'

interface Campaign {
  id: string
  title: string
  slug: string
  locked_charity_id: string | null
}

interface CharityWithVotes {
  id: string
  name: string
  description: string | null
  website_url: string | null
  vote_count: number
}

export default function VotePage() {
  const params = useParams()
  const slug = params.slug as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [lockedCharityName, setLockedCharityName] = useState<string | null>(null)
  const [charities, setCharities] = useState<CharityWithVotes[]>([])
  const [loading, setLoading] = useState(true)

  // Vote state
  const [votingId, setVotingId] = useState<string | null>(null)
  const [voted, setVoted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Suggest new charity state
  const [showSuggest, setShowSuggest] = useState(false)
  const [newCharityName, setNewCharityName] = useState('')
  const [newCharityWebsite, setNewCharityWebsite] = useState('')
  const [newCharityDescription, setNewCharityDescription] = useState('')
  const [suggestSubmitting, setSuggestSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch campaign
        const campaignRes = await fetch(`/api/campaigns?slug=${slug}`)
        if (!campaignRes.ok) return
        const campaignData = await campaignRes.json()
        setCampaign(campaignData)

        if (campaignData.locked_charity_id) {
          // Fetch locked charity name
          const charitiesRes = await fetch(
            `/api/charities?campaign_id=${campaignData.id}`
          )
          if (charitiesRes.ok) {
            const charitiesData: CharityWithVotes[] = await charitiesRes.json()
            const locked = charitiesData.find(
              (c) => c.id === campaignData.locked_charity_id
            )
            if (locked) setLockedCharityName(locked.name)
          }
        } else {
          // Fetch charities with vote counts
          const charitiesRes = await fetch(
            `/api/charities?campaign_id=${campaignData.id}`
          )
          if (charitiesRes.ok) {
            const charitiesData: CharityWithVotes[] = await charitiesRes.json()
            setCharities(
              charitiesData.sort((a, b) => b.vote_count - a.vote_count)
            )
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const handleVote = async (charityId: string) => {
    if (!campaign) return
    setVotingId(charityId)
    setError(null)

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          charity_id: charityId,
        }),
      })

      if (res.ok) {
        setVoted(true)
      } else {
        const data = await res.json()
        if (
          data.error?.includes('already') ||
          data.error?.includes('duplicate')
        ) {
          setError('Du hast bereits abgestimmt.')
        } else {
          setError(data.error || 'Ein Fehler ist aufgetreten.')
        }
      }
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    } finally {
      setVotingId(null)
    }
  }

  const handleSuggestAndVote = async () => {
    if (!campaign || !newCharityName.trim()) return
    setSuggestSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          new_charity: {
            name: newCharityName.trim(),
            website_url: newCharityWebsite.trim() || null,
            description: newCharityDescription.trim() || null,
          },
        }),
      })

      if (res.ok) {
        setVoted(true)
      } else {
        const data = await res.json()
        if (
          data.error?.includes('already') ||
          data.error?.includes('duplicate')
        ) {
          setError('Du hast bereits abgestimmt.')
        } else {
          setError(data.error || 'Ein Fehler ist aufgetreten.')
        }
      }
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    } finally {
      setSuggestSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Kampagne nicht gefunden.</p>
      </div>
    )
  }

  // Success state
  if (voted) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="rounded-full bg-green-100 dark:bg-green-950 w-20 h-20 mx-auto flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
              Danke für deine Stimme!
            </h2>
            <p className="text-muted-foreground">
              Deine Teilnahme macht einen Unterschied.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Locked charity mode
  if (campaign.locked_charity_id) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{campaign.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-green-800 dark:text-green-300">
                    Für diese Kampagne wurde bereits eine Organisation festgelegt:{' '}
                    <strong>{lockedCharityName}</strong>.
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Deine Teilnahme unterstützt {lockedCharityName}.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Voting mode
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Abstimmung
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Wähle eine Organisation, die von dieser Kampagne profitieren soll.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Charity list */}
          {charities.length > 0 ? (
            <div className="space-y-3">
              {charities.map((charity, index) => (
                <div
                  key={charity.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      {index < 3 && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          #{index + 1}
                        </Badge>
                      )}
                      <span className="font-medium truncate">
                        {charity.name}
                      </span>
                    </div>
                    {charity.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {charity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {charity.vote_count}{' '}
                        {charity.vote_count === 1 ? 'Stimme' : 'Stimmen'}
                      </span>
                      {charity.website_url && (
                        <a
                          href={sanitizeUrl(charity.website_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          Webseite
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleVote(charity.id)}
                    disabled={votingId !== null}
                  >
                    {votingId === charity.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Stimme abgeben'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Noch keine Organisationen vorgeschlagen. Sei der Erste!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Suggest new charity */}
      <Card>
        <CardHeader>
          <CardTitle
            className="text-base flex items-center gap-2 cursor-pointer"
            onClick={() => setShowSuggest(!showSuggest)}
          >
            <Plus className="h-4 w-4" />
            Organisation vorschlagen
          </CardTitle>
        </CardHeader>
        {showSuggest && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="charity-name">Name *</Label>
              <Input
                id="charity-name"
                placeholder="Name der Organisation"
                value={newCharityName}
                onChange={(e) => setNewCharityName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="charity-website">Webseite (optional)</Label>
              <Input
                id="charity-website"
                placeholder="https://..."
                value={newCharityWebsite}
                onChange={(e) => setNewCharityWebsite(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="charity-desc">Kurzbeschreibung (optional)</Label>
              <Textarea
                id="charity-desc"
                placeholder="Worum geht es bei dieser Organisation?"
                rows={2}
                value={newCharityDescription}
                onChange={(e) => setNewCharityDescription(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSuggestAndVote}
              disabled={!newCharityName.trim() || suggestSubmitting}
              className="w-full"
            >
              {suggestSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Wird eingereicht...
                </>
              ) : (
                'Vorschlagen & Abstimmen'
              )}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
