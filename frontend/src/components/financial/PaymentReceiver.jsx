
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Payment } from "@/api/entities";
import { Invoice } from "@/api/entities";
import { FinancialTransaction } from "@/api/entities";

export default function PaymentReceiver({ invoice, onPaymentReceived }) {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: invoice?.amount || 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    notes: ''
  });

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Verificar valor numérico
      const paymentAmount = parseFloat(paymentData.amount);
      if (isNaN(paymentAmount)) {
        throw new Error("Valor de pagamento inválido");
      }
      
      // Verificar data válida
      const paymentDate = new Date(paymentData.payment_date);
      if (isNaN(paymentDate.getTime())) {
        throw new Error("Data de pagamento inválida");
      }
      
      // Registrar pagamento
      const payment = await Payment.create({
        invoice_id: invoice.id,
        customer_id: invoice.customer_id,
        amount: paymentAmount,
        payment_method: paymentData.payment_method,
        payment_date: paymentData.payment_date,
        status: 'completed'
      });

      // Atualizar status da fatura
      await Invoice.update(invoice.id, {
        ...invoice,
        status: 'paid',
        payment_date: paymentData.payment_date
      });

      // Registrar transação financeira
      await FinancialTransaction.create({
        type: 'income',
        amount: paymentAmount,
        description: `Pagamento da fatura ${invoice.id}`,
        date: paymentData.payment_date,
        status: 'paid',
        payment_method: paymentData.payment_method,
        customer_id: invoice.customer_id,
        invoice_id: invoice.id
      });

      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado com sucesso"
      });

      setShowDialog(false);
      if (onPaymentReceived) {
        onPaymentReceived(payment);
      }

    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast({
        title: "Erro ao registrar pagamento",
        description: "Não foi possível registrar o pagamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        Registrar Pagamento
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Registre o pagamento da fatura {invoice?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Valor</label>
              <Input
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({
                  ...paymentData,
                  amount: e.target.value
                })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Data do Pagamento</label>
              <Input
                type="date"
                value={paymentData.payment_date}
                onChange={(e) => setPaymentData({
                  ...paymentData,
                  payment_date: e.target.value
                })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <select
                className="w-full rounded-md border border-input px-3 py-2"
                value={paymentData.payment_method}
                onChange={(e) => setPaymentData({
                  ...paymentData,
                  payment_method: e.target.value
                })}
              >
                <option value="cash">Dinheiro</option>
                <option value="card">Cartão</option>
                <option value="bank_slip">Boleto</option>
                <option value="pix">PIX</option>
                <option value="transfer">Transferência</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Observações</label>
              <Input
                value={paymentData.notes}
                onChange={(e) => setPaymentData({
                  ...paymentData,
                  notes: e.target.value
                })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={loading}
              className="bg-green-600"
            >
              {loading ? 'Registrando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
