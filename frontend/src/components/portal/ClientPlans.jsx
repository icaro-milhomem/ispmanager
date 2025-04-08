
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
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  ChevronRight,
  Download,
  Upload,
  Clock,
  CreditCard,
  AlertTriangle,
  Zap
} from "lucide-react";
import { Plan } from "@/api/entities";

export default function ClientPlans({ currentPlan = 'basic' }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState("monthly");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plansData = await Plan.list();
      
      // Se não houver planos, criar planos padrão
      if (plansData.length === 0) {
        await createDefaultPlans();
        const updatedPlans = await Plan.list();
        setPlans(updatedPlans);
      } else {
        setPlans(plansData);
      }
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPlans = async () => {
    const defaultPlans = [
      {
        name: "Plano Básico",
        code: "basic",
        description: "Plano ideal para uso básico de internet, navegação e e-mail.",
        download_speed: 50,
        upload_speed: 25,
        monthly_price: 79.90,
        quarterly_discount: 5,
        annual_discount: 15,
        features: ["Navegação", "E-mail", "Redes Sociais", "Suporte Básico"],
        category: "residential",
        is_active: true,
        setup_fee: 99
      },
      {
        name: "Plano Padrão",
        code: "standard",
        description: "Plano ideal para famílias com uso moderado de streaming e jogos.",
        download_speed: 150,
        upload_speed: 75,
        monthly_price: 129.90,
        quarterly_discount: 10,
        annual_discount: 20,
        features: ["Streaming HD", "Jogos Online", "Múltiplos Dispositivos", "Suporte Prioritário"],
        category: "residential",
        is_active: true,
        setup_fee: 79
      },
      {
        name: "Plano Premium",
        code: "premium",
        description: "Para usuários exigentes que precisam de alta velocidade para streaming 4K e downloads.",
        download_speed: 300,
        upload_speed: 150,
        monthly_price: 199.90,
        quarterly_discount: 10,
        annual_discount: 20,
        features: ["Streaming 4K", "Downloads Rápidos", "Prioridade de Tráfego", "Suporte VIP"],
        category: "residential",
        is_active: true,
        setup_fee: 49
      },
      {
        name: "Plano Empresarial",
        code: "enterprise",
        description: "Para pequenas e médias empresas que precisam de confiabilidade e velocidade.",
        download_speed: 500,
        upload_speed: 250,
        monthly_price: 349.90,
        quarterly_discount: 15,
        annual_discount: 25,
        features: ["IP Fixo", "Link Dedicado", "Garantia de Banda", "Suporte 24/7"],
        category: "business",
        is_active: true,
        setup_fee: 0
      }
    ];
    
    try {
      for (const plan of defaultPlans) {
        await Plan.create(plan);
      }
      console.log("Planos padrão criados com sucesso");
    } catch (error) {
      console.error("Erro ao criar planos padrão:", error);
    }
  };

  const handleUpgradePlan = (plan) => {
    setSelectedPlan(plan);
    setShowUpgradeDialog(true);
  };

  const confirmUpgrade = () => {
    // Simulação de upgrade (apenas para demonstração)
    // Em uma implementação real, aqui chamaríamos a API para atualizar o plano
    setUpgradeSuccess(true);
    
    setTimeout(() => {
      setShowUpgradeDialog(false);
      setUpgradeSuccess(false);
    }, 3000);
  };

  const calculatePrice = (plan, cycle) => {
    if (!plan) return 0;
    
    const basePrice = plan.monthly_price;
    
    switch (cycle) {
      case "monthly":
        return basePrice;
      case "quarterly":
        const quarterlyTotal = basePrice * 3;
        const quarterlyDiscount = quarterlyTotal * (plan.quarterly_discount / 100);
        return quarterlyTotal - quarterlyDiscount;
      case "annual":
        const annualTotal = basePrice * 12;
        const annualDiscount = annualTotal * (plan.annual_discount / 100);
        return annualTotal - annualDiscount;
      default:
        return basePrice;
    }
  };

  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const getCurrentPlanDetails = () => {
    return plans.find(p => p.code === currentPlan) || null;
  };

  const isCurrentPlan = (plan) => {
    return plan.code === currentPlan;
  };

  const getPlanDetails = (planCode) => {
    const plans = {
      basic: {
        name: "Básico",
        speed: "100 Mbps",
        price: "99,90"
      },
      standard: {
        name: "Padrão",
        speed: "300 Mbps",
        price: "129,90"
      },
      premium: {
        name: "Premium",
        speed: "500 Mbps",
        price: "159,90"
      },
      enterprise: {
        name: "Empresarial",
        speed: "1000 Mbps",
        price: "399,90"
      }
    };
    
    return plans[planCode] || plans.basic;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Carregando planos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meu Plano Atual</CardTitle>
          <CardDescription>
            Detalhes do seu plano de internet atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getCurrentPlanDetails() ? (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-blue-700">{getCurrentPlanDetails().name}</h3>
                  <p className="text-blue-600 mt-1">{getCurrentPlanDetails().description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {getCurrentPlanDetails().features.map((feature, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-700">
                    {formatCurrency(getCurrentPlanDetails().monthly_price)}
                    <span className="text-sm font-normal text-blue-600">/mês</span>
                  </div>
                  <p className="text-blue-600 text-sm mt-1">Fidelidade de 12 meses</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Download</p>
                    <p className="font-bold text-blue-700">{getCurrentPlanDetails().download_speed} Mbps</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Upload</p>
                    <p className="font-bold text-blue-700">{getCurrentPlanDetails().upload_speed} Mbps</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Vencimento</p>
                    <p className="font-bold text-blue-700">Dia {new Date().getDate() + 5}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Não foi possível encontrar detalhes do seu plano atual.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Planos Disponíveis</CardTitle>
          <CardDescription>
            Compare e escolha o melhor plano para você
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`overflow-hidden ${isCurrentPlan(plan) ? 'border-blue-400 border-2' : ''}`}
              >
                {isCurrentPlan(plan) && (
                  <div className="bg-blue-500 text-white text-center py-1 text-xs font-medium">
                    SEU PLANO ATUAL
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.download_speed} Mbps</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold">
                    {formatCurrency(plan.monthly_price)}
                    <span className="text-sm font-normal text-gray-500">/mês</span>
                  </div>
                  
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{plan.download_speed} Mbps de download</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{plan.upload_speed} Mbps de upload</span>
                    </li>
                    {plan.features.slice(0, 2).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className={isCurrentPlan(plan) ? "bg-gray-400 w-full cursor-not-allowed" : "bg-blue-600 w-full"}
                    disabled={isCurrentPlan(plan)}
                    onClick={() => handleUpgradePlan(plan)}
                  >
                    {isCurrentPlan(plan) ? "Plano Atual" : "Mudar para Este Plano"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Diálogo de Upgrade de Plano */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Mudança de Plano</DialogTitle>
            <DialogDescription>
              Selecione o ciclo de faturamento para seu novo plano
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Detalhes do Plano Selecionado</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Plano:</span>
                    <span className="font-medium">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Download:</span>
                    <span className="font-medium">{selectedPlan.download_speed} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Upload:</span>
                    <span className="font-medium">{selectedPlan.upload_speed} Mbps</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Selecione o Ciclo de Pagamento</Label>
                <RadioGroup 
                  value={selectedCycle} 
                  onValueChange={setSelectedCycle}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between space-x-2 border rounded-md p-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="font-normal">
                        Mensal
                      </Label>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(calculatePrice(selectedPlan, "monthly") / 12)}/mês
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2 border rounded-md p-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quarterly" id="quarterly" />
                      <div>
                        <Label htmlFor="quarterly" className="font-normal">
                          Trimestral
                        </Label>
                        <p className="text-xs text-green-600">Economia de {selectedPlan.quarterly_discount}%</p>
                      </div>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(calculatePrice(selectedPlan, "quarterly") / 3)}/mês
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2 border rounded-md p-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="annual" id="annual" />
                      <div>
                        <Label htmlFor="annual" className="font-normal">
                          Anual
                        </Label>
                        <p className="text-xs text-green-600">Economia de {selectedPlan.annual_discount}%</p>
                      </div>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(calculatePrice(selectedPlan, "annual") / 12)}/mês
                    </span>
                  </div>
                </RadioGroup>
              </div>
              
              {upgradeSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700">
                    Solicitação enviada com sucesso! Nossa equipe entrará em contato para confirmar os detalhes.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
              disabled={upgradeSuccess}
            >
              Cancelar
            </Button>
            <Button
              className="bg-blue-600"
              onClick={confirmUpgrade}
              disabled={upgradeSuccess}
            >
              Solicitar Mudança
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
