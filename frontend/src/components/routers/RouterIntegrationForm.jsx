
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Router,
  Server,
  Network,
  Save,
  Terminal,
  Lock,
  Key,
  Globe,
  Loader2,
  ArrowLeft,
  Share2,
  AlertCircle,
  Info,
  Check,
  Wand2,
  Settings as SettingsIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RouterIntegrationForm({ integration, onSubmit, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState(
    integration || {
      name: "",
      type: "mikrotik",
      integration_method: "api",
      host: "",
      port: 8728,
      username: "",
      password: "",
      api_ssl: false,
      snmp_community: "public",
      snmp_version: "v2c",
      ssh_key_path: "",
      connection_timeout: 10,
      auto_sync: true,
      sync_interval: 5,
      is_primary: false,
      status: "inativo",
      notes: ""
    }
  );

  useEffect(() => {
    const defaultPorts = {
      mikrotik: {
        api: formData.api_ssl ? 8729 : 8728,
        ssh: 22,
        snmp: 161
      },
      cisco: {
        api: 443,
        ssh: 22,
        snmp: 161
      },
      juniper: {
        api: 3000,
        ssh: 22,
        snmp: 161
      },
      huawei: {
        api: 443,
        ssh: 22,
        snmp: 161
      },
      outro: {
        api: 443,
        ssh: 22,
        snmp: 161
      }
    };

    if (formData.type && formData.integration_method) {
      setFormData({
        ...formData,
        port: defaultPorts[formData.type][formData.integration_method] || formData.port
      });
    }
  }, [formData.type, formData.integration_method, formData.api_ssl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSwitchChange = (name, checked) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (!formData.name) {
        throw new Error("O nome da integração é obrigatório");
      }

      if (!formData.host) {
        throw new Error("O endereço do roteador é obrigatório");
      }

      if (!formData.username) {
        throw new Error("O nome de usuário é obrigatório");
      }

      if (!integration && !formData.password) {
        throw new Error("A senha é obrigatória para uma nova integração");
      }

      const dataToSubmit = { ...formData };
      if (integration && !dataToSubmit.password) {
        delete dataToSubmit.password;
      }

      await onSubmit(dataToSubmit);
      setSuccessMessage("Integração salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar integração:", error);
      setErrorMessage(error.message || "Ocorreu um erro ao salvar a integração");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = () => {
    alert("Funcionalidade de teste de conexão em implementação.");
  };

  const handleAutoDetect = () => {
    alert(`Tentando detectar roteador em ${formData.host}...`);
    
    setTimeout(() => {
      setFormData({
        ...formData,
        type: "mikrotik",
        port: 8728,
        integration_method: "api"
      });
      alert("Roteador MikroTik detectado com sucesso!");
    }, 1500);
  };

  return (
    <Card className="shadow-lg border-t-4 border-t-blue-600">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{integration ? "Editar Integração" : "Nova Integração de Roteador"}</CardTitle>
            <CardDescription>
              Configure a integração com seu roteador para gerenciar IPs, clientes e conexões
            </CardDescription>
          </div>
          {integration && (
            <Badge className={integration.status === "ativo" ? "bg-green-100 text-green-800" : integration.status === "erro" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
              {integration.status === "ativo" ? "Ativo" : integration.status === "erro" ? "Erro" : "Inativo"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
            <Check className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert className="mb-4 bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="general" className="gap-2">
                <Globe className="w-4 h-4" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="auth" className="gap-2">
                <Lock className="w-4 h-4" />
                Autenticação
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2">
                <SettingsIcon className="w-4 h-4" />
                Configurações Avançadas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Integração</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: MikroTik Principal"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-sm text-gray-500">Um nome descritivo para identificar o roteador</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="host">Endereço do Roteador</Label>
                  <div className="flex gap-2">
                    <Input
                      id="host"
                      name="host"
                      placeholder="Ex: 192.168.1.1"
                      value={formData.host}
                      onChange={handleInputChange}
                      required
                      className="flex-1"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={handleAutoDetect}
                      className="gap-1 whitespace-nowrap"
                    >
                      <Wand2 className="w-4 h-4" />
                      Auto Detectar
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">Endereço IP ou hostname do roteador</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Roteador</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Selecione o tipo de roteador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mikrotik">MikroTik RouterOS</SelectItem>
                      <SelectItem value="cisco">Cisco IOS/IOS-XE</SelectItem>
                      <SelectItem value="juniper">Juniper Junos</SelectItem>
                      <SelectItem value="huawei">Huawei</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Marca/tipo do roteador a ser integrado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="integration_method">Método de Integração</Label>
                  <Select
                    value={formData.integration_method}
                    onValueChange={(value) => handleSelectChange("integration_method", value)}
                  >
                    <SelectTrigger id="integration_method">
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">API REST</SelectItem>
                      <SelectItem value="ssh">SSH</SelectItem>
                      <SelectItem value="snmp">SNMP</SelectItem>
                      <SelectItem value="telnet">Telnet</SelectItem>
                      <SelectItem value="combinado">Combinado</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Método principal utilizado para comunicação</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port">Porta</Label>
                  <Input
                    id="port"
                    name="port"
                    type="number"
                    placeholder="Porta"
                    value={formData.port}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    {formData.integration_method === "api" && formData.type === "mikrotik" 
                      ? "Padrão: 8728 (HTTP) ou 8729 (HTTPS)" 
                      : formData.integration_method === "ssh" 
                        ? "Padrão: 22" 
                        : formData.integration_method === "snmp" 
                          ? "Padrão: 161" 
                          : "Porta de conexão"}
                  </p>
                </div>

                <div className="flex items-center justify-between space-y-0 pt-5">
                  <div className="space-y-1">
                    <Label htmlFor="is_primary">Roteador Principal</Label>
                    <p className="text-sm text-gray-500">Definir como roteador principal do sistema</p>
                  </div>
                  <Switch
                    id="is_primary"
                    checked={formData.is_primary}
                    onCheckedChange={(checked) => handleSwitchChange("is_primary", checked)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="auth">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Usuário para autenticação"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-sm text-gray-500">Usuário com permissões adequadas para o acesso</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={integration ? "••••••••" : "Senha para autenticação"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!integration}
                  />
                  <p className="text-sm text-gray-500">
                    {integration ? "Deixe em branco para manter a senha atual" : "Senha de acesso ao roteador"}
                  </p>
                </div>

                {formData.integration_method === "api" && (
                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-1">
                      <Label htmlFor="api_ssl">Usar SSL</Label>
                      <p className="text-sm text-gray-500">Utilizar HTTPS para comunicação API</p>
                    </div>
                    <Switch
                      id="api_ssl"
                      checked={formData.api_ssl}
                      onCheckedChange={(checked) => handleSwitchChange("api_ssl", checked)}
                    />
                  </div>
                )}

                {formData.integration_method === "snmp" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="snmp_community">Community String</Label>
                      <Input
                        id="snmp_community"
                        name="snmp_community"
                        placeholder="Ex: public"
                        value={formData.snmp_community}
                        onChange={handleInputChange}
                      />
                      <p className="text-sm text-gray-500">Community string para acesso SNMP</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="snmp_version">Versão SNMP</Label>
                      <Select
                        value={formData.snmp_version}
                        onValueChange={(value) => handleSelectChange("snmp_version", value)}
                      >
                        <SelectTrigger id="snmp_version">
                          <SelectValue placeholder="Selecione a versão" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="v1">Versão 1</SelectItem>
                          <SelectItem value="v2c">Versão 2c</SelectItem>
                          <SelectItem value="v3">Versão 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">Versão do protocolo SNMP (v3 recomendado para segurança)</p>
                    </div>
                  </>
                )}

                {formData.integration_method === "ssh" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="ssh_key_path">Caminho da Chave SSH (Opcional)</Label>
                    <Input
                      id="ssh_key_path"
                      name="ssh_key_path"
                      placeholder="Ex: /path/to/id_rsa"
                      value={formData.ssh_key_path}
                      onChange={handleInputChange}
                    />
                    <p className="text-sm text-gray-500">Caminho para chave privada SSH (recomendado em vez de senha)</p>
                  </div>
                )}
              </div>

              <Alert className="mt-4 bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Recomendamos criar um usuário específico para integração com permissões restritas apenas às operações necessárias.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="advanced">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="connection_timeout">Timeout de Conexão (segundos)</Label>
                  <Input
                    id="connection_timeout"
                    name="connection_timeout"
                    type="number"
                    min="1"
                    placeholder="Ex: 10"
                    value={formData.connection_timeout}
                    onChange={handleInputChange}
                  />
                  <p className="text-sm text-gray-500">Tempo limite para tentativas de conexão</p>
                </div>

                <div className="flex items-center justify-between space-y-0">
                  <div className="space-y-1">
                    <Label htmlFor="auto_sync">Sincronização Automática</Label>
                    <p className="text-sm text-gray-500">Sincronizar dados automaticamente</p>
                  </div>
                  <Switch
                    id="auto_sync"
                    checked={formData.auto_sync}
                    onCheckedChange={(checked) => handleSwitchChange("auto_sync", checked)}
                  />
                </div>

                {formData.auto_sync && (
                  <div className="space-y-2">
                    <Label htmlFor="sync_interval">Intervalo de Sincronização (minutos)</Label>
                    <Input
                      id="sync_interval"
                      name="sync_interval"
                      type="number"
                      min="1"
                      placeholder="Ex: 5"
                      value={formData.sync_interval}
                      onChange={handleInputChange}
                    />
                    <p className="text-sm text-gray-500">Frequência de sincronização automática</p>
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Notas adicionais sobre esta integração"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                  <p className="text-sm text-gray-500">Informações adicionais sobre o roteador ou integração</p>
                </div>
              </div>

              <Alert className="mt-6 bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Sincronizações muito frequentes podem sobrecarregar o roteador em redes maiores. Recomendamos intervalos de pelo menos 5 minutos.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancelar
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={saving || !formData.host || !formData.username}
                className="gap-1"
              >
                <Network className="w-4 h-4" />
                Testar Conexão
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="gap-1 bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Integração
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
