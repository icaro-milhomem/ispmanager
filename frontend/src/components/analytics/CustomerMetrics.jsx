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
  Users, 
  UserPlus, 
  UserMinus, 
  TrendingUp, 
  TrendingDown,
  Clock,
  ThumbsUp
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
  Legend
} from 'recharts';

export default function CustomerMetrics({ data }) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Clientes Ativos
                </p>
                <p className="text-2xl font-bold">
                  {data.total_active}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
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
                  Taxa de Churn
                </p>
                <p className="text-2xl font-bold">
                  {data.churn_rate}%
                </p>
              </div>
              <div className="p-2 rounded-lg bg-red-100">
                <UserMinus className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="flex flex-col">
              <Progress value={data.churn_rate} max={10} className="h-1 mt-2 mb-1" />
              <span className="text-xs text-gray-500 ml-auto">
                Meta: <span className="font-medium">{'<'} 5%</span>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Tempo Médio como Cliente
                </p>
                <p className="text-2xl font-bold">
                  {data.average_tenure} <span className="text-sm font-normal">meses</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">
                {data.average_tenure > 12 ? (data.average_tenure / 12).toFixed(1) + ' anos' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Satisfação
                </p>
                <p className="text-2xl font-bold">
                  {data.satisfaction_score}<span className="text-sm font-normal">/10</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-100">
                <ThumbsUp className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="flex flex-col">
              <Progress 
                value={data.satisfaction_score * 10} 
                className="h-1 mt-2 mb-1" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aquisição de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Aquisição de Clientes
            </CardTitle>
            <CardDescription>
              Novos clientes por período
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.acquisition}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="period" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Novos Clientes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Distribuição de Planos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Distribuição de Planos
            </CardTitle>
            <CardDescription>
              Clientes por plano contratado
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.plans_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="plan"
                  label={({ plan, percent }) => `${plan} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.plans_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, "Clientes"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Demografia de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Demografia de Clientes
            </CardTitle>
            <CardDescription>
              Distribuição por perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data.demographics}
                margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="category" 
                  type="category" 
                  tick={{ fontSize: 14 }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Quantidade" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Resumo de Métricas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Indicadores-Chave
            </CardTitle>
            <CardDescription>
              Resumo das métricas principais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Taxa de Crescimento</span>
                  <span className="text-sm font-medium text-green-600">+{data.growth_rate}%</span>
                </div>
                <Progress value={data.growth_rate} max={20} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Taxa de Retenção</span>
                  <span className="text-sm font-medium text-blue-600">{100 - data.churn_rate}%</span>
                </div>
                <Progress value={100 - data.churn_rate} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Satisfação (NPS)</span>
                  <span className="text-sm font-medium text-yellow-600">{data.satisfaction_score * 10}%</span>
                </div>
                <Progress value={data.satisfaction_score * 10} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Renovações</p>
                  <p className="text-xl font-bold text-green-600">87%</p>
                  <p className="text-xs text-gray-500">dos contratos</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Upgrades</p>
                  <p className="text-xl font-bold text-blue-600">24%</p>
                  <p className="text-xs text-gray-500">de adesão</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}