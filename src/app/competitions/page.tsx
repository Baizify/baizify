import prisma from "@/providers/prisma";
import CompetitionListTable from "./components/competitionListTable";
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
     const competitions = await prisma.competition.findMany();

     if (session?.user?.id) {
          profile =  await prisma.user.findUnique({
               where: {
                    id: session?.user?.id
               }
          });
     }
     
     return (
          <>
               <div className="flex flex-row justify-between">
                    <div>
                         <h1 className="text-xl font-bold">Competitions</h1>
                         <p className="text-gray-400 text-sm">List of all competitions.</p>
                    </div>

                    {profile?.isAdmin && (
                         <Button as={Link} className="text-right" color="primary" href="/competitions/create" variant="solid">
                              Create <FaPlus />
                         </Button>
                    )}
               </div>


               <CompetitionListTable competitions={competitions} />
          </>
     )
}

export default CompetitionListPage;