import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from "lucide-react";

export default function FinancialSummary() {
  // Em uma implementação real, esses dados viriam de uma API
  const financialData = {
    monthlyRevenue: 58750.50,
    previousMonthRevenue: 52100.25,
    pendingInvoices: 15,
    pendingAmount: 12450.75,
    overdueInvoices: 5,
    overdueAmount: 3750.00,
    averageTicket: 150.25,
    revenueBreakdown: [
      { name: 'Internet Residencial', value: 38500.50 },
      { name: 'Internet Empresarial', value: 15200.00 },
      { name: 'Serviços', value: 5050.00 }
    ]
  };

  const revenueChange = (financialData.monthlyRevenue - financialData.previousMonthRevenue) / financialData.previousMonthRevenue * 100;
  const isRevenueUp = revenueChange > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-green-600" />
          Resumo Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Faturamento Mensal</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">R$ {financialData.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <div className={`flex items-center text-xs ${isRevenueUp ? 'text-green-600' : 'text-red-600'}`}>
                {isRevenueUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(revenueChange).toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Ticket Médio</p>
            <p className="text-2xl font-bold">R$ {financialData.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-yellow-600" />
              <span className="text-sm">Faturas Pendentes</span>
            </div>
            <div className="text-right">
              <p className="font-medium">{financialData.pendingInvoices} faturas</p>
              <p className="text-sm text-gray-500">R$ {financialData.pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-red-600" />
              <span className="text-sm">Faturas Vencidas</span>
            </div>
            <div className="text-right">
              <p className="font-medium">{financialData.overdueInvoices} faturas</p>
              <p className="text-sm text-gray-500">R$ {financialData.overdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Faturamento por Categoria</p>
          {financialData.revenueBreakdown.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">{item.name}</span>
              <span className="text-sm font-medium">
                R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}