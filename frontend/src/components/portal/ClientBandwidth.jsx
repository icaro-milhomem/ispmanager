
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart,
  Calendar,
  Clock,
  Download,
  Upload,
  Wifi,
  AlertTriangle,
  Info
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart as RechartBarChart,
  Bar
} from 'recharts';
import { InvokeLLM } from "@/api/integrations";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ClientBandwidth({ clientData, equipment }) {
  const [period, setPeriod] = useState("day");
  const [bandwidthData, setBandwidthData] = useState([]);
  const [usageSummary, setUsageSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyUsage, setDailyUsage] = useState([]);
  
  useEffect(() => {
    loadBandwidthData();
  }, [period]);
  
  // Função para carregar dados de consumo (simulado)
  const loadBandwidthData = async () => {
    setLoading(true);
    try {
      // Simular dados usando o LLM
      const dataSummary = await InvokeLLM({
        prompt: `Gere dados simulados de uso de largura de banda para um cliente de internet. 
        O período é: ${period} (day=dia, week=semana, month=mês).
        O plano do cliente é ${clientData.plan} (pode ser basic, standard, premium ou enterprise).
        A velocidade contratada depende do plano: 
        - básico: 100 Mbps
        - padrão: 300 Mbps
        - premium: 500 Mbps
        - empresarial: 1000 Mbps
        
        Gere dados realistas para consumo de largura de banda, com variações ao longo do dia/semana/mês.`,
        response_json_schema: {
          type: "object",
          properties: {
            chart_data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  time: { type: "string" },
                  download: { type: "number" },
                  upload: { type: "number" }
                }
              }
            },
            summary: {
              type: "object",
              properties: {
                total_download: { type: "number" },
                total_upload: { type: "number" },
                average_usage: { type: "number" },
                peak_usage: { type: "number" },
                peak_time: { type: "string" },
                total_data: { type: "number" },
                percentage_of_cap: { type: "number" }
              }
            },
            daily_distribution: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  usage: { type: "number" }
                }
              }
            }
          }
        }
      });
      
      setBandwidthData(dataSummary.chart_data);
      setUsageSummary(dataSummary.summary);
      setDailyUsage(dataSummary.daily_distribution);
    } catch (error) {
      console.error("Erro ao carregar dados de consumo:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Formatar bytes em unidades legíveis (KB, MB, GB, etc.)
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Adicionar verificações de nulo
  const getSpeedForPlan = (plan) => {
    if (!plan) return 100; // valor padrão
    
    switch (plan) {
      case 'basic': return 100;
      case 'standard': return 300;
      case 'premium': return 500;
      case 'enterprise': return 1000;
      default: return 100;
    }
  };

  // Obter a velocidade máxima do plano em Mbps
  const getMaxSpeed = () => {
    switch (clientData.plan) {
      case 'basic': return 100;
      case 'standard': return 300;
      case 'premium': return 500;
      case 'enterprise': return 1000;
      default: return 100;
    }
  };
  
  // Personalização do gráfico
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-600">
            <ArrowDown className="inline w-3 h-3 mr-1" />
            Download: {payload[0].value.toFixed(2)} Mbps
          </p>
          <p className="text-sm text-green-600">
            <ArrowUp className="inline w-3 h-3 mr-1" />
            Upload: {payload[1].value.toFixed(2)} Mbps
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Consumo de Internet</h2>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <Select
            value={period}
            onValueChange={setPeriod}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Último Dia</SelectItem>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Resumo de Uso */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total de Dados
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {formatBytes(usageSummary?.total_data || 0)}
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-blue-100">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Uso Médio
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {usageSummary?.average_usage.toFixed(2)} Mbps
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-green-100">
                    <BarChart className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Uso Máximo
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {usageSummary?.peak_usage.toFixed(2)} Mbps
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-red-100">
                    <ArrowUp className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Pico em {usageSummary?.peak_time}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Utilização do Plano
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {usageSummary?.percentage_of_cap.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-purple-100">
                    <Wifi className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Gráfico Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Gráfico de Consumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={bandwidthData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="download" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fill="#93C5FD" 
                      name="Download"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="upload" 
                      stackId="1"
                      stroke="#22C55E" 
                      fill="#86EFAC" 
                      name="Upload"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {usageSummary?.peak_usage > getMaxSpeed() * 0.9 && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Você atingiu {usageSummary.peak_usage.toFixed(0)} Mbps, que está próximo do limite do seu plano de {getMaxSpeed()} Mbps. 
                    Considere fazer um upgrade para um plano superior para melhor desempenho.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distribuição de Uso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-blue-600" />
                  Distribuição de Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartBarChart
                      data={dailyUsage}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="usage" name="Uso de Dados" fill="#3B82F6" />
                    </RechartBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Detalhes de Consumo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Detalhes do Plano
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Plano Contratado</TableCell>
                      <TableCell className="text-right">
                        {clientData?.plan === "basic" ? "Básico" : 
                         clientData?.plan === "standard" ? "Padrão" : 
                         clientData?.plan === "premium" ? "Premium" : 
                         clientData?.plan === "enterprise" ? "Empresarial" : 
                         "Não definido"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Velocidade Download</TableCell>
                      <TableCell className="text-right">{getSpeedForPlan(clientData?.plan)} Mbps</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Velocidade Upload</TableCell>
                      <TableCell className="text-right">{getMaxSpeed() / 2} Mbps</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Limite de Dados</TableCell>
                      <TableCell className="text-right">Ilimitado</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Histórico de Consumo</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Este mês</span>
                    <span className="font-medium">{formatBytes(usageSummary?.total_data || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Mês anterior</span>
                    <span className="font-medium">{formatBytes((usageSummary?.total_data || 0) * 0.8)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Média mensal</span>
                    <span className="font-medium">{formatBytes((usageSummary?.total_data || 0) * 0.9)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
