import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, playerId: string } }
) {
     try {
          const data: { isTeamCaptain: boolean } = await request.json();

          // Check if TeamCampaignPlayer record exists
          const existingTeamCampaignPlayer = await prisma.teamCampaignPlayer.findUnique({
               where: {
                    campaignPlayerId: params.playerId
               }
          });

          if (data.isTeamCaptain) {
               if (existingTeamCampaignPlayer) {
                    // Update existing record
                    await prisma.teamCampaignPlayer.update({
                         where: {
                              campaignPlayerId: params.playerId
                         },
                         data: {
                              isTeamCaptain: true
                         }
                    });
               } else {
                    // Create new record
                    await prisma.teamCampaignPlayer.create({
                         data: {
                              campaignPlayerId: params.playerId,
                              isTeamCaptain: true
                         }
                    });
               }
          } else {
               // Remove TeamCampaignPlayer record if it exists
               if (existingTeamCampaignPlayer) {
                    await prisma.teamCampaignPlayer.delete({
                         where: {
                              campaignPlayerId: params.playerId
                         }
                    });
               }
          }

          await prisma.$disconnect();
          return NextResponse.json({ success: true });
     } catch (error) {
          console.error('Error updating campaign player:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to update campaign player' }, { status: 500 });
     }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, playerId: string } }
) {
     try {
          // Delete TeamCampaignPlayer record first (if exists)
          await prisma.teamCampaignPlayer.deleteMany({
               where: {
                    campaignPlayerId: params.playerId
               }
          });

          // Delete CampaignPlayer record
          await prisma.campaignPlayer.delete({
               where: {
                    id: params.playerId
               }
          });

          await prisma.$disconnect();
          return NextResponse.json({ success: true });
     } catch (error) {
          console.error('Error deleting campaign player:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to delete campaign player' }, { status: 500 });
     }
}