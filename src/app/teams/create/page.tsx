import { auth } from "@/auth";
import { User } from "@/generator/prisma";
import prisma from "@/providers/prisma";
import { Session } from "next-auth";
import { redirect } from "next/navigation";
import CreateTeamForm from "./components/createTeamForm";

const CreateTeamPage = async () => {
     const session: Session | null = await auth();
     let profile: User | null = null;

     if (session?.user?.id) {
          profile = await prisma.user.findUnique({
               where: {
                    id: session?.user?.id
               }
          });
     }

     if (!profile?.isAdmin) {
          return redirect('/access-denied');
     }

     return (
          <div className="max-w-md mx-auto mt-8">
               <h1 className="text-2xl font-bold mb-6">Create New Team</h1>
               <CreateTeamForm />
          </div>
     );
};

export default CreateTeamPage;