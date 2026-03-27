import { NextResponse } from 'next/server'
import { getDonationsByCharity } from '@/lib/donations'

export const revalidate = 60

export async function GET() {
  const data = await getDonationsByCharity()
  return NextResponse.json(data)
}
