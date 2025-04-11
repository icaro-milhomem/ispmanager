import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, AlertCircle, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreditCardForm({ onSubmit, amount, isProcessing }) {
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
    installments: '1'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setCardData({
      ...cardData,
      [field]: value
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
    
    // Validação do número do cartão
    if (!cardData.number.replace(/\s/g, '').match(/^\d{13,19}$/)) {
      newErrors.number = 'Número de cartão inválido';
    }
    
    // Validação do nome
    if (!cardData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    // Validação da data de expiração
    if (!cardData.expiry.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiry = 'Data de validade inválida';
    } else {
      const [month, year] = cardData.expiry.split('/').map(Number);
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (month < 1 || month > 12) {
        newErrors.expiry = 'Mês inválido';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiry = 'Cartão expirado';
      }
    }
    
    // Validação do CVC
    if (!cardData.cvc.match(/^\d{3,4}$/)) {
      newErrors.cvc = 'CVC inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Sanitizar os dados antes de enviar
    const sanitizedData = {
      ...cardData,
      number: `**** **** **** ${cardData.number.slice(-4)}`, // Apenas últimos 4 dígitos
    };
    
    onSubmit({
      payment_method: 'credit_card',
      card_data: sanitizedData,
      installments: cardData.installments
    });
  };

  // Calcular valor das parcelas
  const installmentValue = (amount / parseInt(cardData.installments || 1)).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-500 mt-0.5" />
        <div>
          <p className="font-medium text-blue-800">Pagamento Seguro</p>
          <p className="text-sm text-blue-700">
            Seus dados de pagamento são criptografados e processados com segurança. 
            Não armazenamos os dados completos do cartão.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="card-number">Número do Cartão</Label>
          <div className="relative">
            <Input
              id="card-number"
              value={cardData.number}
              onChange={(e) => handleChange('number', e.target.value)}
              placeholder="0000 0000 0000 0000"
              className={errors.number ? "border-red-300 pr-10" : ""}
            />
            <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {errors.number && (
            <p className="text-sm text-red-500">{errors.number}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="card-name">Nome no Cartão</Label>
          <Input
            id="card-name"
            value={cardData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="NOME COMO ESTÁ NO CARTÃO"
            className={errors.name ? "border-red-300" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="card-expiry">Validade</Label>
            <Input
              id="card-expiry"
              value={cardData.expiry}
              onChange={(e) => handleChange('expiry', e.target.value)}
              placeholder="MM/AA"
              className={errors.expiry ? "border-red-300" : ""}
            />
            {errors.expiry && (
              <p className="text-sm text-red-500">{errors.expiry}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="card-cvc">Código de Segurança</Label>
            <Input
              id="card-cvc"
              value={cardData.cvc}
              onChange={(e) => handleChange('cvc', e.target.value)}
              placeholder="CVC"
              maxLength={4}
              className={errors.cvc ? "border-red-300" : ""}
            />
            {errors.cvc && (
              <p className="text-sm text-red-500">{errors.cvc}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="installments">Número de Parcelas</Label>
          <select 
            id="installments"
            value={cardData.installments}
            onChange={(e) => handleChange('installments', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1x de R$ {amount.toFixed(2)} (à vista)</option>
            <option value="2">2x de R$ {(amount / 2).toFixed(2)}</option>
            <option value="3">3x de R$ {(amount / 3).toFixed(2)}</option>
            <option value="6">6x de R$ {(amount / 6).toFixed(2)}</option>
            <option value="12">12x de R$ {(amount / 12).toFixed(2)}</option>
          </select>
          <p className="text-sm text-gray-500">
            {cardData.installments > 1 
              ? `${cardData.installments}x de R$ ${installmentValue} sem juros` 
              : "Pagamento à vista"}
          </p>
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
              Pagar R$ {amount.toFixed(2)}
            </>
          )}
        </Button>
        <p className="text-center mt-2 text-xs text-gray-500">
          Ao confirmar o pagamento, você concorda com os termos e condições.
        </p>
      </div>
    </form>
  );
}