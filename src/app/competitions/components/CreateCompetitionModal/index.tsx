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
     Divider
} from "@heroui/react";
import { FaTrophy, FaPlus, FaSort, FaLayerGroup } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface CreateCompetitionModalProps {
     isOpen: boolean;
     onClose: () => void;
     onCompetitionCreated: () => void;
}

const CreateCompetitionModal = ({ isOpen, onClose, onCompetitionCreated }: CreateCompetitionModalProps) => {
     const [formData, setFormData] = useState({
          name: '',
          collection: 'Default League',
          sortOrder: 1
     });
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');
     const router = useRouter();

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          
          if (!formData.name.trim()) {
               setError('Competition name is required');
               return;
          }

          if (formData.sortOrder < 1 || formData.sortOrder > 100) {
               setError('Division level must be between 1 and 100');
               return;
          }

          setLoading(true);
          setError('');

          try {
               const response = await fetch('/api/competitions', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
               });

               const data = await response.json();

               if (response.ok) {
                    onCompetitionCreated();
                    onClose();
                    // Reset form
                    setFormData({
                         name: '',
                         collection: 'Default League',
                         sortOrder: 1
                    });
                    // Navigate to the new competition
                    router.push(`/competitions/${data.id}`);
               } else {
                    setError(data.error || 'Failed to create competition');
               }
          } catch (error) {
               setError('Failed to create competition');
          } finally {
               setLoading(false);
          }
     };

     const handleInputChange = (field: string, value: string | number) => {
          setFormData(prev => ({
               ...prev,
               [field]: value
          }));
     };

     const handleClose = () => {
          setFormData({
               name: '',
               collection: 'Default League',
               sortOrder: 1
          });
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
                                   <FaTrophy className="text-blue-600" size={16} />
                              </div>
                              <h2 className="text-xl font-semibold">Create New Competition</h2>
                         </div>
                    </ModalHeader>
                    <ModalBody>
                         {error && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                                   <p className="text-red-600 text-sm">{error}</p>
                              </div>
                         )}

                         <form onSubmit={handleSubmit} className="space-y-6">
                              {/* Competition Name */}
                              <Input
                                   label="Competition Name"
                                   placeholder="Enter competition name (e.g., Premier League)"
                                   startContent={<FaTrophy className="text-gray-400" />}
                                   value={formData.name}
                                   onChange={(e) => handleInputChange('name', e.target.value)}
                                   isRequired
                                   description="The name of your competition or league"
                              />

                              <Divider />

                              {/* Collection */}
                              <Input
                                   label="League Collection"
                                   placeholder="Enter collection name (e.g., English Football League)"
                                   startContent={<FaLayerGroup className="text-gray-400" />}
                                   value={formData.collection}
                                   onChange={(e) => handleInputChange('collection', e.target.value)}
                                   description="Groups competitions together (e.g., all divisions in a league system)"
                              />

                              {/* Sort Order */}
                              <Input
                                   label="Division Level"
                                   type="number"
                                   placeholder="Enter division level (1 = highest)"
                                   startContent={<FaSort className="text-gray-400" />}
                                   value={formData.sortOrder.toString()}
                                   onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 1)}
                                   min={1}
                                   max={100}
                                   description="1 = Premier League (top), 2 = Championship, 3 = League One, etc."
                              />

                              <Divider />

                              {/* Info Box */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                   <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                                   <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• The competition will be created and added to your league system</li>
                                        <li>• You can then add seasons to organize matches by time period</li>
                                        <li>• Teams and players can be assigned to campaigns within seasons</li>
                                        <li>• The competition will be grouped under "{formData.collection}"</li>
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
                              className="bg-gradient-to-r from-blue-500 to-purple-600"
                         >
                              {loading ? 'Creating...' : 'Create Competition'}
                         </Button>
                    </ModalFooter>
               </ModalContent>
          </Modal>
     );
};

export default CreateCompetitionModal;