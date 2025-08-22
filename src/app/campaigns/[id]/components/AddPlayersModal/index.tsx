'use client'

import { useState, useEffect } from 'react';
import {
     Modal,
     ModalContent,
     ModalHeader,
     ModalBody,
     ModalFooter,
     Button,
     Select,
     SelectItem,
     Switch,
     Avatar,
     Spinner
} from "@heroui/react";
import { FaUser, FaUserShield, FaPlus } from "react-icons/fa";

interface User {
     id: string;
     name: string | null;
     email: string;
     image: string | null;
}

interface AddPlayersModalProps {
     isOpen: boolean;
     onClose: () => void;
     campaignId: string;
     onPlayerAdded: () => void;
}

const AddPlayersModal = ({ isOpen, onClose, campaignId, onPlayerAdded }: AddPlayersModalProps) => {
     const [users, setUsers] = useState<User[]>([]);
     const [selectedUserId, setSelectedUserId] = useState<string>('');
     const [isTeamCaptain, setIsTeamCaptain] = useState(false);
     const [loading, setLoading] = useState(false);
     const [fetchingUsers, setFetchingUsers] = useState(false);
     const [error, setError] = useState('');

     // Fetch available users when modal opens
     useEffect(() => {
          if (isOpen) {
               fetchUsers();
          }
     }, [isOpen]);

     const fetchUsers = async () => {
          setFetchingUsers(true);
          try {
               const response = await fetch('/api/users');
               if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
               }
          } catch (error) {
               console.error('Failed to fetch users:', error);
          } finally {
               setFetchingUsers(false);
          }
     };

     const handleSubmit = async () => {
          if (!selectedUserId) {
               setError('Please select a user');
               return;
          }

          setLoading(true);
          setError('');

          try {
               const response = await fetch(`/api/campaigns/${campaignId}/players`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         userId: selectedUserId,
                         isTeamCaptain
                    }),
               });

               const data = await response.json();

               if (response.ok) {
                    onPlayerAdded();
                    onClose();
                    // Reset form
                    setSelectedUserId('');
                    setIsTeamCaptain(false);
               } else {
                    setError(data.error || 'Failed to add player');
               }
          } catch (error) {
               setError('Failed to add player');
          } finally {
               setLoading(false);
          }
     };

     const handleClose = () => {
          setSelectedUserId('');
          setIsTeamCaptain(false);
          setError('');
          onClose();
     };

     return (
          <Modal
               isOpen={isOpen}
               onClose={handleClose}
               size="lg"
               classNames={{
                    body: "py-6",
                    backdrop: "bg-black/50",
               }}
          >
               <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                         <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                   <FaPlus className="text-blue-600" size={16} />
                              </div>
                              <h2 className="text-xl font-semibold">Add Player to Campaign</h2>
                         </div>
                    </ModalHeader>
                    <ModalBody>
                         {error && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                                   <p className="text-red-600 text-sm">{error}</p>
                              </div>
                         )}

                         <div className="space-y-6">
                              {/* User Selection */}
                              <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select User
                                   </label>
                                   {fetchingUsers ? (
                                        <div className="flex items-center justify-center h-12">
                                             <Spinner size="sm" />
                                        </div>
                                   ) : (
                                        <Select
                                             placeholder="Choose a user to add"
                                             selectedKeys={selectedUserId ? [selectedUserId] : []}
                                             onSelectionChange={(keys) => {
                                                  const selectedKey = Array.from(keys)[0] as string;
                                                  setSelectedUserId(selectedKey || '');
                                             }}
                                             startContent={<FaUser className="text-gray-400" />}
                                             className="w-full"
                                        >
                                             {users.map((user) => (
                                                  <SelectItem
                                                       key={user.id}
                                                       value={user.id}
                                                       startContent={
                                                            <Avatar
                                                                 src={user.image || undefined}
                                                                 name={user.name || user.email}
                                                                 size="sm"
                                                            />
                                                       }
                                                  >
                                                       <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                 {user.name || 'No name'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                 {user.email}
                                                            </span>
                                                       </div>
                                                  </SelectItem>
                                             ))}
                                        </Select>
                                   )}
                              </div>

                              {/* Team Captain Option */}
                              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                   <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                             <FaUserShield className="text-yellow-600" size={16} />
                                        </div>
                                        <div>
                                             <div className="font-medium text-gray-900">Team Captain</div>
                                             <div className="text-sm text-gray-600">
                                                  Mark this player as team captain
                                             </div>
                                        </div>
                                   </div>
                                   <Switch
                                        isSelected={isTeamCaptain}
                                        onValueChange={setIsTeamCaptain}
                                        color="warning"
                                   />
                              </div>

                              {/* Info Box */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                   <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                                   <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• The player will be added to this campaign</li>
                                        <li>• Their initial handicap will be set to 10</li>
                                        <li>• They will be able to participate in matches for this campaign</li>
                                        {isTeamCaptain && <li>• They will be marked as team captain</li>}
                                   </ul>
                              </div>
                         </div>
                    </ModalBody>
                    <ModalFooter>
                         <Button
                              variant="light"
                              onPress={handleClose}
                              isDisabled={loading}
                         >
                              Cancel
                         </Button>
                         <Button
                              color="primary"
                              onPress={handleSubmit}
                              isLoading={loading}
                              startContent={!loading && <FaPlus />}
                              className="bg-gradient-to-r from-blue-500 to-purple-600"
                         >
                              {loading ? 'Adding Player...' : 'Add Player'}
                         </Button>
                    </ModalFooter>
               </ModalContent>
          </Modal>
     );
};

export default AddPlayersModal;