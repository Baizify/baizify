import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string, playerId: string } }
) {
     try {
          const data: { value: number } = await request.json();
          
          await prisma.handicap.create({
               data: {
                    value: data.value,
                    campaignPlayerId: params.playerId
               }
          });

          await prisma.$disconnect();
          return NextResponse.json({ success: true });
     } catch(error) {
          console.error('Error updating campaign player:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to update campaign player' }, { status: 500 });
     }     
}