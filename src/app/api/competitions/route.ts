import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
     request: NextRequest
) {
     try {
          const competitions = await prisma.competition.findMany();

          await prisma.$disconnect();
          return NextResponse.json(competitions);
     } catch (err) {
          console.error('Error getting competitions:', err);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to get competitions' }, { status: 500 });
     }
}

export async function POST(
  request: NextRequest,
) {
     try {
          const competition: { 
               name: string; 
               sortOrder?: number; 
               collection?: string; 
          } = await request.json();

          const result = await prisma.competition.create({
               data: {
                    name: competition.name,
                    sortOrder: competition.sortOrder || 1,
                    collection: competition.collection || 'Default League'
               }
          });

          await prisma.$disconnect();
          return NextResponse.json(result);
     } catch (error) {
          console.error('Error creating competition:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to create competition' }, { status: 500 });
     }
}