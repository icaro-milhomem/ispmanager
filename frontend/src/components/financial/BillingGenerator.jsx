
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Customer } from "@/api/entities";
import { BillingBatch } from "@/api/entities";
import { Invoice } from "@/api/entities";

const PLAN_PRICES = {
  basic: 89.90,
  standard: 109.90,
  premium: 149.90,
  business: 299.90
};

export default function BillingGenerator({ onSubmit, onCancel, customers = [] }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [localCustomers, setLocalCustomers] = useState(customers);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [billingType, setBillingType] = useState('single');
  const [startDate, setStartDate] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (customers.length === 0) {
      loadCustomers();
    }
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await Customer.list();
      setLocalCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes",
        variant: "destructive"
      });
    }
  };

  const handleCustomerChange = (customerId) => {
    const customer = localCustomers.find(c => c.id === customerId);
    setSelectedCustomer(customer);
    
    if (customer) {
      // Definir valor baseado no plano do cliente
      if (customer.plan) {
        setAmount(PLAN_PRICES[customer.plan]?.toString() || '');
        setDescription(`Mensalidade - Plano ${customer.plan.charAt(0).toUpperCase() + customer.plan.slice(1)}`);
      }
      
      // Definir data de vencimento baseada no dia preferencial do cliente
      if (customer.due_day) {
        // Obter data atual
        const today = new Date();
        let dueDay = parseInt(customer.due_day, 10);
        
        // Garantir que o dia de vencimento é válido (entre 1 e 28)
        dueDay = Math.min(Math.max(dueDay, 1), 28);
        
        // Definir a data de vencimento com o dia preferencial
        let dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
        
        // Se a data já passou neste mês, usar o próximo mês
        if (dueDate < today) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }
        
        setStartDate(dueDate.toISOString().split('T')[0]);
      } else {
        // Se não tiver dia preferencial, usar data atual + 5 dias
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 5);
        setStartDate(dueDate.toISOString().split('T')[0]);
      }
    }
  };

  const generateBilling = async () => {
    if (!selectedCustomer || !startDate || !amount) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        throw new Error("Valor inválido");
      }
      
      const batchData = {
        customer_id: selectedCustomer.id,
        type: billingType,
        total_amount: numericAmount * (billingType === 'installment' ? 12 : 1),
        start_date: startDate,
        installments: billingType === 'installment' ? 12 : 1,
        description: description || `Faturamento ${billingType === 'installment' ? 'mensal' : 'avulso'} - ${selectedCustomer.full_name}`
      };

      const batch = await BillingBatch.create(batchData);

      // Gerar faturas
      const invoices = [];
      const baseDate = new Date(startDate);
      
      // Verificar se a data é válida
      if (isNaN(baseDate.getTime())) {
        throw new Error("Data de vencimento inválida");
      }

      for (let i = 0; i < (billingType === 'installment' ? 12 : 1); i++) {
        // Criar uma nova data para cada mês, evitando problemas com datas inválidas
        const dueDate = new Date(baseDate);
        
        // Adicionar meses de forma segura
        const newMonth = (baseDate.getMonth() + i) % 12;
        const yearIncrement = Math.floor((baseDate.getMonth() + i) / 12);
        dueDate.setFullYear(baseDate.getFullYear() + yearIncrement);
        dueDate.setMonth(newMonth);
        
        // Garantir dia válido (cuidado com fevereiro, etc)
        const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
        if (dueDate.getDate() > lastDayOfMonth) {
          dueDate.setDate(lastDayOfMonth);
        }

        const invoiceData = {
          customer_id: selectedCustomer.id,
          amount: numericAmount,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'pending',
          description: billingType === 'installment' 
            ? `${description || 'Mensalidade'} ${i + 1}/12` 
            : (description || 'Fatura avulsa')
        };

        const invoice = await Invoice.create(invoiceData);
        invoices.push(invoice.id);
      }

      // Atualizar lote com as faturas geradas
      await BillingBatch.update(batch.id, {
        ...batch,
        generated_invoices: invoices,
        status: 'completed'
      });

      toast({
        title: "Faturamento gerado",
        description: `${billingType === 'installment' ? '12 faturas geradas' : 'Fatura gerada'} com sucesso`
      });

      if (onSubmit) {
        onSubmit(batch);
      }

    } catch (error) {
      console.error('Erro ao gerar faturamento:', error);
      toast({
        title: "Erro ao gerar faturamento",
        description: "Não foi possível gerar as faturas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCustomer || !startDate || !amount) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await generateBilling();
      
      // Redirecionar para a página do cliente, não para a página de faturas
      window.location.href = `/customers`;
    } catch (error) {
      console.error("Erro ao gerar fatura:", error);
      toast({
        title: "Erro ao gerar fatura",
        description: error.message || "Não foi possível gerar a fatura",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerar Faturamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Cliente</label>
            <Select onValueChange={handleCustomerChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {localCustomers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Tipo de Faturamento</label>
            <Select value={billingType} onValueChange={setBillingType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Boleto Avulso</SelectItem>
                <SelectItem value="installment">Carnê (12x)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Data de Vencimento</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            {selectedCustomer?.due_day && (
              <p className="text-xs text-gray-500 mt-1">
                Dia de vencimento preferencial: {selectedCustomer.due_day}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Valor</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
            />
            {selectedCustomer?.plan && (
              <p className="text-xs text-gray-500 mt-1">
                Valor do plano atual: R$ {PLAN_PRICES[selectedCustomer.plan]?.toFixed(2) || '0,00'}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Descrição</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da fatura"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button 
            onClick={generateBilling} 
            disabled={loading}
            className="bg-blue-600"
          >
            {loading ? 'Gerando...' : 'Gerar Faturamento'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
