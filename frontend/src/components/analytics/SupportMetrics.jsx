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
  MessageSquare,
  Clock,
  ThumbsUp,
  Users,
  BarChart as BarChartIcon,
  CheckCircle,
  Clock12,
  UserPlus
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

export default function SupportMetrics({ data }) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];
  
  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total de Tickets
                </p>
                <p className="text-2xl font-bold">
                  {data.total_tickets}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">
                {data.open_tickets} tickets em aberto
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Tempo Médio de Resolução
                </p>
                <p className="text-2xl font-bold">
                  {data.average_resolution_time} <span className="text-sm font-normal">horas</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="flex flex-col">
              <Progress 
                value={data.average_resolution_time} 
                max={48} 
                className="h-1 mt-2 mb-1" 
              />
              <span className="text-xs text-gray-500 ml-auto">
                Meta: <span className="font-medium">{'<'} 24h</span>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Satisfação de Suporte
                </p>
                <p className="text-2xl font-bold">
                  {data.satisfaction_score}<span className="text-sm font-normal">/10</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <ThumbsUp className="w-5 h-5 text-green-600" />
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
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Tempo Médio de Resposta
                </p>
                <p className="text-2xl font-bold">
                  {data.avg_response_time} <span className="text-sm font-normal">min</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Clock12 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="flex flex-col">
              <Progress 
                value={data.avg_response_time} 
                max={60} 
                className="h-1 mt-2 mb-1" 
              />
              <span className="text-xs text-gray-500 ml-auto">
                Meta: <span className="font-medium">{'<'} 30 min</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets por Período */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-blue-600" />
              Tickets por Período
            </CardTitle>
            <CardDescription>
              Volume de tickets ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.tickets_by_period}
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
                <Tooltip formatter={(value) => [value, "Tickets"]} />
                <Legend />
                <Bar dataKey="count" name="Tickets" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Tickets por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Tickets por Categoria
            </CardTitle>
            <CardDescription>
              Distribuição de tickets por tipo
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.tickets_by_category}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="category"
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.tickets_by_category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, "Tickets"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Indicadores de Suporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Indicadores de Suporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Taxa de Resolução no Primeiro Contato</span>
                  <span className="text-sm font-medium text-green-600">68%</span>
                </div>
                <Progress value={68} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Meta: {'>'} 65%</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Tempo de Espera</span>
                  <span className="text-sm font-medium text-yellow-600">2.5 min</span>
                </div>
                <Progress value={2.5} max={10} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Meta: {'<'} 3 min</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Taxa de Reaberturas de Ticket</span>
                  <span className="text-sm font-medium text-blue-600">4.3%</span>
                </div>
                <Progress value={4.3} max={20} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Meta: {'<'} 5%</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Tickets por Técnico</p>
                  <p className="text-xl font-bold text-blue-600">
                    12.4
                  </p>
                  <p className="text-xs text-gray-500">média diária</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Dia Mais Movimentado</p>
                  <p className="text-xl font-bold text-purple-600">
                    Segunda
                  </p>
                  <p className="text-xs text-gray-500">+32% vs. média</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Distribuição de Desempenho */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Desempenho da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Equipe</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Atendimento</Badge>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  8
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  atendentes ativos
                </p>
              </div>
              
              <div className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Volume</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Diário</Badge>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(data.total_tickets / 30)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  tickets por dia
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-3">Canais de Atendimento</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Chat</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Telefone</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Email</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Redes Sociais</span>
                    <span className="font-medium">5%</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium mb-2">Satisfação por Canal</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span>Chat</span>
                  <span className="font-medium">8.7/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Telefone</span>
                  <span className="font-medium">9.2/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Email</span>
                  <span className="font-medium">7.9/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Redes Sociais</span>
                  <span className="font-medium">8.3/10</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}