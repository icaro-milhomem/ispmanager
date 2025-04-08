
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
    login_background_color: "#f9fafb",
    login_text_color: "#1f2937",
    login_button_color: "#2563eb"
  });
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "user"
  });

  useEffect(() => {
    loadConfig();
    loadUsers();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const configs = await SystemConfig.list();
      if (configs.length > 0) {
        setConfigData(configs[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações do sistema",
        variant: "destructive"
      });
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
    setConfigData({
      ...configData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (configData.id) {
        await SystemConfig.update(configData.id, configData);
      } else {
        await SystemConfig.create(configData);
      }
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso"
      });
      await loadConfig();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddUser = () => {
    try {
      if (!newUser.full_name || !newUser.email || !newUser.password) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }

      const existingUsers = JSON.parse(sessionStorage.getItem("usersData") || "[]");

      if (existingUsers.some(u => u.email === newUser.email)) {
        toast({
          title: "Erro",
          description: "Este email já está em uso",
          variant: "destructive"
        });
        return;
      }

      const newUserData = {
        ...newUser,
        id: Date.now().toString(),
      };

      existingUsers.push(newUserData);
      sessionStorage.setItem("usersData", JSON.stringify(existingUsers));

      setUsers(existingUsers);
      setShowUserDialog(false);
      setNewUser({
        full_name: "",
        email: "",
        password: "",
        role: "user"
      });

      toast({
        title: "Sucesso",
        description: "Usuário adicionado com sucesso"
      });
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o usuário",
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
      const { file_url } = await UploadFile({ file });
      setConfigData(prev => ({
        ...prev,
        company_logo_url: file_url
      }));
      toast({
        title: "Logo enviado com sucesso",
        description: "A imagem foi carregada e salva"
      });
    } catch (error) {
      console.error("Erro ao fazer upload do logo:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem",
        variant: "destructive"
      });
    } finally {
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
                        value={configData.company_logo_url}
                        onChange={handleInputChange}
                        placeholder="https://exemplo.com/logo.png"
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
                          className="h-12 w-auto border rounded p-1"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/150x50?text=Logo+Inválido";
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
                        onChange={(e) => setConfigData({
                          ...configData,
                          login_background_color: e.target.value
                        })}
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
                        onChange={(e) => setConfigData({
                          ...configData,
                          login_text_color: e.target.value
                        })}
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
                        onChange={(e) => setConfigData({
                          ...configData,
                          login_button_color: e.target.value
                        })}
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
                        className="h-10 w-auto mb-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150x50?text=Logo+Inválido";
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
                  <SelectItem value="user">Usuário (acesso limitado)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Administradores têm acesso total ao sistema. Usuários têm acesso limitado.
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
                  role: "user"
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
