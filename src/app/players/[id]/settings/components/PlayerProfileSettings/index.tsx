'use client'

import { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Avatar, Divider, Switch } from "@heroui/react";
import { FaUser, FaEnvelope, FaImage, FaSave, FaUserShield } from "react-icons/fa";
import { User, Account } from "@/generator/prisma";

interface PlayerProfileSettingsProps {
     player: User & {
          accounts: Pick<Account, 'provider' | 'providerAccountId'>[];
          _count: {
               campaigns: number;
          };
     };
     isOwnProfile: boolean;
     isAdmin: boolean;
}

const PlayerProfileSettings = ({ player, isOwnProfile, isAdmin }: PlayerProfileSettingsProps) => {
     const [formData, setFormData] = useState({
          name: player.name || '',
          email: player.email || '',
          isAdmin: player.isAdmin
     });
     const [loading, setLoading] = useState(false);
     const [success, setSuccess] = useState('');
     const [error, setError] = useState('');

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setLoading(true);
          setError('');
          setSuccess('');

          try {
               // Prepare the update data
               const updateData: any = {
                    name: formData.name
               };

               // Only admins can change admin status of other users
               if (isAdmin && !isOwnProfile) {
                    updateData.isAdmin = formData.isAdmin;
               }

               const response = await fetch(`/api/users/${player.id}`, {
                    method: 'PATCH',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
               });

               const data = await response.json();

               if (response.ok) {
                    setSuccess(isOwnProfile ? 'Profile updated successfully!' : 'Player profile updated successfully!');
                    // Refresh the page to update the data
                    setTimeout(() => {
                         window.location.reload();
                    }, 1000);
               } else {
                    setError(data.error || 'Failed to update profile');
               }
          } catch (error) {
               setError('Failed to update profile');
          } finally {
               setLoading(false);
          }
     };

     const handleInputChange = (field: string, value: string | boolean) => {
          setFormData(prev => ({
               ...prev,
               [field]: value
          }));
     };

     return (
          <Card>
               <CardHeader>
                    <div className="flex items-center gap-3">
                         <FaUser className="text-blue-500" size={20} />
                         <h2 className="text-xl font-semibold">Profile Information</h2>
                    </div>
               </CardHeader>
               <CardBody className="space-y-6">
                    {/* Profile Picture Section */}
                    <div className="flex items-center gap-6">
                         <Avatar 
                              src={player.image || undefined}
                              name={player.name || player.email || ''}
                              size="lg"
                              className="ring-4 ring-blue-500/20"
                         />
                         <div>
                              <h3 className="font-semibold text-gray-900">Profile Picture</h3>
                              <p className="text-sm text-gray-600 mb-3">
                                   Profile pictures are managed through Google accounts.
                              </p>
                              <Button
                                   size="sm"
                                   variant="bordered"
                                   startContent={<FaImage />}
                                   as="a"
                                   href="https://myaccount.google.com/profile"
                                   target="_blank"
                              >
                                   Update on Google
                              </Button>
                         </div>
                    </div>

                    <Divider />

                    {/* Profile Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                         {success && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                   <p className="text-green-600 text-sm">{success}</p>
                              </div>
                         )}

                         {error && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                   <p className="text-red-600 text-sm">{error}</p>
                              </div>
                         )}

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                   label="Full Name"
                                   placeholder="Enter full name"
                                   startContent={<FaUser className="text-gray-400" />}
                                   value={formData.name}
                                   onChange={(e) => handleInputChange('name', e.target.value)}
                                   isRequired
                              />

                              <Input
                                   label="Email Address"
                                   placeholder="Enter email"
                                   type="email"
                                   startContent={<FaEnvelope className="text-gray-400" />}
                                   value={formData.email}
                                   onChange={(e) => handleInputChange('email', e.target.value)}
                                   isReadOnly
                                   description="Email cannot be changed. Contact support if needed."
                              />
                         </div>

                         {/* Admin controls - only show if current user is admin and editing someone else */}
                         {isAdmin && !isOwnProfile && (
                              <>
                                   <Divider />
                                   <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Administrative Controls</h3>
                                        
                                        <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                             <div className="flex items-center gap-3">
                                                  <div className="p-2 bg-yellow-100 rounded-lg">
                                                       <FaUserShield className="text-yellow-600" size={16} />
                                                  </div>
                                                  <div>
                                                       <div className="font-medium text-gray-900">Admin Access</div>
                                                       <div className="text-sm text-gray-600">
                                                            Allow this user to manage competitions, teams, and other users
                                                       </div>
                                                  </div>
                                             </div>
                                             <Switch
                                                  isSelected={formData.isAdmin}
                                                  onValueChange={(value) => handleInputChange('isAdmin', value)}
                                                  color="warning"
                                             />
                                        </div>
                                   </div>
                              </>
                         )}

                         <div className="flex justify-end">
                              <Button
                                   type="submit"
                                   color="primary"
                                   isLoading={loading}
                                   startContent={!loading && <FaSave />}
                                   className="bg-gradient-to-r from-blue-500 to-purple-600"
                              >
                                   {loading ? 'Saving...' : 'Save Changes'}
                              </Button>
                         </div>
                    </form>
               </CardBody>
          </Card>
     );
};

export default PlayerProfileSettings;