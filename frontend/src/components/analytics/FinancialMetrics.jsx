import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertCircle,
  Calendar,
  ArrowUpRight
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export default function FinancialMetrics({ data }) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Converter número para formato de moeda brasileira
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Receita Total
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.total_revenue)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center">
              <TrendingUp className={`w-4 h-4 mr-1 ${data.growth_rate >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm ${data.growth_rate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {data.growth_rate >= 0 ? '+' : ''}{data.growth_rate}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs. período anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  ARPU
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.average_arpu)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">
                Receita média por cliente
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Taxa de Inadimplência
                </p>
                <p className="text-2xl font-bold">
                  {data.default_rate}%
                </p>
              </div>
              <div className="p-2 rounded-lg bg-red-100">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="flex flex-col">
              <Progress 
                value={data.default_rate} 
                max={10} 
                className="h-1 mt-2 mb-1" 
              />
              <span className="text-xs text-gray-500 ml-auto">
                Meta: <span className="font-medium">{'<'} 3%</span>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Previsão Próximo Mês
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.forecast_next_month)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center">
              <ArrowUpRight className={`w-4 h-4 mr-1 text-green-500`} />
              <span className="text-xs text-gray-500">
                Projeção com base em tendências
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita por Período */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Receita por Período
            </CardTitle>
            <CardDescription>
              Evolução da receita ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.revenue_by_period}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="period" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis 
                  tickFormatter={(value) => `R$ ${value/1000}k`}
                />
                <Tooltip formatter={(value) => [formatCurrency(value), "Receita"]} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  name="Receita" 
                  stroke="#3b82f6" 
                  fill="#93c5fd" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Receita por Plano */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Receita por Plano
            </CardTitle>
            <CardDescription>
              Distribuição de receita entre os planos
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.revenue_by_plan}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="plan" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis 
                  tickFormatter={(value) => `R$ ${value/1000}k`}
                />
                <Tooltip formatter={(value) => [formatCurrency(value), "Receita"]} />
                <Legend />
                <Bar dataKey="value" name="Receita" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Indicadores Financeiros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Indicadores Financeiros
            </CardTitle>
            <CardDescription>
              Métricas-chave de desempenho financeiro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Taxa de Pagamento</span>
                  <span className="text-sm font-medium text-green-600">{data.payment_rate}%</span>
                </div>
                <Progress value={data.payment_rate} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Taxa de Crescimento de Receita</span>
                  <span className={`text-sm font-medium ${data.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.growth_rate >= 0 ? '+' : ''}{data.growth_rate}%
                  </span>
                </div>
                <Progress 
                  value={data.growth_rate + 10} 
                  max={20} 
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Taxa de Inadimplência</span>
                  <span className="text-sm font-medium text-red-600">{data.default_rate}%</span>
                </div>
                <Progress 
                  value={data.default_rate} 
                  max={10} 
                  className="h-2" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Faturamento em Aberto</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {formatCurrency(data.total_revenue * data.default_rate / 100)}
                  </p>
                  <p className="text-xs text-gray-500">faturas pendentes</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Projeção Anual</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(data.forecast_next_month * 12)}
                  </p>
                  <p className="text-xs text-gray-500">receita estimada</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Comparação de Pagamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Comparativos Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-blue-700">ARPU</p>
                    <Badge variant="outline" className="bg-blue-100">Atual</Badge>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(data.average_arpu)}</p>
                  <div className="flex items-center mt-2 text-xs text-blue-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>+{(data.growth_rate / 2).toFixed(1)}% vs. período anterior</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Valor Médio Fatura</p>
                    <Badge variant="outline">Mensal</Badge>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(data.average_arpu)}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Vencimento médio: dia 10</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-3">Distribuição de Métodos de Pagamento</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Cartão de Crédito</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Boleto</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>PIX</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>35%</div>
                    <div>25%</div>
                    <div>40%</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border">
                <p className="text-sm font-medium mb-2">Taxa de Conversão de Vendas</p>
                <div className="flex items-center gap-2">
                  <Progress value={65} className="h-2 flex-grow" />
                  <span className="text-sm font-medium">65%</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Das apresentações para novos prospectos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}