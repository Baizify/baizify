import { Link, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import Image from "next/image";
import { FaShield } from "react-icons/fa6";

const LeagueTable = () => {
     const campaigns: any[] = [
          {
               id: 1,
               team: {
                    name: 'Hanging Heaton CC (A)'
               },
               pointsFor: 180,
               pointsAgainst: 300,
               points: 5
          },
          {
               id: 2,
               team: {
                    name: 'Hanging Heaton CC (B)'
               },
               pointsFor: 320,
               pointsAgainst: 300,
               points: 5
          },
          {
               id: 3,
               team: {
                    name: 'Hanging Heaton CC (C)'
               },
               pointsFor: 460,
               pointsAgainst: 10,
               points: 9
          },
          {
               id: 4,
               team: {
                    badge: '/HHCC.png',
                    name: 'Hanging Heaton CC (D)'
               },
               pointsFor: 380,
               pointsAgainst: 250,
               points: 7
          }
     ];

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
               <TableBody items={campaigns.sort((a,b) => b.points - a.points)} emptyContent={"No rows to display."}>
                    {(campaign) => (
                         <TableRow key={campaign.id}>
                              <TableCell className="text-center">{campaign.team.badge ? <Image src={campaign.team.badge} alt={"team badge"} width={24} height={24} />  : <FaShield width={24} height={24}  />}</TableCell>
                              <TableCell><Link href={`competitions/${campaign.id}`}>{campaign.team.name}</Link></TableCell>
                              <TableCell className="hidden md:table-cell">1</TableCell>
                              <TableCell>{campaign.points}</TableCell>
                              <TableCell  className="hidden md:table-cell">4</TableCell>
                              <TableCell>{campaign.pointsFor - campaign.pointsAgainst}</TableCell>
                         </TableRow>
                    )}
               </TableBody>
          </Table>
     )
}

export default LeagueTable;