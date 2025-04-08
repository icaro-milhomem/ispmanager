import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  Activity,
  Users,
  ArrowRight,
  CheckCircle,
  Loader2
} from "lucide-react";

export default function RouterIssuesList({ router, issues = [], isLoading = false, onRefresh }) {
  // Ordenar problemas por data (mais recentes primeiro)
  const sortedIssues = [...issues].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );
  
  // Formatar a data relativa
  const formatRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} minutos`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Há ${diffHours} horas`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays} dias`;
  };
  
  // Obter classe de estilo baseada no tipo de problema
  const getIssueTypeClass = (type) => {
    switch (type) {
      case "outage":
        return "bg-red-100 text-red-800";
      case "slowdown":
        return "bg-yellow-100 text-yellow-800";
      case "intermittent":
        return "bg-orange-100 text-orange-800";
      case "hardware":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Obter classe de estilo baseada na prioridade
  const getPriorityClass = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Traduzir tipo de problema
  const translateIssueType = (type) => {
    const translations = {
      outage: "Queda",
      slowdown: "Lentidão",
      intermittent: "Intermitente",
      hardware: "Hardware",
      other: "Outro"
    };
    
    return translations[type] || type;
  };
  
  // Traduzir prioridade
  const translatePriority = (priority) => {
    const translations = {
      critical: "Crítica",
      high: "Alta",
      medium: "Média",
      low: "Baixa"
    };
    
    return translations[priority] || priority;
  };
  
  // Dados de amostra para a lista de problemas
  const sampleIssues = [
    {
      id: "1",
      title: "Queda de conectividade em todos os clientes PPPoE",
      description: "Todos os clientes PPPoE perderam conexão repentinamente às 14:30h",
      type: "outage",
      status: "open",
      priority: "critical",
      affected_customers: ["customer1", "customer2", "customer3"],
      created_date: "2023-06-15T14:30:00",
      resolved_date: null
    },
    {
      id: "2",
      title: "Lentidão intermitente na rede",
      description: "Clientes relatando lentidão em horários de pico (19h-22h)",
      type: "slowdown",
      status: "in_progress",
      priority: "high",
      affected_customers: ["customer4", "customer5"],
      created_date: "2023-06-14T19:45:00",
      resolved_date: null
    },
    {
      id: "3",
      title: "Erro de autenticação em alguns clientes",
      description: "Cerca de 5 clientes não conseguem autenticar no PPPoE",
      type: "intermittent",
      status: "open",
      priority: "medium",
      affected_customers: ["customer6", "customer7"],
      created_date: "2023-06-14T10:15:00",
      resolved_date: null
    },
    {
      id: "4",
      title: "Alta utilização de CPU no roteador",
      description: "CPU acima de 90% nos últimos 30 minutos",
      type: "hardware",
      status: "resolved",
      priority: "high",
      affected_customers: [],
      created_date: "2023-06-13T08:20:00",
      resolved_date: "2023-06-13T09:45:00",
      resolution: "Reiniciado o serviço PPPoE que estava consumindo muitos recursos"
    }
  ];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" /> 
              Problemas no Roteador {router.name}
            </CardTitle>
            <CardDescription>
              Alertas e problemas detectados recentemente
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
            <span>Carregando problemas...</span>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Problema</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Clientes Afetados</TableHead>
                  <TableHead>Ocorrido</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleIssues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      Nenhum problema detectado recentemente.
                    </TableCell>
                  </TableRow>
                ) : (
                  sampleIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>
                        <div className="font-medium">{issue.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{issue.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getIssueTypeClass(issue.type)}>
                          {translateIssueType(issue.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityClass(issue.priority)}>
                          {translatePriority(issue.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          issue.status === "open" ? "bg-red-100 text-red-800" :
                          issue.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                          issue.status === "monitoring" ? "bg-purple-100 text-purple-800" :
                          "bg-green-100 text-green-800"
                        }>
                          {issue.status === "open" ? "Aberto" :
                           issue.status === "in_progress" ? "Em Andamento" :
                           issue.status === "monitoring" ? "Monitorando" :
                           "Resolvido"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{issue.affected_customers.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{formatRelativeTime(issue.created_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="gap-1"
                          onClick={() => alert("Visualizar detalhes do problema em implementação.")}
                        >
                          {issue.status === "resolved" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Activity className="h-4 w-4" />
                          )}
                          <span>
                            {issue.status === "resolved" ? "Detalhes" : "Resolver"}
                          </span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          {sampleIssues.length > 0 
            ? `Exibindo ${sampleIssues.length} problemas detectados`
            : "Nenhum problema ativo"
          }
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          className="gap-1"
          onClick={() => alert("Página de diagnóstico em implementação.")}
        >
          <ArrowRight className="h-4 w-4" />
          Executar Diagnóstico
        </Button>
      </CardFooter>
    </Card>
  );
}