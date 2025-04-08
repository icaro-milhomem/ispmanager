
import React, { useState, useEffect } from "react";
import { UserRole } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Shield,
  Edit,
  Trash2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";

export default function AccessControl() {
  const { toast } = useToast();
  const [roles, setRoles] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    slug: "",
    permissions: {},
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      
      const mockRoles = [
        {
          id: "1",
          name: "Administrador",
          slug: "admin",
          description: "Acesso total ao sistema",
          is_system: true,
          permissions: {
            customers: { view: true, create: true, edit: true, delete: true },
            invoices: { view: true, create: true, edit: true, delete: true },
            network: { view: true, manage: true },
            equipment: { view: true, create: true, edit: true, delete: true },
            support: { view: true, respond: true, escalate: true },
            users: { view: true, create: true, edit: true, delete: true, manage_roles: true },
            settings: { view: true, edit: true }
          }
        },
        {
          id: "2",
          name: "Técnico",
          slug: "tecnico",
          description: "Acesso às funcionalidades técnicas",
          is_system: false,
          permissions: {
            customers: { view: true, create: false, edit: false, delete: false },
            network: { view: true, manage: true },
            equipment: { view: true, create: true, edit: true, delete: false },
            support: { view: true, respond: true, escalate: false }
          }
        },
        {
          id: "3",
          name: "Financeiro",
          slug: "financeiro",
          description: "Acesso às funcionalidades financeiras",
          is_system: false,
          permissions: {
            customers: { view: true, create: false, edit: true, delete: false },
            invoices: { view: true, create: true, edit: true, delete: false }
          }
        }
      ];
      
      setRoles(mockRoles);
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os perfis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = () => {
    setIsCreating(true);
    setRoleForm({
      name: "",
      description: "",
      slug: "",
      permissions: {
        customers: { view: false, create: false, edit: false, delete: false },
        invoices: { view: false, create: false, edit: false, delete: false },
        network: { view: false, manage: false },
        equipment: { view: false, create: false, edit: false, delete: false },
        support: { view: false, respond: false, escalate: false },
        ftth: { view: false, edit: false },
        inventory: { view: false, manage: false },
        reports: { view: false, export: false },
        settings: { view: false, edit: false },
        users: { view: false, create: false, edit: false, delete: false, manage_roles: false }
      }
    });
  };

  const handleEditRole = (role) => {
    setIsEditing(true);
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      slug: role.slug,
      permissions: { ...role.permissions }
    });
  };

  const handleDeleteRole = (role) => {
    setIsDeleting(true);
    setSelectedRole(role);
  };

  const confirmDeleteRole = async () => {
    try {
      const updatedRoles = roles.filter(r => r.id !== selectedRole.id);
      setRoles(updatedRoles);
      
      toast({
        title: "Perfil excluído",
        description: `O perfil ${selectedRole.name} foi excluído com sucesso`,
      });
      setIsDeleting(false);
    } catch (error) {
      console.error("Erro ao excluir perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o perfil",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "name" && !isEditing) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "_");
      
      setRoleForm({
        ...roleForm,
        name: value,
        slug: slug,
      });
    } else {
      setRoleForm({
        ...roleForm,
        [name]: value,
      });
    }
  };

  const handlePermissionChange = (module, permission, checked) => {
    setRoleForm({
      ...roleForm,
      permissions: {
        ...roleForm.permissions,
        [module]: {
          ...(roleForm.permissions[module] || {}),
          [permission]: checked
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roleForm.name || !roleForm.slug) {
      toast({
        title: "Erro",
        description: "Nome e slug são campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isCreating) {
        const newRole = {
          id: Date.now().toString(),
          name: roleForm.name,
          slug: roleForm.slug,
          description: roleForm.description,
          permissions: roleForm.permissions,
          is_system: false
        };
        
        setRoles([...roles, newRole]);
        
        toast({
          title: "Perfil criado",
          description: `O perfil ${roleForm.name} foi criado com sucesso`,
        });
      } else if (isEditing) {
        const updatedRoles = roles.map(role => 
          role.id === selectedRole.id 
            ? { 
                ...role, 
                name: roleForm.name, 
                description: roleForm.description,
                permissions: roleForm.permissions
              }
            : role
        );
        
        setRoles(updatedRoles);
        
        toast({
          title: "Perfil atualizado",
          description: `O perfil ${roleForm.name} foi atualizado com sucesso`,
        });
      }
      
      setIsCreating(false);
      setIsEditing(false);
      setSelectedRole(null);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o perfil",
        variant: "destructive",
      });
    }
  };

  const moduleLabels = {
    customers: "Clientes",
    invoices: "Faturas",
    network: "Rede",
    equipment: "Equipamentos",
    support: "Suporte",
    ftth: "Rede FTTH",
    inventory: "Estoque",
    reports: "Relatórios",
    settings: "Configurações",
    users: "Usuários"
  };

  const permissionLabels = {
    view: "Visualizar",
    create: "Criar",
    edit: "Editar",
    delete: "Excluir",
    manage: "Gerenciar",
    respond: "Responder",
    escalate: "Escalar",
    export: "Exportar",
    manage_roles: "Gerenciar Perfis"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Perfis de Acesso</CardTitle>
              <CardDescription>
                Defina os diferentes níveis de acesso ao sistema
              </CardDescription>
            </div>
            <Button onClick={handleCreateRole} className="bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Perfil
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Sistema</TableHead>
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
                      <p className="mt-2 text-gray-500">Carregando perfis...</p>
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-gray-500">Nenhum perfil encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-600" />
                          {role.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">
                          {role.slug}
                        </code>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        {role.is_system ? (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Sistema
                          </Badge>
                        ) : (
                          "Não"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditRole(role)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRole(role)}
                            title="Excluir"
                            disabled={role.is_system}
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

      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Criar Novo Perfil" : "Editar Perfil"}
            </DialogTitle>
            <DialogDescription>
              Defina as permissões para este perfil de acesso
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Perfil</Label>
                  <Input
                    id="name"
                    name="name"
                    value={roleForm.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={roleForm.slug}
                    onChange={handleInputChange}
                    required
                    disabled={isEditing && selectedRole?.is_system}
                  />
                  {isEditing && selectedRole?.is_system && (
                    <p className="text-sm text-amber-600">
                      O slug de um perfil de sistema não pode ser alterado
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  name="description"
                  value={roleForm.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-medium mb-4">Permissões</h3>
                
                <div className="space-y-6">
                  {Object.keys(moduleLabels).map((module) => (
                    <Card key={module}>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">{moduleLabels[module]}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.keys(permissionLabels).map((permission) => {
                            if (
                              (module === 'network' && !['view', 'manage'].includes(permission)) ||
                              (module === 'ftth' && !['view', 'edit'].includes(permission)) ||
                              (module === 'inventory' && !['view', 'manage'].includes(permission)) ||
                              (module === 'reports' && !['view', 'export'].includes(permission)) ||
                              (module === 'settings' && !['view', 'edit'].includes(permission)) ||
                              (module === 'support' && !['view', 'respond', 'escalate'].includes(permission)) ||
                              (module === 'users' && permission === 'manage')
                            ) {
                              return null;
                            }
                            
                            return (
                              <div key={`${module}-${permission}`} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${module}-${permission}`}
                                  checked={roleForm.permissions?.[module]?.[permission] || false}
                                  onCheckedChange={(checked) => 
                                    handlePermissionChange(module, permission, checked)
                                  }
                                  disabled={isEditing && selectedRole?.is_system && module === 'users' && permission === 'manage_roles'}
                                />
                                <Label
                                  htmlFor={`${module}-${permission}`}
                                  className="text-sm font-normal"
                                >
                                  {permissionLabels[permission]}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
              }}>
                Cancelar
              </Button>
              <Button type="submit">
                {isCreating ? "Criar Perfil" : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja excluir este perfil?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O perfil {selectedRole?.name} será
              excluído permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRole} className="bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
