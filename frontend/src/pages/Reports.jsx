import React, { useState, useEffect } from "react";
import { Customer } from "@/api/entities";
import { Invoice } from "@/api/entities";
import { NetworkIssue } from "@/api/entities";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart as BarChartIcon,
  PieChart,
  Calendar,
  Download,
  DollarSign,
  Users,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Cores para gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function ReportsPage() {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState("financeiro");
  const [timePeriod, setTimePeriod] = useState("month");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const customersData = await Customer.list();
      const invoicesData = await Invoice.list();
      const issuesData = await NetworkIssue.list();
      
      setCustomers(customersData);
      setInvoices(invoicesData);
      setIssues(issuesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Preparar dados para o relatório financeiro
  const financialData = [
    { name: "Pendente", value: invoices.filter(i => i.status === "pending").reduce((sum, i) => sum + (i.amount || 0), 0) },
    { name: "Pago", value: invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + (i.amount || 0), 0) },
    { name: "Vencido", value: invoices.filter(i => i.status === "overdue").reduce((sum, i) => sum + (i.amount || 0), 0) }
  ];

  // Dados para gráfico de clientes por plano
  const customersByPlan = [
    { name: "Básico", value: customers.filter(c => c.plan === "basic").length },
    { name: "Padrão", value: customers.filter(c => c.plan === "standard").length },
    { name: "Premium", value: customers.filter(c => c.plan === "premium").length },
    { name: "Empresarial", value: customers.filter(c => c.plan === "enterprise").length }
  ];

  // Dados para gráfico de problemas por tipo
  const issuesByType = [
    { name: "Queda Total", value: issues.filter(i => i.type === "outage").length },
    { name: "Lentidão", value: issues.filter(i => i.type === "slowdown").length },
    { name: "Intermitente", value: issues.filter(i => i.type === "intermittent").length },
    { name: "Hardware", value: issues.filter(i => i.type === "hardware").length },
    { name: "Outro", value: issues.filter(i => i.type === "other").length }
  ];

  // Formatar para gráfico de barras mensal
  const monthlyInvoices = [
    { name: "Jan", value: 0 },
    { name: "Fev", value: 0 },
    { name: "Mar", value: 0 },
    { name: "Abr", value: 0 },
    { name: "Mai", value: 0 },
    { name: "Jun", value: 0 },
    { name: "Jul", value: 0 },
    { name: "Ago", value: 0 },
    { name: "Set", value: 0 },
    { name: "Out", value: 0 },
    { name: "Nov", value: 0 },
    { name: "Dez", value: 0 }
  ];

  // Preencher dados mensais (simulado para demonstração)
  invoices.forEach(invoice => {
    const date = new Date(invoice.due_date);
    const month = date.getMonth();
    if (invoice.status === "paid") {
      monthlyInvoices[month].value += invoice.amount || 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Relatório" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="financeiro">Relatório Financeiro</SelectItem>
              <SelectItem value="clientes">Relatório de Clientes</SelectItem>
              <SelectItem value="problemas">Relatório de Problemas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
              <SelectItem value="all">Todo o Período</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total de Faturas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  <div className="text-2xl font-bold">
                    R$ {invoices.reduce((sum, i) => sum + (i.amount || 0), 0).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 mr-2" />
                  <div className="text-2xl font-bold">{customers.length}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Problemas Resolvidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <div className="text-2xl font-bold">
                    {issues.filter(i => i.status === "resolved").length}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          {reportType === "financeiro" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Faturamento por Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RPieChart>
                        <Pie
                          data={financialData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {financialData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                      </RPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChartIcon className="w-5 h-5" />
                    Faturamento Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyInvoices}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                        <Bar dataKey="value" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {reportType === "clientes" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Clientes por Plano
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart>
                      <Pie
                        data={customersByPlan}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {customersByPlan.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </RPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {reportType === "problemas" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Problemas por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={issuesByType} layout="vertical">
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}