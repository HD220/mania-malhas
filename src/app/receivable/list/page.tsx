import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Page() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Card className="flex flex-col flex-1">
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
        <Card className="flex flex-col flex-1">
          <CardHeader className="px-2">
            <CardTitle>Nicolas Fraga Faust</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-2 p-2">
            <div className="flex flex-1 flex-row gap-2">
              <div className="flex flex-col flex-1 items-center justify-center bg-secondary p-2 ">
                <span className="text-primary">Dívida</span>
                <p className="text-primary-foreground">R$ 50,00</p>
              </div>
              <div className="flex flex-col flex-1 items-center justify-center bg-secondary p-2 ">
                <span className="text-primary">Pago</span>
                <p className="text-primary-foreground">R$ 50,00</p>
              </div>
            </div>
            <div className="flex flex-col flex-1 items-center justify-center bg-secondary p-2  text-center">
              <span className="text-primary">Pendente</span>
              <p className="text-primary-foreground">R$ 50,00</p>
            </div>
          </CardContent>
          <CardFooter className="p-2">
            <Button className="w-full">Novo Pagamento</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
