import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Loader2, 
  Save, 
  Building,
  Users,
  Plus,
  Trash2,
} from "lucide-react";
import { SystemConfig } from "@/api/entities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadFile } from "@/api/integrations";
import { User } from "@/api/entities";

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("company");
  const [users, setUsers] = useState([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [configData, setConfigData] = useState({
    company_name: "",
    company_logo_url: "",
    company_address: "",
    company_phone: "",
    company_email: "",
    company_website: "",
    admin_email: "",
    smtp_host: "",
    smtp_port: "",
    smtp_user: "",
    smtp_pass: "",
    login_background_color: "#f9fafb",
    login_text_color: "#1f2937",
    login_button_color: "#2563eb"
  });
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "staff"
  });

  useEffect(() => {
    loadConfig();
    loadUsers();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      // Usar a função list do SystemConfigClient para obter configurações
      const configs = await SystemConfig.list();
      
      // Verificar se temos dados válidos
      if (configs && Array.isArray(configs) && configs.length > 0) {
        console.log("Configurações carregadas:", configs);
        
        // Usar o primeiro item como configuração atual
        const config = configs[0];
        
        // Certificar que temos um objeto de configuração válido
        if (config) {
          setConfigData(config);
        } else {
          console.warn("Configuração recebida é inválida:", config);
          toast({
            title: "Aviso",
            description: "Configurações carregadas com formato inválido",
            variant: "warning"
          });
          
          // Inicializar com valores padrão
          setConfigData({
            company_name: "",
            company_document: "",
            company_address: "",
            company_phone: "",
            company_email: "",
            company_logo_url: "",
            support_phone: "",
            support_email: "",
            support_hours: "",
            payment_details: "",
            terms_and_conditions: "",
            privacy_policy: "",
            default_due_day: 10,
          });
        }
      } else {
        console.warn("Nenhuma configuração encontrada, criando novo registro");
        
        // Inicializar com valores padrão
        setConfigData({
          company_name: "",
          company_document: "",
          company_address: "",
          company_phone: "",
          company_email: "",
          company_logo_url: "",
          support_phone: "",
          support_email: "",
          support_hours: "",
          payment_details: "",
          terms_and_conditions: "",
          privacy_policy: "",
          default_due_day: 10,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro",
        description: `Erro ao carregar configurações: ${error.message}`,
        variant: "destructive"
      });
      
      // Verificar se temos dados no localStorage como fallback
      try {
        const configs = await SystemConfig.list();
        if (configs && configs.length > 0) {
          toast({
            title: "Info",
            description: "Usando dados salvos localmente",
            variant: "default"
          });
        } else {
          toast({
            title: "Aviso", 
            description: "Nenhuma configuração encontrada. Crie uma nova.",
            variant: "warning"
          });
          
          // Inicializar com valores padrão
          setConfigData({
            company_name: "",
            company_document: "",
            company_address: "",
            company_phone: "",
            company_email: "",
            company_logo_url: "",
            support_phone: "",
            support_email: "",
            support_hours: "",
            payment_details: "",
            terms_and_conditions: "",
            privacy_policy: "",
            default_due_day: 10,
          });
        }
      } catch (localError) {
        console.error("Erro ao verificar dados locais:", localError);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = () => {
    const usersData = JSON.parse(sessionStorage.getItem("usersData") || "[]");
    setUsers(usersData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevenir edição manual de URLs de base64
    if (name === 'company_logo_url' && configData.company_logo_url?.startsWith('data:')) {
      // Não permitir edição manual de URLs base64
      return;
    }
    
    setConfigData({
      ...configData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      console.log("Iniciando salvamento das configurações:", configData);
      
      // Garantir que admin_email esteja preenchido
      if (!configData.admin_email) {
        console.warn("admin_email é obrigatório");
        // Se não tiver admin_email, usar o company_email ou um valor padrão
        const dataWithEmail = {
          ...configData,
          admin_email: configData.company_email || "admin@ispmanager.com"
        };
        setConfigData(dataWithEmail);
        console.log("Dados atualizados com admin_email:", dataWithEmail);
        
        let result;
        if (dataWithEmail.id) {
          console.log(`Atualizando configuração existente ID ${dataWithEmail.id}`);
          result = await SystemConfig.update(dataWithEmail);
        } else {
          console.log("Criando nova configuração");
          result = await SystemConfig.create(dataWithEmail);
        }
        
        console.log("Resultado da operação:", result);
        
        // Resto do código permanece igual
        if (result && (result.id || result.success)) {
          setConfigData(prevData => ({
            ...prevData,
            ...(result.data || result),
            id: (result.data?.id || result.id || configData.id)
          }));
          
          toast({
            title: "Sucesso",
            description: "Configurações salvas com sucesso"
          });
        } else {
          console.warn("Resposta inesperada ao salvar configurações:", result);
          toast({
            title: "Aviso",
            description: "Configurações salvas, mas a resposta foi inesperada",
            variant: "warning"
          });
        }
      } else {
        // Código original se admin_email já estiver preenchido
        let result;
        if (configData.id) {
          console.log(`Atualizando configuração existente ID ${configData.id}`);
          result = await SystemConfig.update(configData);
        } else {
          console.log("Criando nova configuração");
          result = await SystemConfig.create(configData);
        }
        
        console.log("Resultado da operação:", result);
        
        if (result && (result.id || result.success)) {
          setConfigData(prevData => ({
            ...prevData,
            ...(result.data || result),
            id: (result.data?.id || result.id || configData.id)
          }));
          
          toast({
            title: "Sucesso",
            description: "Configurações salvas com sucesso"
          });
        } else {
          console.warn("Resposta inesperada ao salvar configurações:", result);
          toast({
            title: "Aviso",
            description: "Configurações salvas, mas a resposta foi inesperada",
            variant: "warning"
          });
        }
      }
      
      // Recarregar configurações para garantir sincronização
      await loadConfig();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações: " + (error.message || "Erro desconhecido"),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddUser = async () => {
    try {
      if (!newUser.full_name || !newUser.email || !newUser.password) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }

      // Mapeia a função do usuário para o formato esperado pelo backend
      let mappedRole;
      switch (newUser.role.toLowerCase()) {
        case 'admin':
          mappedRole = 'ADMIN';
          break;
        case 'technician':
        case 'tecnico':
          mappedRole = 'TECHNICIAN';
          break;
        default:
          mappedRole = 'STAFF'; // valor padrão para qualquer outra função
      }

      // Converte o formato do usuário para o formato esperado pela API
      const userData = {
        name: newUser.full_name,
        email: newUser.email,
        password: newUser.password,
        role: mappedRole // Função mapeada para o formato correto
      };

      console.log("Enviando dados do usuário para API:", userData);
      
      // Chama a API para criar o usuário no backend
      const createdUser = await User.create(userData);
      console.log("Usuário criado com sucesso na API:", createdUser);
      
      // Atualiza também o armazenamento local para manter a consistência
      const existingUsers = JSON.parse(sessionStorage.getItem("usersData") || "[]");
      const newUserData = {
        ...newUser,
        id: createdUser.id || createdUser.user?.id || Date.now().toString(),
      };
      existingUsers.push(newUserData);
      sessionStorage.setItem("usersData", JSON.stringify(existingUsers));

      setUsers(existingUsers);
      setShowUserDialog(false);
      setNewUser({
        full_name: "",
        email: "",
        password: "",
        role: "staff"  // Alterado de "user" para "staff" (valor padrão válido)
      });

      toast({
        title: "Sucesso",
        description: "Usuário adicionado com sucesso"
      });
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o usuário: " + (error.message || "Erro de comunicação com o servidor"),
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = (userId) => {
    try {
      const updatedUsers = users.filter(user => user.id !== userId);
      sessionStorage.setItem("usersData", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);

      toast({
        title: "Sucesso",
        description: "Usuário removido com sucesso"
      });
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o usuário",
        variant: "destructive"
      });
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      
      // Converter o arquivo para Base64 para armazenamento local
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target.result;
          
          // Ainda tenta fazer o upload para o servidor se disponível
          try {
            const response = await UploadFile({ file });
            console.log("Resposta do servidor de upload:", response);
          } catch (uploadError) {
            console.warn("Erro ao fazer upload para o servidor, usando apenas base64:", uploadError);
          }
          
          // Independente da resposta do servidor, usamos o Base64
          setConfigData(prev => ({
            ...prev,
            company_logo_url: base64Data
          }));
          
          toast({
            title: "Logo enviado com sucesso",
            description: "A imagem foi carregada e salva localmente"
          });
          
          console.log("Upload concluído com sucesso, usando Base64");
        } catch (error) {
          console.error("Erro ao processar imagem:", error);
          toast({
            title: "Erro no upload",
            description: error.message || "Não foi possível processar a imagem",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = (error) => {
        console.error("Erro ao ler arquivo:", error);
        toast({
          title: "Erro na leitura",
          description: "Não foi possível ler o arquivo de imagem",
          variant: "destructive"
        });
        setLoading(false);
      };
      
      // Iniciar a leitura do arquivo como URL de dados
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error("Erro ao iniciar upload do logo:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível enviar a imagem",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
          <p className="text-gray-500">Gerencie as configurações do seu ISP Manager</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
          <TabsTrigger value="network">Rede</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-gray-500" />
                Informações da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-1.5">Nome da Empresa</div>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={configData.company_name}
                      onChange={handleInputChange}
                      placeholder="Ex: Minha ISP"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-1.5">URL do Logo</div>
                    <div className="flex gap-2">
                      <Input
                        id="company_logo_url"
                        name="company_logo_url"
                        value={configData.company_logo_url || ''}
                        onChange={handleInputChange}
                        placeholder="URL da imagem de logo"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('logo-upload').click()}
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Upload"
                          )}
                        </Button>
                      </div>
                    </div>
                    {configData.company_logo_url && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-1">Preview:</p>
                        <img 
                          src={configData.company_logo_url} 
                          alt="Logo Preview" 
                          className="h-12 w-auto border rounded p-1 object-contain bg-white"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='50' viewBox='0 0 150 50'%3E%3Crect fill='%23f0f0f0' width='150' height='50'/%3E%3Ctext fill='%23999' font-family='Arial' font-size='12' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ELogo Inválido%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-1.5">Endereço</div>
                    <Input
                      id="company_address"
                      name="company_address"
                      value={configData.company_address}
                      onChange={handleInputChange}
                      placeholder="Rua, número, cidade, estado"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-1.5">Telefone</div>
                    <Input
                      id="company_phone"
                      name="company_phone"
                      value={configData.company_phone}
                      onChange={handleInputChange}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-1.5">Email</div>
                    <Input
                      id="company_email"
                      name="company_email"
                      type="email"
                      value={configData.company_email}
                      onChange={handleInputChange}
                      placeholder="contato@exemplo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-1.5">Website</div>
                    <Input
                      id="company_website"
                      name="company_website"
                      value={configData.company_website}
                      onChange={handleInputChange}
                      placeholder="https://exemplo.com"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="mt-4"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visual">
          <Card>
            <CardHeader>
              <CardTitle>Personalização Visual</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-1.5">Cor de Fundo da Tela de Login</div>
                    <div className="flex gap-2">
                      <Input
                        id="login_background_color"
                        name="login_background_color"
                        value={configData.login_background_color}
                        onChange={handleInputChange}
                        placeholder="#f9fafb"
                      />
                      <input 
                        type="color" 
                        value={configData.login_background_color || "#f9fafb"}
                        onChange={(e) => {
                          handleInputChange({
                            target: {
                              name: "login_background_color",
                              value: e.target.value
                            }
                          });
                        }}
                        className="h-10 w-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-1.5">Cor do Texto na Tela de Login</div>
                    <div className="flex gap-2">
                      <Input
                        id="login_text_color"
                        name="login_text_color"
                        value={configData.login_text_color}
                        onChange={handleInputChange}
                        placeholder="#1f2937"
                      />
                      <input 
                        type="color" 
                        value={configData.login_text_color || "#1f2937"}
                        onChange={(e) => {
                          handleInputChange({
                            target: {
                              name: "login_text_color",
                              value: e.target.value
                            }
                          });
                        }}
                        className="h-10 w-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-1.5">Cor do Botão na Tela de Login</div>
                    <div className="flex gap-2">
                      <Input
                        id="login_button_color"
                        name="login_button_color"
                        value={configData.login_button_color}
                        onChange={handleInputChange}
                        placeholder="#2563eb"
                      />
                      <input 
                        type="color" 
                        value={configData.login_button_color || "#2563eb"}
                        onChange={(e) => {
                          handleInputChange({
                            target: {
                              name: "login_button_color",
                              value: e.target.value
                            }
                          });
                        }}
                        className="h-10 w-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 border rounded-md">
                  <h3 className="font-medium mb-3">Preview da Tela de Login</h3>
                  <div 
                    className="p-4 rounded-md flex flex-col items-center"
                    style={{ 
                      backgroundColor: configData.login_background_color,
                      color: configData.login_text_color,
                    }}
                  >
                    {configData.company_logo_url && (
                      <img 
                        src={configData.company_logo_url}
                        alt="Logo Preview"
                        className="h-10 w-auto mb-2 object-contain bg-white"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='50' viewBox='0 0 150 50'%3E%3Crect fill='%23f0f0f0' width='150' height='50'/%3E%3Ctext fill='%23999' font-family='Arial' font-size='12' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ELogo Inválido%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    )}
                    <div className="font-bold mb-2" style={{ color: configData.login_text_color }}>
                      {configData.company_name || "ISP Manager"} - Login
                    </div>
                    <button 
                      className="px-4 py-2 rounded text-white"
                      style={{ backgroundColor: configData.login_button_color }}
                    >
                      Entrar
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="mt-4"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  Usuários do Sistema
                </CardTitle>
                <Button 
                  onClick={() => setShowUserDialog(true)}
                  className="bg-blue-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Gerencie os usuários que têm acesso ao sistema. Os usuários podem ter função de Administrador (acesso total) ou Usuário (acesso limitado).
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Ativo
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.role !== 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          Nenhum usuário cadastrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Faturamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Configurações de faturamento serão adicionadas em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Rede</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Configurações de rede serão adicionadas em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para criar um novo usuário no sistema.
              <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
                <strong>Importante:</strong>
                <ul className="list-disc ml-4 mt-1">
                  <li>O email será usado para login no sistema</li>
                  <li>A senha deve ter no mínimo 6 caracteres</li>
                  <li>Administradores têm acesso total ao sistema</li>
                  <li>Usuários têm acesso limitado às funcionalidades</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="text-sm font-medium mb-1.5">
                Nome Completo
                <span className="text-red-500 ml-1">*</span>
              </div>
              <Input
                id="full_name"
                placeholder="Digite o nome completo"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium mb-1.5">
                Email
                <span className="text-red-500 ml-1">*</span>
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Digite o email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <p className="text-xs text-gray-500">Este email será usado para login no sistema</p>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium mb-1.5">
                Senha
                <span className="text-red-500 ml-1">*</span>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Digite a senha"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <p className="text-xs text-gray-500">A senha deve ter no mínimo 6 caracteres</p>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium mb-1.5">
                Função
                <span className="text-red-500 ml-1">*</span>
              </div>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador (acesso total)</SelectItem>
                  <SelectItem value="staff">Funcionário (acesso padrão)</SelectItem>
                  <SelectItem value="technician">Técnico (acesso técnico)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Administradores têm acesso total ao sistema. Funcionários e técnicos têm acesso específico.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUserDialog(false);
                setNewUser({
                  full_name: "",
                  email: "",
                  password: "",
                  role: "staff"
                });
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddUser} 
              className="bg-blue-600"
              disabled={!newUser.full_name || !newUser.email || newUser.password.length < 6}
            >
              Adicionar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
