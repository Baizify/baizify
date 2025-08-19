import { auth } from "@/auth"
import SignOutForm from "@/components/forms/signout"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardBody } from "@heroui/react"

export default async function SignOut() {
     const session = await auth()

     if (!session) {
          return redirect('/')
     }

     return (
          <>
               <Card className="md:max-w-[50%] md:m-auto" shadow="sm" radius="none">
                    <CardHeader className="">
                         <div className="flex flex-col">
                              <h1 className="text-lg font-bold">Sign Out</h1>
                              <p className="text-sm text-gray-400">Are you sure you want to sign out?</p>
                         </div>
                    </CardHeader>
                    <hr className="border-gray-200 mx-2" />
                    <CardBody>
                         <SignOutForm user={session.user} />
                    </CardBody>
               </Card>
          </>
     )
}