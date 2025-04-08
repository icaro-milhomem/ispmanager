import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  User as UserIcon,
  Mail,
  Key,
  Loader2,
  Save
} from "lucide-react";

export default function UserSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      // Pegar dados do usuário do sessionStorage
      const userStr = sessionStorage.getItem("currentUser");
      if (userStr) {
        const userData = JSON.parse(userStr);
        setCurrentUser(userData);
        setProfileForm({
          full_name: userData.full_name || "",
          email: userData.email || ""
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Atualizar dados no sessionStorage
      const userData = {
        ...currentUser,
        full_name: profileForm.full_name,
        email: profileForm.email
      };
      
      sessionStorage.setItem("currentUser", JSON.stringify(userData));
      setCurrentUser(userData);
      
      toast({
        title: "Sucesso",
        description: "Suas informações foram atualizadas"
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seu perfil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordForm.new_password.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Atualizar senha no userData do sessionStorage
      const userData = {
        ...currentUser,
        password: passwordForm.new_password
      };
      
      // Atualizar no usersData também para manter consistência
      const usersData = JSON.parse(sessionStorage.getItem("usersData") || "[]");
      const updatedUsers = usersData.map(u => 
        u.id === currentUser.id ? {...u, password: passwordForm.new_password} : u
      );
      
      sessionStorage.setItem("usersData", JSON.stringify(updatedUsers));
      sessionStorage.setItem("currentUser", JSON.stringify(userData));
      
      setCurrentUser(userData);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
      
      toast({
        title: "Sucesso",
        description: "Sua senha foi alterada com sucesso"
      });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar sua senha",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };
  
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
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
          <h1 className="text-2xl font-bold">Minha Conta</h1>
          <p className="text-gray-500">Personalize suas informações pessoais</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="password">Alterar Senha</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    <UserIcon className="ml-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="full_name"
                      name="full_name"
                      value={profileForm.full_name}
                      onChange={handleProfileInputChange}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    <Mail className="ml-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileInputChange}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-4"
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

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Atualize sua senha de acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Senha Atual</Label>
                  <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    <Key className="ml-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="current_password"
                      name="current_password"
                      type={showPassword.current ? "text" : "password"}
                      value={passwordForm.current_password}
                      onChange={handlePasswordInputChange}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => togglePasswordVisibility('current')}
                      className="h-8 w-8 mr-1"
                    >
                      {showPassword.current ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">Nova Senha</Label>
                  <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    <Key className="ml-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="new_password"
                      name="new_password"
                      type={showPassword.new ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={handlePasswordInputChange}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => togglePasswordVisibility('new')}
                      className="h-8 w-8 mr-1"
                    >
                      {showPassword.new ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
                  <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    <Key className="ml-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordForm.confirm_password}
                      onChange={handlePasswordInputChange}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="h-8 w-8 mr-1"
                    >
                      {showPassword.confirm ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-4"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Alterar Senha
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}