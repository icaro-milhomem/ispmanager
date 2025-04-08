import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Activity,
  AlertTriangle
} from "lucide-react";
import { InvokeLLM } from "@/api/integrations";

export default function MonitoringIntegration() {
  const [monitoringSystem, setMonitoringSystem] = useState("zabbix");
  const [serverUrl, setServerUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [monitoringData, setMonitoringData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Função para testar conexão com o sistema de monitoramento
  const testConnection = async () => {
    if (!serverUrl) {
      setError("Por favor, insira o URL do servidor.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulação de conexão com o sistema de monitoramento
      const result = await InvokeLLM({
        prompt: `Simule uma conexão de teste com um servidor ${monitoringSystem} no URL ${serverUrl}. 
        Retorne um objeto JSON com o status da conexão e uma mensagem.`,
        response_json_schema: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" }
          }
        }
      });

      if (result.success) {
        setIsConnected(true);
        fetchMonitoringData();
      } else {
        setError(result.message || "Falha na conexão. Verifique suas credenciais e URL.");
        setIsConnected(false);
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor de monitoramento. Verifique suas configurações.");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar dados de monitoramento
  const fetchMonitoringData = async () => {
    setIsLoading(true);
    try {
      // Simulação da obtenção de dados do sistema de monitoramento
      const data = await InvokeLLM({
        prompt: `Gere dados simulados de um sistema de monitoramento ${monitoringSystem} para uma rede de provedor de internet.
        Inclua:
        1. Um resumo com total de hosts, hosts com problemas, alertas ativos
        2. Os 5 principais alertas ativos no momento
        3. Dados de performance para os 3 principais links (largura de banda, latência, pacotes perdidos)
        4. Utilização de CPU/memória dos principais equipamentos`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                total_hosts: { type: "number" },
                problem_hosts: { type: "number" },
                active_alerts: { type: "number" },
                uptime_percentage: { type: "number" }
              }
            },
            alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  host: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" },
                  time: { type: "string" },
                  status: { type: "string" }
                }
              }
            },
            performance: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  link_name: { type: "string" },
                  bandwidth_usage: { type: "number" },
                  bandwidth_total: { type: "number" },
                  latency: { type: "number" },
                  packet_loss: { type: "number" }
                }
              }
            },
            resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  host: { type: "string" },
                  cpu_usage: { type: "number" },
                  memory_usage: { type: "number" },
                  disk_usage: { type: "number" }
                }
              }
            }
          }
        }
      });

      setMonitoringData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Erro ao buscar dados de monitoramento:", err);
      setError("Falha ao recuperar dados do sistema de monitoramento.");
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar automaticamente os dados a cada 2 minutos se estiver conectado
  useEffect(() => {
    let interval;
    if (isConnected) {
      interval = setInterval(() => {
        fetchMonitoringData();
      }, 120000); // 2 minutos
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'major':
      case 'média':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
      case 'baixa':
        return 'bg-yellow-100 text-yellow-800';
      case 'warning':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Configuração de Conexão */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Integração com Sistema de Monitoramento
          </CardTitle>
          <CardDescription>
            Conecte-se a ferramentas de monitoramento como Zabbix ou PRTG para obter análises em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monitoring-system">Sistema de Monitoramento</Label>
                <Select
                  value={monitoringSystem}
                  onValueChange={setMonitoringSystem}
                >
                  <SelectTrigger id="monitoring-system">
                    <SelectValue placeholder="Selecione um sistema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zabbix">Zabbix</SelectItem>
                    <SelectItem value="prtg">PRTG Network Monitor</SelectItem>
                    <SelectItem value="librenms">LibreNMS</SelectItem>
                    <SelectItem value="nagios">Nagios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="server-url">URL do Servidor</Label>
                <Input
                  id="server-url"
                  placeholder="https://zabbix.seudominio.com"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {monitoringSystem === "zabbix" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuário</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              {monitoringSystem === "prtg" && (
                <div className="space-y-2">
                  <Label htmlFor="api-key">Token/API Key</Label>
                  <Input
                    id="api-key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={testConnection}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              {isConnected ? "Reconectar" : "Testar Conexão"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exibição de Dados de Monitoramento */}
      {isConnected && monitoringData && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Dados de Monitoramento</h2>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <span className="text-sm text-gray-500">
                  Atualizado: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMonitoringData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir {monitoringSystem.toUpperCase()}
              </Button>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total de Hosts
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {monitoringData.summary.total_hosts}
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-blue-100">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Hosts com Problemas
                    </p>
                    <p className="text-2xl font-bold mt-1 text-red-600">
                      {monitoringData.summary.problem_hosts}
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-red-100">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Alertas Ativos
                    </p>
                    <p className="text-2xl font-bold mt-1 text-yellow-600">
                      {monitoringData.summary.active_alerts}
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-yellow-100">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Uptime da Rede
                    </p>
                    <p className="text-2xl font-bold mt-1 text-green-600">
                      {monitoringData.summary.uptime_percentage.toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-green-100">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Abas de Informações Detalhadas */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="resources">Recursos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Alertas Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {monitoringData.alerts.slice(0, 3).map((alert, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between">
                            <div className="font-medium">{alert.host}</div>
                            <div className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{alert.description}</div>
                          <div className="text-xs text-gray-400 mt-1">{alert.time}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Utilização de Recursos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monitoringData.resources.slice(0, 3).map((resource, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{resource.host}</span>
                            <span>CPU: {resource.cpu_usage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                resource.cpu_usage > 80
                                  ? "bg-red-600"
                                  : resource.cpu_usage > 60
                                  ? "bg-yellow-600"
                                  : "bg-green-600"
                              }`}
                              style={{ width: `${resource.cpu_usage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Alertas Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Host
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Severidade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descrição
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hora
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {monitoringData.alerts.map((alert, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">{alert.host}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                                {alert.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4">{alert.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{alert.time}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{alert.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance de Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {monitoringData.performance.map((perf, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium">{perf.link_name}</h3>
                          <div className="text-sm text-gray-500">
                            {(perf.bandwidth_usage / perf.bandwidth_total * 100).toFixed(1)}% utilizado
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Largura de Banda</span>
                              <span>{perf.bandwidth_usage} / {perf.bandwidth_total} Mbps</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-600"
                                style={{ width: `${(perf.bandwidth_usage / perf.bandwidth_total * 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm mb-1">Latência</div>
                              <div className="text-2xl font-bold">
                                {perf.latency} ms
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm mb-1">Perda de Pacotes</div>
                              <div className="text-2xl font-bold">
                                {perf.packet_loss}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Uso de Recursos dos Equipamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {monitoringData.resources.map((resource, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-4">{resource.host}</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>CPU</span>
                              <span>{resource.cpu_usage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  resource.cpu_usage > 80
                                    ? "bg-red-600"
                                    : resource.cpu_usage > 60
                                    ? "bg-yellow-600"
                                    : "bg-green-600"
                                }`}
                                style={{ width: `${resource.cpu_usage}%` }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Memória</span>
                              <span>{resource.memory_usage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  resource.memory_usage > 80
                                    ? "bg-red-600"
                                    : resource.memory_usage > 60
                                    ? "bg-yellow-600"
                                    : "bg-green-600"
                                }`}
                                style={{ width: `${resource.memory_usage}%` }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Disco</span>
                              <span>{resource.disk_usage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  resource.disk_usage > 80
                                    ? "bg-red-600"
                                    : resource.disk_usage > 60
                                    ? "bg-yellow-600"
                                    : "bg-green-600"
                                }`}
                                style={{ width: `${resource.disk_usage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}