'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Eye, Users } from 'lucide-react'

export function VisitorTracker() {
  const pathname = usePathname()
  const [stats, setStats] = useState<{
    total_views: number
    unique_visitors: number
  } | null>(null)

  // Track page view on route change
  useEffect(() => {
    fetch('/api/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_path: pathname }),
    }).catch(() => {
      // silently ignore tracking errors
    })
  }, [pathname])

  // Fetch stats once on mount
  useEffect(() => {
    fetch('/api/tracking?period=all')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {
        // ignore
      })
  }, [])

  if (!stats) return null

  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <Eye className="h-3 w-3" />
        {stats.total_views.toLocaleString('de-DE')} Aufrufe
      </span>
      <span className="inline-flex items-center gap-1">
        <Users className="h-3 w-3" />
        {stats.unique_visitors.toLocaleString('de-DE')} Besucher
      </span>
    </div>
  )
}
