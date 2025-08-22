'use client'

import { useState } from 'react';
import {
     Modal,
     ModalContent,
     ModalHeader,
     ModalBody,
     ModalFooter,
     Button,
     Input,
     Divider,
     PressEvent
} from "@heroui/react";
import { FaUsers, FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface CreateTeamModalProps {
     isOpen: boolean;
     onClose: () => void;
     onTeamCreated: () => void;
}

const CreateTeamModal = ({ isOpen, onClose, onTeamCreated }: CreateTeamModalProps) => {
     const [teamName, setTeamName] = useState('');
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');
     const router = useRouter();

     const handleSubmit = async (e: PressEvent | React.FormEvent) => {          
          if (!teamName.trim()) {
               setError('Team name is required');
               return;
          }

          if (teamName.length < 2) {
               setError('Team name must be more than 2 characters long');
               return;
          }

          if (teamName.length > 50) {
               setError('Team name must be less than 50 characters long');
               return;
          }

          setLoading(true);
          setError('');

          try {
               const response = await fetch('/api/teams', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: teamName }),
               });

               const data = await response.json();

               if (response.ok) {
                    onTeamCreated();
                    onClose();
                    // Reset form
                    setTeamName('');
                    // Navigate to the new team page
                    router.push(`/teams/${data.id}`);
               } else {
                    setError(data.error || 'Failed to create team');
               }
          } catch (error) {
               setError('Failed to create team');
          } finally {
               setLoading(false);
          }
     };

     const handleClose = () => {
          setTeamName('');
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
                              <div className="p-2 bg-green-100 rounded-lg">
                                   <FaUsers className="text-green-600" size={16} />
                              </div>
                              <h2 className="text-xl font-semibold">Create New Team</h2>
                         </div>
                    </ModalHeader>
                    <ModalBody>
                         {error && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                                   <p className="text-red-600 text-sm">{error}</p>
                              </div>
                         )}

                         <form onSubmit={handleSubmit} className="space-y-6">
                              {/* Team Name */}
                              <Input
                                   label="Team Name"
                                   placeholder="Enter team name"
                                   startContent={<FaUsers className="text-gray-400" />}
                                   value={teamName}
                                   onChange={(e) => setTeamName(e.target.value)}
                                   isRequired
                                   description="The name of your team (2-50 characters)"
                                   autoFocus
                              />

                              <Divider />

                              {/* Info Box */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                   <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                                   <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• The team will be created and added to your system</li>
                                        <li>• You can then add the team to a season - this is a <strong>campaign</strong></li>
                                        <li>• You can then add <strong>players</strong> to a <strong>campaign</strong></li>
                                        <li>• Team statistics and match history will be tracked</li>
                                   </ul>
                              </div>
                         </form>
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
                              className="bg-gradient-to-r from-green-500 to-blue-600"
                         >
                              {loading ? 'Creating...' : 'Create Team'}
                         </Button>
                    </ModalFooter>
               </ModalContent>
          </Modal>
     );
};

export default CreateTeamModal;