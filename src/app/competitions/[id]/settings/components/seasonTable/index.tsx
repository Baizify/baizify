'use client'

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react"

const SeasonTable = () => {
     return (
          <Table shadow="none" fullWidth>
               <TableHeader>
                    <TableColumn>Season</TableColumn>
               </TableHeader>
               <TableBody>
                    <TableRow>
                         <TableCell>Season 1</TableCell>
                    </TableRow>
               </TableBody>
          </Table>
     )
}

export default SeasonTable;