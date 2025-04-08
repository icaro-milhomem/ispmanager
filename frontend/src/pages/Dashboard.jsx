import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { Customer } from "../api/entities";
import { NetworkNode } from "../api/entities";
import { Invoice } from "../api/entities";
import { SupportTicket } from "../api/entities";
import {
  ActivitySquare,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  RefreshCcw,
  Signal,
  Users,
  WifiOff
} from "lucide-react";
import ApiConnectionTest from '../components/ApiConnectionTest';

export default function DashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    customers: { total: 0, active: 0, pending: 0, suspended: 0, inactive: 0 },
    network: { online: 0, offline: 0, warning: 0 },
    financial: { monthlyRevenue: 0, pendingPayments: 0, overduePayments: 0 },
    support: { openTickets: 0, urgentTickets: 0 }
  });
  
  // Controle da visualização do componente de teste
  const [showApiTest, setShowApiTest] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Carregando dados de clientes
      let customerStats;
      try {
        const response = await Customer.list({ dashboard: true });
        // Extrair o array de clientes da resposta
        const customers = Array.isArray(response) ? response : 
                          response.customers ? response.customers : [];
                          
        customerStats = customers.reduce((acc, customer) => {
          acc.total++;
          // Lidar com diferentes formatos de status (maiúsculo ou minúsculo)
          const status = (customer.status || '').toLowerCase();
          if (status === 'active' || status === 'ativo') acc.active++;
          else if (status === 'pending' || status === 'pendente') acc.pending++;
          else if (status === 'suspended' || status === 'suspenso') acc.suspended++;
          else if (status === 'inactive' || status === 'inativo') acc.inactive++;
          return acc;
        }, { total: 0, active: 0, pending: 0, suspended: 0, inactive: 0 });
      } catch (error) {
        console.error("Erro ao carregar dados de clientes:", error);
        customerStats = { total: 0, active: 0, pending: 0, suspended: 0, inactive: 0 };
      }
      
      // Carregando dados de rede
      let networkStats;
      try {
        const response = await NetworkNode.list({ dashboard: true });
        // Extrair o array de nós de rede da resposta
        const nodes = Array.isArray(response) ? response : 
                      response.nodes ? response.nodes : [];
                      
        networkStats = nodes.reduce((acc, node) => {
          const status = (node.status || '').toUpperCase();
          if (status === 'ACTIVE') acc.online++;
          else if (status === 'PROBLEM' || status === 'MAINTENANCE') acc.warning++;
          else acc.offline++;
          return acc;
        }, { online: 0, offline: 0, warning: 0 });
      } catch (error) {
        console.error("Erro ao carregar dados de rede:", error);
        networkStats = { online: 0, offline: 0, warning: 0 };
      }
      
      // Carregando dados financeiros
      let financialStats;
      try {
        const response = await Invoice.list({ dashboard: true });
        // Extrair o array de faturas da resposta
        const invoices = Array.isArray(response) ? response : 
                        response.invoices ? response.invoices : [];
                        
        const currentMonth = new Date().getMonth();
        
        financialStats = invoices.reduce((acc, invoice) => {
          const invoiceMonth = new Date(invoice.dueDate || invoice.due_date).getMonth();
          const status = (invoice.status || '').toUpperCase();
          
          if (invoiceMonth === currentMonth) {
            if (status === 'PAID') {
              acc.monthlyRevenue += invoice.amount;
            } else if (status === 'PENDING') {
              acc.pendingPayments++;
            } else if (status === 'OVERDUE') {
              acc.overduePayments++;
            }
          }
          return acc;
        }, { monthlyRevenue: 0, pendingPayments: 0, overduePayments: 0 });
      } catch (error) {
        console.error("Erro ao carregar dados financeiros:", error);
        financialStats = { monthlyRevenue: 0, pendingPayments: 0, overduePayments: 0 };
      }
      
      // Carregando dados de suporte
      let supportStats;
      try {
        const response = await SupportTicket.list({ dashboard: true });
        // Extrair o array de tickets de suporte da resposta
        const tickets = Array.isArray(response) ? response : 
                        response.tickets ? response.tickets : [];
                        
        supportStats = tickets.reduce((acc, ticket) => {
          const status = (ticket.status || '').toUpperCase();
          const priority = (ticket.priority || '').toUpperCase();
          
          if (status !== 'CLOSED' && status !== 'CANCELLED') {
            acc.openTickets++;
            if (priority === 'HIGH' || priority === 'URGENT') {
              acc.urgentTickets++;
            }
          }
          return acc;
        }, { openTickets: 0, urgentTickets: 0 });
      } catch (error) {
        console.error("Erro ao carregar dados de suporte:", error);
        supportStats = { openTickets: 0, urgentTickets: 0 };
      }
      
      // Atualizar estados
      setStats({
        customers: customerStats,
        network: networkStats,
        financial: financialStats,
        support: supportStats
      });
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError('Falha ao carregar alguns dados do dashboard');
      toast({
        title: "Erro ao carregar dados",
        description: "Alguns dados podem estar desatualizados ou indisponíveis",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowApiTest(!showApiTest)} 
            variant="outline"
          >
            {showApiTest ? "Ocultar Teste API" : "Testar API"}
          </Button>
          <Button 
            onClick={loadDashboardData} 
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-700">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      {showApiTest && (
        <ApiConnectionTest />
      )}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers.active}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.customers.total} clientes totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Equipamentos Online
            </CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.network.online}</div>
            <p className="text-xs text-muted-foreground">
              {stats.network.offline} offline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento Mensal
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.financial.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.financial.pendingPayments} faturas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Chamados Abertos
            </CardTitle>
            <ActivitySquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.support.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.support.urgentTickets} urgentes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status da Rede</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Equipamentos Online</span>
                </div>
                <span className="font-medium">{stats.network.online}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Equipamentos Offline</span>
                </div>
                <span className="font-medium">{stats.network.offline}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span>Equipamentos com Alerta</span>
                </div>
                <span className="font-medium">{stats.network.warning}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Faturamento do Mês</span>
                <span className="font-medium text-green-600">
                  R$ {stats.financial.monthlyRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Faturas Pendentes</span>
                <span className="font-medium text-yellow-600">
                  {stats.financial.pendingPayments} faturas
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Faturas Vencidas</span>
                <span className="font-medium text-red-600">
                  {stats.financial.overduePayments} faturas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chamados Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-gray-500">
              Carregando chamados recentes...
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-gray-500">
              Nenhum alerta no momento
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}