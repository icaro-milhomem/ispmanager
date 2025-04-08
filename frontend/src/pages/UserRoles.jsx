
import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Lock,
  Users,
  FileText,
  Network,
  Settings,
  Settings2,
  Package,
  ClipboardList,
  MessageSquare,
  Router,
  Save,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Define permissions structure for new roles
function defaultPermissions() {
  return {
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
  };
}

export default function UserRolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    permissions: defaultPermissions(),
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    customers: true,
    invoices: false,
    network: false,
    equipment: false,
    support: false,
    ftth: false,
    inventory: false,
    reports: false,
    settings: false,
    users: false
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await UserRole.list();
      setRoles(data);
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
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

  const handlePermissionChange = (section, permission, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: {
          ...prev.permissions[section],
          [permission]: value
        }
      }
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Nome do perfil é obrigatório";
    }
    
    if (!formData.slug.trim()) {
      errors.slug = "Identificador é obrigatório";
    } else if (!/^[a-z0-9_-]+$/.test(formData.slug)) {
      errors.slug = "Identificador deve conter apenas letras minúsculas, números, underscores e hífens";
    } else if (!editMode && roles.some(role => role.slug === formData.slug)) {
      errors.slug = "Este identificador já está em uso";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSaveLoading(true);
      
      if (editMode && currentRole) {
        await UserRole.update(currentRole.id, formData);
      } else {
        await UserRole.create(formData);
      }
      
      loadRoles();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEdit = (role) => {
    setCurrentRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      slug: role.slug,
      permissions: role.permissions || defaultPermissions(),
      is_active: role.is_active !== false
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (roleId) => {
    try {
      await UserRole.delete(roleId);
      loadRoles();
      setConfirmDelete(null);
    } catch (error) {
      console.error("Erro ao excluir perfil:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      slug: "",
      permissions: defaultPermissions(),
      is_active: true
    });
    setFormErrors({});
    setCurrentRole(null);
    setEditMode(false);
  };

  const newRole = () => {
    resetForm();
    setShowForm(true);
  };

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleNameChange = (name) => {
    handleFormChange('name', name);
    if (!editMode) {
      handleFormChange('slug', slugify(name));
    }
  };

  const getModuleIcon = (module) => {
    const icons = {
      customers: Users,
      invoices: FileText,
      network: Network,
      equipment: Router,
      support: MessageSquare,
      ftth: Router,
      inventory: Package,
      reports: ClipboardList,
      settings: Settings2,
      users: Users
    };
    
    const IconComponent = icons[module] || Settings;
    return <IconComponent className="w-5 h-5" />;
  };

  const getPermissionName = (permission) => {
    const names = {
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
    
    return names[permission] || permission;
  };

  const getModuleName = (module) => {
    const names = {
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
    
    return names[module] || module;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Perfis de Acesso</h1>
          <p className="text-gray-500">Configure as permissões de acesso ao sistema</p>
        </div>
        
        <div className="flex gap-2">
          <Link to={createPageUrl("Users")}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Usuários
            </Button>
          </Link>
          
          <Button onClick={newRole} className="bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Novo Perfil
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Perfis de Acesso</CardTitle>
          <CardDescription>
            Gerencie os perfis de acesso ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-gray-400 mb-4" />
              <p className="text-gray-500">Carregando perfis de acesso...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-12 border rounded-md bg-gray-50">
              <ShieldCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Nenhum perfil de acesso cadastrado</p>
              <Button variant="outline" onClick={newRole} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Perfil
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Identificador</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-gray-100 font-mono">
                          {role.slug}
                        </Badge>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        {role.is_active !== false ? (
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(role)}
                            className="h-8 w-8 text-blue-600"
                            disabled={role.is_system}
                            title={role.is_system ? "Perfil de sistema não pode ser editado" : "Editar perfil"}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Dialog 
                            open={confirmDelete === role.id} 
                            onOpenChange={(open) => !open && setConfirmDelete(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => !role.is_system && setConfirmDelete(role.id)}
                                className="h-8 w-8 text-red-600"
                                disabled={role.is_system}
                                title={role.is_system ? "Perfil de sistema não pode ser excluído" : "Excluir perfil"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Excluir Perfil</DialogTitle>
                                <DialogDescription>
                                  Tem certeza que deseja excluir o perfil <strong>{role.name}</strong>?
                                  <br />
                                  Esta ação não pode ser desfeita e afetará todos os usuários com este perfil.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setConfirmDelete(null)}
                                >
                                  Cancelar
                                </Button>
                                
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(role.id)}
                                >
                                  Excluir
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open) {
          setShowForm(false);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[750px]">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Editar Perfil de Acesso" : "Novo Perfil de Acesso"}
            </DialogTitle>
            <DialogDescription>
              {editMode 
                ? "Altere as permissões e informações do perfil conforme necessário."
                : "Configure o nome, descrição e permissões para o novo perfil."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Perfil</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Gerente, Técnico, Suporte"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Identificador 
                  <span className="ml-1 text-xs text-gray-500">(para uso técnico)</span>
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleFormChange("slug", e.target.value)}
                  placeholder="Ex: gerente, tecnico, suporte"
                  disabled={currentRole?.is_system}
                />
                {formErrors.slug && (
                  <p className="text-sm text-red-500">{formErrors.slug}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                placeholder="Descreva o propósito deste perfil de acesso"
                rows={2}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleFormChange("is_active", checked)}
                disabled={currentRole?.is_system}
              />
              <Label htmlFor="is_active">Perfil ativo</Label>
            </div>
            
            {currentRole?.is_system && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  Este é um perfil de sistema e algumas configurações não podem ser alteradas.
                </AlertDescription>
              </Alert>
            )}
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Permissões</h3>
              
              <div className="space-y-4 rounded-md border p-4">
                {Object.keys(formData.permissions).map((module) => (
                  <div key={module} className="rounded-md border">
                    <div 
                      className={`flex items-center justify-between p-3 cursor-pointer ${expandedSections[module] ? 'bg-blue-50' : 'bg-gray-50'}`}
                      onClick={() => toggleSection(module)}
                    >
                      <div className="flex items-center gap-2">
                        {getModuleIcon(module)}
                        <span className="font-medium">{getModuleName(module)}</span>
                      </div>
                      
                      {expandedSections[module] ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                    
                    {expandedSections[module] && (
                      <div className="p-4 border-t bg-white">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {Object.keys(formData.permissions[module]).map((permission) => (
                            <div key={`${module}-${permission}`} className="flex items-center space-x-2">
                              <Switch
                                id={`${module}-${permission}`}
                                checked={formData.permissions[module][permission]}
                                onCheckedChange={(checked) => handlePermissionChange(module, permission, checked)}
                                disabled={currentRole?.is_system && module === 'users' && permission === 'manage_roles'}
                              />
                              <Label 
                                htmlFor={`${module}-${permission}`}
                                className="text-sm cursor-pointer"
                              >
                                {getPermissionName(permission)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              disabled={saveLoading}
              className="bg-blue-600"
            >
              {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editMode ? 'Atualizar Perfil' : 'Criar Perfil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
