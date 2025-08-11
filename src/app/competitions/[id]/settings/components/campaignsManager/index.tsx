'use client'

import { Campaign, Season, Team } from "@/generator/prisma";
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
     Select,
     SelectItem,
     RadioGroup,
     Radio
} from "@heroui/react";
import { useState, useEffect } from "react";
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaTrash, FaCog } from "react-icons/fa";
import Link from "next/link";

interface CampaignWithRelations extends Campaign {
     season: Season;
     teamCampaign?: {
          team: Team;
     } | null;
     leagueCampaign?: object | null;
}

interface CampaignFormValues {
     seasonId: string;
     campaignType: 'team' | 'league';
     teamId?: string;
}

const CampaignsManager = ({
     competitionId
}: {
     competitionId: string
}) => {
     const [campaigns, setCampaigns] = useState<CampaignWithRelations[]>([]);
     const [seasons, setSeasons] = useState<Season[]>([]);
     const [teams, setTeams] = useState<Team[]>([]);
     const [loading, setLoading] = useState(true);
     const { isOpen, onOpen, onClose } = useDisclosure();
     const [isSubmitting, setIsSubmitting] = useState(false);

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

     const fetchTeams = async () => {
          try {
               const response = await fetch('/api/teams');
               if (response.ok) {
                    const data = await response.json();
                    setTeams(data);
               }
          } catch (error) {
               console.error('Error fetching teams:', error);
          }
     };

     const fetchData = async () => {
          setLoading(true);
          await Promise.all([
               fetchCampaigns(),
               fetchSeasons(),
               fetchTeams()
          ]);
          setLoading(false);
     };

     useEffect(() => {
          fetchData();
     }, [competitionId]);

     const handleSubmitForm = async (values: CampaignFormValues, { resetForm }: FormikHelpers<CampaignFormValues>) => {
          setIsSubmitting(true);

          try {
               const response = await fetch(`/api/competitions/${competitionId}/campaigns`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values)
               });

               if (response.ok) {
                    await fetchCampaigns();
                    resetForm();
                    onClose();
               }
          } catch (error) {
               console.error('Error creating campaign:', error);
          } finally {
               setIsSubmitting(false);
          }
     };

     const handleDeleteCampaign = async (campaignId: string) => {
          if (confirm('Are you sure you want to delete this campaign?')) {
               try {
                    const response = await fetch(`/api/campaigns/${campaignId}`, {
                         method: 'DELETE'
                    });

                    if (response.ok) {
                         await fetchCampaigns();
                    }
               } catch (error) {
                    console.error('Error deleting campaign:', error);
               }
          }
     };

     const validationSchema = Yup.object().shape({
          seasonId: Yup.string().required('Season is required'),
          campaignType: Yup.string().oneOf(['team', 'league']).required('Campaign type is required'),
          teamId: Yup.string().when('campaignType', {
               is: 'team',
               then: (schema) => schema.required('Team is required for team campaigns'),
               otherwise: (schema) => schema.notRequired()
          }),
     });

     return (
          <>
               <Card>
                    <CardHeader className="flex justify-between items-center">
                         <h2 className="text-lg font-semibold">Campaigns</h2>
                         <Button 
                              color="primary" 
                              variant="solid"
                              startContent={<FaPlus />}
                              onPress={onOpen}
                         >
                              Add Campaign
                         </Button>
                    </CardHeader>
                    <CardBody className="p-0">
                         <Table shadow="none" fullWidth>
                              <TableHeader>
                                   <TableColumn>SEASON</TableColumn>
                                   <TableColumn>TYPE</TableColumn>
                                   <TableColumn>TEAM</TableColumn>
                                   <TableColumn>CREATED</TableColumn>
                                   <TableColumn width={100}>ACTIONS</TableColumn>
                              </TableHeader>
                              <TableBody 
                                   isLoading={loading}
                                   emptyContent={loading ? "Loading..." : "No campaigns found"}
                              >
                                   {campaigns.map((campaign) => (
                                        <TableRow key={campaign.id}>
                                             <TableCell>{campaign.season?.name}</TableCell>
                                             <TableCell>
                                                  {campaign.teamCampaign ? 'Team' : campaign.leagueCampaign ? 'League' : 'Unknown'}
                                             </TableCell>
                                             <TableCell>
                                                  {campaign.teamCampaign?.team?.name || '-'}
                                             </TableCell>
                                             <TableCell>
                                                  {new Date(campaign.createdAt).toLocaleDateString()}
                                             </TableCell>
                                             <TableCell>
                                                  <div className="flex gap-2">
                                                       <Button
                                                            as={Link}
                                                            href={`/campaign/${campaign.id}/settings`}
                                                            size="sm"
                                                            variant="light"
                                                            isIconOnly
                                                       >
                                                            <FaCog />
                                                       </Button>
                                                       <Button
                                                            size="sm"
                                                            variant="light"
                                                            color="danger"
                                                            isIconOnly
                                                            onPress={() => handleDeleteCampaign(campaign.id)}
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

               <Modal isOpen={isOpen} onClose={onClose} size="lg">
                    <ModalContent>
                         <Formik
                              initialValues={{
                                   seasonId: '',
                                   campaignType: 'league' as 'team' | 'league',
                                   teamId: '',
                              }}
                              validationSchema={validationSchema}
                              validateOnBlur
                              onSubmit={handleSubmitForm}
                         >
                              {props => (
                                   <Form>
                                        <ModalHeader>Create Campaign</ModalHeader>
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
                                                       <SelectItem key={season.id} value={season.id}>
                                                            {season.name}
                                                       </SelectItem>
                                                  ))}
                                             </Select>

                                             <RadioGroup 
                                                  label="Campaign Type"
                                                  value={props.values.campaignType}
                                                  onValueChange={(value) => {
                                                       props.setFieldValue('campaignType', value);
                                                       if (value === 'league') {
                                                            props.setFieldValue('teamId', '');
                                                       }
                                                  }}
                                             >
                                                  <Radio value="league">League Campaign</Radio>
                                                  <Radio value="team">Team Campaign</Radio>
                                             </RadioGroup>

                                             {props.values.campaignType === 'team' && (
                                                  <Select 
                                                       name="teamId"
                                                       label="Team"
                                                       placeholder="Select a team"
                                                       variant="bordered"
                                                       errorMessage={props.errors.teamId}
                                                       isInvalid={Boolean(props.errors.teamId)}
                                                       selectedKeys={props.values.teamId ? [props.values.teamId] : []}
                                                       onSelectionChange={(keys) => {
                                                            const selectedKey = Array.from(keys)[0] as string;
                                                            props.setFieldValue('teamId', selectedKey);
                                                       }}
                                                  >
                                                       {teams.map((team) => (
                                                            <SelectItem key={team.id} value={team.id}>
                                                                 {team.name}
                                                            </SelectItem>
                                                       ))}
                                                  </Select>
                                             )}
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
                                                  Create Campaign
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

export default CampaignsManager;