import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Receipt,
  Search,
  Download,
  ExternalLink,
  CreditCard,
  ArrowRight,
  FileText,
  Wallet,
  CheckCircle
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
  cancelled: "Cancelado"
};

const paymentMethodIcons = {
  credit_card: <CreditCard className="w-4 h-4" />,
  bank_slip: <FileText className="w-4 h-4" />,
  pix: <Wallet className="w-4 h-4" />
};

const paymentMethodLabels = {
  credit_card: "Cartão de Crédito",
  bank_slip: "Boleto",
  pix: "PIX"
};

export default function ClientInvoices({ invoices, clientData }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  
  const filteredInvoices = invoices.filter(invoice => 
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(invoice.due_date).toLocaleDateString('pt-BR').includes(searchTerm)
  );
  
  const handleShowInvoiceDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentConfirmation(false);
  };
  
  const handleCloseDetails = () => {
    setSelectedInvoice(null);
    setShowPaymentConfirmation(false);
  };
  
  const handlePay = () => {
    setShowPaymentConfirmation(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Minhas Faturas</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resumo Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Plano atual:</span>
              <span className="font-medium">
                {clientData.plan === "basic" ? "Básico" : 
                 clientData.plan === "standard" ? "Padrão" : 
                 clientData.plan === "premium" ? "Premium" : 
                 "Empresarial"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Valor mensal:</span>
              <span className="font-medium">
                R$ {
                  clientData.plan === "basic" ? "99,90" : 
                  clientData.plan === "standard" ? "129,90" : 
                  clientData.plan === "premium" ? "159,90" : 
                  "399,90"
                }
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Dia de vencimento:</span>
              <span className="font-medium">{new Date().getDate() + 10}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Status de pagamento:</span>
              <Badge className={
                invoices.some(i => i.status === 'overdue') 
                  ? "bg-red-100 text-red-800" 
                  : "bg-green-100 text-green-800"
              }>
                {invoices.some(i => i.status === 'overdue') ? "Em atraso" : "Em dia"}
              </Badge>
            </div>
            
            {invoices.some(i => i.status === 'pending') && (
              <Button className="w-full mt-4 gap-2 bg-blue-600" onClick={() => handleShowInvoiceDetails(invoices.find(i => i.status === 'pending'))}>
                <CreditCard className="w-4 h-4" />
                Pagar Fatura Pendente
              </Button>
            )}
          </CardContent>
        </Card>
        
        {/* Próximas Faturas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Próximas Faturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInvoices.filter(i => i.status === 'pending').length > 0 ? (
              <div className="space-y-4">
                {filteredInvoices
                  .filter(i => i.status === 'pending')
                  .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                  .slice(0, 3)
                  .map((invoice, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Fatura #{(invoice.invoice_number || "").slice(-4)}</div>
                        <div className="text-sm text-gray-500">Vencimento: {new Date(invoice.due_date).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-medium">R$ {invoice.amount?.toFixed(2).replace('.', ',')}</div>
                          <Badge className={statusColors[invoice.status]}>
                            {statusLabels[invoice.status]}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleShowInvoiceDetails(invoice)}>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>Não há faturas pendentes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Lista de Faturas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Faturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar faturas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Forma de Pagamento</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      Nenhuma fatura encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">Fatura #{(invoice.invoice_number || "").slice(-4)}</TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>R$ {invoice.amount?.toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[invoice.status]}>
                          {statusLabels[invoice.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {paymentMethodIcons[invoice.payment_method]}
                          <span>{paymentMethodLabels[invoice.payment_method]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleShowInvoiceDetails(invoice)}>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal de Detalhes da Fatura */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-6">
              {showPaymentConfirmation ? (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Pagamento Realizado!</h3>
                    <p className="text-gray-500">
                      Seu pagamento foi processado com sucesso. Obrigado!
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Fatura</span>
                      <span className="font-medium">#{(selectedInvoice.invoice_number || "").slice(-4)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Valor</span>
                      <span className="font-medium">R$ {selectedInvoice.amount?.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Data do Pagamento</span>
                      <span className="font-medium">{new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Forma de Pagamento</span>
                      <span className="font-medium">{paymentMethodLabels[selectedInvoice.payment_method]}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={handleCloseDetails}
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">Detalhes da Fatura</h3>
                      <p className="text-gray-500">Fatura #{(selectedInvoice.invoice_number || "").slice(-4)}</p>
                    </div>
                    <Badge className={statusColors[selectedInvoice.status]}>
                      {statusLabels[selectedInvoice.status]}
                    </Badge>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Cliente</span>
                      <span className="font-medium">{clientData.full_name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Plano</span>
                      <span className="font-medium">
                        {clientData.plan === "basic" ? "Básico" : 
                        clientData.plan === "standard" ? "Padrão" : 
                        clientData.plan === "premium" ? "Premium" : 
                        "Empresarial"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Período</span>
                      <span className="font-medium">
                        {new Date(selectedInvoice.due_date).getMonth() + 1}/{new Date(selectedInvoice.due_date).getFullYear()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Vencimento</span>
                      <span className="font-medium">{new Date(selectedInvoice.due_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Valor</span>
                      <span className="font-bold text-lg">R$ {selectedInvoice.amount?.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={handleCloseDetails}
                    >
                      Fechar
                    </Button>
                    
                    {selectedInvoice.status === 'pending' && (
                      <Button
                        className="gap-2 bg-blue-600"
                        onClick={handlePay}
                      >
                        <CreditCard className="w-4 h-4" />
                        Realizar Pagamento
                      </Button>
                    )}
                    
                    {selectedInvoice.invoice_url && (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.open(selectedInvoice.invoice_url, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                        Baixar Fatura
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}