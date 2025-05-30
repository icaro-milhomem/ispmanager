import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

// Importação das páginas principais
import SystemLogin from "./pages/SystemLogin"
import Layout from "./pages/Layout"
import Dashboard from "./pages/Dashboard"

// Importação de páginas existentes
import Customers from "./pages/Customers"
import Network from "./pages/Network"
import NetworkNodes from "./pages/NetworkNodes"
import RouterIntegration from "./pages/RouterIntegration"
import Plans from "./pages/Plans"
import InventoryManager from "./pages/InventoryManager"
import Monitoring from "./pages/Monitoring"
import FinancialManagement from "./pages/FinancialManagement"
import FleetFuelMonitoring from "./pages/FleetFuelMonitoring"
import SupportTickets from "./pages/SupportTickets"
import Analytics from "./pages/Analytics"
import FTTHNetwork from "./pages/FTTHNetwork"
import PPPoEConfiguration from "./pages/PPPoEConfiguration"
import Contracts from "./pages/Contracts"
import CustomerPortal from "./pages/CustomerPortal"
import Documentation from "./pages/Documentation"
import UserSettings from "./pages/UserSettings"
import Settings from "./pages/Settings"
import UbuntuInstaller from "./pages/UbuntuInstaller"
import BillingManagement from "./pages/BillingManagement"
import RecurringBilling from "./pages/RecurringBilling"
import PaymentProcessing from "./pages/PaymentProcessing"

// Componente para páginas não implementadas
function PageNotImplemented() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Página em Desenvolvimento</h1>
      <p className="text-gray-600 mb-6">Esta página ainda está sendo implementada.</p>
      <p className="text-gray-600">Volte para o Dashboard para continuar navegando no sistema.</p>
    </div>
  )
}

// Versão simples do app para depuração
function App() {
  // Verificar e limpar dados antigos no localStorage se necessário
  useEffect(() => {
    try {
      // Limpar dados antigos se forem de uma versão diferente
      const appVersion = "1.0.1"; // Incrementar esta versão quando houver mudanças no formato dos dados
      const savedVersion = localStorage.getItem('app_version');
      
      if (savedVersion !== appVersion) {
        console.log(`Detectada nova versão do app: ${appVersion} (anterior: ${savedVersion || 'nenhuma'})`);
        console.log("Limpando localStorage para evitar problemas de compatibilidade");
        
        // Remover apenas as chaves relacionadas às configurações
        localStorage.removeItem('system_config');
        localStorage.removeItem('system-config-data');
        localStorage.removeItem('system-config-last-update');
        
        // Atualizar versão
        localStorage.setItem('app_version', appVersion);
      }
    } catch (error) {
      console.error("Erro ao verificar versão do app:", error);
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/systemlogin" element={<SystemLogin />} />
        <Route path="/SystemLogin" element={<SystemLogin />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          
          {/* Rotas para componentes existentes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/Customers" element={<Customers />} />
          <Route path="/network" element={<Network />} />
          <Route path="/Network" element={<Network />} />
          <Route path="/network-nodes" element={<NetworkNodes />} />
          <Route path="/NetworkNodes" element={<NetworkNodes />} />
          <Route path="/router-integration" element={<RouterIntegration />} />
          <Route path="/RouterIntegration" element={<RouterIntegration />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/Plans" element={<Plans />} />
          <Route path="/inventory-manager" element={<InventoryManager />} />
          <Route path="/InventoryManager" element={<InventoryManager />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/Monitoring" element={<Monitoring />} />
          <Route path="/financial-management" element={<FinancialManagement />} />
          <Route path="/FinancialManagement" element={<FinancialManagement />} />
          <Route path="/fleet-fuel-monitoring" element={<FleetFuelMonitoring />} />
          <Route path="/FleetFuelMonitoring" element={<FleetFuelMonitoring />} />
          <Route path="/support-tickets" element={<SupportTickets />} />
          <Route path="/SupportTickets" element={<SupportTickets />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/Analytics" element={<Analytics />} />
          <Route path="/ftth-network" element={<FTTHNetwork />} />
          <Route path="/FTTHNetwork" element={<FTTHNetwork />} />
          <Route path="/pppoe-configuration" element={<PPPoEConfiguration />} />
          <Route path="/PPPoEConfiguration" element={<PPPoEConfiguration />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/Contracts" element={<Contracts />} />
          <Route path="/customer-portal" element={<CustomerPortal />} />
          <Route path="/CustomerPortal" element={<CustomerPortal />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/Documentation" element={<Documentation />} />
          <Route path="/user-settings" element={<UserSettings />} />
          <Route path="/UserSettings" element={<UserSettings />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/Settings" element={<Settings />} />
          <Route path="/ubuntu-installer" element={<UbuntuInstaller />} />
          <Route path="/UbuntuInstaller" element={<UbuntuInstaller />} />
          <Route path="/billing" element={<BillingManagement />} />
          <Route path="/BillingManagement" element={<BillingManagement />} />
          <Route path="/recurring-billing" element={<RecurringBilling />} />
          <Route path="/RecurringBilling" element={<RecurringBilling />} />
          <Route path="/payment-processing" element={<PaymentProcessing />} />
          <Route path="/PaymentProcessing" element={<PaymentProcessing />} />
          
          {/* Rota para capturar qualquer outro caminho não definido */}
          <Route path="*" element={<PageNotImplemented />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App 