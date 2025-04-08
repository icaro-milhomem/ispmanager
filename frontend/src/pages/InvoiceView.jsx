import React, { useState, useEffect } from "react";
import { Invoice } from "@/api/entities";
import { Customer } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Download, Printer, Receipt, CreditCard, QrCode } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function InvoiceViewPage() {
  const { toast } = useToast();
  const [invoice, setInvoice] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInvoice();
  }, []);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obter o ID da fatura da URL
      const urlParams = new URLSearchParams(window.location.search);
      const invoiceId = urlParams.get('id');

      if (!invoiceId) {
        throw new Error('ID da fatura não especificado');
      }

      // Carregar todas as faturas (não temos método get por ID)
      const invoices = await Invoice.list();
      const currentInvoice = invoices.find(inv => inv.id === invoiceId);

      if (!currentInvoice) {
        throw new Error('Fatura não encontrada');
      }

      setInvoice(currentInvoice);

      // Carregar dados do cliente
      const customers = await Customer.list();
      const invoiceCustomer = customers.find(cust => cust.id === currentInvoice.customer_id);

      if (invoiceCustomer) {
        setCustomer(invoiceCustomer);
      }
    } catch (err) {
      console.error('Erro ao carregar fatura:', err);
      setError(err.message || 'Erro ao carregar fatura');
      toast({
        title: "Erro",
        description: err.message || 'Erro ao carregar fatura',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: pt });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p>Carregando fatura...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 mb-4 text-5xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro ao carregar fatura</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.history.back()} 
            className="bg-blue-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Fatura não encontrada</h2>
          <p className="text-gray-600 mb-4">A fatura solicitada não foi encontrada.</p>
          <Button 
            onClick={() => window.history.back()} 
            className="bg-blue-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <div className="print:hidden mb-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-8">
        <header className="mb-8 flex justify-between items-center border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">FATURA</h1>
            <p className="text-gray-500">#{invoice.id}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">ISP Manager</h2>
            <p className="text-gray-500">CNPJ: 00.000.000/0001-00</p>
            <p className="text-gray-500">contato@ispmanager.com.br</p>
            <p className="text-gray-500">(11) 1234-5678</p>
          </div>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-gray-500 font-medium mb-2">Faturado para:</h3>
            <p className="font-bold text-lg">{customer?.full_name}</p>
            <p>{customer?.document_number}</p>
            <p>{customer?.email}</p>
            <p>{customer?.phone}</p>
            <p>{customer?.address}, {customer?.address_number}</p>
            <p>{customer?.neighborhood}, {customer?.city} - {customer?.state}</p>
          </div>
          <div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Número da Fatura:</span>
                <span className="font-medium">{invoice.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Data de Emissão:</span>
                <span className="font-medium">{format(new Date(), "dd/MM/yyyy")}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Data de Vencimento:</span>
                <span className="font-medium">{format(new Date(invoice.due_date), "dd/MM/yyyy")}</span>
              </div>
              <div className="flex justify-between py-2 font-bold">
                <span>Valor Total:</span>
                <span className="text-xl">{formatCurrency(invoice.amount)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 border text-left">Descrição</th>
                <th className="py-2 px-4 border text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 px-4 border">{invoice.description}</td>
                <td className="py-4 px-4 border text-right">{formatCurrency(invoice.amount)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td className="py-3 px-4 border text-right">Total</td>
                <td className="py-3 px-4 border text-right">{formatCurrency(invoice.amount)}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section className="mb-8">
          <h3 className="text-lg font-bold mb-4">Instruções de Pagamento</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            {invoice.payment_method === 'bank_slip' && (
              <div className="flex items-start gap-4">
                <Receipt className="w-8 h-8 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-bold mb-1">Boleto Bancário</h4>
                  <p className="mb-3">O boleto para pagamento foi enviado por email. Se preferir, utilize o código de barras abaixo:</p>
                  <div className="bg-white p-3 border border-gray-200 font-mono text-sm break-all mb-4">
                    {invoice.payment_data?.barcode || '34191.79001 01043.510047 91020.150008 7 93180000029999'}
                  </div>
                </div>
              </div>
            )}
            
            {invoice.payment_method === 'pix' && (
              <div className="flex items-start gap-4">
                <QrCode className="w-8 h-8 text-green-600 mt-1" />
                <div>
                  <h4 className="font-bold mb-1">Pagamento via PIX</h4>
                  <p className="mb-3">Escaneie o QR Code abaixo ou copie o código PIX:</p>
                  <div className="flex justify-center mb-3">
                    <div className="bg-white p-4 border border-gray-200 inline-block">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code PIX" className="w-32 h-32" />
                    </div>
                  </div>
                  <div className="bg-white p-3 border border-gray-200 font-mono text-sm break-all">
                    {invoice.payment_data?.copy_paste || '00020126580014BR.GOV.BCB.PIX0136a629532e-7693-4846-b028-f142736891670224Pagamento de servicos52040000530398654075.005802BR5913ISP MANAGER6008Sao Paulo62070503***6304E2CA'}
                  </div>
                </div>
              </div>
            )}
            
            {invoice.payment_method === 'credit_card' && (
              <div className="flex items-start gap-4">
                <CreditCard className="w-8 h-8 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-bold mb-1">Cartão de Crédito</h4>
                  <p>Para pagar com cartão de crédito, acesse a área do cliente em nosso site ou entre em contato com nossa central de atendimento.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Em caso de dúvidas, entre em contato com nosso suporte:</p>
          <p>suporte@ispmanager.com.br | (11) 1234-5678</p>
        </footer>
      </div>
    </div>
  );
}