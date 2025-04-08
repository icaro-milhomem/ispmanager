
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FileQuestion,
  Edit,
  Tag,
  CalendarClock,
  FileText,
  MapPin,
  Phone,
  Mail,
  Terminal,
  Wifi,
  Printer,
  Hash // Imported Hash icon
} from "lucide-react";

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

export default function TicketDetails({ ticket, customerName, onEdit, onClose, customer, onStatusChange }) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');

    const printStyles = `
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          margin: 0;
          padding: 20px;
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .company-info {
          font-weight: bold;
          font-size: 18px;
        }
        .order-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .order-subtitle {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 20px;
        }
        .info-section {
          margin-bottom: 20px;
        }
        .section-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
          color: #3b82f6;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          font-size: 12px;
          color: #6b7280;
        }
        .info-value {
          font-size: 14px;
        }
        .full-width {
          grid-column: 1 / -1;
        }
        .credentials-box {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 10px;
          margin-top: 10px;
        }
        .credential-item {
          display: inline-block;
          width: 48%;
          margin-right: 2%;
        }
        .credential-value {
          background-color: white;
          border: 1px solid #d1d5db;
          padding: 5px;
          font-family: monospace;
          border-radius: 3px;
        }
        .description-box {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 10px;
          margin-top: 5px;
        }
        .signature-section {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }
        .signature-line {
          border-top: 1px solid black;
          width: 200px;
          margin-top: 5px;
          text-align: center;
        }
        @media print {
          body {
            padding: 0;
            margin: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    `;

    const statusText = {
      aberto: "Aberto",
      em_andamento: "Em Andamento",
      pendente: "Pendente",
      resolvido: "Resolvido",
      cancelado: "Cancelado"
    }[ticket.status];

    const priorityText = {
      baixa: "Baixa",
      média: "Média",
      alta: "Alta",
      crítica: "Crítica"
    }[ticket.priority];

    const categoryText = {
      conexão: "Conexão",
      financeiro: "Financeiro",
      técnico: "Técnico",
      comercial: "Comercial",
      outros: "Outros"
    }[ticket.category];

    const fullAddress = customer?.address ? 
      `${customer.address}${customer.address_number ? `, ${customer.address_number}` : ''}${customer.neighborhood ? `, ${customer.neighborhood}` : ''}${customer.city ? `, ${customer.city}` : ''}${customer.state ? ` - ${customer.state}` : ''}` 
      : "Não informado";

    const formattedDate = new Date(ticket.created_date).toLocaleString('pt-BR');

    const printContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Ordem de Serviço - ${ticket.title}</title>
        ${printStyles}
      </head>
      <body>
        <div class="order-header">
          <div class="company-info">
            ISP Manager
          </div>
          <div>
            <div>Ordem de Serviço</div>
            <div>${formattedDate}</div>
          </div>
        </div>

        <div class="order-title">${ticket.title}</div>
        <div class="order-subtitle">
          Status: ${statusText} | Prioridade: ${priorityText} | Categoria: ${categoryText}
        </div>

        <div class="info-section">
          <div class="section-title">Dados do Cliente</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Cliente:</div>
              <div class="info-value">${customerName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Telefone:</div>
              <div class="info-value">${customer?.phone || "Não informado"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">E-mail:</div>
              <div class="info-value">${customer?.email || "Não informado"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Contrato:</div>
              <div class="info-value">${customer?.contract_number || "Não informado"}</div>
            </div>
            <div class="info-item full-width">
              <div class="info-label">Endereço:</div>
              <div class="info-value">${fullAddress}</div>
            </div>
            <div class="info-item full-width">
              <div class="info-label">Credenciais PPPoE:</div>
              <div class="credentials-box">
                <div class="credential-item">
                  <div class="info-label">Usuário:</div>
                  <div class="credential-value">${customer?.pppoe_username || "Não configurado"}</div>
                </div>
                <div class="credential-item">
                  <div class="info-label">Senha:</div>
                  <div class="credential-value">${customer?.pppoe_password || "Não configurada"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <div class="section-title">Detalhes do Chamado</div>
          <div class="info-item">
            <div class="info-label">Descrição:</div>
            <div class="description-box">
              ${ticket.description}
            </div>
          </div>
        </div>

        <div class="info-section">
          <div class="section-title">Resolução</div>
          <div class="info-item">
            <div class="description-box" style="height: 100px;">
              ${ticket.resolution || ""}
            </div>
          </div>
        </div>

        <div class="signature-section">
          <div>
            <div class="signature-line">Técnico</div>
          </div>
          <div>
            <div class="signature-line">Cliente</div>
          </div>
        </div>

        <div style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
          Este documento é parte integrante da Ordem de Serviço. 
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print();" style="padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Imprimir
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.focus();
  };

  const handleMarkAsResolved = () => {
    const resolvedTicket = {
      ...ticket,
      status: "resolvido",
      resolved_date: new Date().toISOString()
    };
    onStatusChange(resolvedTicket);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              {ticket.title}
            </CardTitle>
            {ticket.is_service_order && (
              <div className="flex gap-2 items-center">
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                  Ordem de Serviço
                </Badge>
                {ticket.os_number && (
                  <span className="text-sm font-mono text-blue-700 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5" />
                    {ticket.os_number} {/* Displaying the OS number */}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={priorityColors[ticket.priority]}
            >
              {priorityLabels[ticket.priority]}
            </Badge>
            <Badge
              variant="secondary"
              className={statusColors[ticket.status]}
            >
              <span className="flex items-center gap-1">
                {getStatusIcon(ticket.status)}
                {statusLabels[ticket.status]}
              </span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p className="text-sm text-gray-500">Cliente</p>
            <div className="flex items-center gap-2 font-medium">
              <User className="w-4 h-4 text-gray-400" />
              {customerName}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Categoria</p>
            <div className="flex items-center gap-2 font-medium">
              <Tag className="w-4 h-4 text-gray-400" />
              {categoryLabels[ticket.category]}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Data de Abertura</p>
            <div className="flex items-center gap-2 font-medium">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(ticket.created_date).toLocaleString('pt-BR')}
            </div>
          </div>

          {ticket.assigned_to && (
            <div>
              <p className="text-sm text-gray-500">Responsável</p>
              <p className="font-medium">{ticket.assigned_to}</p>
            </div>
          )}

          {ticket.resolved_date && (
            <div>
              <p className="text-sm text-gray-500">Data de Resolução</p>
              <div className="flex items-center gap-2 font-medium">
                <CalendarClock className="w-4 h-4 text-gray-400" />
                {new Date(ticket.resolved_date).toLocaleString('pt-BR')}
              </div>
            </div>
          )}
        </div>

        {ticket.is_service_order && customer && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mt-4 border border-blue-100 dark:border-blue-700">
            <h3 className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-3">
              <FileText className="h-4 w-4" />
              Informações da Ordem de Serviço
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> Telefone
                </div>
                <div>{customer?.phone || "Não informado"}</div>
              </div>

              <div>
                <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> Email
                </div>
                <div>{customer?.email || "Não informado"}</div>
              </div>

              <div className="md:col-span-2">
                <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Endereço
                </div>
                <div>
                  {customer?.address ? 
                    `${customer.address}${customer.address_number ? `, ${customer.address_number}` : ''}${customer.neighborhood ? `, ${customer.neighborhood}` : ''}${customer.city ? `, ${customer.city}` : ''}${customer.state ? ` - ${customer.state}` : ''}` 
                    : "Não informado"}
                </div>
              </div>

              {customer?.contract_number && (
                <div>
                  <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> Contrato
                  </div>
                  <div>{customer.contract_number}</div>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md md:col-span-2 mt-2">
                <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                  <Wifi className="h-3.5 w-3.5" /> Credenciais PPPoE
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Usuário:</span>
                    <div className="font-mono text-sm bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                      {customer?.pppoe_username || "Não configurado"}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Senha:</span>
                    <div className="font-mono text-sm bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                      {customer?.pppoe_password || "Não configurada"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500 mb-1">Descrição</p>
          <div className="p-3 bg-gray-50 rounded-md">
            {ticket.description}
          </div>
        </div>

        {ticket.resolution && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Resolução</p>
            <div className="p-3 bg-green-50 rounded-md">
              {ticket.resolution}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        <div>
          {ticket.status !== "resolvido" && (
            <Button 
              type="button" 
              variant="outline" 
              className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
              onClick={handleMarkAsResolved}
            >
              <CheckCircle className="w-4 h-4" />
              Marcar como Resolvido
            </Button>
          )}
        </div>
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {ticket.is_service_order && (
            <Button 
              type="button" 
              variant="outline" 
              className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4" />
              Imprimir OS
            </Button>
          )}
          <Button type="button" className="bg-blue-600" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
