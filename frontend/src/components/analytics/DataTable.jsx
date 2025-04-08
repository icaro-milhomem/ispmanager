import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Search, Download, Filter } from "lucide-react";

export default function DataTable({ data, type }) {
  const [searchTerm, setSearchTerm] = useState("");
  let tableData = [];
  let columns = [];
  
  // Formatar número para moeda brasileira
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Configurar dados e colunas com base no tipo
  switch(type) {
    case 'customers':
      tableData = data.plans_distribution.map(plan => ({
        plan: plan.plan,
        count: plan.count,
        percentage: ((plan.count / data.total_active) * 100).toFixed(1) + '%',
        averageTenure: data.average_tenure + ' meses',
        status: 'Active'
      }));
      columns = [
        { key: 'plan', label: 'Plano' },
        { key: 'count', label: 'Quantidade' },
        { key: 'percentage', label: 'Porcentagem' },
        { key: 'averageTenure', label: 'Tempo Médio' },
        { key: 'status', label: 'Status' }
      ];
      break;
      
    case 'financial':
      tableData = data.revenue_by_plan.map(plan => ({
        plan: plan.plan,
        revenue: formatCurrency(plan.value),
        percentage: ((plan.value / data.total_revenue) * 100).toFixed(1) + '%',
        arpu: formatCurrency(data.average_arpu),
        status: plan.value > data.total_revenue * 0.2 ? 'Alto' : 'Normal'
      }));
      columns = [
        { key: 'plan', label: 'Plano' },
        { key: 'revenue', label: 'Receita' },
        { key: 'percentage', label: 'Porcentagem' },
        { key: 'arpu', label: 'ARPU' },
        { key: 'status', label: 'Impacto' }
      ];
      break;
      
    case 'network':
      tableData = data.issues_by_type.map(issue => ({
        type: issue.type,
        count: issue.count,
        percentage: ((issue.count / data.issues_by_type.reduce((sum, i) => sum + i.count, 0)) * 100).toFixed(1) + '%',
        resolution: data.average_issue_resolution_time + ' horas',
        status: issue.count > 5 ? 'Alto' : 'Normal'
      }));
      columns = [
        { key: 'type', label: 'Tipo de Problema' },
        { key: 'count', label: 'Ocorrências' },
        { key: 'percentage', label: 'Porcentagem' },
        { key: 'resolution', label: 'Tempo Resolução' },
        { key: 'status', label: 'Criticidade' }
      ];
      break;
      
    case 'support':
      tableData = data.tickets_by_category.map(category => ({
        category: category.category,
        count: category.count,
        percentage: ((category.count / data.tickets_by_category.reduce((sum, c) => sum + c.count, 0)) * 100).toFixed(1) + '%',
        resolution: data.average_resolution_time + ' horas',
        status: category.count > 10 ? 'Alto' : 'Normal'
      }));
      columns = [
        { key: 'category', label: 'Categoria' },
        { key: 'count', label: 'Tickets' },
        { key: 'percentage', label: 'Porcentagem' },
        { key: 'resolution', label: 'Tempo Resolução' },
        { key: 'status', label: 'Volume' }
      ];
      break;
      
    case 'geographic':
      tableData = data.top_regions.map(region => ({
        region: region.region,
        customers: region.customers,
        revenue: formatCurrency(region.revenue),
        density: data.density_map.find(d => d.region === region.region)?.density.toFixed(1) + ' /km²',
        status: region.customers > 100 ? 'Alto' : 'Normal'
      }));
      columns = [
        { key: 'region', label: 'Região' },
        { key: 'customers', label: 'Clientes' },
        { key: 'revenue', label: 'Receita' },
        { key: 'density', label: 'Densidade' },
        { key: 'status', label: 'Saturação' }
      ];
      break;
      
    default:
      break;
  }
  
  // Filtrar dados com base no termo de busca
  const filteredData = tableData.filter(item => 
    Object.values(item).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>Dados Detalhados</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtrar
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                    Nenhum resultado encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, index) => (
                  <TableRow key={index}>
                    {columns.map(column => (
                      <TableCell key={column.key}>
                        {column.key === 'status' ? (
                          <Badge className={`${item.status === 'Alto' ? 'bg-yellow-100 text-yellow-800' : 
                                             item.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                             'bg-blue-100 text-blue-800'}`}>
                            {item.status}
                          </Badge>
                        ) : (
                          item[column.key]
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}