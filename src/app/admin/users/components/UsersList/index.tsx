'use client'

import { useState, useEffect } from 'react';
import { 
     Table, 
     TableHeader, 
     TableColumn, 
     TableBody, 
     TableRow, 
     TableCell, 
     Chip,
     Avatar,
     Button,
     Input,
     Spinner
} from "@heroui/react";
import { FaSearch, FaUserShield, FaUser, FaCalendarAlt, FaEnvelope } from "react-icons/fa";
import { formatDistanceToNow } from 'date-fns';

interface User {
     id: string;
     name: string | null;
     email: string;
     image: string | null;
     isAdmin: boolean;
     createdAt: string;
     updatedAt: string;
     emailVerified: string | null;
     _count: {
          campaigns: number;
     };
}

const UsersList = () => {
     const [users, setUsers] = useState<User[]>([]);
     const [loading, setLoading] = useState(true);
     const [search, setSearch] = useState('');

     const fetchUsers = async (searchTerm: string = '') => {
          try {
               const params = new URLSearchParams();
               params.set('admin', 'true');
               if (searchTerm) {
                    params.set('search', searchTerm);
               }
               
               const response = await fetch(`/api/users?${params}`);
               if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
               }
          } catch (error) {
               console.error('Failed to fetch users:', error);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchUsers(search);
     }, [search]);

     const getStatusChip = (user: User) => {
          if (user.isAdmin) {
               return (
                    <Chip
                         size="sm"
                         color="warning"
                         variant="flat"
                         startContent={<FaUserShield size={12} />}
                    >
                         Admin
                    </Chip>
               );
          }
          
          if (user.emailVerified) {
               return (
                    <Chip
                         size="sm"
                         color="success"
                         variant="flat"
                         startContent={<FaEnvelope size={12} />}
                    >
                         Verified
                    </Chip>
               );
          }

          return (
               <Chip
                    size="sm"
                    color="default"
                    variant="flat"
                    startContent={<FaUser size={12} />}
               >
                    Pending
               </Chip>
          );
     };

     if (loading) {
          return (
               <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
               </div>
          );
     }

     return (
          <div className="space-y-4">
               <div className="flex gap-4 mb-6">
                    <Input
                         placeholder="Search users by name or email..."
                         startContent={<FaSearch />}
                         value={search}
                         onChange={(e) => setSearch(e.target.value)}
                         className="flex-1"
                    />
               </div>

               <Table aria-label="Users table">
                    <TableHeader>
                         <TableColumn>USER</TableColumn>
                         <TableColumn>EMAIL</TableColumn>
                         <TableColumn>STATUS</TableColumn>
                         <TableColumn>CAMPAIGNS</TableColumn>
                         <TableColumn>JOINED</TableColumn>
                         <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="No users found">
                         {users.map((user) => (
                              <TableRow key={user.id}>
                                   <TableCell>
                                        <div className="flex items-center gap-3">
                                             <Avatar 
                                                  src={user.image || undefined}
                                                  name={user.name || user.email}
                                                  size="sm"
                                             />
                                             <div>
                                                  <div className="font-semibold">
                                                       {user.name || 'No name'}
                                                  </div>
                                                  <div className="text-xs text-gray-500">
                                                       ID: {user.id.slice(-8)}
                                                  </div>
                                             </div>
                                        </div>
                                   </TableCell>
                                   <TableCell>
                                        <div className="text-sm">
                                             {user.email}
                                        </div>
                                   </TableCell>
                                   <TableCell>
                                        {getStatusChip(user)}
                                   </TableCell>
                                   <TableCell>
                                        <div className="text-center">
                                             {user._count.campaigns}
                                        </div>
                                   </TableCell>
                                   <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                             <FaCalendarAlt size={12} />
                                             {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                        </div>
                                   </TableCell>
                                   <TableCell>
                                        <Button
                                             size="sm"
                                             variant="light"
                                             as="a"
                                             href={`/players/${user.id}`}
                                        >
                                             View
                                        </Button>
                                   </TableCell>
                              </TableRow>
                         ))}
                    </TableBody>
               </Table>
          </div>
     );
};

export default UsersList;