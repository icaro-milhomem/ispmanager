import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign, AlertCircle, Building, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DirectDebitForm({ onSubmit, amount, isProcessing, customer }) {
  const [bankData, setBankData] = useState({
    bank: '',
    agency: '',
    account: '',
    account_type: 'checking',
    account_holder: customer?.full_name || '',
    document: customer?.cpf || ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    let formattedValue = value;
    
    // Formatações específicas
    if (field === 'agency') {
      // Apenas números e um hífen
      formattedValue = value
        .replace(/[^\d-]/g, '')
        .replace(/^(\d{4})-?(\d{0,1})$/, '$1-$2')
        .replace(/^(\d{0,4})/, '$1');
    } else if (field === 'account') {
      // Apenas números e um hífen para o dígito verificador
      formattedValue = value
        .replace(/[^\d-]/g, '')
        .replace(/^(\d{5,12})-?(\d{0,1})$/, '$1-$2')
        .replace(/^(\d{0,12})/, '$1');
    } else if (field === 'document') {
      // CPF: 000.000.000-00
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .substring(0, 14);
    }
    
    setBankData({
      ...bankData,
      [field]: formattedValue
    });
    
    // Limpar erro específico do campo
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validação do banco
    if (!bankData.bank) {
      newErrors.bank = 'Selecione um banco';
    }
    
    // Validação da agência
    if (!bankData.agency.match(/^\d{4}(-\d)?$/)) {
      newErrors.agency = 'Agência inválida';
    }
    
    // Validação da conta
    if (!bankData.account.match(/^\d{5,12}-\d$/)) {
      newErrors.account = 'Conta inválida';
    }
    
    // Validação do nome do titular
    if (!bankData.account_holder.trim()) {
      newErrors.account_holder = 'Nome do titular é obrigatório';
    }
    
    // Validação do CPF
    if (!bankData.document.match(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
      newErrors.document = 'CPF inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit({
      payment_method: 'direct_debit',
      bank_data: bankData
    });
  };

  const banks = [
    { code: '001', name: 'Banco do Brasil' },
    { code: '104', name: 'Caixa Econômica Federal' },
    { code: '033', name: 'Santander' },
    { code: '341', name: 'Itaú' },
    { code: '237', name: 'Bradesco' },
    { code: '756', name: 'Sicoob' },
    { code: '748', name: 'Sicredi' },
    { code: '077', name: 'Inter' },
    { code: '655', name: 'Votorantim' },
    { code: '212', name: 'Banco Original' },
    { code: '336', name: 'C6 Bank' },
    { code: '260', name: 'Nu Pagamentos (Nubank)' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert className="bg-blue-50 border border-blue-100">
        <Building className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Configurar débito automático em conta corrente ou poupança.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bank">Banco</Label>
          <Select 
            value={bankData.bank} 
            onValueChange={(value) => handleChange('bank', value)}
          >
            <SelectTrigger id="bank" className={errors.bank ? "border-red-300" : ""}>
              <SelectValue placeholder="Selecione o banco" />
            </SelectTrigger>
            <SelectContent>
              {banks.map((bank) => (
                <SelectItem key={bank.code} value={bank.code}>
                  {bank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bank && (
            <p className="text-sm text-red-500">{errors.bank}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="account_type">Tipo de Conta</Label>
          <Select 
            value={bankData.account_type} 
            onValueChange={(value) => handleChange('account_type', value)}
          >
            <SelectTrigger id="account_type">
              <SelectValue placeholder="Tipo de conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checking">Conta Corrente</SelectItem>
              <SelectItem value="savings">Conta Poupança</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="agency">Agência</Label>
          <Input
            id="agency"
            value={bankData.agency}
            onChange={(e) => handleChange('agency', e.target.value)}
            placeholder="0000"
            className={errors.agency ? "border-red-300" : ""}
          />
          {errors.agency && (
            <p className="text-sm text-red-500">{errors.agency}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="account">Conta com dígito</Label>
          <Input
            id="account"
            value={bankData.account}
            onChange={(e) => handleChange('account', e.target.value)}
            placeholder="00000-0"
            className={errors.account ? "border-red-300" : ""}
          />
          {errors.account && (
            <p className="text-sm text-red-500">{errors.account}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="account_holder">Nome do Titular</Label>
          <Input
            id="account_holder"
            value={bankData.account_holder}
            onChange={(e) => handleChange('account_holder', e.target.value)}
            placeholder="Nome do titular da conta"
            className={errors.account_holder ? "border-red-300" : ""}
          />
          {errors.account_holder && (
            <p className="text-sm text-red-500">{errors.account_holder}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="document">CPF do Titular</Label>
          <Input
            id="document"
            value={bankData.document}
            onChange={(e) => handleChange('document', e.target.value)}
            placeholder="000.000.000-00"
            className={errors.document ? "border-red-300" : ""}
          />
          {errors.document && (
            <p className="text-sm text-red-500">{errors.document}</p>
          )}
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-md">
        <div className="flex justify-between mb-2">
          <span>Valor a debitar:</span>
          <span className="font-semibold">R$ {amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Data do débito:</span>
          <span>{new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              Autorizar Débito em Conta
            </>
          )}
        </Button>
        <p className="text-center mt-2 text-xs text-gray-500">
          Ao autorizar, você concorda com os termos de autorização de débito automático.
        </p>
      </div>
    </form>
  );
}