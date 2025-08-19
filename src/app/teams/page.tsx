import prisma from "@/providers/prisma";
import { auth } from "@/auth";
import { Session } from "next-auth";
import { User } from "@/generator/prisma";
import { Button } from "@heroui/react";
import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
import TeamCards from "./components/teamCards";

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
          <div className="max-w-7xl mx-auto p-4">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                         <h1 className="text-3xl font-bold text-gray-900 mb-2">Teams</h1>
                         <p className="text-gray-600">Browse all teams in the league system</p>
                    </div>

                    {profile?.isAdmin && (
                         <Button 
                              as={Link} 
                              href="/teams/create" 
                              color="primary"
                              variant="solid"
                              startContent={<FaPlus size={16} />}
                              className="bg-gradient-to-r from-blue-500 to-purple-600 font-semibold"
                         >
                              Create Team
                         </Button>
                    )}
               </div>

               <TeamCards teams={teams} isAdmin={profile?.isAdmin || false} />
          </div>
     )
}

export default TeamsListPage;