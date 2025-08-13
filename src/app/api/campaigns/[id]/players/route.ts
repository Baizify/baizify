import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
     try {
          const campaignPlayers = await prisma.campaignPlayer.findMany({
               where: {
                    campaignId: (await params).id
               },
               include: {
                    user: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              image: true
                         }
                    }
               }
          });

          // Get team campaign players for team captain info
          const teamCampaignPlayers = await prisma.teamCampaignPlayer.findMany({
               where: {
                    campaignPlayerId: {
                         in: campaignPlayers.map(cp => cp.id)
                    }
               }
          });

          const playersWithCaptainInfo = campaignPlayers.map(player => ({
               ...player,
               isTeamCaptain: teamCampaignPlayers.find(tcp => tcp.campaignPlayerId === player.id)?.isTeamCaptain || false
          }));

          await prisma.$disconnect();
          return NextResponse.json(playersWithCaptainInfo);
     } catch (error) {
          console.error('Error fetching campaign players:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to fetch campaign players' }, { status: 500 });
     }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
     try {
          const data: { userId: string, isTeamCaptain: boolean } = await request.json();

          // Create campaign player
          const campaignPlayer = await prisma.campaignPlayer.create({
               data: {
                    campaignId: (await params).id,
                    userId: data.userId
               }
          });

          await prisma.handicap.create({
               data: {
                    campaignPlayerId: campaignPlayer.id,
                    value: 10
               }
          });

          // If isTeamCaptain is true, create TeamCampaignPlayer record
          if (data.isTeamCaptain) {
               await prisma.teamCampaignPlayer.create({
                    data: {
                         campaignPlayerId: campaignPlayer.id,
                         isTeamCaptain: true
                    }
               });
          }

          await prisma.$disconnect();
          return NextResponse.json(campaignPlayer);
     } catch (error) {
          console.error('Error creating campaign player:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to create campaign player' }, { status: 500 });
     }
}