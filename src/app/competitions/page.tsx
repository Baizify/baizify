import prisma from "@/providers/prisma";
import { auth } from "@/auth";
import { Session } from "next-auth";
import { User } from "@/generator/prisma";
import CompetitionsPageClient from "./components/CompetitionsPageClient";

/**
 * The competition list page.
 * @returns The competition list page.
 */
const CompetitionListPage = async (): Promise<React.ReactElement> => {
     const session: Session | null = await auth();
     let profile: User | null = null;
     const competitions = await prisma.competition.findMany({
          include: {
               campaigns: {
                    include: {
                         season: true,
                         teamCampaign: {
                              include: {
                                   team: true
                              }
                         },
                         players: true
                    }
               },
               fixtures: {
                    include: {
                         season: true
                    },
                    where: {
                         scheduledDate: {
                              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                         }
                    },
                    orderBy: {
                         scheduledDate: 'desc'
                    },
                    take: 5
               },
               _count: {
                    select: {
                         campaigns: true,
                         fixtures: true
                    }
               }
          },
          orderBy: [
               { sortOrder: 'asc' },
               { name: 'asc' }
          ]
     });

     if (session?.user?.id) {
          profile =  await prisma.user.findUnique({
               where: {
                    id: session?.user?.id
               }
          });
     }
     
     await prisma.$disconnect();

     return (
          <CompetitionsPageClient 
               competitions={competitions as any} 
               isAdmin={profile?.isAdmin || false} 
          />
     )
}

export default CompetitionListPage;