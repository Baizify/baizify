import { auth } from "@/auth"
import LoginProviderList from "@/components/forms/login"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardBody } from "@heroui/react"

export default async function SignIn() {
     const session = await auth()

     if (session) {
          return redirect('/')
     }

     return (
          <>
               <Card className="md:max-w-[50%] md:m-auto" shadow="sm" radius="none">
                    <CardHeader className="">
                         <div className="flex flex-col">
                              <h1 className="text-lg font-bold">Login</h1>
                              <p className="text-sm text-gray-400">Login to view your profile</p>
                         </div>
                    </CardHeader>
                    <hr className="border-gray-200 mx-2" />
                    <CardBody>
                         <LoginProviderList />
                    </CardBody>
               </Card>
          </>
     )
}