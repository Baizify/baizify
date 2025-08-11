import prisma from "@/providers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
     const { searchParams } = new URL(request.url);
     const search = searchParams.get('search');

     try {
          const users = await prisma.user.findMany({
               where: search ? {
                    OR: [
                         {
                              name: {
                                   contains: search,
                                   mode: 'insensitive'
                              }
                         },
                         {
                              email: {
                                   contains: search,
                                   mode: 'insensitive'
                              }
                         }
                    ]
               } : undefined,
               select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
               },
               orderBy: {
                    name: 'asc'
               },
               take: 50
          });
          
          await prisma.$disconnect();
          return NextResponse.json(users);
     } catch (error) {
          console.error('Error fetching users:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
     }
}