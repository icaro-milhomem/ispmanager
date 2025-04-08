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
  Wifi,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Zap,
  ArrowDown,
  ArrowUp,
  Router,
  Server
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

export default function NetworkMetrics({ data }) {
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
                  Uptime Médio
                </p>
                <p className="text-2xl font-bold">
                  {data.average_uptime}%
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex flex-col">
              <Progress 
                value={data.average_uptime} 
                className="h-1 mt-2 mb-1" 
              />
              <span className="text-xs text-gray-500 ml-auto">
                Meta: <span className="font-medium">{'>='} 99.9%</span>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Uso de Banda
                </p>
                <p className="text-2xl font-bold">
                  {data.bandwidth_usage} <span className="text-sm font-normal">Gbps</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">
                Pico: {data.peak_usage} Gbps
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total de Interrupções
                </p>
                <p className="text-2xl font-bold">
                  {data.total_outages}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">
                No período atual
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
                  {data.average_issue_resolution_time} <span className="text-sm font-normal">horas</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">
                Para problemas de rede
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uso de Banda por Período */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Uso de Banda por Período
            </CardTitle>
            <CardDescription>
              Download e upload ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.bandwidth_by_period}
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
                <Tooltip formatter={(value) => [`${value} Gbps`, ""]} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="download" 
                  name="Download" 
                  stroke="#3b82f6" 
                  fill="#93c5fd" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="upload" 
                  name="Upload" 
                  stroke="#10b981" 
                  fill="#6ee7b7" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Problemas por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              Problemas por Tipo
            </CardTitle>
            <CardDescription>
              Distribuição dos problemas de rede
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.issues_by_type}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="type"
                  label={({ type, percent }) => `${type} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.issues_by_type.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, "Ocorrências"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Métricas de Qualidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-600" />
              Métricas de Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Latência Média</span>
                  <span className="text-sm font-medium text-blue-600">12 ms</span>
                </div>
                <Progress value={12} max={100} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Meta: {'<'} 20ms</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Taxa de Perda de Pacotes</span>
                  <span className="text-sm font-medium text-green-600">0.2%</span>
                </div>
                <Progress value={0.2} max={5} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Meta: {'<'} 1%</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Jitter</span>
                  <span className="text-sm font-medium text-blue-600">3.5 ms</span>
                </div>
                <Progress value={3.5} max={20} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Meta: {'<'} 5ms</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Disponibilidade</p>
                  <p className="text-xl font-bold text-green-600">
                    {data.average_uptime}%
                  </p>
                  <p className="text-xs text-gray-500">da rede</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Capacidade</p>
                  <p className="text-xl font-bold text-blue-600">
                    {(data.peak_usage * 1.5).toFixed(1)} Gbps
                  </p>
                  <p className="text-xs text-gray-500">total disponível</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Desempenho da Rede */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Desempenho da Rede
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Download</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Médio</Badge>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {data.bandwidth_by_period.reduce((acc, item) => acc + item.download, 0) / data.bandwidth_by_period.length} Gbps
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Pico: {data.peak_usage} Gbps
                </p>
              </div>
              
              <div className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Upload</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Médio</Badge>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {data.bandwidth_by_period.reduce((acc, item) => acc + item.upload, 0) / data.bandwidth_by_period.length} Gbps
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Pico: {(data.peak_usage * 0.3).toFixed(1)} Gbps
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-3">Status dos Equipamentos</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Router className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Roteadores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">98.9% online</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Access Points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">97.2% online</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Servidores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">100% online</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium mb-2">Eficiência de Largura de Banda</p>
              <div className="flex items-center gap-2">
                <Progress value={82} className="h-2 flex-grow" />
                <span className="text-sm font-medium">82%</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Utilização da capacidade total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}