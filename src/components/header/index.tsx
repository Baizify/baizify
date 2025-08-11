import { auth } from "@/auth";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Avatar, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip } from "@heroui/react";
import { Session } from "next-auth";
import { FaChevronRight, FaTrophy, FaUsers, FaUser, FaCog, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import { FaBolt } from "react-icons/fa6";

const Logo = () => {
     return (
          <div className="flex items-center gap-2">
               <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                         <FaBolt className="text-white text-xl" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"></div>
               </div>
               <div className="flex flex-col">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                         ODSL
                    </span>
                    <span className="text-xs text-gray-500 -mt-1">League System</span>
               </div>
          </div>
     )
}

export default async function Header() {
     const session: Session | null = await auth();

     return (
          <Navbar 
               className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm" 
               maxWidth="full"
               height="4rem"
          >
               {/* Mobile Menu Toggle */}
               <NavbarContent>
                    <NavbarMenuToggle className="sm:hidden text-gray-700" />
                    <NavbarBrand>
                         <Link href="/" className="flex">
                              <Logo />
                         </Link>
                    </NavbarBrand>
               </NavbarContent>

               {/* Desktop Navigation */}
               <NavbarContent className="hidden sm:flex gap-8" justify="center">
                    <NavbarItem>
                         <Link 
                              href="/competitions"
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                         >
                              <FaTrophy size={16} />
                              Competitions
                         </Link>
                    </NavbarItem>
                    <NavbarItem>
                         <Link 
                              href="/teams"
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                         >
                              <FaUsers size={16} />
                              Teams
                         </Link>
                    </NavbarItem>
               </NavbarContent>

               {/* User Section */}
               <NavbarContent justify="end">
                    {session?.user ? (
                         <Dropdown placement="bottom-end">
                              <DropdownTrigger>
                                   <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
                                        <Avatar 
                                             src={session.user.image || undefined} 
                                             name={session.user.name || session.user.email || ''} 
                                             size="sm"
                                             className="ring-2 ring-blue-500/20"
                                        />
                                        <div className="hidden md:flex flex-col items-start">
                                             <span className="text-sm font-semibold text-gray-800">
                                                  {session.user.name || 'Player'}
                                             </span>
                                             <span className="text-xs text-gray-500">
                                                  {session.user.email}
                                             </span>
                                        </div>
                                        <FaChevronDown className="text-gray-400 text-xs hidden md:block" />
                                   </div>
                              </DropdownTrigger>
                              <DropdownMenu 
                                   aria-label="User Actions"
                                   className="w-60"
                              >
                                   <DropdownItem 
                                        key="profile"
                                        startContent={<FaUser className="text-gray-500" />}
                                        as={Link}
                                        href={`/players/${session.user.id}`}
                                   >
                                        <div className="flex flex-col">
                                             <span>View Profile</span>
                                             <span className="text-xs text-gray-500">See your statistics and achievements</span>
                                        </div>
                                   </DropdownItem>
                                   <DropdownItem 
                                        key="settings"
                                        startContent={<FaCog className="text-gray-500" />}
                                        as={Link}
                                        href="/settings"
                                   >
                                        <div className="flex flex-col">
                                             <span>Settings</span>
                                             <span className="text-xs text-gray-500">Manage your account</span>
                                        </div>
                                   </DropdownItem>
                                   <DropdownItem 
                                        key="logout"
                                        className="text-danger"
                                        color="danger"
                                        startContent={<FaSignOutAlt className="text-danger" />}
                                        as={Link}
                                        href="/auth/signout"
                                   >
                                        Sign Out
                                   </DropdownItem>
                              </DropdownMenu>
                         </Dropdown>
                    ) : (
                         <div className="flex items-center gap-2">
                              <Button 
                                   as={Link} 
                                   href="/auth/signin"
                                   variant="light"
                                   className="text-gray-600 font-medium"
                              >
                                   Sign In
                              </Button>
                              <Button 
                                   as={Link} 
                                   href="/auth/signup"
                                   className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                              >
                                   Get Started
                              </Button>
                         </div>
                    )}
               </NavbarContent>

               {/* Mobile Menu */}
               <NavbarMenu className="bg-white/95 backdrop-blur-md mt-2">
                    <NavbarMenuItem>
                         <Link 
                              href="/competitions"
                              className="flex items-center justify-between w-full py-4 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                         >
                              <div className="flex items-center gap-3">
                                   <FaTrophy className="text-blue-500" />
                                   <span className="font-medium">Competitions</span>
                              </div>
                              <FaChevronRight className="text-gray-400" />
                         </Link>
                    </NavbarMenuItem>
                    <NavbarMenuItem>
                         <Link 
                              href="/teams"
                              className="flex items-center justify-between w-full py-4 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                         >
                              <div className="flex items-center gap-3">
                                   <FaUsers className="text-blue-500" />
                                   <span className="font-medium">Teams</span>
                              </div>
                              <FaChevronRight className="text-gray-400" />
                         </Link>
                    </NavbarMenuItem>
                    {session?.user && (
                         <>
                              <NavbarMenuItem className="border-t border-gray-200 mt-4 pt-4">
                                   <Link 
                                        href={`/players/${session.user.id}`}
                                        className="flex items-center justify-between w-full py-4 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                   >
                                        <div className="flex items-center gap-3">
                                             <FaUser className="text-blue-500" />
                                             <span className="font-medium">Profile</span>
                                        </div>
                                        <FaChevronRight className="text-gray-400" />
                                   </Link>
                              </NavbarMenuItem>
                              <NavbarMenuItem>
                                   <Link 
                                        href="/settings"
                                        className="flex items-center justify-between w-full py-4 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                   >
                                        <div className="flex items-center gap-3">
                                             <FaCog className="text-blue-500" />
                                             <span className="font-medium">Settings</span>
                                        </div>
                                        <FaChevronRight className="text-gray-400" />
                                   </Link>
                              </NavbarMenuItem>
                              <NavbarMenuItem>
                                   <Link 
                                        href="/auth/signout"
                                        className="flex items-center justify-between w-full py-4 px-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                   >
                                        <div className="flex items-center gap-3">
                                             <FaSignOutAlt className="text-red-500" />
                                             <span className="font-medium">Sign Out</span>
                                        </div>
                                        <FaChevronRight className="text-gray-400" />
                                   </Link>
                              </NavbarMenuItem>
                         </>
                    )}
               </NavbarMenu>
          </Navbar>
     );
}
