import { Team } from "@/generator/prisma";
import prisma from "@/providers/prisma";
import TeamContainer from "./components/teamContainer";

const TeamPage = async ({
     params: {
          id
     }
}: {
     params: {
          id: string
     }
}) => {
     const team: Team | null = await prisma.team.findUnique({
          where: {
               id
          }
     });

     if (!team) {
          return <div>Team not found</div>;
     }

     await prisma.$disconnect();

     return <TeamContainer team={team} />;
}

export default TeamPage;