'use client'

import { Table, TableHeader, TableRow, TableColumn, TableBody, TableCell } from "@heroui/react"
import { formatDistanceToNow } from 'date-fns'
import Link from "next/link"

const CompetitionListTable = ({
     competitions
}: {
     competitions: any[]
}) => {
     return (
          <Table className="mt-3">
               <TableHeader>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Created at</TableColumn>
               </TableHeader>
               <TableBody items={competitions} emptyContent={"No rows to display."}>
                    {(competition) => (
                         <TableRow key={competition.id}>
                              <TableCell><Link href={`competitions/${competition.id}`}>{competition.name}</Link></TableCell>
                              <TableCell>{formatDistanceToNow(competition.createdAt)}</TableCell>
                         </TableRow>
                    )}
               </TableBody>
          </Table>
     )
}

export default CompetitionListTable;