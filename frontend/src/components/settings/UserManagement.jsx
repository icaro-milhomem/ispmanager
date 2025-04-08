import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { UserRole } from "@/api/entities";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Check,
  X,
  User as UserIcon,
  Shield,
  Edit,
  Trash2,
  Key,
} from "lucide-react";

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({
    full_name: "",
    email: "",
    role: "",
    password: "",
    confirm_password: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Dados mockados para demonstração
      const mockUsers = [
        { id: "1", full_name: "Administrador Master", email: "admin@isp.com", role: "admin", last_login: new Date().toISOString() },
        { id: "2", full_name: "Técnico Suporte", email: "suporte@isp.com", role: "tecnico", last_login: new Date().toISOString() },
        { id: "3", full_name: "Financeiro", email: "financeiro@isp.com", role: "financeiro", last_login: null }
      ];

      const mockRoles = [
        { id: "1", name: "Administrador", slug: "admin" },
        { id: "2", name: "Técnico", slug: "tecnico" },
        { id: "3", name: "Financeiro", slug: "financeiro" },
        { id: "4", name: "Atendente", slug: "atendente" }
      ];

      setUsers(mockUsers);
      setRoles(mockRoles);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos usuários",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = () => {
    setIsCreating(true);
    setUserForm({
      full_name: "",
      email: "",
      role: "",
      password: "",
      confirm_password: "",
    });
  };

  const handleEditUser = (user) => {
    setIsEditing(true);
    setSelectedUser(user);
    setUserForm({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      password: "",
      confirm_password: "",
    });
  };

  const handleDeleteUser = (user) => {
    setIsDeleting(true);
    setSelectedUser(user);
  };

  const confirmDeleteUser = async () => {
    try {
      // Simulação de exclusão
      const updatedUsers = users.filter(u => u.id !== selectedUser.id);
      setUsers(updatedUsers);
      
      toast({
        title: "Usuário excluído",
        description: `O usuário ${selectedUser.full_name} foi excluído com sucesso`,
      });
      setIsDeleting(false);
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = (user) => {
    setIsResettingPassword(true);
    setSelectedUser(user);
    setNewPassword(generatePassword());
  };

  const generatePassword = () => {
    return Math.random().toString(36).slice(-10);
  };

  const confirmResetPassword = async () => {
    try {
      // Simulação de reset de senha
      toast({
        title: "Senha redefinida",
        description: `A senha de ${selectedUser.full_name} foi redefinida com sucesso. Nova senha: ${newPassword}`,
      });
      setIsResettingPassword(false);
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      toast({
        title: "Erro",
        description: "Não foi possível redefinir a senha",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({
      ...userForm,
      [name]: value,
    });
  };

  const handleRoleChange = (value) => {
    setUserForm({
      ...userForm,
      role: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (userForm.password !== userForm.confirm_password) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isCreating) {
        // Simulação de criação
        const newUser = {
          id: Date.now().toString(),
          full_name: userForm.full_name,
          email: userForm.email,
          role: userForm.role,
          last_login: null
        };
        
        setUsers([...users, newUser]);
        
        toast({
          title: "Usuário criado",
          description: `${userForm.full_name} foi criado com sucesso`,
        });
      } else if (isEditing) {
        // Simulação de edição
        const updatedUsers = users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, full_name: userForm.full_name, email: userForm.email, role: userForm.role }
            : user
        );
        
        setUsers(updatedUsers);
        
        toast({
          title: "Usuário atualizado",
          description: `${userForm.full_name} foi atualizado com sucesso`,
        });
      }
      
      setIsCreating(false);
      setIsEditing(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário",
        variant: "destructive",
      });
    }
  };

  const roleNames = {
    admin: "Administrador",
    tecnico: "Técnico",
    financeiro: "Financeiro",
    atendente: "Atendente"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Usuários</CardTitle>
              <CardDescription>
                Gerencie os usuários do sistema e suas permissões
              </CardDescription>
            </div>
            <Button onClick={handleCreateUser} className="bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
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
                  <TableHead>Último Login</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                      <p className="mt-2 text-gray-500">Carregando usuários...</p>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-gray-500">Nenhum usuário encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-5 h-5 text-gray-500" />
                          {user.full_name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          {roleNames[user.role] || user.role}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.last_login
                          ? new Date(user.last_login).toLocaleString()
                          : "Nunca"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResetPassword(user)}
                            title="Redefinir senha"
                          >
                            <Key className="w-4 h-4 text-amber-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user)}
                            title="Excluir"
                            disabled={user.role === "admin" && users.filter(u => u.role === "admin").length === 1}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
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

      {/* Dialog de Criar/Editar Usuário */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Criar Novo Usuário" : "Editar Usuário"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do usuário abaixo
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={userForm.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Perfil</Label>
                <Select
                  value={userForm.role}
                  onValueChange={handleRoleChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.slug} value={role.slug}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isCreating && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={userForm.password}
                      onChange={handleInputChange}
                      required={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirmar Senha</Label>
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      value={userForm.confirm_password}
                      onChange={handleInputChange}
                      required={isCreating}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
              }}>
                Cancelar
              </Button>
              <Button type="submit">
                {isCreating ? "Criar Usuário" : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Excluir Usuário */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja excluir este usuário?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário {selectedUser?.full_name} será
              excluído permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Redefinição de Senha */}
      <AlertDialog open={isResettingPassword} onOpenChange={setIsResettingPassword}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Redefinir senha de {selectedUser?.full_name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-4">
                Você está prestes a redefinir a senha deste usuário.
              </p>
              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <p className="font-medium text-amber-800">Nova senha gerada:</p>
                <p className="font-mono text-lg mt-2 text-center bg-white p-2 rounded border">
                  {newPassword}
                </p>
                <p className="text-sm mt-2 text-amber-700">
                  Guarde esta senha em um local seguro. Ela não poderá ser recuperada depois.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetPassword}>
              Redefinir Senha
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}