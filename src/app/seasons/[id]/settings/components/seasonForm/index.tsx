'use client'

import { Season } from "@/generator/prisma";
import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { useState } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";

interface SeasonFormValues {
     name: string;
     startDate: string;
     endDate: string;
}

const SeasonForm = ({
     season
}: {
     season: Season;
}) => {
     const [isSubmitting, setIsSubmitting] = useState(false);

     const handleSubmitForm = async (values: SeasonFormValues, { setSubmitting }: FormikHelpers<SeasonFormValues>) => {
          setIsSubmitting(true);

          try {
               const response = await fetch(`/api/seasons/${season.id}`, {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         name: values.name,
                         startDate: values.startDate ? new Date(values.startDate).toISOString() : null,
                         endDate: values.endDate ? new Date(values.endDate).toISOString() : null,
                    })
               });

               if (response.ok) {
                    window.location.reload();
               }
          } catch (error) {
               console.error('Error updating season:', error);
          } finally {
               setIsSubmitting(false);
               setSubmitting(false);
          }
     };

     const validationSchema = Yup.object().shape({
          name: Yup.string().required('Season name is required'),
          startDate: Yup.string(),
          endDate: Yup.string()
     });

     const formatDateForInput = (date: Date | string | null): string => {
          if (!date) return '';
          const d = typeof date === 'string' ? new Date(date) : date;
          return d.toISOString().split('T')[0];
     };

     return (
          <Card>
               <CardHeader>
                    <h3 className="text-lg font-semibold">Season Details</h3>
               </CardHeader>
               <CardBody>
                    <Formik
                         initialValues={{
                              name: season.name || '',
                              startDate: formatDateForInput(season.startDate),
                              endDate: formatDateForInput(season.endDate)
                         }}
                         validationSchema={validationSchema}
                         validateOnBlur
                         onSubmit={handleSubmitForm}
                    >
                         {props => (
                              <Form className="space-y-4">
                                   <Input
                                        type="text"
                                        name="name"
                                        label="Season Name"
                                        placeholder="Enter season name"
                                        variant="bordered"
                                        errorMessage={props.errors.name}
                                        isInvalid={Boolean(props.errors.name && props.touched.name)}
                                        onChange={props.handleChange}
                                        onBlur={props.handleBlur}
                                        value={props.values.name}
                                        isRequired
                                   />

                                   <Input
                                        type="date"
                                        name="startDate"
                                        label="Start Date"
                                        placeholder="Select start date"
                                        variant="bordered"
                                        onChange={props.handleChange}
                                        onBlur={props.handleBlur}
                                        value={props.values.startDate}
                                   />

                                   <Input
                                        type="date"
                                        name="endDate"
                                        label="End Date"
                                        placeholder="Select end date"
                                        variant="bordered"
                                        onChange={props.handleChange}
                                        onBlur={props.handleBlur}
                                        value={props.values.endDate}
                                   />

                                   <div className="flex justify-end">
                                        <Button
                                             type="submit"
                                             color="primary"
                                             variant="solid"
                                             isLoading={isSubmitting}
                                             disabled={isSubmitting || !props.isValid}
                                        >
                                             Update Season
                                        </Button>
                                   </div>
                              </Form>
                         )}
                    </Formik>
               </CardBody>
          </Card>
     );
};

export default SeasonForm;