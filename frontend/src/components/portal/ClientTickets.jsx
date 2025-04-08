import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  FileQuestion,
  Search,
  User,
  CalendarClock,
  Send
} from "lucide-react";
import { SupportTicket } from "@/api/entities";

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

export default function ClientTickets({ tickets, onCreateTicket, clientId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "conexão",
    priority: "média",
    status: "aberto",
    customer_id: clientId,
    created_date: new Date().toISOString()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const filteredTickets = tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    statusLabels[ticket.status].toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDetail(true);
    setShowNewTicketForm(false);
  };
  
  const handleNewTicket = () => {
    setShowNewTicketForm(true);
    setShowTicketDetail(false);
    setSelectedTicket(null);
  };
  
  const handleCloseDetail = () => {
    setShowTicketDetail(false);
    setSelectedTicket(null);
  };
  
  const handleCloseForm = () => {
    setShowNewTicketForm(false);
    setNewTicket({
      title: "",
      description: "",
      category: "conexão",
      priority: "média",
      status: "aberto",
      customer_id: clientId,
      created_date: new Date().toISOString()
    });
  };
  
  const handleChange = (field, value) => {
    setNewTicket(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await SupportTicket.create(newTicket);
      setShowNewTicketForm(false);
      setNewTicket({
        title: "",
        description: "",
        category: "conexão",
        priority: "média",
        status: "aberto",
        customer_id: clientId,
        created_date: new Date().toISOString()
      });
      
      // Recarregar tickets
      if (onCreateTicket) onCreateTicket(clientId);
      
      alert("Seu chamado foi criado com sucesso! Em breve entraremos em contato.");
    } catch (error) {
      console.error("Erro ao criar chamado:", error);
      alert("Erro ao criar chamado. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    alert("Mensagem enviada com sucesso!");
    setNewMessage("");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Suporte Técnico</h2>
        <Button onClick={handleNewTicket} className="bg-blue-600 gap-2">
          <Plus className="w-4 h-4" />
          Abrir Chamado
        </Button>
      </div>
      
      {showNewTicketForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Novo Chamado de Suporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Título
                </label>
                <Input
                  id="title"
                  placeholder="Descreva brevemente seu problema"
                  value={newTicket.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Categoria
                  </label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value) => handleChange("category", value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conexão">Conexão</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="técnico">Técnico</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Prioridade
                  </label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value) => handleChange("priority", value)}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="média">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="crítica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Descrição
                </label>
                <Textarea
                  id="description"
                  placeholder="Descreva seu problema com detalhes"
                  rows={5}
                  value={newTicket.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Chamado"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : showTicketDetail && selectedTicket ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                {selectedTicket.title}
              </CardTitle>
              <Badge className={statusColors[selectedTicket.status]}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(selectedTicket.status)}
                  {statusLabels[selectedTicket.status]}
                </span>
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <CalendarClock className="w-4 h-4" />
                {new Date(selectedTicket.created_date).toLocaleDateString('pt-BR')}
              </span>
              <Badge className={priorityColors[selectedTicket.priority]}>
                {priorityLabels[selectedTicket.priority]}
              </Badge>
              <span>{categoryLabels[selectedTicket.category]}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Você</div>
                  <div className="text-xs text-gray-500">
                    {new Date(selectedTicket.created_date).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 pl-11">
                {selectedTicket.description}
              </p>
            </div>
            
            {selectedTicket.status === "resolvido" && selectedTicket.resolution && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Resolução</div>
                    <div className="text-xs text-gray-500">
                      {selectedTicket.resolved_date ? new Date(selectedTicket.resolved_date).toLocaleString('pt-BR') : ""}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 pl-11">
                  {selectedTicket.resolution}
                </p>
              </div>
            )}
            
            {selectedTicket.status !== "resolvido" && selectedTicket.status !== "cancelado" && (
              <div className="flex gap-2">
                <Input 
                  placeholder="Digite uma mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                variant="outline"
                onClick={handleCloseDetail}
              >
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar chamados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum chamado encontrado</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">
                  Você ainda não possui chamados de suporte. Clique no botão abaixo para abrir um novo chamado.
                </p>
                <Button onClick={handleNewTicket} className="bg-blue-600 gap-2">
                  <Plus className="w-4 h-4" />
                  Abrir Chamado
                </Button>
              </div>
            ) : (
              filteredTickets.map((ticket, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewTicket(ticket)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{ticket.title}</h3>
                    <Badge className={statusColors[ticket.status]}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(ticket.status)}
                        {statusLabels[ticket.status]}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {ticket.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>
                        {categoryLabels[ticket.category]}
                      </span>
                      <Badge className={priorityColors[ticket.priority]}>
                        {priorityLabels[ticket.priority]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarClock className="w-3 h-3" />
                      {new Date(ticket.created_date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}