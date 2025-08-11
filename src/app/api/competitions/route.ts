import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(
  request: NextRequest,
) {
     try {
          const competition: { name: string } = await request.json();

          const result = await prisma.competition.create({
               data: competition
          });

          await prisma.$disconnect();
          return NextResponse.json(result);
     } catch (error) {
          console.error('Error creating competition:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to create competition' }, { status: 500 });
     }
}