import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
// import { createPageUrl } from "@/utils";
import { SystemConfig, User } from "../api/entities";
import {
  LayoutDashboard,
  Users,
  Network,
  Receipt,
  Settings,
  Menu,
  X,
  LogOut,
  MessagesSquare,
  ServerCog,
  Activity,
  Home,
  BoxesIcon,
  WifiIcon,
  CreditCard,
  PackageSearch,
  User as UserIcon,
  ShieldCheck,
  DollarSign,
  Cable,
  FileText,
  Wallet,
  Building2,
  BarChart3,
  KeyRound,
  Cog,
  UserCog,
  ScrollText,
  Warehouse,
  BadgeCheck,
  Terminal,
  Car,
  Router
} from "lucide-react";
import { Button } from "../components/ui/button";
import { PermissionCheck } from "../components/permissions/PermissionCheck";

const themeStyles = `
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}
`;

// Função para criar URLs de páginas
const createPageUrl = (pageName) => {
  return '/' + pageName.toLowerCase().replace(/ /g, '-');
};

const isAuthenticated = () => {
  // Verificar autenticação baseada em sessão
  const authStatus = sessionStorage.getItem("isAuthenticated");
  const userData = sessionStorage.getItem("currentUser");
  
  // Verificar token da API
  const apiToken = localStorage.getItem("auth_token");
  
  // Considerar autenticado se tiver dados de sessão OU token da API
  return (authStatus === "true" && userData !== null) || !!apiToken;
};

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [systemConfig, setSystemConfig] = useState({
    company_name: "",
    company_logo_url: ""
  });

  useEffect(() => {
    // Permitir visualização da fatura sem autenticação
    if (currentPageName === "InvoiceView") {
      return;
    }
    
    if (!isAuthenticated() && currentPageName !== "SystemLogin") {
      window.location.href = createPageUrl("SystemLogin");
      return;
    }

    // Verificar se temos os dados do usuário na sessão
    const userStr = sessionStorage.getItem("currentUser");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        handleLogout();
      }
    } 
    // Se não temos dados na sessão mas temos token, buscar da API
    else if (localStorage.getItem("auth_token")) {
      const fetchCurrentUser = async () => {
        try {
          const userData = await User.getCurrentUser();
          if (userData) {
            setCurrentUser(userData);
            sessionStorage.setItem("currentUser", JSON.stringify(userData));
            sessionStorage.setItem("isAuthenticated", "true");
          } else {
            // Se não conseguir obter dados do usuário, fazer logout
            handleLogout();
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          handleLogout();
        }
      };
      
      fetchCurrentUser();
    }

    if (["Settings", "Dashboard", "SystemLogin"].includes(currentPageName)) {
      const loadSystemConfig = async () => {
        try {
          const configs = await SystemConfig.list();
          if (configs.length > 0) {
            setSystemConfig(configs[0]);
          }
        } catch (error) {
          console.error("Erro ao carregar configurações:", error);
        }
      };

      loadSystemConfig();
    }
  }, [currentPageName]);

  const handleLogout = () => {
    // Limpar dados da sessão
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("isAuthenticated");
    
    // Limpar token da API
    localStorage.removeItem("auth_token");
    
    // Chamar função de logout da API se estiver disponível
    try {
      User.logout();
    } catch (error) {
      console.error("Erro ao fazer logout na API:", error);
    }
    
    // Redirecionar para a página de login
    window.location.href = createPageUrl("SystemLogin");
  };

  // Modificar a condição para não exigir login na página InvoiceView
  if (currentPageName === "SystemLogin" || currentPageName === "InvoiceView") {
    return <div><style>{themeStyles}</style>{children}</div>;
  }

  if (!isAuthenticated()) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <style>{themeStyles}</style>
        <div className="text-center">
          <p className="mb-4 text-gray-700">Você precisa fazer login para acessar esta página</p>
          <Button 
            onClick={() => window.location.href = createPageUrl("SystemLogin")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Ir para Login
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      page: "Dashboard", 
      module: null, 
      permission: null,
      iconColor: "text-purple-500"
    },
    { 
      icon: Building2, 
      label: "Clientes", 
      page: "Customers", 
      module: "customers", 
      permission: "view",
      iconColor: "text-blue-500"
    },
    { 
      icon: Network, 
      label: "Rede", 
      page: "Network", 
      module: "network", 
      permission: "view",
      iconColor: "text-indigo-500"
    },
    { 
      icon: Router, 
      label: "Nós de Rede", 
      page: "NetworkNodes", 
      module: "network", 
      permission: "manage",
      iconColor: "text-cyan-500"
    },
    { 
      icon: ServerCog, 
      label: "Integrações de Roteadores", 
      page: "RouterIntegration", 
      module: "network", 
      permission: "manage",
      iconColor: "text-emerald-500"
    },
    { 
      icon: PackageSearch, 
      label: "Planos", 
      page: "Plans", 
      module: null, 
      permission: null,
      iconColor: "text-yellow-500"
    },
    { 
      icon: Warehouse, 
      label: "Estoque", 
      page: "InventoryManager", 
      module: "inventory", 
      permission: "view",
      iconColor: "text-orange-500"
    },
    { 
      icon: Activity, 
      label: "Monitoramento", 
      page: "Monitoring", 
      module: "network", 
      permission: "view",
      iconColor: "text-rose-500"
    },
    { 
      icon: Wallet, 
      label: "Financeiro", 
      page: "FinancialManagement", 
      module: "financial", 
      permission: "view",
      iconColor: "text-emerald-600"
    },
    { 
      icon: Car, 
      label: "Consumo Combustível", 
      page: "FleetFuelMonitoring", 
      module: null, 
      permission: null,
      iconColor: "text-amber-600"
    },
    { 
      icon: MessagesSquare, 
      label: "Suporte", 
      page: "SupportTickets", 
      module: "support", 
      permission: "view",
      iconColor: "text-blue-600"
    },
    { 
      icon: BarChart3, 
      label: "Analytics", 
      page: "Analytics", 
      module: "reports", 
      permission: "view",
      iconColor: "text-violet-500"
    },
    { 
      icon: Cable, 
      label: "Rede FTTH", 
      page: "FTTHNetwork", 
      module: "ftth", 
      permission: "view",
      iconColor: "text-sky-500"
    },
    { 
      icon: WifiIcon, 
      label: "Conexões PPPoE", 
      page: "PPPoEConfiguration", 
      module: "network", 
      permission: "manage",
      iconColor: "text-cyan-600"
    },
    { 
      icon: FileText,
      label: "Contratos", 
      page: "Contracts", 
      module: "customers", 
      permission: "view",
      iconColor: "text-amber-500"
    },
    { 
      icon: Users,
      label: "Central do Cliente", 
      page: "CustomerPortal", 
      module: null, 
      permission: null,
      iconColor: "text-purple-600"
    },
    { 
      icon: FileText,
      label: "Documentação", 
      page: "Documentation", 
      module: null, 
      permission: null,
      iconColor: "text-green-600"
    },
    { 
      icon: UserIcon, 
      label: "Minha Conta", 
      page: "UserSettings", 
      module: null, 
      permission: null,
      iconColor: "text-slate-600"
    },
    { 
      icon: Settings, 
      label: "Configurações", 
      page: "Settings", 
      module: "settings", 
      permission: "view",
      iconColor: "text-gray-600"
    },
    { 
      icon: Terminal, 
      label: "Auto Instalador Ubuntu", 
      page: "UbuntuInstaller", 
      module: null, 
      permission: null,
      iconColor: "text-orange-600"
    }
  ].filter(item => 
    item.page !== "Users" && 
    item.page !== "AccessManagement" && 
    item.page !== "Billing"
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <style>{themeStyles}</style>
      
      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:relative md:translate-x-0
        `}
      >
        <div className="flex flex-col items-center justify-between p-4 border-b bg-white">
          <div className="flex flex-col items-center w-full">
            {systemConfig.company_logo_url ? (
              <img
                src={systemConfig.company_logo_url}
                alt="Logo"
                className="h-12 w-auto mb-2"
              />
            ) : (
              <h1 className="text-xl font-bold text-blue-600">ISP Manager</h1>
            )}
            {systemConfig.company_name && (
              <p className="text-sm text-gray-600 text-center">
                {systemConfig.company_name}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {currentUser && (
          <div className="p-4 border-b bg-gray-50">
            <p className="font-medium text-gray-800">{currentUser.full_name}</p>
            <p className="text-sm text-gray-500">{currentUser.role === "admin" ? "Administrador" : currentUser.role}</p>
          </div>
        )}

        <nav className="p-4 overflow-y-auto bg-white">
          {menuItems.map((item) => {
            if (currentUser?.role === 'admin' || (!item.module || !item.permission)) {
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ${
                    currentPageName === item.page 
                      ? "bg-blue-50 text-blue-600 font-medium" 
                      : ""
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                  {item.label}
                </Link>
              );
            }
            return (
              <PermissionCheck
                key={item.page}
                module={item.module}
                permission={item.permission}
                currentUserData={currentUser}
              >
                <Link
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ${
                    currentPageName === item.page 
                      ? "bg-blue-50 text-blue-600 font-medium" 
                      : ""
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                  {item.label}
                </Link>
              </PermissionCheck>
            );
          })}

          {isAuthenticated() && currentUser && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-x-auto">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          {isAuthenticated() && (
            <div className="md:hidden bg-white border-b px-4 py-3 flex justify-between items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          )}
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

