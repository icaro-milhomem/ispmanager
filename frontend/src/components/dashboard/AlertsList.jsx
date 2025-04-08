import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, WifiOff, AlertCircle, Bell, ThumbsUp, BadgeAlert, Clock } from "lucide-react";

export default function AlertsList() {
  // Em uma implementação real, esses dados viriam de uma API
  const alerts = [
    {
      id: 1,
      type: 'critical',
      message: 'CTO-B5 offline há mais de 30 minutos',
      timestamp: '2023-05-15T18:30:00Z',
      affectedCustomers: 12,
      icon: WifiOff
    },
    {
      id: 2,
      type: 'warning',
      message: 'Tráfego elevado na OLT-02 (85% da capacidade)',
      timestamp: '2023-05-15T17:45:00Z',
      affectedCustomers: 0,
      icon: AlertCircle
    },
    {
      id: 3,
      type: 'info',
      message: '5 faturas vencidas nos últimos 2 dias',
      timestamp: '2023-05-15T09:15:00Z',
      affectedCustomers: 5,
      icon: BadgeAlert
    },
    {
      id: 4,
      type: 'success',
      message: 'Manutenção programada concluída com sucesso',
      timestamp: '2023-05-14T23:00:00Z',
      affectedCustomers: 0,
      icon: ThumbsUp
    }
  ];

  const getAlertTypeColor = (type) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'success': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAlertTypeBadge = (type) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertTypeLabel = (type) => {
    switch (type) {
      case 'critical': return 'Crítico';
      case 'warning': return 'Alerta';
      case 'info': return 'Informação';
      case 'success': return 'Sucesso';
      default: return type;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5 text-yellow-600" />
          Alertas do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Nenhum alerta no momento
          </div>
        ) : (
          alerts.map((alert) => {
            const IconComponent = alert.icon;
            return (
              <div 
                key={alert.id}
                className={`border rounded-lg p-4 ${getAlertTypeColor(alert.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{alert.message}</h3>
                      <Badge className={getAlertTypeBadge(alert.type)}>
                        {getAlertTypeLabel(alert.type)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {formatDate(alert.timestamp)}
                      </div>
                      {alert.affectedCustomers > 0 && (
                        <div className="text-gray-600">
                          {alert.affectedCustomers} clientes afetados
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Ver todos os alertas
        </Button>
      </CardFooter>
    </Card>
  );
}