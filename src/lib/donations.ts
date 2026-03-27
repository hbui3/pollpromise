import { supabase } from '@/lib/supabase'

export interface CharityDonationSummary {
  charity_id: string | null
  charity_name: string
  website_url: string | null
  total_donated_cents: number
  campaign_count: number
}

/**
 * Aggregates total donations per charity across all campaigns.
 * Non-public campaigns or campaigns without a locked charity are grouped under "Sonstiges".
 */
export async function getDonationsByCharity(): Promise<{
  charities: CharityDonationSummary[]
  total_donated_cents: number
}> {
  try {
    // 1. Get all campaigns that have confirmed donations or are completed
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select(
        'id, locked_charity_id, donation_per_completion_cents, is_public, donation_confirmed, status'
      )

    if (!campaigns || campaigns.length === 0) {
      return { charities: [], total_donated_cents: 0 }
    }

    // 2. Get all verified completions for these campaigns in one query
    const campaignIds = campaigns.map((c) => c.id)
    const { data: completions } = await supabase
      .from('completions')
      .select('campaign_id')
      .in('campaign_id', campaignIds)
      .eq('status', 'verified')

    // 3. Count completions per campaign
    const countMap: Record<string, number> = {}
    for (const c of completions ?? []) {
      countMap[c.campaign_id] = (countMap[c.campaign_id] ?? 0) + 1
    }

    // 4. Aggregate by charity
    const charityTotals: Record<
      string,
      { cents: number; count: number }
    > = {}

    for (const campaign of campaigns) {
      const verified = countMap[campaign.id] ?? 0
      if (verified === 0) continue

      const donated = verified * campaign.donation_per_completion_cents

      // Group non-public campaigns or those without a charity under "sonstiges"
      const key =
        campaign.is_public && campaign.locked_charity_id
          ? campaign.locked_charity_id
          : 'sonstiges'

      if (!charityTotals[key]) {
        charityTotals[key] = { cents: 0, count: 0 }
      }
      charityTotals[key].cents += donated
      charityTotals[key].count += 1
    }

    // 5. Fetch charity details for all referenced charity IDs
    const charityIds = Object.keys(charityTotals).filter(
      (k) => k !== 'sonstiges'
    )
    let charityMap: Record<
      string,
      { name: string; website_url: string | null }
    > = {}

    if (charityIds.length > 0) {
      const { data: charityData } = await supabase
        .from('charities')
        .select('id, name, website_url')
        .in('id', charityIds)

      for (const c of charityData ?? []) {
        charityMap[c.id] = { name: c.name, website_url: c.website_url }
      }
    }

    // 6. Build result array
    const result: CharityDonationSummary[] = []
    let totalDonated = 0

    for (const [key, value] of Object.entries(charityTotals)) {
      if (key === 'sonstiges') continue
      const charity = charityMap[key]
      if (!charity) continue

      result.push({
        charity_id: key,
        charity_name: charity.name,
        website_url: charity.website_url,
        total_donated_cents: value.cents,
        campaign_count: value.count,
      })
      totalDonated += value.cents
    }

    // Sort by total donated descending
    result.sort((a, b) => b.total_donated_cents - a.total_donated_cents)

    // Add "Sonstiges" at the end if present
    if (charityTotals['sonstiges']) {
      result.push({
        charity_id: null,
        charity_name: 'Sonstiges',
        website_url: null,
        total_donated_cents: charityTotals['sonstiges'].cents,
        campaign_count: charityTotals['sonstiges'].count,
      })
      totalDonated += charityTotals['sonstiges'].cents
    }

    return { charities: result, total_donated_cents: totalDonated }
  } catch {
    return { charities: [], total_donated_cents: 0 }
  }
}
