import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusColors = {
  open: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  monitoring: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
};

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica"
};

const statusLabels = {
  open: "Aberto",
  in_progress: "Em Andamento",
  resolved: "Resolvido",
  monitoring: "Monitorando"
};

const typeLabels = {
  outage: "Queda Total",
  slowdown: "Lentidão",
  intermittent: "Intermitente",
  hardware: "Hardware",
  other: "Outro"
};

export default function ActiveIssuesList({ issues = [], onIssueSelect, hasError = false }) {
  // Filtrar problemas ativos ou usar array vazio se não houver dados
  const activeIssues = Array.isArray(issues) 
    ? issues.filter((issue) => issue.status !== "resolved")
    : [];

  if (hasError && activeIssues.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Problemas Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Dados temporariamente indisponíveis
            </h3>
            <p className="text-gray-500">
              Não foi possível carregar os problemas ativos devido a um erro de conexão.
              Por favor, tente novamente mais tarde.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Problemas Ativos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border dark:border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-700">
                <TableHead className="dark:text-gray-400">Título</TableHead>
                <TableHead className="dark:text-gray-400">Tipo</TableHead>
                <TableHead className="dark:text-gray-400">Prioridade</TableHead>
                <TableHead className="dark:text-gray-400">Status</TableHead>
                <TableHead className="dark:text-gray-400">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeIssues.map((issue) => (
                <TableRow
                  key={issue.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700"
                  onClick={() => onIssueSelect(issue)}
                >
                  <TableCell>
                    <div className="font-medium dark:text-white">{issue.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {issue.description}
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{typeLabels[issue.type]}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={priorityColors[issue.priority]}
                    >
                      {priorityLabels[issue.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[issue.status]}
                    >
                      {statusLabels[issue.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    {new Date(issue.created_date).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
              {activeIssues.length === 0 && (
                <TableRow className="dark:border-gray-700">
                  <TableCell colSpan={5} className="text-center py-4 dark:text-gray-400">
                    Nenhum problema ativo no momento
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}