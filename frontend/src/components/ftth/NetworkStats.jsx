
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Box,
  Link as LinkIcon,
  PieChart,
  BarChart,
  Ruler,
  Cable,
  Users
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function NetworkStats({
  statistics,
  networkElements,
  cables,
  networkElementTypes,
  cableTypes
}) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];
  
  const elementsByTypeData = Object.keys(statistics.elements.byType).map(type => ({
    name: networkElementTypes[type].name,
    value: statistics.elements.byType[type],
    color: networkElementTypes[type].color
  }));
  
  const cablesByTypeData = Object.keys(statistics.cables.byType).map(type => ({
    name: cableTypes[type].name,
    value: statistics.cables.byType[type],
    color: cableTypes[type].color
  }));
  
  const cableLengthByTypeData = Object.keys(statistics.cables.lengthByType).map(type => ({
    name: cableTypes[type].name,
    length: parseFloat(statistics.cables.lengthByType[type]),
    color: cableTypes[type].color
  }));

  const getMostUtilizedElement = () => {
    if (networkElements.length === 0) return null;
    
    return networkElements.reduce((prev, current) => {
      const prevUtilizationRatio = prev.properties.utilization / prev.properties.capacity;
      const currentUtilizationRatio = current.properties.utilization / current.properties.capacity;
      return prevUtilizationRatio > currentUtilizationRatio ? prev : current;
    });
  };
  
  const mostUtilizedElement = getMostUtilizedElement();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total de Elementos
                </p>
                <p className="text-2xl font-bold">
                  {statistics.elements.total}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <Box className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total de Cabos
                </p>
                <p className="text-2xl font-bold">
                  {statistics.cables.total}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <LinkIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Comprimento Total
                </p>
                <p className="text-2xl font-bold">
                  {statistics.cables.totalLength} <span className="text-sm font-normal">km</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-100">
                <Ruler className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Clientes Conectados
                </p>
                <p className="text-2xl font-bold">
                  {statistics.elements.byType.CLIENTE || 0}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              Elementos por Tipo
            </CardTitle>
            <CardDescription>
              Distribuição dos elementos da rede por tipo
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={elementsByTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {elementsByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-600" />
              Cabos por Tipo
            </CardTitle>
            <CardDescription>
              Distribuição dos cabos por tipo
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={cablesByTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {cablesByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-yellow-600" />
              Comprimento por Tipo de Cabo
            </CardTitle>
            <CardDescription>
              Distribuição do comprimento por tipo de cabo
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={cableLengthByTypeData}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} km`, "Comprimento"]} />
                <Legend />
                <Bar dataKey="length" name="Comprimento (km)">
                  {cableLengthByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cable className="w-5 h-5 text-purple-600" />
              Utilização de Recursos
            </CardTitle>
            <CardDescription>
              Taxa de utilização dos elementos e cabos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mostUtilizedElement && (
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: networkElementTypes[mostUtilizedElement.type].color }}
                      ></span>
                      <span className="text-sm font-medium">
                        Elemento mais utilizado: {mostUtilizedElement.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round((mostUtilizedElement.properties.utilization / mostUtilizedElement.properties.capacity) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(mostUtilizedElement.properties.utilization / mostUtilizedElement.properties.capacity) * 100} 
                    className="h-2" 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {mostUtilizedElement.properties.utilization} de {mostUtilizedElement.properties.capacity} em uso
                  </p>
                </div>
              )}
              
              <div>
                <div className="font-medium mb-2">Taxa de Utilização por Tipo de Elemento</div>
                {Object.keys(networkElementTypes).map(type => {
                  const elements = networkElements.filter(e => e.type === type);
                  if (elements.length === 0) return null;
                  
                  const totalCapacity = elements.reduce((sum, e) => sum + e.properties.capacity, 0);
                  const totalUtilization = elements.reduce((sum, e) => sum + e.properties.utilization, 0);
                  const utilizationPercent = totalCapacity > 0 ? (totalUtilization / totalCapacity) * 100 : 0;
                  
                  return (
                    <div key={type} className="mb-3">
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: networkElementTypes[type].color }}
                          ></span>
                          <span className="text-sm">{networkElementTypes[type].name}</span>
                        </div>
                        <span className="text-sm font-medium">{Math.round(utilizationPercent)}%</span>
                      </div>
                      <Progress value={utilizationPercent} className="h-2" />
                    </div>
                  );
                })}
              </div>
              
              <div>
                <div className="font-medium mb-2">Taxa de Utilização por Tipo de Cabo</div>
                {Object.keys(cableTypes).map(type => {
                  const cablesOfType = cables.filter(c => c.type === type);
                  if (cablesOfType.length === 0) return null;
                  
                  const totalFibers = cablesOfType.reduce((sum, c) => sum + c.properties.fibers, 0);
                  const totalUtilization = cablesOfType.reduce((sum, c) => sum + c.properties.utilization, 0);
                  const utilizationPercent = totalFibers > 0 ? (totalUtilization / totalFibers) * 100 : 0;
                  
                  return (
                    <div key={type} className="mb-3">
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: cableTypes[type].color }}
                          ></span>
                          <span className="text-sm">{cableTypes[type].name}</span>
                        </div>
                        <span className="text-sm font-medium">{Math.round(utilizationPercent)}%</span>
                      </div>
                      <Progress value={utilizationPercent} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
