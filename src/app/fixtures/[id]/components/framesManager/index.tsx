'use client'

import { User } from "@/generator/prisma";
import { 
     Button, 
     Table, 
     TableHeader, 
     TableColumn, 
     TableBody, 
     TableRow, 
     TableCell,
     Modal,
     ModalContent,
     ModalHeader,
     ModalBody,
     ModalFooter,
     useDisclosure,
     Select,
     SelectItem,
     Input,
     Avatar,
     Chip
} from "@heroui/react";
import { useState, useEffect } from "react";
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaEdit, FaTrash, FaTrophy } from "react-icons/fa";

interface CampaignPlayerWithUser {
     id: string;
     campaignId: string;
     userId: string;
     user: User;
     createdAt: string;
     handicaps: Array<{
          id: string;
          value: number;
          createdAt: string;
     }>;
}

interface FrameWithPlayers {
     id: string;
     fixtureId: string;
     frameNumber: number;
     homePlayerId?: string;
     homePlayerHandicapId?: string;
     awayPlayerId?: string;
     awayPlayerHandicapId?: string;
     homeScore: number;
     awayScore: number;
     winnerId?: string;
     status: string;
     notes?: string;
     homePlayer?: CampaignPlayerWithUser;
     awayPlayer?: CampaignPlayerWithUser;
     winner?: CampaignPlayerWithUser;
     homePlayerHandicap?: {
          id: string;
          value: number;
          createdAt: string;
     };
     awayPlayerHandicap?: {
          id: string;
          value: number;
          createdAt: string;
     };
     createdAt: string;
     updatedAt?: string;
}

interface FrameFormValues {
     frameNumber: number;
     homePlayerId: string;
     homePlayerHandicapId: string;
     awayPlayerId: string;
     awayPlayerHandicapId: string;
     homeScore: number;
     awayScore: number;
     status: string;
     notes: string;
}

const FramesManager = ({
     fixture,
     isUserAdmin
}: {
     fixture: any;
     isUserAdmin: boolean;
}) => {
     const [frames, setFrames] = useState<FrameWithPlayers[]>([]);
     const [loading, setLoading] = useState(true);
     const [editingFrame, setEditingFrame] = useState<FrameWithPlayers | null>(null);
     const { isOpen, onOpen, onClose } = useDisclosure();
     const [isSubmitting, setIsSubmitting] = useState(false);

     const homePlayers = fixture.homeCampaign?.players || [];
     const awayPlayers = fixture.awayCampaign?.players || [];
     const allPlayers = [...homePlayers, ...awayPlayers];

     const fetchFrames = async () => {
          try {
               const response = await fetch(`/api/fixtures/${fixture.id}/frames`);
               if (response.ok) {
                    const data = await response.json();
                    setFrames(data);
               }
          } catch (error) {
               console.error('Error fetching frames:', error);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          if (fixture.frames) {
               setFrames(fixture.frames);
               setLoading(false);
          } else {
               fetchFrames();
          }
     }, [fixture]);

     const handleSubmitForm = async (values: FrameFormValues, { resetForm }: FormikHelpers<FrameFormValues>) => {
          setIsSubmitting(true);

          try {
               const url = editingFrame 
                    ? `/api/frames/${editingFrame.id}` 
                    : `/api/fixtures/${fixture.id}/frames`;
               const method = editingFrame ? 'PUT' : 'POST';
               
               const response = await fetch(url, {
                    method,
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         ...values,
                         homePlayerId: values.homePlayerId || null,
                         homePlayerHandicapId: values.homePlayerHandicapId || null,
                         awayPlayerId: values.awayPlayerId || null,
                         awayPlayerHandicapId: values.awayPlayerHandicapId || null,
                         winnerId: values.status === 'completed' ? 
                              determineWinner(
                                   values.homeScore, 
                                   values.awayScore, 
                                   values.homePlayerId, 
                                   values.awayPlayerId
                              ) : null,
                         notes: values.notes || null
                    })
               });

               if (response.ok) {
                    await fetchFrames();
                    resetForm();
                    handleCloseModal();
               }
          } catch (error) {
               console.error('Error saving frame:', error);
          } finally {
               setIsSubmitting(false);
          }
     };

     const handleDeleteFrame = async (frameId: string) => {
          if (confirm('Are you sure you want to delete this frame?')) {
               try {
                    const response = await fetch(`/api/frames/${frameId}`, {
                         method: 'DELETE'
                    });

                    if (response.ok) {
                         await fetchFrames();
                    }
               } catch (error) {
                    console.error('Error deleting frame:', error);
               }
          }
     };

     const handleOpenModal = (frame?: FrameWithPlayers) => {
          setEditingFrame(frame || null);
          onOpen();
     };

     const handleCloseModal = () => {
          setEditingFrame(null);
          onClose();
     };

     const validationSchema = Yup.object().shape({
          frameNumber: Yup.number()
               .min(1, 'Frame number must be at least 1')
               .required('Frame number is required'),
          homePlayerId: Yup.string(),
          homePlayerHandicapId: Yup.string(),
          awayPlayerId: Yup.string(),
          awayPlayerHandicapId: Yup.string(),
          homeScore: Yup.number().min(0, 'Score must be 0 or greater').required('Home score is required'),
          awayScore: Yup.number().min(0, 'Score must be 0 or greater').required('Away score is required'),
          status: Yup.string().required('Status is required'),
          notes: Yup.string()
     });

     const getStatusColor = (status: string) => {
          switch (status) {
               case 'completed': return 'success';
               case 'in_progress': return 'warning';
               default: return 'default';
          }
     };

     const getNextFrameNumber = () => {
          return frames.length > 0 ? Math.max(...frames.map(f => f.frameNumber)) + 1 : 1;
     };

     const getLatestHandicapId = (playerId: string, players: CampaignPlayerWithUser[]) => {
          const player = players.find(p => p.id === playerId);
          return player?.handicaps?.[0]?.id || '';
     };

     const determineWinner = (homeScore: number, awayScore: number, homePlayerId: string, awayPlayerId: string) => {
          if (homeScore > awayScore) {
               return homePlayerId;
          } else if (awayScore > homeScore) {
               return awayPlayerId;
          }
          return null; // Tie or no clear winner
     };

     return (
          <>
               <div className="p-4">
                    {isUserAdmin && (
                         <div className="mb-4">
                              <Button 
                                   color="primary" 
                                   variant="solid"
                                   startContent={<FaPlus />}
                                   onPress={() => handleOpenModal()}
                              >
                                   Add Frame
                              </Button>
                         </div>
                    )}

                    {frames.length === 0 ? (
                         <div className="text-center py-8">
                              <p className="text-gray-500">No frames recorded for this fixture.</p>
                              {isUserAdmin && (
                                   <Button 
                                        className="mt-3"
                                        color="primary" 
                                        variant="flat"
                                        onPress={() => handleOpenModal()}
                                   >
                                        Add First Frame
                                   </Button>
                              )}
                         </div>
                    ) : (
                         <Table shadow="none" fullWidth>
                              <TableHeader>
                                   <TableColumn>FRAME</TableColumn>
                                   <TableColumn>HOME PLAYER</TableColumn>
                                   <TableColumn>AWAY PLAYER</TableColumn>
                                   <TableColumn>HANDICAPS</TableColumn>
                                   <TableColumn>SCORE</TableColumn>
                                   <TableColumn>WINNER</TableColumn>
                                   <TableColumn>STATUS</TableColumn>
                                   <TableColumn width={100}>ACTIONS</TableColumn>
                              </TableHeader>
                              <TableBody 
                                   isLoading={loading}
                                   emptyContent={loading ? "Loading..." : "No frames found"}
                              >
                                   {frames.map((frame) => (
                                        <TableRow key={frame.id}>
                                             <TableCell>
                                                  <div className="font-semibold">Frame {frame.frameNumber}</div>
                                             </TableCell>
                                             <TableCell>
                                                  {frame.homePlayer ? (
                                                       <div className="flex items-center gap-2">
                                                            <Avatar
                                                                 src={frame.homePlayer.user.image || undefined}
                                                                 name={frame.homePlayer.user.name || frame.homePlayer.user.email}
                                                                 size="sm"
                                                            />
                                                            <span className="text-sm">
                                                                 {frame.homePlayer.user.name || frame.homePlayer.user.email}
                                                            </span>
                                                       </div>
                                                  ) : (
                                                       <span className="text-gray-500 text-sm">TBD</span>
                                                  )}
                                             </TableCell>
                                             <TableCell>
                                                  {frame.awayPlayer ? (
                                                       <div className="flex items-center gap-2">
                                                            <Avatar
                                                                 src={frame.awayPlayer.user.image || undefined}
                                                                 name={frame.awayPlayer.user.name || frame.awayPlayer.user.email}
                                                                 size="sm"
                                                            />
                                                            <span className="text-sm">
                                                                 {frame.awayPlayer.user.name || frame.awayPlayer.user.email}
                                                            </span>
                                                       </div>
                                                  ) : (
                                                       <span className="text-gray-500 text-sm">TBD</span>
                                                  )}
                                             </TableCell>
                                             <TableCell>
                                                  <div className="flex gap-1 text-xs font-mono">
                                                       <Chip size="sm" variant="flat" color="primary">
                                                            H: {frame.homePlayerHandicap?.value || '-'}
                                                       </Chip>
                                                       <Chip size="sm" variant="flat" color="secondary">
                                                            A: {frame.awayPlayerHandicap?.value || '-'}
                                                       </Chip>
                                                  </div>
                                             </TableCell>
                                             <TableCell>
                                                  <span className="font-mono text-sm">
                                                       {frame.homeScore} - {frame.awayScore}
                                                  </span>
                                             </TableCell>
                                             <TableCell>
                                                  {frame.winner ? (
                                                       <div className="flex items-center gap-2">
                                                            <FaTrophy size={12} className="text-yellow-500" />
                                                            <span className="text-sm font-medium">
                                                                 {frame.winner.user.name || frame.winner.user.email}
                                                            </span>
                                                       </div>
                                                  ) : (
                                                       <span className="text-gray-500 text-sm">-</span>
                                                  )}
                                             </TableCell>
                                             <TableCell>
                                                  <Chip 
                                                       size="sm" 
                                                       color={getStatusColor(frame.status)}
                                                       variant="flat"
                                                  >
                                                       {frame.status.replace('_', ' ').toUpperCase()}
                                                  </Chip>
                                             </TableCell>
                                                  <TableCell>
                                             {isUserAdmin && (
                                                       <div className="flex gap-2">
                                                            <Button
                                                                 size="sm"
                                                                 variant="light"
                                                                 isIconOnly
                                                                 onPress={() => handleOpenModal(frame)}
                                                            >
                                                                 <FaEdit />
                                                            </Button>
                                                            <Button
                                                                 size="sm"
                                                                 variant="light"
                                                                 color="danger"
                                                                 isIconOnly
                                                                 onPress={() => handleDeleteFrame(frame.id)}
                                                            >
                                                                 <FaTrash />
                                                            </Button>
                                                       </div>
                                             )}
                                             </TableCell>
                                        </TableRow>
                                   ))}
                              </TableBody>
                         </Table>
                    )}
               </div>

               <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
                    <ModalContent>
                         <Formik
                              initialValues={{
                                   frameNumber: editingFrame?.frameNumber || getNextFrameNumber(),
                                   homePlayerId: editingFrame?.homePlayerId || '',
                                   homePlayerHandicapId: editingFrame?.homePlayerHandicapId || 
                                        (editingFrame?.homePlayerId ? getLatestHandicapId(editingFrame.homePlayerId, [...homePlayers, ...awayPlayers]) : ''),
                                   awayPlayerId: editingFrame?.awayPlayerId || '',
                                   awayPlayerHandicapId: editingFrame?.awayPlayerHandicapId || 
                                        (editingFrame?.awayPlayerId ? getLatestHandicapId(editingFrame.awayPlayerId, [...homePlayers, ...awayPlayers]) : ''),
                                   homeScore: editingFrame?.homeScore || 0,
                                   awayScore: editingFrame?.awayScore || 0,
                                   status: editingFrame?.status || 'not_started',
                                   notes: editingFrame?.notes || ''
                              }}
                              validationSchema={validationSchema}
                              validateOnBlur
                              onSubmit={handleSubmitForm}
                         >
                              {props => (
                                   <Form>
                                        <ModalHeader>
                                             {editingFrame ? 'Edit Frame' : 'Add Frame'}
                                        </ModalHeader>
                                        <ModalBody className="space-y-4">
                                             <Input
                                                  type="number"
                                                  name="frameNumber"
                                                  label="Frame Number"
                                                  placeholder="Enter frame number"
                                                  variant="bordered"
                                                  errorMessage={props.errors.frameNumber}
                                                  isInvalid={Boolean(props.errors.frameNumber)}
                                                  onChange={props.handleChange}
                                                  onBlur={props.handleBlur}
                                                  value={props.values.frameNumber.toString()}
                                                  disabled={!!editingFrame}
                                             />

                                             <div className="grid grid-cols-2 gap-4">
                                                  <Select 
                                                       name="homePlayerId"
                                                       label="Home Player"
                                                       placeholder="Select home player"
                                                       variant="bordered"
                                                       selectedKeys={props.values.homePlayerId ? [props.values.homePlayerId] : []}
                                                       onSelectionChange={(keys) => {
                                                            const selectedKey = Array.from(keys)[0] as string;
                                                            props.setFieldValue('homePlayerId', selectedKey || '');
                                                            
                                                            // Auto-select the most recent handicap for the selected player
                                                            if (selectedKey) {
                                                                 props.setFieldValue('homePlayerHandicapId', getLatestHandicapId(selectedKey, homePlayers));
                                                            } else {
                                                                 props.setFieldValue('homePlayerHandicapId', '');
                                                            }
                                                       }}
                                                  >
                                                       {homePlayers.map((player: CampaignPlayerWithUser) => (
                                                            <SelectItem key={player.id} textValue={player.id}>
                                                                 <div className="flex items-center justify-between">
                                                                      <span>{player.user.name || player.user.email}</span>
                                                                      <Chip size="sm" variant="flat" color="primary" className="ml-2">
                                                                           HC: {player.handicaps?.[0]?.value || 10}
                                                                      </Chip>
                                                                 </div>
                                                            </SelectItem>
                                                       ))}
                                                  </Select>

                                                  <Select 
                                                       name="awayPlayerId"
                                                       label="Away Player"
                                                       placeholder="Select away player"
                                                       variant="bordered"
                                                       selectedKeys={props.values.awayPlayerId ? [props.values.awayPlayerId] : []}
                                                       onSelectionChange={(keys) => {
                                                            const selectedKey = Array.from(keys)[0] as string;
                                                            props.setFieldValue('awayPlayerId', selectedKey || '');
                                                            
                                                            // Auto-select the most recent handicap for the selected player
                                                            if (selectedKey) {
                                                                 props.setFieldValue('awayPlayerHandicapId', getLatestHandicapId(selectedKey, awayPlayers));
                                                            } else {
                                                                 props.setFieldValue('awayPlayerHandicapId', '');
                                                            }
                                                       }}
                                                  >
                                                       {awayPlayers.map((player: CampaignPlayerWithUser) => (
                                                            <SelectItem key={player.id} textValue={player.id}>
                                                                 <div className="flex items-center justify-between">
                                                                      <span>{player.user.name || player.user.email}</span>
                                                                      <Chip size="sm" variant="flat" color="secondary" className="ml-2">
                                                                           HC: {player.handicaps?.[0]?.value || 10}
                                                                      </Chip>
                                                                 </div>
                                                            </SelectItem>
                                                       ))}
                                                  </Select>
                                             </div>

                                             <div className="grid grid-cols-2 gap-4">
                                                  <Input
                                                       type="number"
                                                       name="homeScore"
                                                       label="Home Score"
                                                       placeholder="0"
                                                       variant="bordered"
                                                       errorMessage={props.errors.homeScore}
                                                       isInvalid={Boolean(props.errors.homeScore)}
                                                       onChange={props.handleChange}
                                                       onBlur={props.handleBlur}
                                                       value={props.values.homeScore.toString()}
                                                  />

                                                  <Input
                                                       type="number"
                                                       name="awayScore"
                                                       label="Away Score"
                                                       placeholder="0"
                                                       variant="bordered"
                                                       errorMessage={props.errors.awayScore}
                                                       isInvalid={Boolean(props.errors.awayScore)}
                                                       onChange={props.handleChange}
                                                       onBlur={props.handleBlur}
                                                       value={props.values.awayScore.toString()}
                                                  />
                                             </div>

                                             {props.values.status === 'completed' && (
                                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                       <p className="text-sm text-blue-700">
                                                            <strong>Info:</strong> Winner will be automatically determined based on the scores when status is set to completed.
                                                       </p>
                                                  </div>
                                             )}


                                             <Select 
                                                  name="status"
                                                  label="Status"
                                                  placeholder="Select status"
                                                  variant="bordered"
                                                  errorMessage={props.errors.status}
                                                  isInvalid={Boolean(props.errors.status)}
                                                  selectedKeys={props.values.status ? [props.values.status] : []}
                                                  onSelectionChange={(keys) => {
                                                       const selectedKey = Array.from(keys)[0] as string;
                                                       props.setFieldValue('status', selectedKey);
                                                  }}
                                             >
                                                  <SelectItem key="not_started" textValue="not_started">Not Started</SelectItem>
                                                  <SelectItem key="in_progress" textValue="in_progress">In Progress</SelectItem>
                                                  <SelectItem key="completed" textValue="completed">Completed</SelectItem>
                                             </Select>

                                             <Input
                                                  type="text"
                                                  name="notes"
                                                  label="Notes"
                                                  placeholder="Additional notes (optional)"
                                                  variant="bordered"
                                                  onChange={props.handleChange}
                                                  onBlur={props.handleBlur}
                                                  value={props.values.notes}
                                             />
                                        </ModalBody>
                                        <ModalFooter>
                                             <Button 
                                                  variant="light" 
                                                  onPress={handleCloseModal}
                                                  disabled={isSubmitting}
                                             >
                                                  Cancel
                                             </Button>
                                             <Button 
                                                  type="submit"
                                                  color="primary" 
                                                  variant="solid"
                                                  isLoading={isSubmitting}
                                             >
                                                  {editingFrame ? 'Update' : 'Add'} Frame
                                             </Button>
                                        </ModalFooter>
                                   </Form>
                              )}
                         </Formik>
                    </ModalContent>
               </Modal>
          </>
     );
};

export default FramesManager;