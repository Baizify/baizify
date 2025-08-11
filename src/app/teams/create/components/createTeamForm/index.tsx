'use client'

import { ReactElement, useState } from "react"
import { Form, Formik, FormikHelpers } from 'formik'
import { Button, Input, Card, CardHeader, CardBody } from "@heroui/react"
import { Team } from "@/generator/prisma";
import * as Yup from 'yup';

interface Values {
  name: string;
}

const CreateTeamForm = (): ReactElement => {
     const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

     const handleSubmitForm = async (values: Values, { setSubmitting, resetForm }: FormikHelpers<Values>): Promise<void> => {
          setSubmitting(true);
          setMessage(null);

          try {
               const response = await fetch('/api/teams', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values)
               });

               if (response.ok) {
                    const team: Team = await response.json();
                    setMessage({ type: 'success', text: `Team "${team.name}" created successfully!` });
                    resetForm();
                    
                    // Optionally redirect to teams list or competition settings
                    setTimeout(() => {
                         window.history.back();
                    }, 2000);
               } else {
                    const errorData = await response.json();
                    setMessage({ type: 'error', text: errorData.error || 'Failed to create team' });
               }
          } catch (error) {
               console.error('Error creating team:', error);
               setMessage({ type: 'error', text: 'An error occurred while creating the team' });
          } finally {
               setSubmitting(false);
          }
     }

     const validationSchema = Yup.object().shape({
          name: Yup.string()
               .min(2, 'The team name must be more than 2 characters long')
               .max(50, 'The team name must be less than 50 characters long')
               .required('The team name field is required'),
     });

     return (
          <Card>
               <CardHeader>
                    <h2 className="text-lg font-semibold">Team Details</h2>
               </CardHeader>
               <CardBody>
                    <Formik
                         initialValues={{
                              name: '',
                         }}
                         validationSchema={validationSchema}
                         validateOnBlur
                         onSubmit={handleSubmitForm}
                    >
                         {props => (
                              <Form>
                                   <div className="flex flex-col mb-4">
                                        <Input 
                                             type="text" 
                                             name="name" 
                                             label="Team name"
                                             placeholder="Enter team name"
                                             variant="bordered"
                                             errorMessage={props.errors.name}
                                             isInvalid={Boolean(props.errors.name?.length)}
                                             onChange={props.handleChange}
                                             onBlur={props.handleBlur}
                                             value={props.values.name} 
                                        />
                                   </div>

                                   {message && (
                                        <div className={`mb-4 p-3 rounded text-sm ${
                                             message.type === 'success' 
                                                  ? 'bg-green-100 text-green-700' 
                                                  : 'bg-red-100 text-red-700'
                                        }`}>
                                             {message.text}
                                        </div>
                                   )}

                                   <div className="flex gap-3">
                                        <Button 
                                             variant="light" 
                                             className="flex-1"
                                             onPress={() => window.history.back()}
                                             disabled={props.isSubmitting}
                                        >
                                             Cancel
                                        </Button>
                                        <Button 
                                             type="submit" 
                                             className="flex-1" 
                                             variant="solid" 
                                             color="primary"
                                             isLoading={props.isSubmitting}
                                        >
                                             Create Team
                                        </Button>
                                   </div>
                              </Form>
                         )}
                    </Formik>
               </CardBody>
          </Card>
     )
}

export default CreateTeamForm;