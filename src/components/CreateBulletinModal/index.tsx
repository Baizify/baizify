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
     Textarea,
     Divider,
     PressEvent
} from "@heroui/react";
import { FaBullhorn, FaPlus, FaNewspaper } from "react-icons/fa";

interface CreateBulletinModalProps {
     isOpen: boolean;
     onClose: () => void;
     onBulletinCreated: () => void;
}

const CreateBulletinModal = ({ isOpen, onClose, onBulletinCreated }: CreateBulletinModalProps) => {
     const [formData, setFormData] = useState({
          title: '',
          description: ''
     });
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');

     const handleSubmit = async (e: React.FormEvent | PressEvent) => {
          
          if (!formData.title.trim()) {
               setError('Title is required');
               return;
          }

          if (!formData.description.trim()) {
               setError('Description is required');
               return;
          }

          if (formData.title.length > 100) {
               setError('Title must be less than 100 characters');
               return;
          }

          if (formData.description.length > 1000) {
               setError('Description must be less than 1000 characters');
               return;
          }

          setLoading(true);
          setError('');

          try {
               const response = await fetch('/api/bulletins', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
               });

               const data = await response.json();

               if (response.ok) {
                    onBulletinCreated();
                    onClose();
                    // Reset form
                    setFormData({
                         title: '',
                         description: ''
                    });
               } else {
                    setError(data.error || 'Failed to create bulletin');
               }
          } catch (error) {
               setError('Failed to create bulletin');
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

     const handleClose = () => {
          setFormData({
               title: '',
               description: ''
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
                              <div className="p-2 bg-orange-100 rounded-lg">
                                   <FaBullhorn className="text-orange-600" size={16} />
                              </div>
                              <h2 className="text-xl font-semibold">Create News Bulletin</h2>
                         </div>
                    </ModalHeader>
                    <ModalBody>
                         {error && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                                   <p className="text-red-600 text-sm">{error}</p>
                              </div>
                         )}

                         <form onSubmit={handleSubmit} className="space-y-6">
                              {/* Title */}
                              <Input
                                   label="Bulletin Title"
                                   placeholder="Enter a catchy title for your news"
                                   startContent={<FaNewspaper className="text-gray-400" />}
                                   value={formData.title}
                                   onChange={(e) => handleInputChange('title', e.target.value)}
                                   isRequired
                                   description={`${formData.title.length}/100 characters`}
                                   autoFocus
                              />

                              {/* Description */}
                              <Textarea
                                   label="Description"
                                   placeholder="Write your bulletin content here. Share updates, announcements, or news with the league..."
                                   value={formData.description}
                                   onChange={(e) => handleInputChange('description', e.target.value)}
                                   isRequired
                                   minRows={4}
                                   maxRows={8}
                                   description={`${formData.description.length}/1000 characters`}
                              />

                              <Divider />

                              {/* Info Box */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                   <h4 className="font-medium text-blue-900 mb-2">Publishing Information</h4>
                                   <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• This bulletin will appear on the home page for all users</li>
                                        <li>• Recent bulletins are shown first</li>
                                        <li>• Your name will be displayed as the author</li>
                                        <li>• Keep content relevant and appropriate for all league members</li>
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
                              className="bg-gradient-to-r from-orange-500 to-red-600"
                         >
                              {loading ? 'Publishing...' : 'Publish Bulletin'}
                         </Button>
                    </ModalFooter>
               </ModalContent>
          </Modal>
     );
};

export default CreateBulletinModal;