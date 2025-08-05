'use client'

import { ReactElement } from "react"
import { Form, Formik, FormikHelpers } from 'formik'
import { Button, Input } from "@heroui/react"
import { Competition } from "@/generator/prisma";
import * as Yup from 'yup';

interface Values {
  name: string;
  sortOrder: number;
  collection: string;
}

/**
 * Create competition form.
 * @returns The create competition form.
 */
const CreateCompetitionForm = (): ReactElement => {

     const handleSubmitForm = async (values: Values, { setSubmitting }: FormikHelpers<Values>): Promise<void> => {
          setSubmitting(true);

          const response = await fetch('/api/competitions', {
               method: 'POST',
               body: JSON.stringify(values)
          });

          const competition: Competition = await response.json();

          window.location.href = `/competitions/${competition.id}`;
     }

     const validationSchema = Yup.object().shape({
          name: Yup.string()
               .min(2, 'The name must be more than 2 characters long')
               .max(50, 'The name must be less that 50 characters long')
               .required('The name field is required'),
          sortOrder: Yup.number()
               .min(1, 'Sort order must be at least 1')
               .max(100, 'Sort order must be less than 100')
               .required('Sort order is required'),
          collection: Yup.string()
               .min(2, 'Collection name must be more than 2 characters long')
               .max(100, 'Collection name must be less than 100 characters long')
               .required('Collection is required'),
     });

     return (
          <Formik
               initialValues={{
                    name: '',
                    sortOrder: 1,
                    collection: 'Default League',
               }}
               validationSchema={validationSchema}
               validateOnBlur
               onSubmit={handleSubmitForm}>
               {props => (
                    <Form>
                         <div className="space-y-4">
                              <div className="flex flex-col">
                                   <label htmlFor="name" className="text-gray-500 text-sm font-bold mb-3">Competition name</label>
                                   <Input type="text" name="name" 
                                        placeholder="Enter competition name (e.g., Premier League)"
                                        variant="underlined"
                                        errorMessage={props.errors.name}
                                        isInvalid={Boolean(props.errors.name?.length)}
                                        onChange={props.handleChange}
                                        onBlur={props.handleBlur}
                                        value={props.values.name} />
                              </div>

                              <div className="flex flex-col">
                                   <label htmlFor="collection" className="text-gray-500 text-sm font-bold mb-3">League Collection</label>
                                   <Input type="text" name="collection" 
                                        placeholder="Enter collection name (e.g., English Football League)"
                                        variant="underlined"
                                        errorMessage={props.errors.collection}
                                        isInvalid={Boolean(props.errors.collection?.length)}
                                        onChange={props.handleChange}
                                        onBlur={props.handleBlur}
                                        value={props.values.collection} />
                                   <p className="text-xs text-gray-500 mt-1">Groups competitions together (e.g., all divisions in a league system)</p>
                              </div>

                              <div className="flex flex-col">
                                   <label htmlFor="sortOrder" className="text-gray-500 text-sm font-bold mb-3">Division Level</label>
                                   <Input type="number" name="sortOrder" 
                                        placeholder="Enter division level (1 = highest)"
                                        variant="underlined"
                                        min={1}
                                        max={100}
                                        errorMessage={props.errors.sortOrder}
                                        isInvalid={Boolean(props.errors.sortOrder?.length)}
                                        onChange={props.handleChange}
                                        onBlur={props.handleBlur}
                                        value={props.values.sortOrder.toString()} />
                                   <p className="text-xs text-gray-500 mt-1">1 = Premier League (top), 2 = Championship, 3 = League One, etc.</p>
                              </div>
                         </div>

                         <div className="mt-6">
                              <Button type="submit" className="w-full md:w-fit" variant="solid" color="primary">Create Competition</Button>
                         </div>
                    </Form>
               )}
          </Formik>
     )
}

export default CreateCompetitionForm;