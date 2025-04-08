import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function RecentTickets() {
  // Em uma implementação real, esses dados viriam de uma API
  const tickets = [
    {
      id: 'TK-1001',
      title: 'Internet lenta no período noturno',
      customer: 'João Silva',
      status: 'em_andamento',
      priority: 'média',
      created_at: '2023-05-15T14:30:00Z',
      last_update: '2023-05-15T16:45:00Z'
    },
    {
      id: 'TK-1002',
      title: 'Falha completa de conexão',
      customer: 'Maria Souza',
      status: 'aberto',
      priority: 'alta',
      created_at: '2023-05-15T18:22:00Z',
      last_update: '2023-05-15T18:22:00Z'
    },
    {
      id: 'TK-1003',
      title: 'Solicitação de upgrade de plano',
      customer: 'Carlos Almeida',
      status: 'pendente',
      priority: 'baixa',
      created_at: '2023-05-14T09:15:00Z',
      last_update: '2023-05-14T10:30:00Z'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'aberto': return 'bg-blue-100 text-blue-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'pendente': return 'bg-purple-100 text-purple-800';
      case 'resolvido': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'baixa': return 'bg-green-100 text-green-800';
      case 'média': return 'bg-yellow-100 text-yellow-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'crítica': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      'aberto': 'Aberto',
      'em_andamento': 'Em andamento',
      'pendente': 'Pendente',
      'resolvido': 'Resolvido',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const formatPriority = (priority) => {
    const priorityMap = {
      'baixa': 'Baixa',
      'média': 'Média',
      'alta': 'Alta',
      'crítica': 'Crítica'
    };
    return priorityMap[priority] || priority;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chamados Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Nenhum chamado recente
          </div>
        ) : (
          tickets.map((ticket) => (
            <div 
              key={ticket.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{ticket.title}</h3>
                  <p className="text-sm text-gray-500">{ticket.customer}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(ticket.status)}>
                    {formatStatus(ticket.status)}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {formatPriority(ticket.priority)}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                  <span className="mr-4">ID: {ticket.id}</span>
                  <span>Aberto em: {formatDate(ticket.created_at)}</span>
                </div>
                <Link 
                  to={createPageUrl("SupportTickets", { id: ticket.id })}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span className="mr-1">Ver detalhes</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter>
        <Link to={createPageUrl("SupportTickets")} className="w-full">
          <Button variant="outline" className="w-full">
            Ver todos os chamados
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}