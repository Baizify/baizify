'use client'

import { 
     Calendar, 
     Card, 
     CardBody, 
     DatePicker, 
     Button,
     Spinner,
     Chip,
     Modal,
     ModalContent,
     ModalHeader,
     ModalBody,
     ModalFooter,
     useDisclosure,
     Select,
     SelectItem,
     Input,
     DateValue
} from "@heroui/react"
import {parseDate} from "@internationalized/date";
import { FaShieldAlt, FaPlus, FaClock, FaCalendarAlt } from "react-icons/fa";
import { format, parseISO, isSameDay, startOfDay, isAfter, isBefore } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Link from "next/link";

interface FixtureWithRelations {
     id: string;
     competitionId: string;
     seasonId: string;
     homeCampaignId: string;
     awayCampaignId: string;
     scheduledDate?: string;
     actualDate?: string;
     homeScore: number;
     awayScore: number;
     status: string;
     venue?: string;
     notes?: string;
     isLive?: boolean;
     homeCampaign: {
          teamCampaign?: {
               team: {
                    id: string;
                    name: string;
               }
          }
     };
     awayCampaign: {
          teamCampaign?: {
               team: {
                    id: string;
                    name: string;
               }
          }
     };
     _count: {
          frames: number;
     };
}

interface Campaign {
     id: string;
     teamCampaign?: {
          team: {
               id: string;
               name: string;
          }
     }
}

interface Season {
     id: string;
     name: string;
}

interface FixtureFormValues {
     seasonId: string;
     homeCampaignId: string;
     awayCampaignId: string;
     scheduledDate: string;
     venue: string;
     notes: string;
}

const FixtureList = ({ 
     competitionId, 
     selectedSeasonId, 
     isUserAdmin 
}: { 
     competitionId: string;
     selectedSeasonId: string;
     isUserAdmin: boolean;
}) => {
     const [fixtures, setFixtures] = useState<FixtureWithRelations[]>([]);
     const [campaigns, setCampaigns] = useState<Campaign[]>([]);
     const [seasons, setSeasons] = useState<Season[]>([]);
     const [loading, setLoading] = useState(true);
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [selectedDate, setSelectedDate] = useState<DateValue | null>(null);
     const { isOpen, onOpen, onClose } = useDisclosure();

     const fetchFixtures = async () => {
          try {
               const url = `/api/competitions/${competitionId}/fixtures${selectedSeasonId ? `?seasonId=${selectedSeasonId}` : ''}`;
               const response = await fetch(url);
               if (response.ok) {
                    const data = await response.json();
                    setFixtures(data);
               }
          } catch (error) {
               console.error('Error fetching fixtures:', error);
          }
     };

     const fetchCampaigns = async () => {
          try {
               const response = await fetch(`/api/competitions/${competitionId}/campaigns`);
               if (response.ok) {
                    const data = await response.json();
                    setCampaigns(data);
               }
          } catch (error) {
               console.error('Error fetching campaigns:', error);
          }
     };

     const fetchSeasons = async () => {
          try {
               const response = await fetch('/api/seasons');
               if (response.ok) {
                    const data = await response.json();
                    setSeasons(data);
               }
          } catch (error) {
               console.error('Error fetching seasons:', error);
          }
     };

     const fetchData = async () => {
          setLoading(true);
          // Reset selected date when fetching new data (e.g., different season)
          setSelectedDate(null);
          await Promise.all([
               fetchFixtures(),
               fetchCampaigns(),
               fetchSeasons()
          ]);
          setLoading(false);
     };

     useEffect(() => {
          fetchData();
     }, [competitionId, selectedSeasonId]);

     // Set default date when fixtures are loaded
     useEffect(() => {
          if (fixtures.length > 0 && selectedDate === null) {
               const defaultDate = getDefaultDate(fixtures);
               if (defaultDate) {
                    setSelectedDate(defaultDate);
               }
          }
     }, [fixtures, selectedDate]);

     const handleSubmitForm = async (values: FixtureFormValues, { resetForm }: FormikHelpers<FixtureFormValues>) => {
          setIsSubmitting(true);

          try {
               const response = await fetch(`/api/competitions/${competitionId}/fixtures`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         ...values,
                         scheduledDate: values.scheduledDate || null
                    })
               });

               if (response.ok) {
                    await fetchFixtures();
                    resetForm();
                    onClose();
               }
          } catch (error) {
               console.error('Error creating fixture:', error);
          } finally {
               setIsSubmitting(false);
          }
     };

     const validationSchema = Yup.object().shape({
          seasonId: Yup.string().required('Season is required'),
          homeCampaignId: Yup.string().required('Home team is required'),
          awayCampaignId: Yup.string().required('Away team is required'),
          scheduledDate: Yup.string(),
          venue: Yup.string(),
          notes: Yup.string()
     });

     const getStatusColor = (status: string) => {
          switch (status) {
               case 'completed': return 'success';
               case 'in_progress': return 'warning';
               case 'cancelled': return 'danger';
               default: return 'default';
          }
     };

     // Filter fixtures based on selected date
     const filteredFixtures = useMemo(() => {
          if (!selectedDate) return fixtures;
          
          return fixtures.filter(fixture => {
               if (!fixture.scheduledDate) return false;
               try {
                    const fixtureDate = parseISO(fixture.scheduledDate);
                    const selectedNativeDate = selectedDate.toDate('UTC');
                    return isSameDay(fixtureDate, selectedNativeDate);
               } catch {
                    return false;
               }
          });
     }, [fixtures, selectedDate]);

     // Get dates that have fixtures for calendar highlighting
     const fixtureDates = useMemo(() => {
          return fixtures
               .filter(fixture => fixture.scheduledDate)
               .map(fixture => {
                    try {
                         return startOfDay(parseISO(fixture.scheduledDate!));
                    } catch {
                         return null;
                    }
               })
               .filter((date): date is Date => date !== null);
     }, [fixtures]);

     const handleDateChange = (date: DateValue | null) => {
          setSelectedDate(date);
     };

     const clearDateFilter = () => {
          setSelectedDate(null);
     };

     // Smart default date logic
     const getDefaultDate = (fixtures: FixtureWithRelations[]): DateValue | null => {
          const today = startOfDay(new Date());
          
          // Get all fixture dates that are valid
          const validFixtureDates = fixtures
               .filter(fixture => fixture.scheduledDate)
               .map(fixture => {
                    try {
                         return startOfDay(parseISO(fixture.scheduledDate!));
                    } catch {
                         return null;
                    }
               })
               .filter((date): date is Date => date !== null)
               .sort((a, b) => a.getTime() - b.getTime()); // Sort chronologically

          if (validFixtureDates.length === 0) {
               return null;
          }

          // Check if there are fixtures today
          const hasFixturesToday = validFixtureDates.some(date => isSameDay(date, today));
          if (hasFixturesToday) {
               return parseDate(format(today, 'yyyy-MM-dd'));
          }

          // Get future fixture dates
          const futureDates = validFixtureDates.filter(date => isAfter(date, today));
          
          // If there are future fixtures, return the earliest one
          if (futureDates.length > 0) {
               return parseDate(format(futureDates[0], 'yyyy-MM-dd'));
          }

          // If no future fixtures, return the latest historic date
          const pastDates = validFixtureDates.filter(date => isBefore(date, today));
          if (pastDates.length > 0) {
               return parseDate(format(pastDates[pastDates.length - 1], 'yyyy-MM-dd'));
          }

          return null;
     };

     if (loading) {
          return (
               <div className="flex justify-center items-center mt-8">
                    <Spinner size="lg" />
               </div>
          );
     }

     return (
          <>
               <div className="md:grid gap-4 grid-cols-12">
                    <div className="hidden md:block col-span-4">
                         <Card>
                              <CardBody>
                                   <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                             <h3 className="text-lg font-semibold">Calendar</h3>
                                             {selectedDate && (
                                                  <Button
                                                       size="sm"
                                                       variant="light"
                                                       color="primary"
                                                       onPress={clearDateFilter}
                                                  >
                                                       View All
                                                  </Button>
                                             )}
                                        </div>
                                        <Calendar 
                                             aria-label="Fixture Calendar"
                                             classNames={{
                                                  content: "w-full",
                                                  gridWrapper: "w-full",
                                                  grid: "w-full",
                                             }}
                                             onChange={handleDateChange}
                                             value={selectedDate}
                                        />
                                        {fixtureDates.length > 0 && (
                                             <div className="text-xs text-gray-500 mt-2">
                                                  Days with fixtures are highlighted
                                             </div>
                                        )}
                                   </div>
                              </CardBody>
                         </Card>
                    </div>

                    <div className="md:hidden mb-5">
                         <Card>
                              <CardBody>
                                   <div className="flex items-center gap-2">
                                        <DatePicker 
                                             label="Filter by Date"
                                             variant="bordered"
                                             className="flex-1"
                                             onChange={handleDateChange}
                                             value={selectedDate}
                                        />
                                        {selectedDate && (
                                             <Button
                                                  size="sm"
                                                  variant="light"
                                                  color="primary"
                                                  onPress={clearDateFilter}
                                             >
                                                  View All
                                             </Button>
                                        )}
                                   </div>
                              </CardBody>
                         </Card>
                    </div>

                    <div className="col-span-8">
                         <div className="mb-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                   {selectedDate && (
                                        <div className="flex items-center gap-2">
                                             <Chip variant="flat" color="primary">
                                                  Showing fixtures for {format(selectedDate.toDate('UTC'), "dd MMMM yyyy")}
                                             </Chip>
                                             <span className="text-sm text-gray-500">
                                                  ({filteredFixtures.length} fixture{filteredFixtures.length !== 1 ? 's' : ''})
                                             </span>
                                        </div>
                                   )}
                                   {isUserAdmin && (
                                        <Button 
                                             color="primary" 
                                             variant="solid"
                                             startContent={<FaPlus />}
                                             onPress={onOpen}
                                        >
                                             Create Fixture
                                        </Button>
                                   )}
                              </div>
                         </div>

                         {filteredFixtures.length === 0 ? (
                              <Card>
                                   <CardBody className="text-center py-8">
                                        <p className="text-gray-500">
                                             {selectedDate 
                                                  ? `No fixtures scheduled for ${format(selectedDate.toDate('UTC'), "dd MMMM yyyy")}.`
                                                  : "No fixtures scheduled for this season."
                                             }
                                        </p>
                                        {selectedDate ? (
                                             <Button 
                                                  className="mt-3"
                                                  color="primary" 
                                                  variant="flat"
                                                  onPress={clearDateFilter}
                                             >
                                                  View All Fixtures
                                             </Button>
                                        ) : isUserAdmin && (
                                             <Button 
                                                  className="mt-3"
                                                  color="primary" 
                                                  variant="flat"
                                                  onPress={onOpen}
                                             >
                                                  Create First Fixture
                                             </Button>
                                        )}
                                   </CardBody>
                              </Card>
                         ) : (
                              filteredFixtures.map((fixture) => (
                                   <Card key={fixture.id} className="mb-4 hover:shadow-md transition-shadow cursor-pointer">
                                        <CardBody>
                                             <Link href={`/fixtures/${fixture.id}`}>
                                                  <div className="w-full flex flex-row justify-between items-center">
                                                       <div className="flex flex-col items-center text-center flex-1">
                                                            <FaShieldAlt size={24} className="mb-2" />
                                                            <span className="text-xs md:text-sm font-bold">
                                                                 {fixture.homeCampaign?.teamCampaign?.team?.name || 'TBD'}
                                                            </span>
                                                       </div>

                                                       <div className="hidden lg:block text-2xl font-bold mx-4">
                                                            {fixture.homeScore}
                                                       </div>

                                                       <div className="flex flex-col items-center flex-1 px-4">
                                                            <div className="flex flex-col items-center mb-2">
                                                                 {fixture.scheduledDate ? (
                                                                      <>
                                                                           <span className="hidden lg:inline text-sm">
                                                                                <FaCalendarAlt className="inline mr-1" />
                                                                                {format(new Date(fixture.scheduledDate), "dd MMMM yyyy")}
                                                                           </span>
                                                                           <span className="inline lg:hidden text-xs">
                                                                                {format(new Date(fixture.scheduledDate), "dd.MM.yyyy")}
                                                                           </span>
                                                                      </>
                                                                 ) : (
                                                                      <span className="text-sm text-gray-500">
                                                                           <FaClock className="inline mr-1" />
                                                                           TBD
                                                                      </span>
                                                                 )}
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2">
                                                                 <span className="lg:hidden font-bold">{fixture.homeScore}</span>
                                                                 <span className="text-sm">vs</span>
                                                                 <span className="lg:hidden font-bold">{fixture.awayScore}</span>
                                                            </div>
                                                            
                                                            <div className="mt-2 flex flex-col items-center gap-1">
                                                                 <Chip 
                                                                      size="sm" 
                                                                      color={getStatusColor(fixture.status)}
                                                                      variant="flat"
                                                                 >
                                                                      {fixture.status.replace('_', ' ').toUpperCase()}
                                                                 </Chip>
                                                                 {fixture.isLive && (
                                                                      <Chip 
                                                                           size="sm" 
                                                                           color="danger"
                                                                           variant="solid"
                                                                           className="animate-pulse"
                                                                      >
                                                                           🔴 LIVE
                                                                      </Chip>
                                                                 )}
                                                            </div>

                                                            {fixture._count.frames > 0 && (
                                                                 <div className="mt-1 text-xs text-gray-500">
                                                                      {fixture._count.frames} frame{fixture._count.frames !== 1 ? 's' : ''}
                                                                 </div>
                                                            )}
                                                       </div>
                                                       
                                                       <div className="hidden lg:block text-2xl font-bold mx-4">
                                                            {fixture.awayScore}
                                                       </div>

                                                       <div className="flex flex-col items-center text-center flex-1">
                                                            <FaShieldAlt size={24} className="mb-2" />
                                                            <span className="text-xs md:text-sm font-bold">
                                                                 {fixture.awayCampaign.teamCampaign?.team?.name || 'TBD'}
                                                            </span>
                                                       </div>
                                                  </div>
                                             </Link>
                                        </CardBody>
                                   </Card>
                              ))
                         )}
                    </div>
               </div>

               <Modal isOpen={isOpen} onClose={onClose} size="lg">
                    <ModalContent>
                         <Formik
                              initialValues={{
                                   seasonId: selectedSeasonId || '',
                                   homeCampaignId: '',
                                   awayCampaignId: '',
                                   scheduledDate: '',
                                   venue: '',
                                   notes: ''
                              }}
                              validationSchema={validationSchema}
                              validateOnBlur
                              onSubmit={handleSubmitForm}
                         >
                              {props => (
                                   <Form>
                                        <ModalHeader>Create Fixture</ModalHeader>
                                        <ModalBody className="space-y-4">
                                             <Select 
                                                  name="seasonId"
                                                  label="Season"
                                                  placeholder="Select a season"
                                                  variant="bordered"
                                                  errorMessage={props.errors.seasonId}
                                                  isInvalid={Boolean(props.errors.seasonId)}
                                                  selectedKeys={props.values.seasonId ? [props.values.seasonId] : []}
                                                  onSelectionChange={(keys) => {
                                                       const selectedKey = Array.from(keys)[0] as string;
                                                       props.setFieldValue('seasonId', selectedKey);
                                                  }}
                                             >
                                                  {seasons.map((season) => (
                                                       <SelectItem key={season.id}>
                                                            {season.name}
                                                       </SelectItem>
                                                  ))}
                                             </Select>

                                             <Select 
                                                  name="homeCampaignId"
                                                  label="Home Team"
                                                  placeholder="Select home team"
                                                  variant="bordered"
                                                  errorMessage={props.errors.homeCampaignId}
                                                  isInvalid={Boolean(props.errors.homeCampaignId)}
                                                  selectedKeys={props.values.homeCampaignId ? [props.values.homeCampaignId] : []}
                                                  onSelectionChange={(keys) => {
                                                       const selectedKey = Array.from(keys)[0] as string;
                                                       props.setFieldValue('homeCampaignId', selectedKey);
                                                  }}
                                             >
                                                  {campaigns.filter(c => c.id !== props.values.awayCampaignId).map((campaign) => (
                                                       <SelectItem key={campaign.id}>
                                                            {campaign.teamCampaign?.team?.name || `Campaign ${campaign.id.slice(-6)}`}
                                                       </SelectItem>
                                                  ))}
                                             </Select>

                                             <Select 
                                                  name="awayCampaignId"
                                                  label="Away Team"
                                                  placeholder="Select away team"
                                                  variant="bordered"
                                                  errorMessage={props.errors.awayCampaignId}
                                                  isInvalid={Boolean(props.errors.awayCampaignId)}
                                                  selectedKeys={props.values.awayCampaignId ? [props.values.awayCampaignId] : []}
                                                  onSelectionChange={(keys) => {
                                                       const selectedKey = Array.from(keys)[0] as string;
                                                       props.setFieldValue('awayCampaignId', selectedKey);
                                                  }}
                                             >
                                                  {campaigns.filter(c => c.id !== props.values.homeCampaignId).map((campaign) => (
                                                       <SelectItem key={campaign.id}>
                                                            {campaign.teamCampaign?.team?.name || `Campaign ${campaign.id.slice(-6)}`}
                                                       </SelectItem>
                                                  ))}
                                             </Select>

                                             <Input
                                                  type="datetime-local"
                                                  name="scheduledDate"
                                                  label="Scheduled Date & Time"
                                                  placeholder="Select date and time"
                                                  variant="bordered"
                                                  onChange={props.handleChange}
                                                  onBlur={props.handleBlur}
                                                  value={props.values.scheduledDate}
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
                                             />

                                             <Input
                                                  type="text"
                                                  name="notes"
                                                  label="Notes"
                                                  placeholder="Additional notes"
                                                  variant="bordered"
                                                  onChange={props.handleChange}
                                                  onBlur={props.handleBlur}
                                                  value={props.values.notes}
                                             />
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
                                                  Create Fixture
                                             </Button>
                                        </ModalFooter>
                                   </Form>
                              )}
                         </Formik>
                    </ModalContent>
               </Modal>
          </>
     )
}

export default FixtureList;