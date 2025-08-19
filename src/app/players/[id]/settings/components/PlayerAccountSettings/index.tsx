'use client'

import { Card, CardBody, CardHeader, Chip, Button, Divider } from "@heroui/react";
import { FaCog, FaGoogle, FaShieldAlt, FaCalendarAlt, FaTrophy, FaSignOutAlt, FaTrashAlt, FaUser } from "react-icons/fa";
import { User, Account } from "@/generator/prisma";
import { format } from 'date-fns';
import Link from "next/link";
import { signOut } from "next-auth/react";

interface PlayerAccountSettingsProps {
     player: User & {
          accounts: Pick<Account, 'provider' | 'providerAccountId'>[];
          _count: {
               campaigns: number;
          };
     };
     isOwnProfile: boolean;
     isAdmin: boolean;
}

const PlayerAccountSettings = ({ player, isOwnProfile, isAdmin }: PlayerAccountSettingsProps) => {
     const handleSignOut = () => {
          signOut({ callbackUrl: '/' });
     };

     const getProviderIcon = (provider: string) => {
          switch (provider.toLowerCase()) {
               case 'google':
                    return <FaGoogle />;
               default:
                    return <FaShieldAlt />;
          }
     };

     return (
          <Card>
               <CardHeader>
                    <div className="flex items-center gap-3">
                         <FaCog className="text-purple-500" size={20} />
                         <h2 className="text-xl font-semibold">
                              {isOwnProfile ? 'Account Settings' : 'Player Account Information'}
                         </h2>
                    </div>
               </CardHeader>
               <CardBody className="space-y-6">
                    {/* Account Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <FaCalendarAlt className="mx-auto mb-2 text-blue-600" size={20} />
                              <div className="text-sm font-medium text-blue-800">Member Since</div>
                              <div className="text-xs text-blue-600">
                                   {format(new Date(player.createdAt), 'MMM dd, yyyy')}
                              </div>
                         </div>

                         <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                              <FaTrophy className="mx-auto mb-2 text-green-600" size={20} />
                              <div className="text-sm font-medium text-green-800">Active Campaigns</div>
                              <div className="text-lg font-bold text-green-900">{player._count.campaigns}</div>
                         </div>

                         <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                              <FaShieldAlt className="mx-auto mb-2 text-yellow-600" size={20} />
                              <div className="text-sm font-medium text-yellow-800">Account Type</div>
                              <div className="text-xs">
                                   <Chip
                                        size="sm"
                                        color={player.isAdmin ? "warning" : "primary"}
                                        variant="flat"
                                   >
                                        {player.isAdmin ? "Administrator" : "Player"}
                                   </Chip>
                              </div>
                         </div>
                    </div>

                    <Divider />

                    {/* Connected Accounts */}
                    <div>
                         <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h3>
                         <div className="space-y-3">
                              {player.accounts.map((account, index) => (
                                   <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                             <div className="p-2 bg-white rounded-full shadow-sm">
                                                  {getProviderIcon(account.provider)}
                                             </div>
                                             <div>
                                                  <div className="font-medium capitalize">{account.provider}</div>
                                                  <div className="text-sm text-gray-600">
                                                       Connected • ID: {account.providerAccountId.slice(-8)}
                                                  </div>
                                             </div>
                                        </div>
                                        <Chip size="sm" color="success" variant="flat">
                                             Active
                                        </Chip>
                                   </div>
                              ))}
                              
                              {player.accounts.length === 0 && (
                                   <div className="text-center py-6 text-gray-500">
                                        <FaShieldAlt className="mx-auto mb-2" size={24} />
                                        <p>No connected accounts found</p>
                                        <p className="text-xs mt-1">This player was created by an administrator</p>
                                   </div>
                              )}
                         </div>
                    </div>

                    <Divider />

                    {/* Account Actions */}
                    <div>
                         <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              {isOwnProfile ? 'Account Actions' : 'Player Actions'}
                         </h3>
                         <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                   <div>
                                        <h4 className="font-medium text-blue-800">View Public Profile</h4>
                                        <p className="text-sm text-blue-600">
                                             View how this profile appears to other users
                                        </p>
                                   </div>
                                   <Button
                                        color="primary"
                                        variant="bordered"
                                        startContent={<FaUser />}
                                        as={Link}
                                        href={`/players/${player.id}`}
                                   >
                                        View Profile
                                   </Button>
                              </div>

                              {isOwnProfile && (
                                   <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div>
                                             <h4 className="font-medium text-yellow-800">Sign Out</h4>
                                             <p className="text-sm text-yellow-600">
                                                  Sign out of your account on this device
                                             </p>
                                        </div>
                                        <Button
                                             color="warning"
                                             variant="bordered"
                                             startContent={<FaSignOutAlt />}
                                             as={Link}
                                             href="/auth/signout"
                                        >
                                             Sign Out
                                        </Button>
                                   </div>
                              )}

                              {isAdmin && (
                                   <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div>
                                             <h4 className="font-medium text-red-800">
                                                  {isOwnProfile ? 'Delete Account' : 'Delete Player Account'}
                                             </h4>
                                             <p className="text-sm text-red-600">
                                                  Permanently delete this account and all associated data
                                             </p>
                                        </div>
                                        <Button
                                             color="danger"
                                             variant="bordered"
                                             startContent={<FaTrashAlt />}
                                             isDisabled
                                        >
                                             Delete Account
                                        </Button>
                                   </div>
                              )}
                         </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                         <h4 className="font-medium text-blue-900 mb-2">Need help?</h4>
                         <p className="text-sm text-blue-800">
                              {isOwnProfile 
                                   ? 'If you need assistance with your account or have questions about your data, please contact the league administrator.'
                                   : 'Administrative actions for this player account. Contact technical support for advanced operations.'
                              }
                         </p>
                    </div>
               </CardBody>
          </Card>
     );
};

export default PlayerAccountSettings;