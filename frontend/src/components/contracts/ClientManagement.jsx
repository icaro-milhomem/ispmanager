import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Customer } from '@/api/entities';
import { Contract } from '@/api/entities';
import { Search, Plus, FileText, User, Edit, Eye } from "lucide-react";

export default function ClientManagement({ 
  onCreateContract, 
  onViewCustomer, 
  onEditCustomer 
}) {
  const [customers, setCustomers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const customersData = await Customer.list();
      const contractsData = await Contract.list();
      
      setCustomers(customersData);
      setContracts(contractsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCustomers = customers.filter((customer) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      customer.full_name.toLowerCase().includes(searchTermLower) ||
      customer.cpf.toLowerCase().includes(searchTermLower) ||
      customer.email.toLowerCase().includes(searchTermLower) ||
      customer.phone.toLowerCase().includes(searchTermLower) ||
      customer.address.toLowerCase().includes(searchTermLower)
    );
  });

  const getCustomerContracts = (customerId) => {
    return contracts.filter(contract => contract.customer_id === customerId);
  };

  const getPlanLabel = (plan) => {
    const planLabels = {
      basic: "Básico",
      standard: "Padrão",
      premium: "Premium",
      enterprise: "Empresarial"
    };
    return planLabels[plan] || plan;
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      active: "Ativo",
      inactive: "Inativo",
      suspended: "Suspenso",
      pending: "Pendente"
    };
    return statusLabels[status] || status;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800"
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-500" />
          Gestão de Clientes
        </CardTitle>
        <CardDescription>
          Gerenciamento de clientes e seus contratos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar clientes por nome, CPF, email..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando clientes...</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contratos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum cliente encontrado com os termos de busca
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => {
                  const customerContracts = getCustomerContracts(customer.id);
                  
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-medium">{customer.full_name}</div>
                        <div className="text-sm text-gray-500">{customer.cpf}</div>
                      </TableCell>
                      <TableCell>
                        <div>{customer.phone}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </TableCell>
                      <TableCell>
                        {getPlanLabel(customer.plan)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(customer.status)}>
                          {getStatusLabel(customer.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customerContracts.length > 0 ? (
                          <Badge variant="outline" className="font-mono">
                            {customerContracts.length}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-400 border-gray-200">
                            Sem contratos
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewCustomer(customer)}
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditCustomer(customer)}
                            title="Editar cliente"
                          >
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onCreateContract(customer)}
                            title="Criar contrato"
                            className="text-green-600"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}