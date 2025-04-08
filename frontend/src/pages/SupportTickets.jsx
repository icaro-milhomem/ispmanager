
import React, { useState, useEffect } from "react";
import { SupportTicket } from "@/api/entities";
import { Customer } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  FileQuestion,
  MessageSquare,
  User,
  CalendarClock,
  FileText,
  Hash
} from "lucide-react";
import TicketForm from "../components/support/TicketForm";
import TicketDetails from "../components/support/TicketDetails";

const statusColors = {
  aberto: "bg-blue-100 text-blue-800",
  em_andamento: "bg-yellow-100 text-yellow-800",
  pendente: "bg-purple-100 text-purple-800",
  resolvido: "bg-green-100 text-green-800",
  cancelado: "bg-gray-100 text-gray-800",
};

const priorityColors = {
  baixa: "bg-blue-100 text-blue-800",
  média: "bg-yellow-100 text-yellow-800",
  alta: "bg-orange-100 text-orange-800",
  crítica: "bg-red-100 text-red-800",
};

const statusLabels = {
  aberto: "Aberto",
  em_andamento: "Em Andamento",
  pendente: "Pendente",
  resolvido: "Resolvido",
  cancelado: "Cancelado"
};

const priorityLabels = {
  baixa: "Baixa",
  média: "Média",
  alta: "Alta",
  crítica: "Crítica"
};

const categoryLabels = {
  conexão: "Conexão",
  financeiro: "Financeiro",
  técnico: "Técnico",
  comercial: "Comercial",
  outros: "Outros"
};

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const ticketsData = await SupportTicket.list();
      const customersData = await Customer.list();
      
      ticketsData.forEach(ticket => {
        if (ticket.is_service_order) {
          const match = ticket.title.match(/OS\s+(\d{8}-\d{2})/);
          ticket.os_number = match ? match[1] : "N/A";
        } else {
          ticket.os_number = "-";
        }
      });
      
      ticketsData.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      
      setTickets(ticketsData);
      setCustomers(customersData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = Object.values(ticket).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && ticket.status === statusFilter;
  });

  const generateOSNumber = async () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateStr = `${day}${month}${year}`;
    
    const todayOrders = tickets.filter(t => {
      if (!t.is_service_order) return false;
      const orderDate = new Date(t.created_date);
      return (
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      );
    });
    
    const sequenceNumber = String(todayOrders.length + 1).padStart(2, '0');
    
    return `${dateStr}-${sequenceNumber}`;
  };

  const handleSubmit = async (ticketData) => {
    try {
      if (selectedTicket) {
        await SupportTicket.update(selectedTicket.id, ticketData);
      } else {
        if (ticketData.is_service_order) {
          const osNumber = await generateOSNumber();
          const customerName = customers.find(c => c.id === ticketData.customer_id)?.full_name || "Cliente";
          ticketData.title = `OS ${osNumber} - ${customerName}`;
          ticketData.os_number = osNumber;
        }
        
        await SupportTicket.create(ticketData);
      }
      setShowForm(false);
      setSelectedTicket(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar chamado:", error);
    }
  };

  const handleEdit = (ticket) => {
    setSelectedTicket(ticket);
    setShowForm(true);
    setShowDetails(false);
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    const customerData = customers.find(c => c.id === ticket.customer_id);
    setSelectedCustomer(customerData);
    setShowDetails(true);
    setShowForm(false);
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.full_name : "N/A";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "aberto":
        return <AlertCircle className="w-4 h-4" />;
      case "em_andamento":
        return <Clock className="w-4 h-4" />;
      case "pendente":
        return <FileQuestion className="w-4 h-4" />;
      case "resolvido":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTicketIcon = (ticket) => {
    if (ticket.is_service_order) {
      return <FileText className="w-4 h-4 mr-1 text-blue-600" />;
    }
    return <MessageSquare className="w-4 h-4 mr-1" />;
  };

  const handleStatusChange = async (updatedTicket) => {
    try {
      await SupportTicket.update(updatedTicket.id, updatedTicket);
      loadData();
      setShowDetails(false);
    } catch (error) {
      console.error("Erro ao atualizar status do chamado:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Suporte Técnico</h1>
        <Button onClick={() => {
          setShowForm(true);
          setSelectedTicket(null);
          setShowDetails(false);
        }} className="bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Chamado
        </Button>
      </div>

      {showForm && (
        <TicketForm
          ticket={selectedTicket}
          customers={customers}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedTicket(null);
          }}
        />
      )}

      {showDetails && selectedTicket && (
        <TicketDetails
          ticket={selectedTicket}
          customerName={getCustomerName(selectedTicket.customer_id)}
          customer={selectedCustomer}
          onEdit={() => handleEdit(selectedTicket)}
          onClose={() => setShowDetails(false)}
          onStatusChange={handleStatusChange}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Chamados de Suporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar chamados..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="border rounded-md px-3 py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="aberto">Abertos</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="pendente">Pendentes</option>
                <option value="resolvido">Resolvidos</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Número OS</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                      <p className="mt-2 text-gray-500">Carregando chamados...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-gray-500">Nenhum chamado encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleViewDetails(ticket)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {ticket.is_service_order ? (
                            <Badge variant="outline" className="mr-2 text-blue-600 border-blue-200 bg-blue-50">
                              OS
                            </Badge>
                          ) : null}
                          {ticket.title}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {ticket.is_service_order ? (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Hash className="w-3 h-3" />
                            {ticket.os_number || "-"}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {getCustomerName(ticket.customer_id)}
                        </div>
                      </TableCell>
                      <TableCell>{categoryLabels[ticket.category]}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={priorityColors[ticket.priority]}
                        >
                          {priorityLabels[ticket.priority]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[ticket.status]}
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(ticket.status)}
                            {statusLabels[ticket.status]}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-500">
                          <CalendarClock className="w-4 h-4" />
                          {new Date(ticket.created_date).toLocaleString('pt-BR')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
