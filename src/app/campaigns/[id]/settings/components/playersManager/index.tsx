'use client'

import { User } from "@/generator/prisma";
import { 
     Button, 
     Card, 
     CardHeader, 
     CardBody, 
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
     Autocomplete,
     AutocompleteItem,
     Checkbox,
     Avatar
} from "@heroui/react";
import { useState, useEffect } from "react";
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaTrash, FaCrown } from "react-icons/fa";

interface CampaignPlayerWithUser {
     id: string;
     campaignId: string;
     userId: string;
     user: User;
     isTeamCaptain: boolean;
     createdAt: string;
}

interface PlayerFormValues {
     userId: string;
     isTeamCaptain: boolean;
}

const PlayersManager = ({
     campaignId
}: {
     campaignId: string
}) => {
     const [players, setPlayers] = useState<CampaignPlayerWithUser[]>([]);
     const [users, setUsers] = useState<User[]>([]);
     const [loading, setLoading] = useState(true);
     const [searchingUsers, setSearchingUsers] = useState(false);
     const { isOpen, onOpen, onClose } = useDisclosure();
     const [isSubmitting, setIsSubmitting] = useState(false);

     const fetchPlayers = async () => {
          try {
               const response = await fetch(`/api/campaigns/${campaignId}/players`);
               if (response.ok) {
                    const data = await response.json();
                    setPlayers(data);
               }
          } catch (error) {
               console.error('Error fetching players:', error);
          }
     };

     const fetchUsers = async (search?: string) => {
          setSearchingUsers(true);
          try {
               const url = search ? `/api/users?search=${encodeURIComponent(search)}` : '/api/users';
               const response = await fetch(url);
               if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
               }
          } catch (error) {
               console.error('Error fetching users:', error);
          } finally {
               setSearchingUsers(false);
          }
     };

     const fetchData = async () => {
          setLoading(true);
          await Promise.all([
               fetchPlayers(),
               fetchUsers()
          ]);
          setLoading(false);
     };

     useEffect(() => {
          fetchData();
     }, [campaignId]);

     const handleSubmitForm = async (values: PlayerFormValues, { resetForm }: FormikHelpers<PlayerFormValues>) => {
          setIsSubmitting(true);

          try {
               const response = await fetch(`/api/campaigns/${campaignId}/players`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values)
               });

               if (response.ok) {
                    await fetchPlayers();
                    resetForm();
                    onClose();
               }
          } catch (error) {
               console.error('Error adding player:', error);
          } finally {
               setIsSubmitting(false);
          }
     };

     const handleToggleCaptain = async (playerId: string, currentStatus: boolean) => {
          try {
               const response = await fetch(`/api/campaigns/${campaignId}/players/${playerId}`, {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ isTeamCaptain: !currentStatus })
               });

               if (response.ok) {
                    await fetchPlayers();
               }
          } catch (error) {
               console.error('Error updating player:', error);
          }
     };

     const handleRemovePlayer = async (playerId: string) => {
          if (confirm('Are you sure you want to remove this player from the campaign?')) {
               try {
                    const response = await fetch(`/api/campaigns/${campaignId}/players/${playerId}`, {
                         method: 'DELETE'
                    });

                    if (response.ok) {
                         await fetchPlayers();
                    }
               } catch (error) {
                    console.error('Error removing player:', error);
               }
          }
     };

     const validationSchema = Yup.object().shape({
          userId: Yup.string().required('Player is required'),
          isTeamCaptain: Yup.boolean()
     });

     // Filter out users who are already in the campaign
     const availableUsers = users.filter(user => 
          !players.some(player => player.userId === user.id)
     );

     return (
          <>
               <Card>
                    <CardHeader className="flex justify-between items-center">
                         <h2 className="text-lg font-semibold">Campaign Players</h2>
                         <Button 
                              color="primary" 
                              variant="solid"
                              startContent={<FaPlus />}
                              onPress={onOpen}
                         >
                              Add Player
                         </Button>
                    </CardHeader>
                    <CardBody className="p-0">
                         <Table shadow="none" fullWidth>
                              <TableHeader>
                                   <TableColumn>PLAYER</TableColumn>
                                   <TableColumn>EMAIL</TableColumn>
                                   <TableColumn>CAPTAIN</TableColumn>
                                   <TableColumn>JOINED</TableColumn>
                                   <TableColumn width={100}>ACTIONS</TableColumn>
                              </TableHeader>
                              <TableBody 
                                   isLoading={loading}
                                   emptyContent={loading ? "Loading..." : "No players found"}
                              >
                                   {players.map((player) => (
                                        <TableRow key={player.id}>
                                             <TableCell>
                                                  <div className="flex items-center gap-3">
                                                       <Avatar
                                                            src={player.user.image || undefined}
                                                            name={player.user.name || player.user.email}
                                                            size="sm"
                                                       />
                                                       <span>{player.user.name || player.user.email}</span>
                                                  </div>
                                             </TableCell>
                                             <TableCell>{player.user.email}</TableCell>
                                             <TableCell>
                                                  <Button
                                                       size="sm"
                                                       variant="light"
                                                       color={player.isTeamCaptain ? "warning" : "default"}
                                                       isIconOnly
                                                       onPress={() => handleToggleCaptain(player.id, player.isTeamCaptain)}
                                                  >
                                                       <FaCrown className={player.isTeamCaptain ? "text-warning" : "text-gray-400"} />
                                                  </Button>
                                             </TableCell>
                                             <TableCell>
                                                  {new Date(player.createdAt).toLocaleDateString()}
                                             </TableCell>
                                             <TableCell>
                                                  <Button
                                                       size="sm"
                                                       variant="light"
                                                       color="danger"
                                                       isIconOnly
                                                       onPress={() => handleRemovePlayer(player.id)}
                                                  >
                                                       <FaTrash />
                                                  </Button>
                                             </TableCell>
                                        </TableRow>
                                   ))}
                              </TableBody>
                         </Table>
                    </CardBody>
               </Card>

               <Modal isOpen={isOpen} onClose={onClose} size="lg">
                    <ModalContent>
                         <Formik
                              initialValues={{
                                   userId: '',
                                   isTeamCaptain: false,
                              }}
                              validationSchema={validationSchema}
                              validateOnBlur
                              onSubmit={handleSubmitForm}
                         >
                              {props => (
                                   <Form>
                                        <ModalHeader>Add Player to Campaign</ModalHeader>
                                        <ModalBody className="space-y-4">
                                             <Autocomplete 
                                                  name="userId"
                                                  label="Select Player"
                                                  placeholder="Search for a user..."
                                                  variant="bordered"
                                                  isLoading={searchingUsers}
                                                  errorMessage={props.errors.userId}
                                                  isInvalid={Boolean(props.errors.userId)}
                                                  onInputChange={(value) => {
                                                       if (value.length > 0) {
                                                            fetchUsers(value);
                                                       }
                                                  }}
                                                  onSelectionChange={(key) => {
                                                       if (key) {
                                                            props.setFieldValue('userId', key);
                                                       }
                                                  }}
                                             >
                                                  {availableUsers.map((user) => (
                                                       <AutocompleteItem 
                                                            key={user.id}
                                                            startContent={
                                                                 <Avatar
                                                                      src={user.image || undefined}
                                                                      name={user.name || user.email}
                                                                      size="sm"
                                                                 />
                                                            }
                                                       >
                                                            <div>
                                                                 <div className="font-medium">{user.name || user.email}</div>
                                                                 <div className="text-small text-gray-500">{user.email}</div>
                                                            </div>
                                                       </AutocompleteItem>
                                                  ))}
                                             </Autocomplete>

                                             <Checkbox 
                                                  isSelected={props.values.isTeamCaptain}
                                                  onValueChange={(checked) => {
                                                       props.setFieldValue('isTeamCaptain', checked);
                                                  }}
                                             >
                                                  Make this player a team captain
                                             </Checkbox>
                                        </ModalBody>
                                        <ModalFooter>
                                             <Button 
                                                  variant="light" 
                                                  onPress={onClose}
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
                                                  Add Player
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

export default PlayersManager;