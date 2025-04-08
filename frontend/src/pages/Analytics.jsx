
import React, { useState, useEffect } from "react";
import { Customer } from "@/api/entities";
import { Invoice } from "@/api/entities";
import { Equipment } from "@/api/entities";
import { NetworkIssue } from "@/api/entities";
import { SupportTicket } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Users,
  DollarSign,
  Wifi,
  MapPin,
  AlertTriangle
} from "lucide-react";

import CustomerMetrics from "../components/analytics/CustomerMetrics";
import FinancialMetrics from "../components/analytics/FinancialMetrics";
import NetworkMetrics from "../components/analytics/NetworkMetrics";
import SupportMetrics from "../components/analytics/SupportMetrics";
import GeographicMetrics from "../components/analytics/GeographicMetrics";
import DataTable from "../components/analytics/DataTable";

// Componentes de gráficos responsivos
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("month");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para os dados carregados
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [networkIssues, setNetworkIssues] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  
  // Carregar dados de entidades
  useEffect(() => {
    loadData();
  }, []);
  
  // Carregar dados analíticos quando o intervalo de tempo mudar
  useEffect(() => {
    if (customers.length > 0) {
      generateAnalyticsData();
    }
  }, [timeRange, customers]);
  
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Carregar dados das entidades
      const customersData = await Customer.list();
      const invoicesData = await Invoice.list();
      const equipmentData = await Equipment.list();
      const networkIssuesData = await NetworkIssue.list();
      const ticketsData = await SupportTicket.list();
      
      setCustomers(customersData);
      setInvoices(invoicesData);
      setEquipment(equipmentData);
      setNetworkIssues(networkIssuesData);
      setTickets(ticketsData);
      
      // Gerar dados analíticos
      await generateAnalyticsData();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Ocorreu um erro ao carregar os dados. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateAnalyticsData = async () => {
    setIsLoading(true);
    
    try {
      // Usar o LLM para gerar dados analíticos simulados com base nos dados reais
      const result = await InvokeLLM({
        prompt: `Gere dados analíticos simulados para um sistema de gestão de provedor de internet.
        Use os seguintes dados reais como base:
        - Número de clientes: ${customers.length}
        - Número de faturas: ${invoices.length}
        - Número de equipamentos: ${equipment.length}
        - Número de problemas de rede: ${networkIssues.length}
        - Número de tickets de suporte: ${tickets.length}
        
        O período de tempo solicitado é: ${timeRange} (day=hoje, week=última semana, month=último mês, quarter=último trimestre, year=último ano).
        
        Inclua dados analíticos detalhados e realistas para:
        1. Métricas de clientes (aquisição, churn, satisfação)
        2. Métricas financeiras (receita, inadimplência, projeções)
        3. Métricas de rede (desempenho, uso de largura de banda, problemas)
        4. Métricas de suporte (volume de tickets, tempo de resolução)
        5. Métricas geográficas (distribuição de clientes, cobertura)
        `,
        response_json_schema: {
          type: "object",
          properties: {
            customers: {
              type: "object",
              properties: {
                total_active: { type: "number" },
                growth_rate: { type: "number" },
                churn_rate: { type: "number" },
                satisfaction_score: { type: "number" },
                average_tenure: { type: "number" },
                demographics: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      value: { type: "number" }
                    }
                  }
                },
                acquisition: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      period: { type: "string" },
                      value: { type: "number" }
                    }
                  }
                },
                plans_distribution: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      plan: { type: "string" },
                      count: { type: "number" }
                    }
                  }
                }
              }
            },
            financial: {
              type: "object",
              properties: {
                total_revenue: { type: "number" },
                growth_rate: { type: "number" },
                average_arpu: { type: "number" },
                payment_rate: { type: "number" },
                default_rate: { type: "number" },
                revenue_by_period: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      period: { type: "string" },
                      value: { type: "number" }
                    }
                  }
                },
                revenue_by_plan: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      plan: { type: "string" },
                      value: { type: "number" }
                    }
                  }
                },
                forecast_next_month: { type: "number" }
              }
            },
            network: {
              type: "object",
              properties: {
                average_uptime: { type: "number" },
                bandwidth_usage: { type: "number" },
                peak_usage: { type: "number" },
                total_outages: { type: "number" },
                average_issue_resolution_time: { type: "number" },
                bandwidth_by_period: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      period: { type: "string" },
                      download: { type: "number" },
                      upload: { type: "number" }
                    }
                  }
                },
                issues_by_type: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      count: { type: "number" }
                    }
                  }
                }
              }
            },
            support: {
              type: "object",
              properties: {
                total_tickets: { type: "number" },
                open_tickets: { type: "number" },
                average_resolution_time: { type: "number" },
                satisfaction_score: { type: "number" },
                tickets_by_period: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      period: { type: "string" },
                      count: { type: "number" }
                    }
                  }
                },
                tickets_by_category: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      count: { type: "number" }
                    }
                  }
                },
                avg_response_time: { type: "number" }
              }
            },
            geographic: {
              type: "object",
              properties: {
                coverage_area: { type: "number" },
                total_cities: { type: "number" },
                top_regions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      region: { type: "string" },
                      customers: { type: "number" },
                      revenue: { type: "number" }
                    }
                  }
                },
                density_map: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      region: { type: "string" },
                      density: { type: "number" }
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      setAnalyticsData(result);
    } catch (error) {
      console.error("Erro ao gerar dados analíticos:", error);
      setError("Ocorreu um erro ao gerar os dados analíticos. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportData = () => {
    if (!analyticsData) return;
    
    // Criar texto CSV com os dados analíticos
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Adicionar cabeçalho e dados de clientes
    csvContent += "Métricas de Clientes\n";
    csvContent += "Total de clientes ativos," + analyticsData.customers.total_active + "\n";
    csvContent += "Taxa de crescimento," + analyticsData.customers.growth_rate + "%\n";
    csvContent += "Taxa de churn," + analyticsData.customers.churn_rate + "%\n";
    csvContent += "Índice de satisfação," + analyticsData.customers.satisfaction_score + "\n\n";
    
    // Adicionar dados financeiros
    csvContent += "Métricas Financeiras\n";
    csvContent += "Receita total,R$ " + analyticsData.financial.total_revenue.toFixed(2) + "\n";
    csvContent += "Crescimento da receita," + analyticsData.financial.growth_rate + "%\n";
    csvContent += "ARPU médio,R$ " + analyticsData.financial.average_arpu.toFixed(2) + "\n";
    csvContent += "Taxa de inadimplência," + analyticsData.financial.default_rate + "%\n\n";
    
    // Adicionar dados de rede
    csvContent += "Métricas de Rede\n";
    csvContent += "Uptime médio," + analyticsData.network.average_uptime + "%\n";
    csvContent += "Uso de banda," + analyticsData.network.bandwidth_usage + " Gbps\n";
    csvContent += "Pico de uso," + analyticsData.network.peak_usage + " Gbps\n";
    csvContent += "Total de interrupções," + analyticsData.network.total_outages + "\n\n";
    
    // Codificar e criar link para download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_${timeRange}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Relatórios</h1>
          <p className="text-gray-500">Análise detalhada dos dados do provedor de internet</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-36">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hoje</SelectItem>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleExportData} disabled={!analyticsData} className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          
          <Button variant="outline" onClick={loadData} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {isLoading && !analyticsData ? (
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Carregando dados analíticos...</p>
          </div>
        </div>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                <span>Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Clientes</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>Financeiro</span>
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-1">
                <Wifi className="w-4 h-4" />
                <span>Rede</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>Suporte</span>
              </TabsTrigger>
              <TabsTrigger value="geographic" className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Geográfico</span>
              </TabsTrigger>
            </TabsList>
            
            {analyticsData && (
              <>
                <TabsContent value="overview">
                  <AnalyticsOverview data={analyticsData} timeRange={timeRange} />
                </TabsContent>
                
                <TabsContent value="customers">
                  <CustomerMetrics data={analyticsData.customers} />
                </TabsContent>
                
                <TabsContent value="financial">
                  <FinancialMetrics data={analyticsData.financial} />
                </TabsContent>
                
                <TabsContent value="network">
                  <NetworkMetrics data={analyticsData.network} />
                </TabsContent>
                
                <TabsContent value="support">
                  <SupportMetrics data={analyticsData.support} />
                </TabsContent>
                
                <TabsContent value="geographic">
                  <GeographicMetrics data={analyticsData.geographic} />
                </TabsContent>
              </>
            )}
          </Tabs>
          
          {analyticsData && activeTab !== "overview" && (
            <DataTable 
              data={analyticsData[activeTab]} 
              type={activeTab}
            />
          )}
        </>
      )}
    </div>
  );
}

function AnalyticsOverview({ data, timeRange }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Clientes Ativos
                </p>
                <p className="text-2xl font-bold">
                  {data.customers.total_active}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center">
              <TrendingUp className={`w-4 h-4 mr-1 ${data.customers.growth_rate >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm ${data.customers.growth_rate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {data.customers.growth_rate >= 0 ? '+' : ''}{data.customers.growth_rate}%
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
                  Receita {getPeriodLabel(timeRange)}
                </p>
                <p className="text-2xl font-bold">
                  R$ {data.financial.total_revenue.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center">
              <TrendingUp className={`w-4 h-4 mr-1 ${data.financial.growth_rate >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm ${data.financial.growth_rate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {data.financial.growth_rate >= 0 ? '+' : ''}{data.financial.growth_rate}%
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
                  Uptime da Rede
                </p>
                <p className="text-2xl font-bold">
                  {data.network.average_uptime}%
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Wifi className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">
                {data.network.total_outages} interrupções no período
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Tickets de Suporte
                </p>
                <p className="text-2xl font-bold">
                  {data.support.total_tickets}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-orange-100">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">
                {data.support.open_tickets} tickets abertos
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-blue-600" />
              Receita por Período
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveLineChart 
              data={data.financial.revenue_by_period.map(item => ({
                x: item.period,
                y: item.value
              }))}
              xLabel="Período"
              yLabel="Receita (R$)"
              color="#3b82f6"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Uso de Banda por Período
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveDualLineChart 
              data={data.network.bandwidth_by_period}
              xField="period"
              y1Field="download"
              y2Field="upload"
              y1Label="Download (Gbps)"
              y2Label="Upload (Gbps)"
              y1Color="#3b82f6"
              y2Color="#10b981"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-600" />
              Distribuição de Planos
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsivePieChart 
              data={data.customers.plans_distribution.map(item => ({
                id: item.plan,
                label: item.plan,
                value: item.count
              }))}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-blue-600" />
              Tickets por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveBarChart 
              data={data.support.tickets_by_category.map(item => ({
                category: item.category,
                value: item.count
              }))}
              indexBy="category"
              keys={["value"]}
              color="#3b82f6"
              label="Tickets"
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Métricas de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <dt className="text-gray-500">Taxa de churn</dt>
                <dd className="font-medium">{data.customers.churn_rate}%</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <dt className="text-gray-500">Satisfação média</dt>
                <dd className="font-medium">{data.customers.satisfaction_score}/10</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <dt className="text-gray-500">Tempo médio como cliente</dt>
                <dd className="font-medium">{data.customers.average_tenure} meses</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Métricas Financeiras</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <dt className="text-gray-500">ARPU</dt>
                <dd className="font-medium">R$ {data.financial.average_arpu.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <dt className="text-gray-500">Taxa de inadimplência</dt>
                <dd className="font-medium">{data.financial.default_rate}%</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <dt className="text-gray-500">Previsão próximo mês</dt>
                <dd className="font-medium">R$ {data.financial.forecast_next_month.toLocaleString('pt-BR')}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Métricas de Suporte</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <dt className="text-gray-500">Tempo de resposta</dt>
                <dd className="font-medium">{data.support.avg_response_time} min</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <dt className="text-gray-500">Tempo de resolução</dt>
                <dd className="font-medium">{data.support.average_resolution_time} horas</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <dt className="text-gray-500">Satisfação do suporte</dt>
                <dd className="font-medium">{data.support.satisfaction_score}/10</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getPeriodLabel(timeRange) {
  switch (timeRange) {
    case 'day': return 'do Dia';
    case 'week': return 'da Semana';
    case 'month': return 'do Mês';
    case 'quarter': return 'do Trimestre';
    case 'year': return 'do Ano';
    default: return '';
  }
}

// Gráfico de linha
function ResponsiveLineChart({ data, xLabel, yLabel, color = "#3b82f6" }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="x" 
          label={{ value: xLabel, position: 'insideBottom', offset: -10 }} 
        />
        <YAxis 
          label={{ value: yLabel, angle: -90, position: 'insideLeft' }} 
        />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="y" stroke={color} strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Gráfico de dupla linha
function ResponsiveDualLineChart({ 
  data, 
  xField, 
  y1Field, 
  y2Field, 
  y1Label, 
  y2Label, 
  y1Color = "#3b82f6", 
  y2Color = "#10b981" 
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xField} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey={y1Field} 
          name={y1Label} 
          stroke={y1Color} 
          strokeWidth={2} 
          dot={{ r: 4 }} 
        />
        <Line 
          type="monotone" 
          dataKey={y2Field} 
          name={y2Label} 
          stroke={y2Color} 
          strokeWidth={2} 
          dot={{ r: 4 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Gráfico de barras
function ResponsiveBarChart({ 
  data, 
  indexBy, 
  keys, 
  color = "#3b82f6", 
  label 
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey={indexBy} 
          angle={-45}
          textAnchor="end"
          height={70}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={keys[0]} name={label} fill={color} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

// Gráfico de pizza
function ResponsivePieChart({ data }) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [value, "Quantidade"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
