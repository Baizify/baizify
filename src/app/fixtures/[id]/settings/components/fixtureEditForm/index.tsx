'use client'

import { 
     Fixture, 
     Competition, 
     Season, 
     Team 
} from "@/generator/prisma";
import { 
     Button, 
     Card, 
     CardBody, 
     CardHeader, 
     Input,
     Select,
     SelectItem,
     Textarea
} from "@heroui/react";
import { useState } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";

interface FixtureWithRelations extends Fixture {
     competition: Competition;
     season: Season;
     homeCampaign: {
          teamCampaign?: {
               team: Team;
          } | null;
     };
     awayCampaign: {
          teamCampaign?: {
               team: Team;
          } | null;
     };
}

interface FixtureFormValues {
     scheduledDate: string;
     venue: string;
     notes: string;
     status: string;
     totalFrames: number;
}

const FixtureEditForm = ({
     fixture
}: {
     fixture: FixtureWithRelations;
}) => {
     const [isSubmitting, setIsSubmitting] = useState(false);

     const handleSubmitForm = async (values: FixtureFormValues, { setSubmitting }: FormikHelpers<FixtureFormValues>) => {
          setIsSubmitting(true);

          try {
               const response = await fetch(`/api/fixtures/${fixture.id}`, {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         scheduledDate: values.scheduledDate ? new Date(values.scheduledDate).toISOString() : null,
                         venue: values.venue || null,
                         notes: values.notes || null,
                         status: values.status,
                         totalFrames: values.totalFrames,
                    })
               });

               if (response.ok) {
                    // Redirect back to fixture page
                    window.location.href = `/fixtures/${fixture.id}`;
               } else {
                    console.error('Failed to update fixture');
               }
          } catch (error) {
               console.error('Error updating fixture:', error);
          } finally {
               setIsSubmitting(false);
               setSubmitting(false);
          }
     };

     const validationSchema = Yup.object().shape({
          scheduledDate: Yup.string(),
          venue: Yup.string().max(200, 'Venue must be less than 200 characters'),
          notes: Yup.string().max(1000, 'Notes must be less than 1000 characters'),
          status: Yup.string().oneOf(['scheduled', 'in_progress', 'completed', 'cancelled']).required('Status is required'),
          totalFrames: Yup.number().min(1, 'Must have at least 1 frame').max(50, 'Cannot exceed 50 frames').required('Total frames is required')
     });

     const formatDateForInput = (date: Date | string | null): string => {
          if (!date) return '';
          const d = typeof date === 'string' ? new Date(date) : date;
          // Format as YYYY-MM-DDTHH:MM for datetime-local input
          return d.toISOString().slice(0, 16);
     };

     const statusOptions = [
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
     ];

     return (
          <Card>
               <CardHeader>
                    <h3 className="text-lg font-semibold">Edit Fixture Details</h3>
               </CardHeader>
               <CardBody>
                    <Formik
                         initialValues={{
                              scheduledDate: formatDateForInput(fixture.scheduledDate),
                              venue: fixture.venue || '',
                              notes: fixture.notes || '',
                              status: fixture.status,
                              totalFrames: fixture.totalFrames
                         }}
                         validationSchema={validationSchema}
                         validateOnBlur
                         onSubmit={handleSubmitForm}
                    >
                         {props => (
                              <Form className="space-y-6">
                                   {/* Match Details */}
                                   <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-700 border-b pb-2">Match Information</h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <div className="space-y-2">
                                                  <label className="text-sm font-medium text-gray-700">Home Team</label>
                                                  <div className="p-3 bg-gray-50 rounded-lg">
                                                       <p className="font-medium">{fixture.homeCampaign?.teamCampaign?.team?.name || 'TBD'}</p>
                                                  </div>
                                             </div>
                                             
                                             <div className="space-y-2">
                                                  <label className="text-sm font-medium text-gray-700">Away Team</label>
                                                  <div className="p-3 bg-gray-50 rounded-lg">
                                                       <p className="font-medium">{fixture.awayCampaign?.teamCampaign?.team?.name || 'TBD'}</p>
                                                  </div>
                                             </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <div className="space-y-2">
                                                  <label className="text-sm font-medium text-gray-700">Competition</label>
                                                  <div className="p-3 bg-gray-50 rounded-lg">
                                                       <p className="font-medium">{fixture.competition.name}</p>
                                                  </div>
                                             </div>
                                             
                                             <div className="space-y-2">
                                                  <label className="text-sm font-medium text-gray-700">Season</label>
                                                  <div className="p-3 bg-gray-50 rounded-lg">
                                                       <p className="font-medium">{fixture.season.name}</p>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Editable Fields */}
                                   <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-700 border-b pb-2">Fixture Settings</h4>
                                        
                                        <Input
                                             type="datetime-local"
                                             name="scheduledDate"
                                             label="Scheduled Date & Time"
                                             placeholder="Select date and time"
                                             variant="bordered"
                                             onChange={props.handleChange}
                                             onBlur={props.handleBlur}
                                             value={props.values.scheduledDate}
                                             errorMessage={props.errors.scheduledDate}
                                             isInvalid={Boolean(props.errors.scheduledDate && props.touched.scheduledDate)}
                                        />

                                        <Input
                                             type="text"
                                             name="venue"
                                             label="Venue"
                                             placeholder="Enter venue location"
                                             variant="bordered"
                                             onChange={props.handleChange}
                                             onBlur={props.handleBlur}
                                             value={props.values.venue}
                                             errorMessage={props.errors.venue}
                                             isInvalid={Boolean(props.errors.venue && props.touched.venue)}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <Select 
                                                  name="status"
                                                  label="Fixture Status"
                                                  placeholder="Select fixture status"
                                                  variant="bordered"
                                                  errorMessage={props.errors.status}
                                                  isInvalid={Boolean(props.errors.status && props.touched.status)}
                                                  selectedKeys={props.values.status ? [props.values.status] : []}
                                                  onSelectionChange={(keys) => {
                                                       const selectedKey = Array.from(keys)[0] as string;
                                                       props.setFieldValue('status', selectedKey);
                                                  }}
                                             >
                                                  {statusOptions.map((option) => (
                                                       <SelectItem key={option.value}>
                                                            {option.label}
                                                       </SelectItem>
                                                  ))}
                                             </Select>

                                             <Input
                                                  type="number"
                                                  name="totalFrames"
                                                  label="Total Frames"
                                                  placeholder="Enter total frames for this fixture"
                                                  variant="bordered"
                                                  min={1}
                                                  max={50}
                                                  onChange={props.handleChange}
                                                  onBlur={props.handleBlur}
                                                  value={props.values.totalFrames.toString()}
                                                  errorMessage={props.errors.totalFrames}
                                                  isInvalid={Boolean(props.errors.totalFrames && props.touched.totalFrames)}
                                             />
                                        </div>

                                        <Textarea
                                             name="notes"
                                             label="Notes"
                                             placeholder="Additional notes or information about this fixture"
                                             variant="bordered"
                                             minRows={3}
                                             maxRows={6}
                                             onChange={props.handleChange}
                                             onBlur={props.handleBlur}
                                             value={props.values.notes}
                                             errorMessage={props.errors.notes}
                                             isInvalid={Boolean(props.errors.notes && props.touched.notes)}
                                        />
                                   </div>

                                   {/* Current Scores Display (Read-only) */}
                                   <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-700 border-b pb-2">Current Match Score</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                             <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                  <p className="text-sm text-gray-600 mb-1">Home Score</p>
                                                  <p className="text-3xl font-bold text-blue-600">{fixture.homeScore}</p>
                                             </div>
                                             <div className="flex items-center justify-center">
                                                  <span className="text-2xl font-light text-gray-400">vs</span>
                                             </div>
                                             <div className="text-center p-4 bg-red-50 rounded-lg">
                                                  <p className="text-sm text-gray-600 mb-1">Away Score</p>
                                                  <p className="text-3xl font-bold text-red-600">{fixture.awayScore}</p>
                                             </div>
                                        </div>
                                        <p className="text-sm text-gray-500 text-center">
                                             Scores are automatically updated from frame results and cannot be edited directly
                                        </p>
                                   </div>

                                   {/* Action Buttons */}
                                   <div className="flex justify-end space-x-4 pt-4 border-t">
                                        <Button
                                             as="a"
                                             href={`/fixtures/${fixture.id}`}
                                             variant="light"
                                             disabled={isSubmitting}
                                        >
                                             Cancel
                                        </Button>
                                        <Button
                                             type="submit"
                                             color="primary"
                                             variant="solid"
                                             isLoading={isSubmitting}
                                             disabled={isSubmitting || !props.isValid}
                                        >
                                             Update Fixture
                                        </Button>
                                   </div>
                              </Form>
                         )}
                    </Formik>
               </CardBody>
          </Card>
     );
};

export default FixtureEditForm;