import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DigitalSignature } from "@/api/entities";
import { Contract } from "@/api/entities";
import { UploadFile, InvokeLLM } from "@/api/integrations";
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Send, 
  CheckCircle,
  Edit,
  Copy,
  Printer,
  Share
} from "lucide-react";

export default function ContractViewAndGenerate({ 
  contract, 
  customer, 
  template, 
  onBack, 
  onUpdate 
}) {
  const [processedContent, setProcessedContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(contract?.pdf_url || "");
  const [activeTab, setActiveTab] = useState("preview");
  const [showSignature, setShowSignature] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [status, setStatus] = useState(contract?.status || "draft");

  useEffect(() => {
    if (template && customer) {
      processTemplate();
    }
  }, [template, customer]);

  const processTemplate = async () => {
    setIsProcessing(true);
    try {
      // Obter conteúdo do template
      let content = template.content || "";
      
      // Lista de tags disponíveis e seus valores correspondentes
      const replacementTags = {
        "{nome}": customer.full_name || "",
        "{cpf}": customer.cpf || "",
        "{numero_contrato}": contract.contract_number || "",
        "{endereco}": customer.address || "",
        "{telefone}": customer.phone || "",
        "{email}": customer.email || "",
        "{plano}": getPlanName(customer.plan) || "",
        "{valor_plano}": getPlanValue(customer.plan) || "",
        "{data_instalacao}": formatDate(customer.installation_date) || "",
        "{data_atual}": formatDate(new Date().toISOString()) || "",
        "{equipamento_mac}": customer.equipment_mac || "",
        "{ip_address}": customer.ip_address || ""
      };

      // Substituir todas as tags
      Object.keys(replacementTags).forEach(tag => {
        const regex = new RegExp(tag, 'g');
        content = content.replace(regex, replacementTags[tag]);
      });

      // Atualizar campos personalizados do contrato se houver
      if (contract.custom_fields) {
        Object.keys(contract.custom_fields).forEach(field => {
          const tag = `{${field}}`;
          const regex = new RegExp(tag, 'g');
          content = content.replace(regex, contract.custom_fields[field] || "");
        });
      }

      setProcessedContent(content);
    } catch (error) {
      console.error("Erro ao processar template:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // Usando a integração para gerar o PDF com o conteúdo processado
      const result = await InvokeLLM({
        prompt: `Gere um PDF de contrato com o seguinte conteúdo HTML. Use formatação profissional e adequada para um contrato legal: ${processedContent}`,
        response_json_schema: {
          type: "object",
          properties: {
            pdf_base64: { type: "string" }
          }
        }
      });

      if (result && result.pdf_base64) {
        // Converter base64 para blob e fazer upload
        const pdfBlob = base64ToBlob(result.pdf_base64, "application/pdf");
        const file = new File([pdfBlob], `contrato_${contract.contract_number}.pdf`, { type: "application/pdf" });
        
        const uploadResult = await UploadFile({ file });
        
        if (uploadResult && uploadResult.file_url) {
          setPdfUrl(uploadResult.file_url);
          
          // Atualizar contrato com URL do PDF
          await Contract.update(contract.id, {
            ...contract,
            pdf_url: uploadResult.file_url
          });
          
          if (onUpdate) onUpdate();
        }
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSignature = async (signatureData) => {
    setSignatureData(signatureData);
    setShowSignature(false);
    
    try {
      // Atualizar status do contrato para ativo
      await Contract.update(contract.id, {
        ...contract,
        status: "active",
        signed_date: new Date().toISOString()
      });
      
      // Salvar dados da assinatura
      await DigitalSignature.create({
        contract_id: contract.id,
        customer_id: customer.id,
        signature_data: signatureData.signatureData,
        signature_method: signatureData.signatureMethod,
        signature_date: signatureData.timestamp
      });
      
      setStatus("active");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Erro ao salvar assinatura:", error);
    }
  };

  // Função auxiliar para converter base64 para blob
  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  };

  // Funções auxiliares para formatação
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateString;
    }
  };

  const getPlanName = (planCode) => {
    const plans = {
      "basic": "Plano Básico",
      "standard": "Plano Padrão",
      "premium": "Plano Premium",
      "enterprise": "Plano Empresarial"
    };
    return plans[planCode] || planCode;
  };

  const getPlanValue = (planCode) => {
    const planValues = {
      "basic": "R$ 99,90",
      "standard": "R$ 149,90",
      "premium": "R$ 199,90",
      "enterprise": "R$ 299,90"
    };
    return planValues[planCode] || "";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Contrato: {contract.contract_number}
            </CardTitle>
            <CardDescription>
              Cliente: {customer?.full_name}, Modelo: {template?.name}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={
              status === "draft" ? "bg-yellow-100 text-yellow-800" :
              status === "active" ? "bg-green-100 text-green-800" :
              status === "expired" ? "bg-gray-100 text-gray-800" :
              "bg-red-100 text-red-800"
            }>
              {status === "draft" ? "Rascunho" :
               status === "active" ? "Ativo" :
               status === "expired" ? "Expirado" :
               "Cancelado"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">Visualizar</TabsTrigger>
            {pdfUrl && <TabsTrigger value="pdf">PDF</TabsTrigger>}
          </TabsList>
        </div>
        
        <TabsContent value="preview" className="px-6 py-4">
          {isProcessing ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Processando contrato...</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="border rounded-lg p-6 bg-white min-h-[60vh] whitespace-pre-wrap">
                <div dangerouslySetInnerHTML={{ __html: processedContent }} />
              </div>
              
              {signatureData && (
                <div className="mt-4 border rounded-lg p-4 bg-green-50">
                  <h3 className="text-sm font-medium flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    Contrato Assinado
                  </h3>
                  <p className="text-xs text-green-700 mt-1">
                    Assinado por {customer?.full_name} em {formatDate(signatureData.timestamp)}
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pdf" className="px-6 py-4">
          {pdfUrl ? (
            <div className="flex flex-col items-center">
              <iframe 
                src={pdfUrl} 
                className="w-full border rounded-lg"
                style={{ height: "70vh" }}
                title={`Contrato ${contract.contract_number}`}
              />
              <div className="flex justify-center gap-2 mt-4">
                <Button asChild variant="outline" className="gap-2">
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </a>
                </Button>
                <Button asChild className="gap-2">
                  <a href={pdfUrl} download={`contrato_${contract.contract_number}.pdf`}>
                    <Download className="h-4 w-4" />
                    Baixar PDF
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">PDF não disponível. Gere um PDF primeiro.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between border-t p-6 bg-gray-50">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex gap-2">
          {!pdfUrl && (
            <Button 
              disabled={isGeneratingPdf || isProcessing}
              onClick={generatePdf}
              className="gap-2"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando PDF...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Gerar PDF
                </>
              )}
            </Button>
          )}
          
          {pdfUrl && status === "draft" && !showSignature && !signatureData && (
            <Button 
              onClick={() => setShowSignature(true)}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Edit className="h-4 w-4" />
              Assinar Contrato
            </Button>
          )}
          
          {(status === "active" || signatureData) && !showSignature && (
            <Button 
              asChild
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <a href={pdfUrl} download={`contrato_${contract.contract_number}.pdf`}>
                <Download className="h-4 w-4" />
                Baixar Contrato Assinado
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
      
      {showSignature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-3xl mx-4">
            <DigitalSignature 
              onSign={handleSignature}
              onCancel={() => setShowSignature(false)}
              customerName={customer?.full_name}
              contractId={contract.id}
            />
          </div>
        </div>
      )}
    </Card>
  );
}