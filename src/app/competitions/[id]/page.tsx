import prisma from "@/providers/prisma"
import { Tab, Tabs } from "@heroui/react"
import CompetitionContainer from "./components/competitionContainer"

const CompetitionPage = async ({
     params
}: {
     params: {
          id: string
     }
}) => {
     const competition = await prisma.competition.findFirst({
          where: { 
               id: params.id 
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
                         leagueCampaign: true
                    }
               }
          }
     });
     
     prisma.$disconnect();

     return <CompetitionContainer competition={competition}/>
}

export default CompetitionPage;