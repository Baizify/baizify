import prisma from "@/providers/prisma";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import CompetitionListTable from "./components/competitionListTable";

/**
 * The competition list page.
 * @returns The competition list page.
 */
const CompetitionListPage = async (): Promise<React.ReactElement> => {
     const competitions = await prisma.competition.findMany();

     return (
          <>
               <h1 className="text-xl font-bold">Competitions</h1>
               <p className="text-gray-400 text-sm">List of all competitions.</p>

               <CompetitionListTable competitions={competitions} />
          </>
     )
}

export default CompetitionListPage;