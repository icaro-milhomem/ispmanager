import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Customer } from '@/api/entities';
import { toast } from 'react-hot-toast';

const formSchema = z.object({
  customerId: z.string({
    required_error: "Por favor selecione um cliente",
  }),
  amount: z.string().transform((val) => parseFloat(val.replace(',', '.'))),
  dueDate: z.string({
    required_error: "Por favor selecione uma data de vencimento",
  }),
  description: z.string().optional(),
});

export default function InvoiceForm({ invoice, onSubmit, onCancel }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: invoice?.customerId || "",
      amount: invoice?.amount?.toString() || "",
      dueDate: invoice?.dueDate ? format(new Date(invoice.dueDate), 'yyyy-MM-dd') : "",
      description: invoice?.description || "",
    },
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await Customer.list();
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const savedCTO = await onSubmit(data);
      if (savedCTO) {
        setLocalElements(prev => [...prev, savedCTO]);
      }
    } catch (error) {
      console.error('Erro ao salvar fatura:', error);
      toast.error('Erro ao salvar fatura. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="0,00"
                  {...field}
                  onChange={(e) => {
                    // Formatar para moeda
                    let value = e.target.value.replace(/\D/g, '');
                    value = (parseFloat(value) / 100).toFixed(2);
                    value = value.replace('.', ',');
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Vencimento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição da fatura" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 