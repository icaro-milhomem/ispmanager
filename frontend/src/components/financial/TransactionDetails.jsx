import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Calendar,
  FileText,
  User,
  Building,
  CreditCard,
  ClipboardList,
  Tag,
  FileInput,
  ArrowDownLeft,
  ArrowUpRight,
  Edit
} from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

const paymentMethodLabels = {
  bank_slip: "Boleto",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  transfer: "Transferência",
  cash: "Dinheiro",
  pix: "PIX",
  check: "Cheque"
};

export default function TransactionDetails({ 
  transaction, 
  customers, 
  suppliers, 
  onClose,
  onEdit
}) {
  if (!transaction) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getEntityName = () => {
    if (transaction.type === "income" && transaction.customer_id) {
      const customer = customers.find(c => c.id === transaction.customer_id);
      return customer ? customer.full_name : "Cliente não encontrado";
    } else if (transaction.type === "expense" && transaction.supplier_id) {
      const supplier = suppliers.find(s => s.id === transaction.supplier_id);
      return supplier ? supplier.name : "Fornecedor não encontrado";
    }
    return "-";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader className="relative pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge
              className={transaction.type === "income" 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"}
            >
              <span className="flex items-center gap-1">
                {transaction.type === "income" 
                  ? <ArrowDownLeft className="w-3 h-3" /> 
                  : <ArrowUpRight className="w-3 h-3" />}
                {transaction.type === "income" ? "Receita" : "Despesa"}
              </span>
            </Badge>
            <Badge
              variant="secondary"
              className={statusColors[transaction.status]}
            >
              {statusLabels[transaction.status]}
            </Badge>
          </div>
          <Button 
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => onEdit(transaction)}
          >
            <Edit className="w-3 h-3" />
            Editar
          </Button>
        </div>
        <CardTitle className="mt-2">
          {transaction.description}
        </CardTitle>
        <div className="text-sm text-gray-500">
          Código: {transaction.reference_code}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Valor</h4>
                <div className={`text-xl font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Datas</h4>
                <div>
                  <div className="text-sm">Emissão: <span className="font-medium">{formatDate(transaction.date)}</span></div>
                  {transaction.payment_date && (
                    <div className="text-sm">Pagamento: <span className="font-medium">{formatDate(transaction.payment_date)}</span></div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Forma de Pagamento</h4>
                <div className="text-sm">{paymentMethodLabels[transaction.payment_method]}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Categoria</h4>
                <div className="text-sm">{transaction.category || "-"}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {transaction.type === "income" ? (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Cliente</h4>
                  <div className="text-sm font-medium">{getEntityName()}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fornecedor</h4>
                  <div className="text-sm font-medium">{getEntityName()}</div>
                </div>
              </div>
            )}
            
            {transaction.total_installments > 1 && (
              <div className="flex items-start gap-3">
                <ClipboardList className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Parcelamento</h4>
                  <div className="text-sm">
                    Parcela <span className="font-medium">{transaction.installment_number}</span> de <span className="font-medium">{transaction.total_installments}</span>
                  </div>
                </div>
              </div>
            )}
            
            {(transaction.invoice_file_url || transaction.bill_file_url) && (
              <div className="flex items-start gap-3">
                <FileInput className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Arquivos</h4>
                  <div className="flex flex-col gap-2 mt-2">
                    {transaction.invoice_file_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 justify-start gap-2"
                        onClick={() => window.open(transaction.invoice_file_url, '_blank')}
                      >
                        <FileText className="h-4 w-4 text-blue-600" />
                        Nota Fiscal
                      </Button>
                    )}
                    {transaction.bill_file_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 justify-start gap-2"
                        onClick={() => window.open(transaction.bill_file_url, '_blank')}
                      >
                        <DollarSign className="h-4 w-4 text-green-600" />
                        Boleto/Comprovante
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </CardFooter>
    </Card>
  );
}