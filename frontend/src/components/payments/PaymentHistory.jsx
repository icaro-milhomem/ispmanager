import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Download, 
  CreditCard,
  FileText,
  User, 
  Calendar,
  Eye,
  Check
} from "lucide-react";

export default function PaymentHistory({ 
  payments, 
  customers, 
  invoices,
  selectedCustomerId = null 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Status de pagamento em português
  const paymentStatusLabels = {
    pending: "Pendente",
    completed: "Concluído",
    failed: "Falhou",
    refunded: "Reembolsado"
  };
  
  // Cores para os status
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-purple-100 text-purple-800"
  };
  
  // Métodos de pagamento em português
  const paymentMethodLabels = {
    credit_card: "Cartão de Crédito",
    bank_slip: "Boleto",
    pix: "PIX",
    direct_debit: "Débito Direto",
    cash: "Dinheiro"
  };
  
  // Filtrar pagamentos por termo de busca e/ou customer selecionado
  const filteredPayments = payments.filter(payment => {
    const customer = customers.find(c => c.id === payment.customer_id);
    const invoice = invoices.find(i => i.id === payment.invoice_id);
    
    const searchString = `
      ${customer?.full_name || ""} 
      ${payment.transaction_id || ""} 
      ${payment.amount || ""} 
      ${payment.status || ""}
    `.toLowerCase();
    
    // Verificar se o termo de busca coincide
    const matchesSearch = searchTerm === "" || searchString.includes(searchTerm.toLowerCase());
    
    // Verificar se o cliente selecionado coincide (se houver um selecionado)
    const matchesCustomer = !selectedCustomerId || payment.customer_id === selectedCustomerId;
    
    return matchesSearch && matchesCustomer;
  });
  
  // Ordenar por data mais recente
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    return new Date(b.payment_date) - new Date(a.payment_date);
  });
  
  // Função para obter informações formatadas
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.full_name : "Cliente não encontrado";
  };
  
  const getInvoiceNumber = (invoiceId) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    return invoice ? `#${invoiceId.substring(0, 8)}` : "Fatura não encontrada";
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Buscar pagamentos..." 
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Fatura</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Transação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <FileText className="w-8 h-8 mb-2 text-gray-400" />
                    {selectedCustomerId 
                      ? "Este cliente não possui pagamentos registrados" 
                      : "Nenhum pagamento encontrado"}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{getCustomerName(payment.customer_id)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{getInvoiceNumber(payment.invoice_id)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(payment.payment_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      R$ {payment.amount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span>{paymentMethodLabels[payment.payment_method] || payment.payment_method}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[payment.status] || "bg-gray-100"}
                    >
                      {payment.status === "completed" && <Check className="w-3 h-3 mr-1" />}
                      {paymentStatusLabels[payment.status] || payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs truncate max-w-[120px]">
                      {payment.transaction_id || "-"}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}