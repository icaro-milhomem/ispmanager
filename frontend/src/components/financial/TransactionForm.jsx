import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownCircle, ArrowUpCircle, Save, X } from "lucide-react";
import { Customer } from "@/api/entities";
import { Supplier } from "@/api/entities";

export default function TransactionForm({ transaction, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    payment_date: "",
    payment_method: "pix",
    status: "pending",
    category: "",
    customer_id: "",
    supplier_id: "",
    reference_code: "",
  });
  
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
    
    if (transaction) {
      const transactionData = {
        ...transaction,
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : "",
        payment_date: transaction.payment_date ? new Date(transaction.payment_date).toISOString().split('T')[0] : "",
      };
      setFormData(transactionData);
    }
  }, [transaction]);

  const loadData = async () => {
    try {
      const customersData = await Customer.list();
      setCustomers(customersData);
      
      // Simular dados de fornecedores
      setSuppliers([
        { id: "supplier1", name: "Fornecedor de Equipamentos A" },
        { id: "supplier2", name: "Fornecedor de Equipamentos B" },
        { id: "supplier3", name: "Fornecedor de Serviços C" },
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const categoryOptions = formData.type === "income" 
    ? [
        { value: "mensalidade", label: "Mensalidade" },
        { value: "instalacao", label: "Taxa de Instalação" },
        { value: "equipamentos", label: "Venda de Equipamentos" },
        { value: "outros_income", label: "Outros" }
      ]
    : [
        { value: "fornecedores", label: "Pagamento a Fornecedores" },
        { value: "aluguel", label: "Aluguel" },
        { value: "salarios", label: "Salários" },
        { value: "servicos", label: "Serviços" },
        { value: "equipamentos_exp", label: "Compra de Equipamentos" },
        { value: "impostos", label: "Impostos e Taxas" },
        { value: "outros_expense", label: "Outros" }
      ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {formData.type === "income" ? (
            <ArrowDownCircle className="h-5 w-5 text-green-600" />
          ) : (
            <ArrowUpCircle className="h-5 w-5 text-red-600" />
          )}
          {transaction ? "Editar Transação" : "Nova Transação"}
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Transação <span className="text-red-500">*</span></Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Valor <span className="text-red-500">*</span></Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição <span className="text-red-500">*</span></Label>
              <Input
                id="description"
                placeholder="Descrição da transação"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Data da Transação <span className="text-red-500">*</span></Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_date">Data de Pagamento</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => handleChange("payment_date", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pagamento</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => handleChange("payment_method", value)}
              >
                <SelectTrigger id="payment_method">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_slip">Boleto Bancário</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference_code">Código de Referência</Label>
              <Input
                id="reference_code"
                placeholder="Ex: NF-1234, Contrato-321"
                value={formData.reference_code}
                onChange={(e) => handleChange("reference_code", e.target.value)}
              />
            </div>
            
            {formData.type === "income" && (
              <div className="space-y-2">
                <Label htmlFor="customer_id">Cliente</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => handleChange("customer_id", value)}
                >
                  <SelectTrigger id="customer_id">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {formData.type === "expense" && (
              <div className="space-y-2">
                <Label htmlFor="supplier_id">Fornecedor</Label>
                <Select
                  value={formData.supplier_id}
                  onValueChange={(value) => handleChange("supplier_id", value)}
                >
                  <SelectTrigger id="supplier_id">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            {transaction ? "Atualizar" : "Salvar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}