import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashParticipant } from '@/lib/hash'

export async function POST(request: NextRequest) {
  try {
    const { page_path } = await request.json()

    if (!page_path || typeof page_path !== 'string') {
      return NextResponse.json({ error: 'page_path required' }, { status: 400 })
    }

    // Limit path length
    const trimmedPath = page_path.slice(0, 500)

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '0.0.0.0'
    const ua = request.headers.get('user-agent') || ''
    const visitorHash = hashParticipant(ip, ua)

    await supabase.from('page_views').insert({
      page_path: trimmedPath,
      visitor_hash: visitorHash,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all' // 'today', '7d', '30d', 'all'

    let query = supabase.from('page_views').select('*', { count: 'exact', head: true })

    const now = new Date()
    if (period === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      query = query.gte('created_at', todayStart)
    } else if (period === '7d') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('created_at', weekAgo)
    } else if (period === '30d') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('created_at', monthAgo)
    }

    const { count } = await query

    // Unique visitors (count distinct visitor_hash)
    // Supabase JS doesn't support COUNT DISTINCT, so we fetch hashes for unique count
    let uniqueQuery = supabase.from('page_views').select('visitor_hash')

    if (period === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      uniqueQuery = uniqueQuery.gte('created_at', todayStart)
    } else if (period === '7d') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      uniqueQuery = uniqueQuery.gte('created_at', weekAgo)
    } else if (period === '30d') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      uniqueQuery = uniqueQuery.gte('created_at', monthAgo)
    }

    const { data: visitors } = await uniqueQuery
    const uniqueVisitors = new Set(visitors?.map((v) => v.visitor_hash)).size

    return NextResponse.json({
      total_views: count ?? 0,
      unique_visitors: uniqueVisitors,
      period,
    })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
