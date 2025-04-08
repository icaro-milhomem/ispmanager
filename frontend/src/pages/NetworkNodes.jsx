import React from "react";

export default function NetworkNodesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nós de Rede</h1>
        <p className="text-gray-500">Página em construção</p>
      </div>
      
      <div className="p-8 bg-white rounded-lg border shadow-sm">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Gerenciamento de Nós de Rede</h2>
          <p className="text-gray-500 mb-4">
            Esta página permite gerenciar os dispositivos da sua infraestrutura de rede,
            como roteadores, switches, ONUs e outros equipamentos.
          </p>
          
          <div className="p-4 bg-blue-50 text-blue-700 rounded-md inline-block">
            Funcionalidade em desenvolvimento
          </div>
        </div>
      </div>
    </div>
  );
} 