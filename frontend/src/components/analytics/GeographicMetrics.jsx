import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin,
  Map,
  Globe,
  Building,
  Home,
  Signal,
  Wifi
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Scatter,
  ScatterChart,
  ZAxis
} from 'recharts';

export default function GeographicMetrics({ data }) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];
  
  // Dados para o mapa térmico simulado
  const bubbleData = data.top_regions.map(region => ({
    name: region.region,
    customers: region.customers,
    revenue: region.revenue,
    z: region.customers * 100
  }));
  
  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Área de Cobertura
                </p>
                <p className="text-2xl font-bold">
                  {data.coverage_area} <span className="text-sm font-normal">km²</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <Map className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">
                Em {data.total_cities} cidades
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total de Cidades
                </p>
                <p className="text-2xl font-bold">
                  {data.total_cities}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <Building className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">
                Presença em {data.total_cities} municípios
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Densidade de Clientes
                </p>
                <p className="text-2xl font-bold">
                  {(data.top_regions.reduce((acc, item) => acc + item.customers, 0) / data.coverage_area).toFixed(1)} <span className="text-sm font-normal">/km²</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Home className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">
                Clientes por área de cobertura
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pontos de Presença
                </p>
                <p className="text-2xl font-bold">
                  {data.total_cities * 2}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-orange-100">
                <Signal className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">
                Torres e pontos de distribuição
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Regiões por Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Top Regiões por Clientes
            </CardTitle>
            <CardDescription>
              Regiões com maior número de clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.top_regions}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="region" 
                  width={100}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="customers" name="Clientes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Top Regiões por Receita */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Top Regiões por Receita
            </CardTitle>
            <CardDescription>
              Contribuição de receita por região
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.top_regions}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="region" 
                  width={100}
                />
                <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, "Receita"]} />
                <Legend />
                <Bar dataKey="revenue" name="Receita (R$)" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Mapa Térmico de Densidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Mapa de Calor - Densidade
            </CardTitle>
            <CardDescription>
              Densidade de clientes por região
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />
                <XAxis 
                  type="category" 
                  dataKey="name" 
                  name="Região" 
                  allowDuplicatedCategory={false}
                />
                <YAxis 
                  type="number" 
                  dataKey="customers" 
                  name="Clientes"
                  label={{ value: 'Clientes', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis 
                  type="number" 
                  dataKey="z" 
                  range={[100, 1000]} 
                  name="Densidade" 
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => {
                    if (name === 'Receita') return [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, name];
                    return [value, name];
                  }}
                />
                <Legend />
                <Scatter 
                  name="Regiões" 
                  data={bubbleData} 
                  fill="#8884d8" 
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Distribuição por Densidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-600" />
              Distribuição de Cobertura
            </CardTitle>
            <CardDescription>
              Distribuição das áreas por densidade de clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.density_map}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="density"
                  nameKey="region"
                  label={({ region, percent }) => `${region} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.density_map.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Densidade"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabela de Regiões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Detalhes por Região
          </CardTitle>
          <CardDescription>
            Análise detalhada por região de cobertura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Região</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Clientes</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Receita</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Densidade</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.top_regions.map((region, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{region.region}</td>
                    <td className="py-3 px-4">{region.customers}</td>
                    <td className="py-3 px-4">R$ {region.revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td className="py-3 px-4">
                      {data.density_map.find(d => d.region === region.region)?.density.toFixed(1)} /km²
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-green-100 text-green-800">
                        {index < 2 ? 'Saturado' : index < 4 ? 'Crescendo' : 'Emergente'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}