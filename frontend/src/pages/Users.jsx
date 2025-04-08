
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { UserRole } from "@/api/entities";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  User as UserIcon,
  Users as UsersIcon,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  Phone,
  Building,
  Briefcase,
  Key,
  Save,
  X
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role_id: "",
    phone: "",
    is_active: true,
    department: "",
    job_title: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const usersData = [
        {
          id: "1",
          full_name: "Administrador Master",
          email: "master@isp.com",
          role: "admin",
          role_id: "1",
          phone: "(99) 98765-4321",
          is_active: true,
          last_login: "2023-10-15T14:30:00Z",
          department: "TI",
          job_title: "Administrador de Sistemas"
        },
        {
          id: "2",
          full_name: "Técnico João Silva",
          email: "joao.silva@isp.com",
          role: "user",
          role_id: "2",
          phone: "(99) 91234-5678",
          is_active: true,
          last_login: "2023-10-14T09:15:00Z",
          department: "Suporte Técnico",
          job_title: "Técnico de Campo"
        },
        {
          id: "3",
          full_name: "Maria Oliveira",
          email: "maria.oliveira@isp.com",
          role: "user",
          role_id: "3",
          phone: "(99) 99876-5432",
          is_active: true,
          last_login: "2023-10-13T16:45:00Z",
          department: "Atendimento",
          job_title: "Atendente de Suporte"
        },
        {
          id: "4",
          full_name: "Carlos Ferreira",
          email: "carlos.ferreira@isp.com",
          role: "user",
          role_id: "2",
          phone: "(99) 98877-6655",
          is_active: false,
          last_login: "2023-09-25T10:20:00Z",
          department: "Suporte Técnico",
          job_title: "Técnico de Campo"
        }
      ];
      
      const rolesData = [
        {
          id: "1",
          name: "Administrador",
          slug: "admin",
          description: "Acesso total ao sistema",
          is_system: true,
          is_active: true
        },
        {
          id: "2",
          name: "Técnico",
          slug: "technician",
          description: "Acesso às funcionalidades técnicas",
          is_system: false,
          is_active: true
        },
        {
          id: "3",
          name: "Atendimento",
          slug: "support",
          description: "Suporte ao cliente e faturamento",
          is_system: false,
          is_active: true
        },
        {
          id: "4",
          name: "Gerente",
          slug: "manager",
          description: "Acesso gerencial e relatórios",
          is_system: false,
          is_active: true
        }
      ];
      
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.full_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.department && user.department.toLowerCase().includes(searchLower)) ||
      (user.job_title && user.job_title.toLowerCase().includes(searchLower))
    );
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.full_name.trim()) {
      errors.full_name = "Nome completo é obrigatório";
    }
    
    if (!formData.email.trim()) {
      errors.email = "E-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "E-mail inválido";
    }
    
    if (!formData.role_id) {
      errors.role_id = "Perfil de acesso é obrigatório";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id,
      phone: user.phone || "",
      is_active: user.is_active !== false,
      department: user.department || "",
      job_title: user.job_title || ""
    });
    setShowUserForm(true);
  };

  const handleDelete = async (userId) => {
    try {
      setUsers(prev => prev.filter(user => user.id !== userId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      role_id: "",
      phone: "",
      is_active: true,
      department: "",
      job_title: ""
    });
    setFormErrors({});
    setEditingUser(null);
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : "Sem perfil";
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "Nunca";
    
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-gray-500">Gerencie os usuários do sistema</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              resetForm();
              setShowUserForm(true);
            }}
            className="bg-blue-600"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
          
          <Link to={createPageUrl("UserRoles")}>
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Perfis de Acesso
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Total de {users.length} usuários no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                      </div>
                      <p className="mt-2 text-gray-500">Carregando usuários...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <UsersIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Nenhum usuário encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.full_name}</div>
                        {user.phone && (
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={
                            user.role === "admin" 
                              ? "bg-purple-100 text-purple-800" 
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {getRoleName(user.role_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.department && (
                          <div>
                            <div>{user.department}</div>
                            {user.job_title && (
                              <div className="text-sm text-gray-500">{user.job_title}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.is_active !== false ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(user.last_login)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(user)}
                            className="h-8 w-8 text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Dialog open={deleteConfirm === user.id} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setDeleteConfirm(user.id)}
                                className="h-8 w-8 text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Excluir Usuário</DialogTitle>
                                <DialogDescription>
                                  Tem certeza que deseja excluir o usuário <strong>{user.full_name}</strong>?
                                  <br />
                                  Esta ação não pode ser desfeita.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setDeleteConfirm(null)}
                                >
                                  Cancelar
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  Excluir
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
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

      <Dialog open={showUserForm} onOpenChange={(open) => {
        if (!open) {
          setShowUserForm(false);
          if (!editingUser) resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? "Altere as informações do usuário conforme necessário." 
                : "Preencha as informações para criar um novo usuário."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Nome completo do usuário"
              />
              {formErrors.full_name && (
                <p className="text-sm text-red-500">{formErrors.full_name}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@provedor.com"
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Perfil de Acesso</Label>
                <Select
                  value={formData.role_id}
                  onValueChange={(value) => handleInputChange("role_id", value)}
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
                {formErrors.role_id && (
                  <p className="text-sm text-red-500">{formErrors.role_id}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  placeholder="TI, Suporte, etc."
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="job_title">Cargo/Função</Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => handleInputChange("job_title", e.target.value)}
                  placeholder="Técnico, Gerente, etc."
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
              />
              <Label htmlFor="is_active">Usuário ativo</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUserForm(false);
              if (!editingUser) resetForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saveLoading}>
              {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
