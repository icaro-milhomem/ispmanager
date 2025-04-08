import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Download, ExternalLink } from "lucide-react";

export default function ContractList({ 
  contracts, 
  getCustomerName,
  getTemplateName,
  onEdit,
  onGenerate,
  isLoading,
  statusColors
}) {
  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateString;
    }
  };

  // Obter texto para o status do contrato
  const getStatusText = (status) => {
    const statusText = {
      draft: "Rascunho",
      active: "Ativo",
      expired: "Expirado",
      cancelled: "Cancelado"
    };
    return statusText[status] || status;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Contratos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando contratos...</p>
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Assinado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      Nenhum contrato encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.contract_number}
                      </TableCell>
                      <TableCell>
                        {getCustomerName(contract.customer_id)}
                      </TableCell>
                      <TableCell>
                        {getTemplateName(contract.template_id)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[contract.status]}>
                          {getStatusText(contract.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(contract.created_date)}
                      </TableCell>
                      <TableCell>
                        {formatDate(contract.signed_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(contract)}
                            title="Editar contrato"
                          >
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onGenerate(contract)}
                            title="Visualizar/Gerar contrato"
                          >
                            {contract.pdf_url ? (
                              <ExternalLink className="h-4 w-4 text-green-600" />
                            ) : (
                              <FileText className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                          {contract.pdf_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              title="Baixar PDF"
                            >
                              <a href={contract.pdf_url} download>
                                <Download className="h-4 w-4 text-green-600" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}