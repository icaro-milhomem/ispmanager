import React, { useState, useEffect } from "react";

export default function ApiConnectionTest() {
  const [apiStatus, setApiStatus] = useState('pending');
  const [apiMessage, setApiMessage] = useState('');
  const [dbStatus, setDbStatus] = useState('pending');
  const [dbMessage, setDbMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    setIsLoading(true);
    setApiStatus('pending');
    setDbStatus('pending');
    
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      console.log('Testando conexão com API:', apiUrl);
      
      // Teste de API
      const apiResponse = await fetch(`${apiUrl}/api/health`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        setApiStatus('success');
        setApiMessage(`API conectada com sucesso! Versão: ${data.version || 'desconhecida'}`);
        
        // Se API está ok, verificamos o status do banco
        setDbStatus(data.database?.connected ? 'success' : 'error');
        setDbMessage(data.database?.connected 
          ? `Banco de dados conectado: ${data.database.name || 'PostgreSQL'}`
          : 'Falha na conexão com o banco de dados');
      } else {
        setApiStatus('error');
        setApiMessage(`Erro na conexão: ${apiResponse.status} ${apiResponse.statusText}`);
        setDbStatus('error');
        setDbMessage('Não foi possível verificar a conexão com o banco de dados');
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setApiStatus('error');
      setApiMessage(`Falha na conexão: ${error.message}. Verifique se o servidor backend está rodando.`);
      setDbStatus('error');
      setDbMessage('Não foi possível verificar a conexão com o banco de dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Testar a conexão quando o componente é montado
    testApiConnection();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return "✅";
      case 'error':
        return "❌";
      case 'pending':
      default:
        return isLoading ? "🔄" : "⏳";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white shadow rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1">Teste de Conexão</h2>
        <p className="text-sm text-gray-600">Verificação da conexão com a API e banco de dados</p>
      </div>
      
      <div className="space-y-4 mb-4">
        <div className="p-3 border rounded">
          <div className="flex items-center gap-2 mb-2">
            <span>API Backend</span>
            <span>{getStatusIcon(apiStatus)}</span>
          </div>
          
          {apiStatus !== 'pending' && (
            <div className={`p-2 rounded text-sm ${apiStatus === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-medium">{apiStatus === 'success' ? 'Conectado' : 'Erro de Conexão'}</p>
              <p>{apiMessage}</p>
            </div>
          )}
        </div>
        
        <div className="p-3 border rounded">
          <div className="flex items-center gap-2 mb-2">
            <span>Banco de Dados</span>
            <span>{getStatusIcon(dbStatus)}</span>
          </div>
          
          {dbStatus !== 'pending' && (
            <div className={`p-2 rounded text-sm ${dbStatus === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-medium">{dbStatus === 'success' ? 'Conectado' : 'Erro de Conexão'}</p>
              <p>{dbMessage}</p>
            </div>
          )}
        </div>
      </div>
      
      <button 
        onClick={testApiConnection} 
        disabled={isLoading}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? "Verificando..." : "Testar Novamente"}
      </button>
    </div>
  );
} 