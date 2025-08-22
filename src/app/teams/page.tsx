import prisma from "@/providers/prisma";
import { auth } from "@/auth";
import { Session } from "next-auth";
import { User } from "@/generator/prisma";
import TeamsPageClient from "./components/TeamsPageClient";

/**
 * The teams list page.
 * @returns The teams list page.
 */
const TeamsListPage = async (): Promise<React.ReactElement> => {
     const session: Session | null = await auth();
     let profile: User | null = null;
     
     const teams = await prisma.team.findMany({
          orderBy: {
               name: 'asc'
          }
     });

     if (session?.user?.id) {
          profile = await prisma.user.findUnique({
               where: {
                    id: session?.user?.id
               }
          });
     }
     
     await prisma.$disconnect();

     return (
          <TeamsPageClient 
               teams={teams} 
               isAdmin={profile?.isAdmin || false} 
          />
     )
}

export default TeamsListPage;