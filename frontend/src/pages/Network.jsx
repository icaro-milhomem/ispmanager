import React, { useState, useEffect } from "react";
import { NetworkIssue, NetworkNode } from "@/api/entities";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import NetworkIssueForm from "../components/network/NetworkIssueForm";
import NetworkStatusCard from "../components/network/NetworkStatusCard";
import ActiveIssuesList from "../components/network/ActiveIssuesList";

export default function NetworkPage() {
  const { toast } = useToast();
  const [issues, setIssues] = useState([]);
  const [networkStatus, setNetworkStatus] = useState({
    networkSpeed: "Carregando...",
    latency: "Carregando...",
    uptime: "Carregando..."
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Carregar issues de rede
      await loadIssues();
      
      // Carregar dados de status da rede
      await loadNetworkStatus();
      
    } catch (error) {
      console.error("Erro ao carregar dados de rede:", error);
      setError("Falha ao carregar os dados. Verifique sua conexão e tente novamente.");
      
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao buscar informações de rede.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadIssues = async () => {
    try {
      const response = await NetworkIssue.list();
      // Extrair o array de issues da resposta, caso venha dentro de um objeto
      const issuesArray = response.issues || response;
      setIssues(Array.isArray(issuesArray) ? issuesArray : []);
    } catch (error) {
      console.error("Erro ao carregar problemas de rede:", error);
      throw error;
    }
  };

  const loadNetworkStatus = async () => {
    try {
      try {
        // Buscar nós de rede ativos para calcular estatísticas
        const response = await NetworkNode.list({ status: 'ACTIVE' });
        const nodes = Array.isArray(response) ? response : (response.nodes || []);
        
        if (nodes && nodes.length > 0) {
          // Calcular média de velocidade e latência dos nós
          const speedSum = nodes.reduce((sum, node) => {
            return sum + (node.bandwidth || 0);
          }, 0);
          
          const latencySum = nodes.reduce((sum, node) => {
            return sum + (node.latency || 0);
          }, 0);
          
          // Calcular porcentagem de nós online
          const totalNodesResponse = await NetworkNode.list();
          const totalNodes = Array.isArray(totalNodesResponse) ? totalNodesResponse : (totalNodesResponse.nodes || []);
          const uptimePercentage = totalNodes.length > 0 
            ? (nodes.length / totalNodes.length * 100).toFixed(1) 
            : 0;
          
          setNetworkStatus({
            networkSpeed: speedSum > 0 ? `${Math.round(speedSum / nodes.length)} Mbps` : "N/A",
            latency: latencySum > 0 ? `${Math.round(latencySum / nodes.length)} ms` : "N/A",
            uptime: `${uptimePercentage}%`
          });
          return; // Sucesso - retorna da função
        } else {
          // Não há nós ativos, usar N/A
          setNetworkStatus({
            networkSpeed: "N/A",
            latency: "N/A",
            uptime: "N/A"
          });
        }
      } catch (apiError) {
        console.warn("Erro na API de nós de rede:", apiError);
        // Sem dados disponíveis
        setNetworkStatus({
          networkSpeed: "N/A",
          latency: "N/A",
          uptime: "N/A"
        });
      }
    } catch (error) {
      console.error("Erro ao carregar status da rede:", error);
      setNetworkStatus({
        networkSpeed: "Erro",
        latency: "Erro",
        uptime: "Erro"
      });
    }
  };

  const handleSubmit = async (issueData) => {
    try {
      setLoading(true);
      
      if (selectedIssue) {
        await NetworkIssue.update(selectedIssue.id, issueData);
        toast({
          title: "Problema atualizado",
          description: "O problema de rede foi atualizado com sucesso",
        });
      } else {
        await NetworkIssue.create(issueData);
        toast({
          title: "Problema registrado",
          description: "O problema de rede foi registrado com sucesso",
        });
      }
      
      setShowForm(false);
      setSelectedIssue(null);
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar problema de rede:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o problema de rede. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Dados de rede para exibição
  const networkData = error ? {
    networkSpeed: "Indisponível",
    latency: "Indisponível",
    activeIssuesCount: issues.length > 0 ? issues.filter(i => i.status !== "resolved").length : "?",
    uptime: "Indisponível"
  } : {
    networkSpeed: networkStatus.networkSpeed,
    latency: networkStatus.latency,
    activeIssuesCount: issues.filter(i => i.status !== "resolved").length,
    uptime: networkStatus.uptime
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Monitoramento de Rede</h1>
        <div className="flex gap-2">
          {loading ? (
            <Button disabled variant="outline">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Carregando...
            </Button>
          ) : error ? (
            <Button 
              variant="outline" 
              onClick={loadData}
              className="text-amber-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          ) : (
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          )}
          <Button onClick={() => setShowForm(true)} className="bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Registrar Problema
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4">
            <div className="flex items-center text-amber-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p>
                {error} Algumas informações podem estar indisponíveis ou desatualizadas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <NetworkIssueForm
          issue={selectedIssue}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedIssue(null);
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <NetworkStatusCard
          title="Velocidade da Rede"
          value={networkData.networkSpeed}
          status={error ? "error" : "good"}
          icon={Activity}
        />
        <NetworkStatusCard
          title="Latência"
          value={networkData.latency}
          status={error ? "error" : "good"}
          icon={Clock}
        />
        <NetworkStatusCard
          title="Problemas Ativos"
          value={networkData.activeIssuesCount}
          status={
            networkData.activeIssuesCount > 0 && !error
              ? "warning"
              : error ? "error" : "good"
          }
          icon={AlertTriangle}
        />
        <NetworkStatusCard
          title="Tempo Online"
          value={networkData.uptime}
          status={error ? "error" : "good"}
          icon={CheckCircle2}
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500">Carregando informações da rede...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ActiveIssuesList
          issues={issues}
          onIssueSelect={(issue) => {
            setSelectedIssue(issue);
            setShowForm(true);
          }}
          hasError={error !== null}
        />
      )}
    </div>
  );
}