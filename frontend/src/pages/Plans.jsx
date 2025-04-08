import React, { useState, useEffect } from "react";
import { Plan } from "@/api/entities";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Wifi,
  Plus,
  Download,
  Upload,
  Pencil,
  Activity,
  CheckCircle,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    download_speed: 100,
    upload_speed: 50,
    monthly_price: 0,
    quarterly_discount: 5,
    annual_discount: 15,
    features: [],
    is_active: true,
    setup_fee: 0,
    category: "residential"
  });
  const [newFeature, setNewFeature] = useState("");
  const [savingPlan, setSavingPlan] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await Plan.list();
      const planData = Array.isArray(response) ? response : 
                       response.plans ? response.plans : [];
      
      // Mapear os planos do formato do backend para o formato do frontend
      const mappedPlans = planData.map(plan => {
        let features = [];
        try {
          // Tentar extrair as características do JSON se existir
          if (plan.features) {
            features = typeof plan.features === 'string' ? 
              JSON.parse(plan.features) : plan.features;
          }
        } catch (e) {
          console.warn("Erro ao processar features:", e);
        }
        
        return {
          id: plan.id,
          name: plan.name,
          code: plan.code || plan.name?.toLowerCase().replace(/\s+/g, '_'),
          description: plan.description || "",
          download_speed: plan.download || 0,
          upload_speed: plan.upload || 0,
          monthly_price: plan.price || 0,
          features: features,
          is_active: plan.status === 'ACTIVE',
          setup_fee: plan.setup_fee || 0,
          category: plan.category || "residential",
          quarterly_discount: plan.quarterly_discount || 0,
          annual_discount: plan.annual_discount || 0
        };
      });
      
      setPlans(mappedPlans);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingPlan(true);
      
      // Garantir que existe um código para o plano
      if (!formData.code) {
        // Gerar código a partir do nome se não existir
        const generatedCode = formData.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '_')
          .substring(0, 20);
        
        formData.code = generatedCode;
      }
      
      // Mapear os campos do formulário para os campos esperados pelo backend
      const planData = {
        name: formData.name,
        description: formData.description,
        price: formData.monthly_price,
        download: formData.download_speed,
        upload: formData.upload_speed,
        data_limit: formData.data_limit || null,
        status: formData.is_active ? 'ACTIVE' : 'INACTIVE',
        // Outros campos que podem ser necessários no backend
        // mas não são obrigatórios
        features: JSON.stringify(formData.features || [])
      };
      
      if (editingPlan) {
        await Plan.update(editingPlan.id, planData);
        toast({
          title: "Plano atualizado",
          description: "O plano foi atualizado com sucesso",
        });
      } else {
        await Plan.create(planData);
        toast({
          title: "Plano criado",
          description: "O plano foi criado com sucesso",
        });
      }
      
      setShowForm(false);
      setEditingPlan(null);
      resetForm();
      loadPlans();
    } catch (error) {
      console.error("Erro ao salvar plano:", error);
      toast({
        title: "Erro ao salvar plano",
        description: error.message || "Verifique os dados e tente novamente",
        variant: "destructive"
      });
    } finally {
      setSavingPlan(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      download_speed: 100,
      upload_speed: 50,
      monthly_price: 0,
      quarterly_discount: 5,
      annual_discount: 15,
      features: [],
      is_active: true,
      setup_fee: 0,
      category: "residential"
    });
  };

  const handleEdit = (plan) => {
    // Garantir que todos os campos necessários estejam presentes
    const editablePlan = {
      ...plan,
      monthly_price: plan.monthly_price || 0,
      download_speed: plan.download_speed || 0,
      upload_speed: plan.upload_speed || 0,
      features: plan.features || [],
      category: plan.category || "residential",
      is_active: plan.is_active !== undefined ? plan.is_active : true,
      setup_fee: plan.setup_fee || 0,
      quarterly_discount: plan.quarterly_discount || 0,
      annual_discount: plan.annual_discount || 0
    };
    
    setEditingPlan(plan);
    setFormData(editablePlan);
    setShowForm(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const categoryLabels = {
    residential: "Residencial",
    business: "Empresarial",
    enterprise: "Corporativo"
  };

  const handleDeletePlan = async (plan) => {
    if (window.confirm(`Tem certeza que deseja excluir o plano "${plan.name}"?`)) {
      try {
        setLoading(true);
        await Plan.delete(plan.id);
        toast({
          title: "Plano excluído",
          description: "O plano foi removido com sucesso",
        });
        loadPlans();
      } catch (error) {
        console.error("Erro ao excluir plano:", error);
        
        // Exibe mensagem de erro exata do servidor
        let errorMessage = "Erro ao excluir o plano.";
        
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = `Erro do servidor: ${error.response.data.message}`;
        } else if (error.message) {
          errorMessage = `Erro: ${error.message}`;
        }
        
        toast({
          title: "Erro ao excluir",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Planos de Internet</h1>
          <p className="text-gray-500">Gerencie os planos oferecidos aos clientes</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setEditingPlan(null);
            setShowForm(true);
          }} 
          className="bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Editar Plano" : "Novo Plano"}</DialogTitle>
            <DialogDescription>
              {editingPlan 
                ? "Edite as informações do plano existente" 
                : "Preencha as informações para criar um novo plano"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Plano</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code">Código do Plano</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    placeholder="Gerado automaticamente"
                  />
                  <p className="text-xs text-gray-500">
                    Deixe em branco para gerar automaticamente
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descreva os detalhes do plano"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="download_speed">Velocidade de Download (Mbps)</Label>
                  <Input
                    id="download_speed"
                    type="number"
                    min="1"
                    value={formData.download_speed}
                    onChange={(e) => handleInputChange("download_speed", Number(e.target.value))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="upload_speed">Velocidade de Upload (Mbps)</Label>
                  <Input
                    id="upload_speed"
                    type="number"
                    min="1"
                    value={formData.upload_speed}
                    onChange={(e) => handleInputChange("upload_speed", Number(e.target.value))}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly_price">Preço Mensal (R$)</Label>
                  <Input
                    id="monthly_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthly_price}
                    onChange={(e) => handleInputChange("monthly_price", Number(e.target.value))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="setup_fee">Taxa de Instalação (R$)</Label>
                  <Input
                    id="setup_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.setup_fee}
                    onChange={(e) => handleInputChange("setup_fee", Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quarterly_discount">Desconto Trimestral (%)</Label>
                  <Input
                    id="quarterly_discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.quarterly_discount}
                    onChange={(e) => handleInputChange("quarterly_discount", Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="annual_discount">Desconto Anual (%)</Label>
                  <Input
                    id="annual_discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.annual_discount}
                    onChange={(e) => handleInputChange("annual_discount", Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Categoria</Label>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="residential"
                      name="category"
                      className="mr-2"
                      checked={formData.category === "residential"}
                      onChange={() => handleInputChange("category", "residential")}
                    />
                    <Label htmlFor="residential" className="cursor-pointer">Residencial</Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="business"
                      name="category"
                      className="mr-2"
                      checked={formData.category === "business"}
                      onChange={() => handleInputChange("category", "business")}
                    />
                    <Label htmlFor="business" className="cursor-pointer">Empresarial</Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="enterprise"
                      name="category"
                      className="mr-2"
                      checked={formData.category === "enterprise"}
                      onChange={() => handleInputChange("category", "enterprise")}
                    />
                    <Label htmlFor="enterprise" className="cursor-pointer">Corporativo</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Plano Ativo</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Planos inativos não ficarão disponíveis para contratação
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Características do Plano</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Ex: Wi-Fi grátis, Suporte 24h..."
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddFeature}
                    disabled={!newFeature.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {formData.features.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.features.map((feature, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span>{feature}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveFeature(index)}
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={savingPlan}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={savingPlan}
                className="bg-blue-600"
              >
                {savingPlan ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    {editingPlan ? "Atualizar Plano" : "Criar Plano"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {plans.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wifi className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum Plano Cadastrado</h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  Você ainda não cadastrou nenhum plano de internet. Clique no botão acima para 
                  criar seu primeiro plano.
                </p>
                <Button 
                  onClick={() => {
                    resetForm();
                    setEditingPlan(null);
                    setShowForm(true);
                  }} 
                  className="bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Plano
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`overflow-hidden ${!plan.is_active ? 'bg-gray-50 opacity-70' : ''}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.code}</CardDescription>
                      </div>
                      <Badge className={`${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {plan.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="mb-4">
                      <p className="text-3xl font-bold text-blue-600">
                        {formatCurrency(plan.monthly_price)}
                        <span className="text-sm font-normal text-gray-500"> /mês</span>
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-blue-600" />
                          <p className="font-medium">{plan.download_speed} Mbps</p>
                          <span className="text-sm text-gray-500">Download</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-blue-600" />
                          <p className="font-medium">{plan.upload_speed} Mbps</p>
                          <span className="text-sm text-gray-500">Upload</span>
                        </div>
                      </div>
                      
                      <div>
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[plan.category]}
                        </Badge>
                      </div>
                      
                      {plan.description && (
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      )}
                      
                      {plan.features && plan.features.length > 0 && (
                        <div className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 px-6 py-3 flex justify-between">
                    <div>
                      {plan.setup_fee > 0 && (
                        <p className="text-xs text-gray-500">
                          Taxa de instalação: {formatCurrency(plan.setup_fee)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(plan)}
                        className="text-blue-600"
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeletePlan(plan)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}