import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/providers/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const seasonId = searchParams.get('seasonId')

  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        competitionId: params.id,
        ...(seasonId && { seasonId })
      },
      include: {
        season: true,
        teamCampaign: {
          include: {
            team: true
          }
        },
        leagueCampaign: true
      }
    })

    await prisma.$disconnect()

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    await prisma.$disconnect()
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}