import { auth } from "@/auth";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Avatar, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@heroui/react";
import { Session } from "next-auth";
import { FaChevronRight } from "react-icons/fa6";

const Logo = () => {
     return (
          <svg width="100" height="50" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">

               <polygon points="30,60 36,63 170,40 168,36" fill="#ffffff" />

               <text x="50%" y="65" textAnchor="middle" fontFamily="Arial, sans-serif"
                    fontSize="40" fontWeight="bold" fill="#ffffff">
                    ODSL
               </text>
          </svg>

     )
}

export default async function Header() {
     const session: Session | null = await auth();

     return (
          <Navbar className="bg-teal-700 text-white">
               <NavbarContent>
                    <NavbarMenuToggle className="sm:hidden" />
                    <NavbarBrand>
                         <Logo />
                    </NavbarBrand>
               </NavbarContent>
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
                                   <Button as={Link} className="text-white" color="default" href="/auth/signin" variant="light">
                                        Login
                                   </Button>
                              </NavbarItem>
                         </>)}
               </NavbarContent>
               <NavbarMenu>
                    <NavbarMenuItem>
                         <Link className="text-black text-lg py-2 flex flex-row justify-between items-center" href="/competitions">
                              <span>Competitions</span>
                              <FaChevronRight size={26} />
                         </Link>
                    </NavbarMenuItem>
               </NavbarMenu>
          </Navbar>
     );
}
