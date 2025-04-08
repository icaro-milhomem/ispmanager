import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { UserRole } from "@/api/entities";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  Users,
  Lock,
  Activity,
  AlertTriangle,
  UserPlus,
  Edit,
  Trash2,
  Plus,
  Save,
  Check,
  X,
  Key,
  User as UserIcon,
  UserCog,
  Search,
  Filter,
  RefreshCw,
  ShieldAlert,
  Download,
  Upload,
  Loader2
} from "lucide-react";
import { ProtectedPage } from "@/components/permissions/ProtectedPage";

export default function AccessManagement() {
  const [activeTab, setActiveTab] = useState("roles");

  return (
    <ProtectedPage module="users" permission="manage_roles">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gerenciamento de Acesso</h1>
            <p className="text-gray-500">Configure permissões e controle de acesso ao sistema</p>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Perfis de Acesso
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Registro de Atividades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <RolesManagement />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Atividades</CardTitle>
                <CardDescription>
                  Acompanhe as ações dos usuários no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center py-8">
                  <AlertTriangle className="w-16 h-16 text-yellow-600 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Funcionalidade em Desenvolvimento</h3>
                  <p className="text-gray-500 text-center mb-2 max-w-md">
                    O registro de atividades está em desenvolvimento e estará disponível em breve.
                  </p>
                  <p className="text-sm text-gray-400 text-center max-w-md">
                    Esta funcionalidade permitirá monitorar todas as ações realizadas pelos usuários
                    no sistema, como criação, edição e exclusão de registros.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedPage>
  );
}

// Componente para gerenciamento de usuários
function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role_id: "",
    status: "active"
  });
  
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);
  
  const loadUsers = async () => {
    try {
      const usersList = await User.list();
      setUsers(usersList);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };
  
  const loadRoles = async () => {
    try {
      const rolesList = await UserRole.list();
      setRoles(rolesList);
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
    }
  };
  
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      role_id: "",
      status: "active"
    });
    setEditingUser(null);
  };
  
  const validateForm = () => {
    if (!formData.full_name || !formData.email || !formData.role_id) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Por favor, insira um email válido.");
      return false;
    }
    
    return true;
  };
  
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id || "",
      status: user.status || "active"
    });
    setShowUserForm(true);
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSaveLoading(true);
      
      // Para novos usuários, gerar senha temporária automaticamente
      if (!editingUser) {
        const tempPassword = generatePassword();
        
        const newUserData = {
          id: Math.random().toString(36).substr(2, 9),
          ...formData,
          role: roles.find(r => r.id === formData.role_id)?.slug || "user",
          last_login: null,
          password: tempPassword,
          requires_password_change: true
        };
        
        // Armazenar o usuário na sessão para simular banco de dados
        const usersData = JSON.parse(sessionStorage.getItem("usersData") || "[]");
        usersData.push(newUserData);
        sessionStorage.setItem("usersData", JSON.stringify(usersData));
        
        // Adicionar à lista em memória
        setUsers(prev => [...prev, newUserData]);
        
        // Mostrar senha gerada (em produção seria enviada por email)
        alert(`Usuário criado com sucesso!\n\nE-mail: ${formData.email}\nSenha temporária: ${tempPassword}\n\nO usuário precisará alterar a senha no primeiro acesso.`);
      } else {
        // Atualização de usuário existente
        setUsers(prev => 
          prev.map(user => 
            user.id === editingUser.id ? {...user, ...formData} : user
          )
        );
        
        // Atualizar na sessão
        const usersData = JSON.parse(sessionStorage.getItem("usersData") || "[]");
        const updatedUsersData = usersData.map(user => 
          user.id === editingUser.id ? {...user, ...formData} : user
        );
        sessionStorage.setItem("usersData", JSON.stringify(updatedUsersData));
      }
      
      resetForm();
      setShowUserForm(false);
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    } finally {
      setSaveLoading(false);
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : "Indefinido";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
        <Button onClick={() => {
          resetForm();
          setShowUserForm(true);
        }} className="bg-blue-600">
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>
      
      {showUserForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</CardTitle>
            <CardDescription>
              {editingUser 
                ? "Atualize os dados do usuário existente." 
                : "Cadastre um novo usuário no sistema."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleFormChange("full_name", e.target.value)}
                  placeholder="Nome completo do usuário"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Perfil de Acesso</Label>
                <Select
                  value={formData.role_id}
                  onValueChange={(value) => handleFormChange("role_id", value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleFormChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {!editingUser && (
              <div className="mt-4 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Key className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p>Uma senha temporária será gerada automaticamente e exibida após salvar o usuário.</p>
                    <p className="mt-1">O usuário precisará alterá-la no primeiro acesso.</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setShowUserForm(false);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={saveLoading}
              className="bg-blue-600"
            >
              {saveLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Usuários</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        {user.full_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role === "admin" ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            Administrador
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            {getRoleName(user.role_id) || user.role || "Usuário"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Ativo
                          </Badge>
                        ) : user.status === "inactive" ? (
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                            Inativo
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            Suspenso
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.last_login ? new Date(user.last_login).toLocaleString('pt-BR') : "Nunca"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para gerenciamento de perfis de acesso
function RolesManagement() {
  const [roles, setRoles] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    permissions: {
      customers: { view: false, create: false, edit: false, delete: false },
      invoices: { view: false, create: false, edit: false, delete: false },
      network: { view: false, manage: false },
      equipment: { view: false, create: false, edit: false, delete: false },
      support: { view: false, respond: false, escalate: false },
      users: { view: false, create: false, edit: false, delete: false, manage_roles: false },
      ftth: { view: false, edit: false },
      inventory: { view: false, manage: false },
      reports: { view: false, export: false },
      settings: { view: false, edit: false },
      financial: { view: false, manage: false }
    },
    is_active: true
  });
  
  useEffect(() => {
    loadRoles();
  }, []);
  
  const loadRoles = async () => {
    try {
      const rolesList = await UserRole.list();
      setRoles(rolesList);
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
    }
  };
  
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handlePermissionChange = (module, permission, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [permission]: value
        }
      }
    }));
  };
  
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      slug: "",
      permissions: {
        customers: { view: false, create: false, edit: false, delete: false },
        invoices: { view: false, create: false, edit: false, delete: false },
        network: { view: false, manage: false },
        equipment: { view: false, create: false, edit: false, delete: false },
        support: { view: false, respond: false, escalate: false },
        users: { view: false, create: false, edit: false, delete: false, manage_roles: false },
        ftth: { view: false, edit: false },
        inventory: { view: false, manage: false },
        reports: { view: false, export: false },
        settings: { view: false, edit: false },
        financial: { view: false, manage: false }
      },
      is_active: true
    });
    setEditingRole(null);
  };
  
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '_');
  };
  
  const handleNameChange = (name) => {
    handleFormChange('name', name);
    if (!editingRole) {
      handleFormChange('slug', generateSlug(name));
    }
  };
  
  const validateForm = () => {
    if (!formData.name || !formData.slug) {
      alert("Nome e slug são campos obrigatórios.");
      return false;
    }
    
    // Verificar se o slug já existe em outro perfil
    if (!editingRole && roles.some(role => role.slug === formData.slug)) {
      alert("Este slug já está em uso. Por favor, escolha outro.");
      return false;
    }
    
    return true;
  };
  
  const handleEditRole = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      slug: role.slug,
      permissions: role.permissions || {
        customers: { view: false, create: false, edit: false, delete: false },
        invoices: { view: false, create: false, edit: false, delete: false },
        network: { view: false, manage: false },
        equipment: { view: false, create: false, edit: false, delete: false },
        support: { view: false, respond: false, escalate: false },
        users: { view: false, create: false, edit: false, delete: false, manage_roles: false },
        ftth: { view: false, edit: false },
        inventory: { view: false, manage: false },
        reports: { view: false, export: false },
        settings: { view: false, edit: false },
        financial: { view: false, manage: false }
      },
      is_active: role.is_active !== false // default to true if not specified
    });
    setShowRoleForm(true);
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSaveLoading(true);
      
      // Simulação de criação/atualização de perfil
      if (editingRole) {
        // Atualizar perfil existente
        const updatedRole = { ...editingRole, ...formData };
        setRoles(prev => prev.map(role => role.id === editingRole.id ? updatedRole : role));
      } else {
        // Criar novo perfil
        const newRole = {
          ...formData,
          id: Math.random().toString(36).substr(2, 9), // ID aleatório
          created_date: new Date().toISOString()
        };
        setRoles(prev => [...prev, newRole]);
      }
      
      resetForm();
      setShowRoleForm(false);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    } finally {
      setSaveLoading(false);
    }
  };
  
  const permissionModules = [
    {
      name: "customers",
      label: "Clientes",
      permissions: [
        { name: "view", label: "Visualizar" },
        { name: "create", label: "Criar" },
        { name: "edit", label: "Editar" },
        { name: "delete", label: "Excluir" }
      ]
    },
    {
      name: "invoices",
      label: "Faturas",
      permissions: [
        { name: "view", label: "Visualizar" },
        { name: "create", label: "Criar" },
        { name: "edit", label: "Editar" },
        { name: "delete", label: "Excluir" }
      ]
    },
    {
      name: "network",
      label: "Rede",
      permissions: [
        { name: "view", label: "Visualizar" },
        { name: "manage", label: "Gerenciar" }
      ]
    },
    {
      name: "equipment",
      label: "Equipamentos",
      permissions: [
        { name: "view", label: "Visualizar" },
        { name: "create", label: "Criar" },
        { name: "edit", label: "Editar" },
        { name: "delete", label: "Excluir" }
      ]
    },
    {
      name: "support",
      label: "Suporte",
      permissions: [
        { name: "view", label: "Visualizar" },
        { name: "respond", label: "Responder" },
        { name: "escalate", label: "Escalar" }
      ]
    },
    {
      name: "users",
      label: "Usuários",
      permissions: [
        { name: "view", label: "Visualizar" },
        { name: "create", label: "Criar" },
        { name: "edit", label: "Editar" },
        { name: "delete", label: "Excluir" },
        { name: "manage_roles", label: "Gerenciar Perfis" }
      ]
    },
    {
      name: "ftth",
      label: "FTTH",
      permissions: [
        { name: "view", label: "Visualizar" },
        { name: "edit", label: "Editar" }
      ]
    },
    {
      name: "inventory",
      label: "Estoque",
      permissions: [
        { name: "view", label: "Visualizar" },
        { name: "manage", label: "Gerenciar" }
      ]
    },
    {
      name: "reports",
      label: "Relatórios",
      permissions: [
        { name: "view", label: "Visualizar" },
        { name: "export", label: "Exportar" }
      ]
    },
    {
      name: "settings",
      label: "Configurações",
      permissions: [
        { name: "view", label: "Visualizar" },
        { name: "edit", label: "Editar" }
      ]
    },
    {
      name: "financial",
      label: "Financeiro",
      permissions: [
        { name: "view", label: "Visualizar" },
        { name: "manage", label: "Gerenciar" }
      ]
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Perfis de Acesso</h2>
        <Button onClick={() => {
          resetForm();
          setShowRoleForm(true);
        }} className="bg-blue-600">
          <ShieldCheck className="w-4 h-4 mr-2" />
          Novo Perfil
        </Button>
      </div>
      
      {showRoleForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRole ? "Editar Perfil" : "Novo Perfil"}</CardTitle>
            <CardDescription>
              {editingRole 
                ? "Atualize as permissões e configurações do perfil." 
                : "Configure as permissões para o novo perfil de acesso."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Perfil</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Técnico, Atendente, Financeiro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleFormChange("slug", e.target.value)}
                  placeholder="ex: tecnico, atendente"
                  disabled={editingRole?.is_system}
                />
                <p className="text-xs text-gray-500">
                  Identificador único do perfil para uso interno.
                </p>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  placeholder="Descreva brevemente este perfil de acesso"
                />
              </div>
              
              <div className="md:col-span-2 space-y-1">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleFormChange("is_active", checked)}
                  />
                  <Label htmlFor="is_active">Perfil Ativo</Label>
                </div>
                <p className="text-xs text-gray-500">
                  Desative para impedir que este perfil seja atribuído a novos usuários.
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Permissões</h3>
              
              <div className="space-y-6">
                {permissionModules.map((module) => (
                  <div key={module.name} className="space-y-2">
                    <h4 className="font-medium text-gray-900">{module.label}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {module.permissions.map((permission) => (
                        <div key={`${module.name}-${permission.name}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${module.name}-${permission.name}`}
                            checked={formData.permissions[module.name]?.[permission.name] || false}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(module.name, permission.name, checked)
                            }
                          />
                          <Label 
                            htmlFor={`${module.name}-${permission.name}`}
                            className="text-sm"
                          >
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <div className="border-b border-gray-200 mt-4"></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setShowRoleForm(false);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={saveLoading}
              className="bg-blue-600"
            >
              {saveLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Perfis Disponíveis</CardTitle>
          <CardDescription>
            Gerencie os perfis de acesso e suas permissões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Nenhum perfil encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-blue-600" />
                          {role.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {role.slug}
                        </div>
                      </TableCell>
                      <TableCell>{role.description || "-"}</TableCell>
                      <TableCell>
                        {role.is_active !== false ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRole(role)}
                          disabled={role.is_system}
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}