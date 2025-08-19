'use client'

import { useState } from 'react';
import { Card, CardBody, Input, Button, Switch, Divider } from "@heroui/react";
import { FaUser, FaEnvelope, FaUserShield } from "react-icons/fa";
import { useRouter } from 'next/navigation';

const CreateUserForm = () => {
     const [formData, setFormData] = useState({
          name: '',
          email: '',
          isAdmin: false
     });
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');
     const router = useRouter();

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setLoading(true);
          setError('');

          try {
               const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
               });

               const data = await response.json();

               if (response.ok) {
                    router.push('/admin/users');
               } else {
                    setError(data.error || 'Failed to create user');
               }
          } catch (error) {
               setError('Failed to create user');
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
               <CardBody className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                         {error && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                   <p className="text-red-600 text-sm">{error}</p>
                              </div>
                         )}

                         <div className="space-y-4">
                              <Input
                                   label="Full Name"
                                   placeholder="Enter user's full name"
                                   startContent={<FaUser className="text-gray-400" />}
                                   value={formData.name}
                                   onChange={(e) => handleInputChange('name', e.target.value)}
                                   isRequired
                              />

                              <Input
                                   label="Email Address"
                                   placeholder="Enter user's email address"
                                   type="email"
                                   startContent={<FaEnvelope className="text-gray-400" />}
                                   value={formData.email}
                                   onChange={(e) => handleInputChange('email', e.target.value)}
                                   isRequired
                              />
                         </div>

                         <Divider />

                         <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
                              
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

                         <Divider />

                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                              <ul className="text-sm text-blue-800 space-y-1">
                                   <li>• The user will be created with the provided information</li>
                                   <li>• They can log in using their email address through Google authentication</li>
                                   <li>• Their email will be verified when they first sign in</li>
                                   <li>• You can assign them to teams and competitions immediately</li>
                              </ul>
                         </div>

                         <div className="flex gap-3">
                              <Button
                                   type="button"
                                   variant="light"
                                   onPress={() => router.back()}
                                   className="flex-1"
                              >
                                   Cancel
                              </Button>
                              <Button
                                   type="submit"
                                   color="primary"
                                   isLoading={loading}
                                   className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                              >
                                   {loading ? 'Creating...' : 'Create User'}
                              </Button>
                         </div>
                    </form>
               </CardBody>
          </Card>
     );
};

export default CreateUserForm;