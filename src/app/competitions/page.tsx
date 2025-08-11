import prisma from "@/providers/prisma";
import CompetitionCards from "./components/competitionCards";
import { auth } from "@/auth";
import { Session } from "next-auth";
import { User } from "@/generator/prisma";
import { Button } from "@heroui/react";
import Link from "next/link";
import { FaPlus } from "react-icons/fa6";

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
          <div className="max-w-7xl mx-auto p-4">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                         <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitions</h1>
                         <p className="text-gray-600">Discover and follow your favorite leagues and tournaments</p>
                    </div>

                    {profile?.isAdmin && (
                         <Button 
                              as={Link} 
                              href="/competitions/create" 
                              color="primary"
                              variant="solid"
                              startContent={<FaPlus size={16} />}
                              className="bg-gradient-to-r from-blue-500 to-purple-600 font-semibold"
                         >
                              Create Competition
                         </Button>
                    )}
               </div>

               <CompetitionCards competitions={competitions as any} isAdmin={profile?.isAdmin || false} />
          </div>
     )
}

export default CompetitionListPage;