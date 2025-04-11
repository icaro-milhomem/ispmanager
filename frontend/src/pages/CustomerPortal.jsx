import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Customer } from "@/api/entities";
import { Invoice } from "@/api/entities";
import { SupportTicket } from "@/api/entities";
import { Equipment } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Receipt,
  FileText,
  MessageSquare,
  Activity,
  Wifi,
  LogOut,
  Home,
  DollarSign,
  HelpCircle,
  Maximize,
  Minimize,
  ArrowRight,
  FileSearch,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientAccountInfo from "../components/portal/ClientAccountInfo";
import ClientInvoices from "../components/portal/ClientInvoices";
import ClientBandwidth from "../components/portal/ClientBandwidth";
import ClientTickets from "../components/portal/ClientTickets";
import ClientPlans from "../components/portal/ClientPlans";
import ClientHelpCenter from "../components/portal/ClientHelpCenter";

export default function CustomerPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [activeTab, setActiveTab] = useState("account");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [error, setError] = useState(null);
  const [loginMethod, setLoginMethod] = useState("cpf"); // cpf ou contrato

  // Login do cliente
  useEffect(() => {
    const clientLoggedIn = sessionStorage.getItem("clientLoggedIn") === "true";
    const clientId = sessionStorage.getItem("clientId");
    
    if (clientLoggedIn && clientId) {
      setLoggedIn(true);
      loadClientData(clientId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadClientData = async (clientId) => {
    setLoading(true);
    setError(null);
    try {
      // Carregar dados do cliente
      const customers = await Customer.list();
      let client = customers.find(c => c.id === clientId);
      
      if (!client) {
        throw new Error("Cliente não encontrado no sistema");
      }
      
      setClientData(client);
      
      // Carregar faturas do cliente
      const allInvoices = await Invoice.list();
      const clientInvoices = allInvoices.filter(invoice => invoice.customer_id === clientId);
      setInvoices(clientInvoices);
      
      // Carregar tickets de suporte do cliente
      const allTickets = await SupportTicket.list();
      const clientTickets = allTickets.filter(ticket => ticket.customer_id === clientId);
      setTickets(clientTickets);
      
      // Carregar equipamentos do cliente
      const allEquipment = await Equipment.list();
      const clientEquipment = allEquipment.filter(eq => eq.customer_id === clientId);
      setEquipment(clientEquipment);
      
    } catch (error) {
      console.error("Erro ao carregar dados do cliente:", error);
      setError("Ocorreu um erro ao carregar dados do cliente. Tente novamente mais tarde.");
      // Não fazemos logout, apenas exibimos uma mensagem de erro
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (loading) return;
    
    const identifier = document.getElementById("identifier")?.value || "";
    
    if (!identifier.trim()) {
      alert("Por favor, informe seu CPF ou número do contrato para acessar.");
      return;
    }
    
    setLoading(true);
    
    try {
      // Buscar clientes
      const customers = await Customer.list();
      
      // Encontrar cliente pelo CPF ou número do contrato
      let foundClient;
      
      if (loginMethod === "cpf") {
        // Normalizar CPF (remover caracteres não numéricos)
        const normalizedCPF = identifier.replace(/[^\d]/g, '');
        foundClient = customers.find(c => c.document_number?.replace(/[^\d]/g, '') === normalizedCPF);
      } else {
        // Buscar por número do contrato (case insensitive)
        foundClient = customers.find(c => 
          c.contract_number && c.contract_number.toLowerCase() === identifier.toLowerCase()
        );
      }
      
      if (foundClient) {
        sessionStorage.setItem("clientLoggedIn", "true");
        sessionStorage.setItem("clientId", foundClient.id);
        setLoggedIn(true);
        loadClientData(foundClient.id);
      } else {
        alert(`${loginMethod === "cpf" ? "CPF" : "Número de contrato"} não encontrado. Por favor, verifique as informações e tente novamente.`);
        setLoading(false);
      }
    } catch (error) {
      console.error("Erro ao autenticar:", error);
      alert("Erro ao realizar login. Tente novamente.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("clientLoggedIn");
    sessionStorage.removeItem("clientId");
    setLoggedIn(false);
    setClientData(null);
    setInvoices([]);
    setTickets([]);
    setEquipment([]);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Erro ao tentar entrar em modo de tela cheia: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const getPlanName = (planCode) => {
    if (!planCode) return "Não definido";
    
    const plans = {
      basic: "Básico",
      standard: "Padrão",
      premium: "Premium",
      enterprise: "Empresarial"
    };
    return plans[planCode] || "Não definido";
  };

  // Tela de login do portal do cliente
  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Portal do Cliente</h1>
                <p className="text-gray-500 mt-2">Acesse sua conta para gerenciar serviços</p>
              </div>

              <Tabs value={loginMethod} onValueChange={setLoginMethod} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cpf" className="flex gap-2 items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                    CPF
                  </TabsTrigger>
                  <TabsTrigger value="contrato" className="flex gap-2 items-center justify-center">
                    <FileSearch className="w-4 h-4" />
                    Nº Contrato
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="identifier" className="text-sm font-medium">
                    {loginMethod === "cpf" ? "CPF" : "Número do Contrato"}
                  </label>
                  <input
                    id="identifier"
                    type="text"
                    placeholder={loginMethod === "cpf" ? "000.000.000-00" : "AAAAMMDD-XXXX"}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Entrar
                </button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <button 
                  onClick={() => navigate(createPageUrl("Dashboard"))}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Voltar para Área Administrativa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela de loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  // Exibir mensagem de erro, se houver
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-4">Erro</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleLogout}>
              Voltar para Login
            </Button>
            <Button className="bg-blue-600" onClick={() => loadClientData(sessionStorage.getItem("clientId"))}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Portal do cliente
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho do Portal */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Home className="w-6 h-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Portal do Cliente</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {clientData && (
                <div className="hidden md:flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="font-medium">{clientData.full_name}</span>
                </div>
              )}
              
              <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
                {isFullScreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Navegação Lateral */}
            <div className="md:w-64">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="space-y-1">
                  <TabsList className="flex flex-col h-auto bg-transparent space-y-1">
                    <TabsTrigger 
                      value="account" 
                      className="w-full justify-start gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                    >
                      <User className="w-5 h-5" />
                      Minha Conta
                    </TabsTrigger>
                    <TabsTrigger 
                      value="invoices"
                      className="w-full justify-start gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                    >
                      <Receipt className="w-5 h-5" />
                      Faturas
                    </TabsTrigger>
                    <TabsTrigger 
                      value="plans"
                      className="w-full justify-start gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                    >
                      <DollarSign className="w-5 h-5" />
                      Planos
                    </TabsTrigger>
                    <TabsTrigger 
                      value="bandwidth"
                      className="w-full justify-start gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                    >
                      <Activity className="w-5 h-5" />
                      Consumo
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tickets"
                      className="w-full justify-start gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Suporte
                    </TabsTrigger>
                    <TabsTrigger 
                      value="help"
                      className="w-full justify-start gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                    >
                      <HelpCircle className="w-5 h-5" />
                      Ajuda
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Informações de Conexão */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center text-blue-600 font-medium mb-1">
                      <Wifi className="w-4 h-4 mr-2" />
                      Status da Conexão
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Online</span>
                      <span className="text-green-600 font-medium">Ativo</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      IP: {equipment[0]?.ip_address || "192.168.15.100"}
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center text-xs">
                      <span className="text-gray-600">Plano Atual</span>
                      <span className="font-medium">
                        {getPlanName(clientData?.plan)}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between items-center text-xs">
                      <span className="text-gray-600">Próx. Vencimento</span>
                      <span className="font-medium">{new Date().getDate() + 10}/{new Date().getMonth() + 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Conteúdo das Abas */}
            <div className="flex-1">
              <TabsContent value="account" className="mt-0">
                <ClientAccountInfo clientData={clientData} equipment={equipment} />
              </TabsContent>
              
              <TabsContent value="invoices" className="mt-0">
                <ClientInvoices 
                  invoices={invoices} 
                  clientData={clientData || {}} 
                />
              </TabsContent>
              
              <TabsContent value="plans" className="mt-0">
                <ClientPlans currentPlan={clientData?.plan || 'basic'} />
              </TabsContent>
              
              <TabsContent value="bandwidth" className="mt-0">
                <ClientBandwidth 
                  clientData={clientData || {}} 
                  equipment={equipment || []} 
                />
              </TabsContent>
              
              <TabsContent value="tickets" className="mt-0">
                <ClientTickets 
                  tickets={tickets} 
                  onCreateTicket={loadClientData} 
                  clientId={clientData?.id} 
                />
              </TabsContent>
              
              <TabsContent value="help" className="mt-0">
                <ClientHelpCenter clientData={clientData || {}} />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>
      
      {/* Rodapé */}
      <footer className="bg-white border-t py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2024 ISP Manager. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Termos de Uso</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Política de Privacidade</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
