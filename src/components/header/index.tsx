import { auth } from "@/auth";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Avatar } from "@heroui/react";
import { Session } from "next-auth";

const Logo = () => {
     return (
          <svg width="100" height="50" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">

               <polygon points="30,60 36,63 170,40 168,36" fill="#ffffff" />

               <text x="50%" y="65" text-anchor="middle" font-family="Arial, sans-serif"
                    font-size="40" font-weight="bold" fill="#ffffff">
                    ODSL
               </text>
               </svg>

     )
}

export default async function Header() {
     const session: Session | null = await auth();

     return (
          <Navbar className="bg-teal-700 text-white">
               <NavbarBrand>
                    <Logo />
               </NavbarBrand>
               <NavbarContent className="hidden sm:flex gap-4" justify="center">
                    <NavbarItem>
                         <Link className="text-white" href="/competitions">
                              Competitions
                         </Link>
                    </NavbarItem>
               </NavbarContent>
               <NavbarContent justify="end">
                    {session?.user ?
                         (
                              <>
                                   <Avatar src={session.user.image!} name={session.user.name!} />
                              </>
                         )
                    : (
                         <>
                              <NavbarItem>
                                   <Button as={Link} color="primary" href="/auth/signin" variant="flat">
                                        Login
                                   </Button>
                              </NavbarItem>
                         </>)}
               </NavbarContent>
          </Navbar>
     );
}
