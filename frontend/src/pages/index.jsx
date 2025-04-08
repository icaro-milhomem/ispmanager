import Layout from "./Layout.jsx";

import Customers from "./Customers";

import Network from "./Network";

import Dashboard from "./Dashboard";

import Reports from "./Reports";

import Settings from "./Settings";

import Equipment from "./Equipment";

import SupportTickets from "./SupportTickets";

import NetworkMap from "./NetworkMap";

import Monitoring from "./Monitoring";

import CustomerPortal from "./CustomerPortal";

import Analytics from "./Analytics";

import FTTHNetwork from "./FTTHNetwork";

import Contracts from "./Contracts";

import PPPoEConfiguration from "./PPPoEConfiguration";

import BillingManagement from "./BillingManagement";

import PaymentProcessing from "./PaymentProcessing";

import SubscriptionManagement from "./SubscriptionManagement";

import InventoryManager from "./InventoryManager";

import Plans from "./Plans";

import Users from "./Users";

import UserRoles from "./UserRoles";

import UserSettings from "./UserSettings";

import AccessManagement from "./AccessManagement";

import FinancialManagement from "./FinancialManagement";

import SuppliersManagement from "./SuppliersManagement";

import UbuntuInstaller from "./UbuntuInstaller";

import FleetFuelMonitoring from "./FleetFuelMonitoring";

import RecurringBilling from "./RecurringBilling";

import RouterIntegration from "./RouterIntegration";

import SystemLogin from "./SystemLogin";

import Documentation from "./Documentation";

import InvoiceView from "./InvoiceView";

import Suppliers from "./Suppliers";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Customers: Customers,
    
    Network: Network,
    
    Dashboard: Dashboard,
    
    Reports: Reports,
    
    Settings: Settings,
    
    Equipment: Equipment,
    
    SupportTickets: SupportTickets,
    
    NetworkMap: NetworkMap,
    
    Monitoring: Monitoring,
    
    CustomerPortal: CustomerPortal,
    
    Analytics: Analytics,
    
    FTTHNetwork: FTTHNetwork,
    
    Contracts: Contracts,
    
    PPPoEConfiguration: PPPoEConfiguration,
    
    BillingManagement: BillingManagement,
    
    PaymentProcessing: PaymentProcessing,
    
    SubscriptionManagement: SubscriptionManagement,
    
    InventoryManager: InventoryManager,
    
    Plans: Plans,
    
    Users: Users,
    
    UserRoles: UserRoles,
    
    UserSettings: UserSettings,
    
    AccessManagement: AccessManagement,
    
    FinancialManagement: FinancialManagement,
    
    SuppliersManagement: SuppliersManagement,
    
    UbuntuInstaller: UbuntuInstaller,
    
    FleetFuelMonitoring: FleetFuelMonitoring,
    
    RecurringBilling: RecurringBilling,
    
    RouterIntegration: RouterIntegration,
    
    SystemLogin: SystemLogin,
    
    Documentation: Documentation,
    
    InvoiceView: InvoiceView,
    
    Suppliers: Suppliers,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Customers />} />
                
                
                <Route path="/Customers" element={<Customers />} />
                
                <Route path="/Network" element={<Network />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Equipment" element={<Equipment />} />
                
                <Route path="/SupportTickets" element={<SupportTickets />} />
                
                <Route path="/NetworkMap" element={<NetworkMap />} />
                
                <Route path="/Monitoring" element={<Monitoring />} />
                
                <Route path="/CustomerPortal" element={<CustomerPortal />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/FTTHNetwork" element={<FTTHNetwork />} />
                
                <Route path="/Contracts" element={<Contracts />} />
                
                <Route path="/PPPoEConfiguration" element={<PPPoEConfiguration />} />
                
                <Route path="/BillingManagement" element={<BillingManagement />} />
                
                <Route path="/PaymentProcessing" element={<PaymentProcessing />} />
                
                <Route path="/SubscriptionManagement" element={<SubscriptionManagement />} />
                
                <Route path="/InventoryManager" element={<InventoryManager />} />
                
                <Route path="/Plans" element={<Plans />} />
                
                <Route path="/Users" element={<Users />} />
                
                <Route path="/UserRoles" element={<UserRoles />} />
                
                <Route path="/UserSettings" element={<UserSettings />} />
                
                <Route path="/AccessManagement" element={<AccessManagement />} />
                
                <Route path="/FinancialManagement" element={<FinancialManagement />} />
                
                <Route path="/SuppliersManagement" element={<SuppliersManagement />} />
                
                <Route path="/UbuntuInstaller" element={<UbuntuInstaller />} />
                
                <Route path="/FleetFuelMonitoring" element={<FleetFuelMonitoring />} />
                
                <Route path="/RecurringBilling" element={<RecurringBilling />} />
                
                <Route path="/RouterIntegration" element={<RouterIntegration />} />
                
                <Route path="/SystemLogin" element={<SystemLogin />} />
                
                <Route path="/Documentation" element={<Documentation />} />
                
                <Route path="/InvoiceView" element={<InvoiceView />} />
                
                <Route path="/Suppliers" element={<Suppliers />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}