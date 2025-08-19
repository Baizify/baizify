'use client'

import { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Avatar, Divider } from "@heroui/react";
import { FaUser, FaEnvelope, FaImage, FaSave } from "react-icons/fa";
import { User } from "@/generator/prisma";

interface ProfileSettingsProps {
     user: User & {
          _count: {
               campaigns: number;
          };
     };
}

const ProfileSettings = ({ user }: ProfileSettingsProps) => {
     const [formData, setFormData] = useState({
          name: user.name || '',
          email: user.email || ''
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
               const response = await fetch(`/api/users/${user.id}`, {
                    method: 'PATCH',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         name: formData.name,
                         email: formData.email
                    }),
               });

               const data = await response.json();

               if (response.ok) {
                    setSuccess('Profile updated successfully!');
                    // Refresh the page to update the session data
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

     const handleInputChange = (field: string, value: string) => {
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
                              src={user.image || undefined}
                              name={user.name || user.email || ''}
                              size="lg"
                              className="ring-4 ring-blue-500/20"
                         />
                         <div>
                              <h3 className="font-semibold text-gray-900">Profile Picture</h3>
                              <p className="text-sm text-gray-600 mb-3">
                                   Your profile picture is managed through your Google account.
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
                                   placeholder="Enter your full name"
                                   startContent={<FaUser className="text-gray-400" />}
                                   value={formData.name}
                                   onChange={(e) => handleInputChange('name', e.target.value)}
                              />

                              <Input
                                   label="Email Address"
                                   placeholder="Enter your email"
                                   type="email"
                                   startContent={<FaEnvelope className="text-gray-400" />}
                                   value={formData.email}
                                   onChange={(e) => handleInputChange('email', e.target.value)}
                                   isReadOnly
                                   description="Email cannot be changed. Contact support if needed."
                              />
                         </div>

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

export default ProfileSettings;