import { Link, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Spinner } from "@heroui/react";
import Image from "next/image";
import { FaShield } from "react-icons/fa6";

const LeagueTable = ({ campaigns = [], loading = false }) => {

     if (loading) {
          return (
               <div className="flex justify-center items-center mt-8">
                    <Spinner size="lg" />
               </div>
          )
     }

     const campaignsWithTeam = campaigns.filter(campaign => campaign.teamCampaign?.team)

     return (
          <Table className="mt-3">
               <TableHeader>
                    <TableColumn><></></TableColumn>
                    <TableColumn>Team</TableColumn>
                    <TableColumn className="hidden md:table-cell">Played</TableColumn>
                    <TableColumn>Points</TableColumn>
                    <TableColumn className="hidden md:table-cell">Frames</TableColumn>
                    <TableColumn>Aggregate</TableColumn>
               </TableHeader>
               <TableBody 
                    items={campaignsWithTeam.sort((a,b) => (b.leagueCampaign?.points || 0) - (a.leagueCampaign?.points || 0))} 
                    emptyContent={"No teams found for this season."}
               >
                    {(campaign) => (
                         <TableRow key={campaign.id}>
                              <TableCell className="text-center">
                                   {campaign.teamCampaign?.team?.badge ? 
                                        <Image src={campaign.teamCampaign.team.badge} alt={"team badge"} width={24} height={24} /> : 
                                        <FaShield width={24} height={24} />
                                   }
                              </TableCell>
                              <TableCell>
                                   <Link href={`/teams/${campaign.teamCampaign?.team?.id}`}>
                                        {campaign.teamCampaign?.team?.name}
                                   </Link>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                   {campaign.leagueCampaign?.played || 0}
                              </TableCell>
                              <TableCell>
                                   {campaign.leagueCampaign?.points || 0}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                   {campaign.leagueCampaign?.framesPlayed || 0}
                              </TableCell>
                              <TableCell>
                                   {(campaign.leagueCampaign?.pointsScoredFor || 0) - (campaign.leagueCampaign?.pointsScoredAgainst || 0)}
                              </TableCell>
                         </TableRow>
                    )}
               </TableBody>
          </Table>
     )
}

export default LeagueTable;