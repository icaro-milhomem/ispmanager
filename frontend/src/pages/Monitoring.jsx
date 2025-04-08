import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  BarChart,
  Layers,
  LineChart,
  Link2,
  Workflow
} from "lucide-react";
import MonitoringIntegration from "../components/network/MonitoringIntegration";

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState("integration");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Monitoramento</h1>
          <p className="text-gray-500">Integração com ferramentas de monitoramento e análise de rede</p>
        </div>
      </div>

      <Tabs defaultValue="integration" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Integração
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Análise
          </TabsTrigger>
          <TabsTrigger value="traffic" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Tráfego
          </TabsTrigger>
          <TabsTrigger value="topology" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            Topologia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integration">
          <MonitoringIntegration />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-600" />
                Análise de Desempenho
              </CardTitle>
              <CardDescription>
                Métricas detalhadas de desempenho da rede, utilização de largura de banda e mais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-96 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="text-center p-6 max-w-md">
                  <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Análise de Desempenho</h3>
                  <p className="text-gray-500 mb-4">
                    Conecte-se a um sistema de monitoramento na aba "Integração" para visualizar os dados de análise de desempenho da sua rede.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("integration")}
                  >
                    Configurar Integração
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Monitoramento de Tráfego
              </CardTitle>
              <CardDescription>
                Visualize o tráfego de rede em tempo real, detecção de anomalias e análise de fluxo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-96 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="text-center p-6 max-w-md">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Monitoramento de Tráfego</h3>
                  <p className="text-gray-500 mb-4">
                    Conecte-se a um sistema de monitoramento na aba "Integração" para visualizar os dados de tráfego da sua rede.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("integration")}
                  >
                    Configurar Integração
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topology">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-blue-600" />
                Topologia de Rede
              </CardTitle>
              <CardDescription>
                Visualização topológica da sua rede com base nos dados do sistema de monitoramento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-96 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="text-center p-6 max-w-md">
                  <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Visualização Topológica</h3>
                  <p className="text-gray-500 mb-4">
                    Conecte-se a um sistema de monitoramento na aba "Integração" para visualizar a topologia da sua rede detectada automaticamente.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("integration")}
                  >
                    Configurar Integração
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}