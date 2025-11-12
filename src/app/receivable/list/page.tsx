import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-1 justify-end gap-2">
        <div className="flex gap-2">
          <Search className="flex" />
          <Button asChild>
            <Link href="/receivable/new">Nova</Link>
          </Button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
        <Card className="">
          <CardHeader>
            <CardTitle>Nicolas Fraga Faust</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-2 w-[30%] text-right">Data</TableHead>
                  <TableHead className="p-2 text-center">Valor</TableHead>
                  <TableHead className="p-2 w-[30%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="p-2 text-right">05/03/24</TableCell>
                  <TableCell className="p-2 text-center">R$ 66,80</TableCell>
                  <TableCell className="p-2">Brusinha</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="p-2 text-right">10/04/24</TableCell>
                  <TableCell className="p-2 text-center">-R$ 30,00</TableCell>
                  <TableCell className="p-2">R$ 36,80</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="p-2 text-right">11/06/24</TableCell>
                  <TableCell className="p-2 text-center">R$ 25,00</TableCell>
                  <TableCell className="p-2">Calcinha</TableCell>
                </TableRow>
              </TableBody>
              <TableCaption>A receber: R$ 61,80</TableCaption>
            </Table>
          </CardContent>
          <CardFooter className="p-2">
            <Button className="w-full">Novo Pagamento</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
