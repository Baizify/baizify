import { auth } from "@/auth";
import { User } from "@/generator/prisma";
import prisma from "@/providers/prisma";
import { Session } from "next-auth";
import { redirect } from "next/navigation";
import CreateCompetitionForm from "./components/createCompetitionForm";

/**
 * Defines the create competition page.
 * @returns The create competition page.
 */
const CreateCompetitionPage = async () => {
     const session: Session | null = await auth();
     let profile: User | null = null;

     if (session?.user?.id) {
          profile =  await prisma.user.findUnique({
               where: {
                    id: session?.user?.id
               }
          });
     }

     if (!profile?.isAdmin) {
          return redirect('/access-denied')
     }
     
     return (
          <>
               <CreateCompetitionForm />
          </>
     )
}

export default CreateCompetitionPage;