import prisma from "@/providers/prisma"
import CompetitionContainer from "./components/competitionContainer"
import { Session } from "next-auth"
import { auth } from "@/auth"
import { User } from '@/generator/prisma'

const CompetitionPage = async ({
     params
}: {
     params: Promise<{
          id: string
     }>
}) => {
     const session: Session | null = await auth();
     let profile: User | undefined | null;
     const competition = await prisma.competition.findFirst({
          where: { 
               id: (await params).id 
          },
          include: {
               campaigns: {
                    include: {
                         season: true,
                         teamCampaign: {
                              include: {
                                   team: true
                              }
                         },
                         leagueCampaign: true,
                         players: {
                              include: {
                                   user: true
                              }
                         }
                    }
               },
               fixtures: {
                    include: {
                         season: true,
                         homeCampaign: {
                              include: {
                                   teamCampaign: {
                                        include: { team: true }
                                   }
                              }
                         },
                         awayCampaign: {
                              include: {
                                   teamCampaign: {
                                        include: { team: true }
                                   }
                              }
                         }
                    },
                    orderBy: {
                         scheduledDate: 'desc'
                    }
               },
               leagueSnapshots: {
                    include: {
                         team: true,
                         season: true
                    },
                    orderBy: {
                         snapshotDate: 'desc'
                    },
                    take: 50
               },
               _count: {
                    select: {
                         campaigns: true,
                         fixtures: true
                    }
               }
          }
     });

     if (session?.user?.id) {
          profile = await prisma.user.findUnique({
               where: {
                    id: session.user.id
               }
          });
     }
     
     prisma.$disconnect();

     return <CompetitionContainer competition={competition} isUserAdmin={profile ? profile.isAdmin : false} />
}

export default CompetitionPage;