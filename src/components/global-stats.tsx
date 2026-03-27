'use client'

import { useEffect, useState } from 'react'
import { Users, Heart, ClipboardList } from 'lucide-react'

export function GlobalStats() {
  const [stats, setStats] = useState<{
    total_completions: number
    confirmed_donation_cents: number
    total_campaigns: number
  } | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  if (!stats || (stats.total_completions === 0 && stats.confirmed_donation_cents === 0)) {
    return null
  }

  const items = [
    {
      icon: Users,
      value: stats.total_completions.toLocaleString('de-DE'),
      label: 'Teilnahmen',
    },
    {
      icon: Heart,
      value: (stats.confirmed_donation_cents / 100).toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }),
      label: 'bestätigte Spenden',
    },
    {
      icon: ClipboardList,
      value: stats.total_campaigns.toLocaleString('de-DE'),
      label: 'Kampagnen',
    },
  ]

  return (
    <section className="py-6 md:py-8 border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <item.icon className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">seit 27.03.2026</p>
      </div>
    </section>
  )
}
