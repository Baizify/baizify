import prisma from "@/providers/prisma";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
     try {
          const bulletins = await prisma.bulletin.findMany({
               include: {
                    user: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              image: true
                         }
                    }
               },
               orderBy: {
                    createdAt: 'desc'
               },
               take: 10 // Limit to most recent 10 bulletins
          });

          await prisma.$disconnect();
          return NextResponse.json(bulletins);
     } catch (error) {
          console.error('Error fetching bulletins:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to fetch bulletins' }, { status: 500 });
     }
}

export async function POST(request: NextRequest) {
     try {
          const session = await auth();
          
          if (!session?.user?.id) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Check if user is admin
          const user = await prisma.user.findUnique({
               where: { id: session.user.id },
               select: { isAdmin: true }
          });

          if (!user?.isAdmin) {
               return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
          }

          const { title, description }: { 
               title: string; 
               description: string; 
          } = await request.json();

          if (!title?.trim() || !description?.trim()) {
               return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
          }

          const bulletin = await prisma.bulletin.create({
               data: {
                    title: title.trim(),
                    description: description.trim(),
                    userId: session.user.id
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

          await prisma.$disconnect();
          return NextResponse.json(bulletin);
     } catch (error) {
          console.error('Error creating bulletin:', error);
          await prisma.$disconnect();
          return NextResponse.json({ error: 'Failed to create bulletin' }, { status: 500 });
     }
}