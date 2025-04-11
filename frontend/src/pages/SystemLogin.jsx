import React, { useState, useEffect } from "react";
import { Auth } from "../api/entities";
import { SystemConfigClient } from "../api/systemConfigClient";

export default function SystemLoginPage() {
  console.log("SystemLogin component is rendering");
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [configLoading, setConfigLoading] = useState(true);
  const [systemConfig, setSystemConfig] = useState({
    company_name: "ISP Manager",
    company_logo_url: "",
    login_background_color: "#f9fafb",
    login_text_color: "#1f2937",
    login_button_color: "#2563eb"
  });

  useEffect(() => {
    console.log("SystemLogin useEffect running");
    document.title = "Login - ISP Manager";
    
    // Carregar configurações do sistema
    const loadSystemConfig = async () => {
      try {
        setConfigLoading(true);
        const configs = await SystemConfigClient.list();
        console.log("Configurações carregadas:", configs);
        
        if (configs && Array.isArray(configs) && configs.length > 0) {
          const config = configs[0];
          setSystemConfig(prevConfig => ({
            ...prevConfig,
            company_name: config.company_name || "ISP Manager",
            company_logo_url: config.company_logo_url || "",
            login_background_color: config.login_background_color || "#f9fafb",
            login_text_color: config.login_text_color || "#1f2937",
            login_button_color: config.login_button_color || "#2563eb"
          }));
          console.log("Configurações aplicadas na tela de login:", config);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setConfigLoading(false);
      }
    };
    
    loadSystemConfig();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (loading) return;
    
    setLoading(true);

    try {
      console.log("Tentando login com:", { email: loginForm.email });
      
      // Usar a API real para login
      const response = await Auth.login(loginForm.email, loginForm.password);
      console.log("Resposta do servidor de login:", response);
      
      // Verificamos se temos uma resposta com token e usuário
      if (!response || !response.token || !response.user) {
        console.error("Resposta inválida:", response);
        throw new Error("Resposta inválida do servidor");
      }

      // Sessão do usuário
      const userData = {
        id: response.user.id,
        full_name: response.user.name,
        email: response.user.email,
        role: response.user.role
      };
      console.log("Dados do usuário para armazenar:", userData);

      // Armazenar os dados do usuário em sessionStorage para o layout usar
      sessionStorage.setItem("currentUser", JSON.stringify(userData));
      sessionStorage.setItem("isAuthenticated", "true");
      
      // Armazenar token para requisições autenticadas
      localStorage.setItem("auth_token", response.token);
      console.log("Token salvo com sucesso, redirecionando...")

      // Redirecionar para o dashboard
      window.location.href = "/";

    } catch (error) {
      console.error("Erro no login:", error);
      
      // Tentar fallback para modo local se a API falhar
      try {
        // Verificar se temos usuários locais
        const usersStr = localStorage.getItem('local_users');
        const users = usersStr ? JSON.parse(usersStr) : [];

        // Adicionar usuário de teste se não existir
        if (users.length === 0) {
          const testUser = {
            id: "test_user",
            name: "Admin",
            email: "admin@teste.com",
            password: "senha123",
            role: "admin",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('local_users', JSON.stringify([testUser]));
        }

        const updatedUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
        const user = updatedUsers.find(u => 
          u.email.toLowerCase() === loginForm.email.toLowerCase() && 
          u.password === loginForm.password
        );

        if (user) {
          const userData = {
            id: user.id,
            full_name: user.name,
            email: user.email,
            role: user.role
          };

          sessionStorage.setItem("currentUser", JSON.stringify(userData));
          sessionStorage.setItem("isAuthenticated", "true");

          alert("Login realizado com sucesso (modo local)");
          window.location.href = "/";
          return;
        }
      } catch (fallbackError) {
        console.error("Erro no fallback local:", fallbackError);
      }

      setError("Email ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  console.log("SystemLogin rendering login form");
  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: systemConfig.login_background_color }}
    >
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <div className="text-center mb-6">
          {systemConfig.company_logo_url && (
            <div className="flex justify-center mb-4">
              <img 
                src={systemConfig.company_logo_url} 
                alt="Logo" 
                className="h-16 w-auto"
              />
            </div>
          )}
          <h1 
            className="text-xl font-bold"
            style={{ color: systemConfig.login_text_color }}
          >
            {systemConfig.company_name} - Login
          </h1>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium"
              style={{ color: systemConfig.login_text_color }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              placeholder="Digite seu email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium"
              style={{ color: systemConfig.login_text_color }}
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="Digite sua senha"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-2 px-4 rounded-md text-white font-medium"
            style={{ backgroundColor: systemConfig.login_button_color }}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          
          <div className="text-sm text-center text-gray-500 mt-4">
            <p>API: {import.meta.env.VITE_API_BASE_URL || "Não configurada"}</p>
            <p>Usuário padrão: admin@teste.com</p>
            <p>Senha padrão: senha123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
