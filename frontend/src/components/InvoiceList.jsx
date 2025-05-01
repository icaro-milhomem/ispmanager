import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Trash2, CheckCircle, DollarSign } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusColors = {
  pending: "bg-yellow-500",
  paid: "bg-green-500",
  overdue: "bg-red-500",
  cancelled: "bg-gray-500"
};

const statusLabels = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado"
};

export default function InvoiceList({ 
  invoices, 
  onEdit, 
  onDelete, 
  onStatusChange,
  onReceivePayment 
}) {
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº Fatura</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data Pagamento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.invoice_number || invoice.id}</TableCell>
              <TableCell>{invoice.customer?.name || '-'}</TableCell>
              <TableCell>{formatCurrency(invoice.amount)}</TableCell>
              <TableCell>{formatDate(invoice.due_date)}</TableCell>
              <TableCell>
                <Badge className={statusColors[invoice.status]}>
                  {statusLabels[invoice.status]}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(invoice.payment_date)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {invoice.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onReceivePayment(invoice.id)}
                        title="Receber pagamento"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onStatusChange(invoice.id, 'paid')}
                        title="Marcar como pago"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(invoice)}
                    title="Editar"
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setInvoiceToDelete(invoice)}
                    title="Excluir"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a fatura {invoiceToDelete?.invoice_number || invoiceToDelete?.id}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(invoiceToDelete?.id);
                setInvoiceToDelete(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 