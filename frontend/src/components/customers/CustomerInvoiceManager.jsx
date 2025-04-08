
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { BillingBatch } from "@/api/entities";
import { Invoice } from "@/api/entities";

const PLAN_PRICES = {
  basic: 89.90,
  standard: 109.90,
  premium: 149.90,
  business: 299.90
};

export default function CustomerInvoiceManager({ customer, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getNextDueDate = () => {
    const today = new Date();
    let nextDate = new Date(today.getFullYear(), today.getMonth(), customer.due_day || 5);
    
    if (nextDate <= today) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    return nextDate.toISOString().split('T')[0];
  };

  const generateSingleInvoice = async (data) => {
    setLoading(true);
    try {
      // Criar lote de faturamento
      const batch = await BillingBatch.create({
        customer_id: customer.id,
        type: 'single',
        total_amount: data.amount,
        start_date: data.due_date,
        description: data.description,
        installments: 1
      });

      // Criar fatura
      await Invoice.create({
        customer_id: customer.id,
        amount: data.amount,
        due_date: data.due_date,
        description: data.description,
        status: 'pending',
        batch_id: batch.id
      });

      toast({
        title: "Fatura gerada",
        description: "Fatura gerada com sucesso"
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erro ao gerar fatura:', error);
      toast({
        title: "Erro ao gerar fatura",
        description: "Não foi possível gerar a fatura",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateBulkInvoices = async (data) => {
    setLoading(true);
    try {
      // Criar lote de faturamento
      const batch = await BillingBatch.create({
        customer_id: customer.id,
        type: 'installment',
        total_amount: data.amount * 12,
        start_date: data.start_date,
        description: data.description,
        installments: 12
      });

      // Gerar 12 faturas
      const startDate = new Date(data.start_date);
      for (let i = 0; i < 12; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + i);

        await Invoice.create({
          customer_id: customer.id,
          amount: data.amount,
          due_date: dueDate.toISOString().split('T')[0],
          description: `${data.description} - Parcela ${i + 1}/12`,
          status: 'pending',
          batch_id: batch.id
        });
      }

      toast({
        title: "Carnê gerado",
        description: "Carnê de 12 meses gerado com sucesso"
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erro ao gerar carnê:', error);
      toast({
        title: "Erro ao gerar carnê",
        description: "Não foi possível gerar o carnê",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const goToInvoiceList = () => {
    // Remover redirecionamento para página de faturas global
    // Permanecer na página atual do cliente
  };

  return {
    generateSingleInvoice,
    generateBulkInvoices,
    getNextDueDate,
    loading
  };
}
