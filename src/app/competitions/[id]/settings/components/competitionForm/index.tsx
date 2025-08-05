'use client'

import { Competition } from "@/generator/prisma";
import { Card, CardHeader, CardBody, Button, Input } from "@heroui/react";
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useState } from "react";

interface Values {
  name: string;
}

const CompetitionForm = ({
     competition
}: {
     competition: Competition
}) => {
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

     const handleSubmitForm = async (values: Values, { setSubmitting }: FormikHelpers<Values>): Promise<void> => {
          setIsSubmitting(true);
          setMessage(null);

          try {
               const response = await fetch(`/api/competitions/${competition.id}`, {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values)
               });

               if (response.ok) {
                    setMessage({ type: 'success', text: 'Competition updated successfully!' });
                    // Refresh the page to show updated data
                    setTimeout(() => {
                         window.location.reload();
                    }, 1500);
               } else {
                    setMessage({ type: 'error', text: 'Failed to update competition' });
               }
          } catch (error) {
               console.error('Error updating competition:', error);
               setMessage({ type: 'error', text: 'An error occurred while updating the competition' });
          } finally {
               setIsSubmitting(false);
               setSubmitting(false);
          }
     }

     const validationSchema = Yup.object().shape({
          name: Yup.string()
               .min(2, 'The name must be more than 2 characters long')
               .max(50, 'The name must be less than 50 characters long')
               .required('The name field is required'),
     });

     return (
          <Card className="max-w-md">
               <CardHeader>
                    <h2 className="text-lg font-semibold">Edit Competition</h2>
               </CardHeader>
               <CardBody>
                    <Formik
                         initialValues={{
                              name: competition.name,
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
                                             label="Competition name"
                                             placeholder="Enter competition name"
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

                                   <Button 
                                        type="submit" 
                                        className="w-full" 
                                        variant="solid" 
                                        color="primary"
                                        isLoading={isSubmitting}
                                   >
                                        Save Changes
                                   </Button>
                              </Form>
                         )}
                    </Formik>
               </CardBody>
          </Card>
     );
};

export default CompetitionForm;