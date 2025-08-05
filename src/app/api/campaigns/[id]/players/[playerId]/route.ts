import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, playerId: string }> }
) {
     try {
          const { playerId }: { id: string, playerId: string } = await params;

          const data: { isTeamCaptain: boolean } = await request.json();

          // Check if TeamCampaignPlayer record exists
          const existingTeamCampaignPlayer = await prisma.teamCampaignPlayer.findUnique({
               where: {
                    campaignPlayerId: playerId
               }
          });

          if (data.isTeamCaptain) {
               if (existingTeamCampaignPlayer) {
                    // Update existing record
                    await prisma.teamCampaignPlayer.update({
                         where: {
                              campaignPlayerId: playerId
                         },
                         data: {
                              isTeamCaptain: true
                         }
                    });
               } else {
                    // Create new record
                    await prisma.teamCampaignPlayer.create({
                         data: {
                              campaignPlayerId: playerId,
                              isTeamCaptain: true
                         }
                    });
               }
          } else {
               // Remove TeamCampaignPlayer record if it exists
               if (existingTeamCampaignPlayer) {
                    await prisma.teamCampaignPlayer.delete({
                         where: {
                              campaignPlayerId: playerId
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
  { params }: { params: Promise<{ id: string, playerId: string }> }
) {
     try {
          const { playerId }: { id: string, playerId: string } = await params;

          // Delete TeamCampaignPlayer record first (if exists)
          await prisma.teamCampaignPlayer.deleteMany({
               where: {
                    campaignPlayerId: playerId
               }
          });

          // Delete CampaignPlayer record
          await prisma.campaignPlayer.delete({
               where: {
                    id: playerId
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