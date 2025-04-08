import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Printer } from "lucide-react";

export default function ContractGenerator({ customer, template }) {
  const [previewMode, setPreviewMode] = useState(false);
  
  if (!customer || !template) {
    return (
      <div className="text-center p-4 text-gray-500">
        Selecione um cliente e um modelo de contrato para continuar.
      </div>
    );
  }

  const replaceTags = (content) => {
    if (!content) return '';
    
    try {
      // Formatadores
      const formatCPF = (cpf) => {
        if (!cpf) return "";
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      };

      const formatCurrency = (value) => {
        if (!value) return "0,00";
        return parseFloat(value).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      };

      // Planos
      const planos = {
        basic: "Básico - 100MB",
        standard: "Padrão - 200MB",
        premium: "Premium - 400MB",
        enterprise: "Empresarial - 600MB"
      };

      // Valor padrão para plano
      const valorPlano = {
        basic: 89.90,
        standard: 99.90,
        premium: 129.90,
        enterprise: 199.90
      };

      // Endereço completo
      const enderecoCompleto = [
        customer.address,
        customer.address_number,
        customer.address_complement,
        customer.neighborhood,
        customer.city,
        customer.state
      ].filter(Boolean).join(', ');

      // Data atual formatada
      const dataAtual = new Date().toLocaleDateString('pt-BR');

      // Mapa de substituições
      const replacements = {
        '{nome}': customer.full_name || "",
        '{cpf}': formatCPF(customer.cpf) || "",
        '{endereco}': enderecoCompleto,
        '{telefone}': customer.phone || "",
        '{plano}': planos[customer.plan] || "Básico",
        '{valor_plano}': formatCurrency(valorPlano[customer.plan]),
        '{cidade}': customer.city || "",
        '{data_atual}': dataAtual
      };

      // Substituir todas as tags
      let finalContent = content;
      Object.entries(replacements).forEach(([tag, value]) => {
        finalContent = finalContent.replace(new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
      });

      return finalContent;
    } catch (error) {
      console.error('Erro ao processar tags do contrato:', error);
      return 'Erro ao gerar contrato';
    }
  };

  const handlePrint = () => {
    try {
      const contractContent = replaceTags(template.content);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Não foi possível abrir a janela de impressão. Verifique se o seu navegador está bloqueando popups.");
        return;
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Contrato de Prestação de Serviços</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              pre {
                white-space: pre-wrap;
                font-family: Arial, sans-serif;
                line-height: 1.6;
              }
              @media print {
                body {
                  padding: 20px;
                }
                button {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <button onclick="window.print()" style="position: fixed; top: 20px; right: 20px; padding: 8px 16px; background: #4a6bef; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Imprimir
            </button>
            <pre>${contractContent}</pre>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (error) {
      console.error('Erro ao imprimir contrato:', error);
      alert('Ocorreu um erro ao gerar a visualização de impressão. Tente novamente.');
    }
  };

  const contractContent = replaceTags(template.content);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button 
          variant={previewMode ? "default" : "outline"} 
          onClick={() => setPreviewMode(!previewMode)}
        >
          <Eye className="w-4 h-4 mr-2" />
          {previewMode ? "Ocultar Prévia" : "Visualizar Contrato"}
        </Button>
        
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
      </div>
      
      {previewMode ? (
        <Card>
          <CardContent className="p-6">
            <div className="bg-white border rounded-md p-6 whitespace-pre-wrap font-sans text-sm leading-relaxed max-h-[600px] overflow-y-auto">
              {contractContent}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="border bg-gray-50 rounded-md p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">Contrato pronto para visualização</h3>
          <p className="text-gray-500 mt-2">
            Clique em "Visualizar Contrato" para ver o documento preenchido com os dados do cliente.
          </p>
        </div>
      )}
    </div>
  );
}