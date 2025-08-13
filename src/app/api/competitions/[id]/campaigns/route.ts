import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/providers/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url)
  const seasonId = searchParams.get('seasonId')

  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        competitionId: (await params).id,
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data: { seasonId: string, campaignType: 'team' | 'league', teamId?: string } = await request.json()

    const campaign = await prisma.campaign.create({
      data: {
        competitionId: (await params).id,
        seasonId: data.seasonId
      }
    })

    if (data.campaignType === 'team' && data.teamId) {
      await prisma.teamCampaign.create({
        data: {
          campaignId: campaign.id,
          teamId: data.teamId
        }
      })
    } else if (data.campaignType === 'league') {
      await prisma.leagueCampaign.create({
        data: {
          campaignId: campaign.id
        }
      })
    }

    await prisma.$disconnect()
    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error creating campaign:', error)
    await prisma.$disconnect()
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}