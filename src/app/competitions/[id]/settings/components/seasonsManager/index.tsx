'use client'

import { Season } from "@/generator/prisma";
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
     Input
} from "@heroui/react";
import { useState, useEffect } from "react";
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaEdit, FaTrash, FaCog } from "react-icons/fa";
import Link from "next/link";

interface SeasonFormValues {
     name: string;
}

const SeasonsManager = () => {
     const [seasons, setSeasons] = useState<Season[]>([]);
     const [loading, setLoading] = useState(true);
     const [editingSeason, setEditingSeason] = useState<Season | null>(null);
     const { isOpen, onOpen, onClose } = useDisclosure();
     const [isSubmitting, setIsSubmitting] = useState(false);

     const fetchSeasons = async () => {
          try {
               const response = await fetch('/api/seasons');
               if (response.ok) {
                    const data = await response.json();
                    setSeasons(data);
               }
          } catch (error) {
               console.error('Error fetching seasons:', error);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchSeasons();
     }, []);

     const handleSubmitForm = async (values: SeasonFormValues, { resetForm }: FormikHelpers<SeasonFormValues>) => {
          setIsSubmitting(true);

          try {
               const url = editingSeason ? `/api/seasons/${editingSeason.id}` : '/api/seasons';
               const method = editingSeason ? 'PUT' : 'POST';
               
               const response = await fetch(url, {
                    method,
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values)
               });

               if (response.ok) {
                    await fetchSeasons();
                    resetForm();
                    handleCloseModal();
               }
          } catch (error) {
               console.error('Error saving season:', error);
          } finally {
               setIsSubmitting(false);
          }
     };

     const handleDeleteSeason = async (seasonId: string) => {
          if (confirm('Are you sure you want to delete this season?')) {
               try {
                    const response = await fetch(`/api/seasons/${seasonId}`, {
                         method: 'DELETE'
                    });

                    if (response.ok) {
                         await fetchSeasons();
                    }
               } catch (error) {
                    console.error('Error deleting season:', error);
               }
          }
     };

     const handleOpenModal = (season?: Season) => {
          setEditingSeason(season || null);
          onOpen();
     };

     const handleCloseModal = () => {
          setEditingSeason(null);
          onClose();
     };

     const validationSchema = Yup.object().shape({
          name: Yup.string()
               .min(2, 'The name must be more than 2 characters long')
               .max(50, 'The name must be less than 50 characters long')
               .required('The name field is required'),
     });

     return (
          <>
               <Card>
                    <CardHeader className="flex justify-between items-center">
                         <h2 className="text-lg font-semibold">Seasons</h2>
                         <Button 
                              color="primary" 
                              variant="solid"
                              startContent={<FaPlus />}
                              onPress={() => handleOpenModal()}
                         >
                              Add Season
                         </Button>
                    </CardHeader>
                    <CardBody className="p-0">
                         <Table shadow="none" fullWidth>
                              <TableHeader>
                                   <TableColumn>NAME</TableColumn>
                                   <TableColumn>CREATED</TableColumn>
                                   <TableColumn width={100}>ACTIONS</TableColumn>
                              </TableHeader>
                              <TableBody 
                                   isLoading={loading}
                                   emptyContent={loading ? "Loading..." : "No seasons found"}
                              >
                                   {seasons.map((season) => (
                                        <TableRow key={season.id}>
                                             <TableCell>{season.name}</TableCell>
                                             <TableCell>
                                                  {new Date(season.createdAt).toLocaleDateString()}
                                             </TableCell>
                                             <TableCell>
                                                  <div className="flex gap-2">
                                                       <Button
                                                            as={Link}
                                                            href={`/seasons/${season.id}/settings`}
                                                            size="sm"
                                                            variant="light"
                                                            isIconOnly
                                                       >
                                                            <FaCog />
                                                       </Button>
                                                       <Button
                                                            size="sm"
                                                            variant="light"
                                                            isIconOnly
                                                            onPress={() => handleOpenModal(season)}
                                                       >
                                                            <FaEdit />
                                                       </Button>
                                                       <Button
                                                            size="sm"
                                                            variant="light"
                                                            color="danger"
                                                            isIconOnly
                                                            onPress={() => handleDeleteSeason(season.id)}
                                                       >
                                                            <FaTrash />
                                                       </Button>
                                                  </div>
                                             </TableCell>
                                        </TableRow>
                                   ))}
                              </TableBody>
                         </Table>
                    </CardBody>
               </Card>

               <Modal isOpen={isOpen} onClose={handleCloseModal}>
                    <ModalContent>
                         <Formik
                              initialValues={{
                                   name: editingSeason?.name || '',
                              }}
                              validationSchema={validationSchema}
                              validateOnBlur
                              onSubmit={handleSubmitForm}
                         >
                              {props => (
                                   <Form>
                                        <ModalHeader>
                                             {editingSeason ? 'Edit Season' : 'Create Season'}
                                        </ModalHeader>
                                        <ModalBody>
                                             <Input 
                                                  type="text" 
                                                  name="name" 
                                                  label="Season name"
                                                  placeholder="Enter season name"
                                                  variant="bordered"
                                                  errorMessage={props.errors.name}
                                                  isInvalid={Boolean(props.errors.name?.length)}
                                                  onChange={props.handleChange}
                                                  onBlur={props.handleBlur}
                                                  value={props.values.name} 
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
                                                  {editingSeason ? 'Update' : 'Create'}
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

export default SeasonsManager;