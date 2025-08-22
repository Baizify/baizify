'use client'

import { useState, useEffect } from 'react';
import { Card, CardBody, Avatar, Button, Spinner } from "@heroui/react";
import { FaBullhorn, FaCalendarAlt, FaPlus } from "react-icons/fa";
import { formatDistanceToNow } from 'date-fns';
import CreateBulletinModal from "../CreateBulletinModal";

interface Bulletin {
     id: string;
     title: string;
     description: string;
     createdAt: string;
     updatedAt: string;
     user: {
          id: string;
          name: string | null;
          email: string;
          image: string | null;
     };
}

interface BulletinsListProps {
     isAdmin: boolean;
}

const BulletinsList = ({ isAdmin }: BulletinsListProps) => {
     const [bulletins, setBulletins] = useState<Bulletin[]>([]);
     const [loading, setLoading] = useState(true);
     const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

     const fetchBulletins = async () => {
          try {
               const response = await fetch('/api/bulletins');
               if (response.ok) {
                    const data = await response.json();
                    setBulletins(data);
               }
          } catch (error) {
               console.error('Failed to fetch bulletins:', error);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchBulletins();
     }, []);

     const handleBulletinCreated = () => {
          fetchBulletins(); // Refresh the bulletins list
     };

     if (loading) {
          return (
               <div className="flex justify-center items-center h-32">
                    <Spinner size="lg" />
               </div>
          );
     }

     return (
          <div className="space-y-6">
               <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-orange-100 rounded-lg">
                              <FaBullhorn className="text-orange-600" size={20} />
                         </div>
                         <div>
                              <h2 className="text-2xl font-bold text-gray-900">League News</h2>
                              <p className="text-gray-600">Latest updates and announcements</p>
                         </div>
                    </div>

                    {isAdmin && (
                         <Button 
                              onPress={() => setIsCreateModalOpen(true)}
                              color="primary"
                              variant="solid"
                              startContent={<FaPlus size={16} />}
                              className="bg-gradient-to-r from-orange-500 to-red-600 font-semibold"
                         >
                              New Bulletin
                         </Button>
                    )}
               </div>

               {bulletins.length === 0 ? (
                    <Card>
                         <CardBody className="text-center py-8">
                              <FaBullhorn size={48} className="mx-auto mb-4 text-gray-400" />
                              <h3 className="text-lg font-semibold text-gray-600 mb-2">No news bulletins yet</h3>
                              <p className="text-gray-500">
                                   {isAdmin 
                                        ? 'Create your first bulletin to share news with the league'
                                        : 'Bulletins will appear here when published'
                                   }
                              </p>
                         </CardBody>
                    </Card>
               ) : (
                    <div className="space-y-4">
                         {bulletins.map((bulletin) => (
                              <Card key={bulletin.id} className="border-l-4 border-l-orange-500">
                                   <CardBody className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                             <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                                  {bulletin.title}
                                             </h3>
                                        </div>
                                        
                                        <p className="text-gray-700 mb-4 leading-relaxed">
                                             {bulletin.description}
                                        </p>
                                        
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-gray-100">
                                             <div className="flex items-center gap-3">
                                                  <Avatar
                                                       src={bulletin.user.image || undefined}
                                                       name={bulletin.user.name || bulletin.user.email}
                                                       size="sm"
                                                  />
                                                  <div>
                                                       <div className="font-medium text-gray-900 text-sm">
                                                            {bulletin.user.name || 'Administrator'}
                                                       </div>
                                                       <div className="text-xs text-gray-500">
                                                            {bulletin.user.email}
                                                       </div>
                                                  </div>
                                             </div>
                                             
                                             <div className="flex items-center gap-1 mt-5 md:mt-0 text-gray-500">
                                                  <FaCalendarAlt size={12} />
                                                  <span>
                                                       {formatDistanceToNow(new Date(bulletin.createdAt), { addSuffix: true })}
                                                  </span>
                                             </div>
                                        </div>
                                   </CardBody>
                              </Card>
                         ))}
                    </div>
               )}

               <CreateBulletinModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onBulletinCreated={handleBulletinCreated}
               />
          </div>
     );
};

export default BulletinsList;