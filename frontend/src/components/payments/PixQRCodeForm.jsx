import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Copy, QrCode, AlertCircle, ClipboardCopy, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InvokeLLM } from "@/api/integrations";

export default function PixQRCodeForm({ onSubmit, amount, isProcessing, invoice, customer }) {
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixCopied, setPixCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    generatePixQRCode();
  }, [amount, invoice]);
  
  const generatePixQRCode = async () => {
    setLoading(true);
    try {
      // Usar LLM para simular geração de QR Code e chave PIX
      const result = await InvokeLLM({
        prompt: `Simule uma API que gera QR Code PIX para pagamento de R$${amount.toFixed(2)}. 
                Retorne uma URL de imagem para QR code (use https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX) 
                e uma chave PIX aleatória no formato copia e cola. Use apenas dados gerados, não inclua código HTML.`,
        response_json_schema: {
          type: "object",
          properties: {
            qr_code_url: { type: "string" },
            pix_key: { type: "string" }
          }
        }
      });
      
      if (result) {
        setQrCodeImage(result.qr_code_url);
        setPixKey(result.pix_key);
      }
    } catch (error) {
      console.error("Erro ao gerar QR Code PIX:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };
  
  const handleCheckPayment = () => {
    onSubmit({
      payment_method: 'pix',
      pix_key: pixKey
    });
  };
  
  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border border-blue-100">
        <QrCode className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Escaneie o QR Code ou copie a chave PIX para pagar.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 flex flex-col items-center justify-center">
          {loading ? (
            <div className="p-10 flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-4" />
              <p className="text-gray-500">Gerando QR Code PIX...</p>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 border rounded-md shadow-sm">
                <img 
                  src={qrCodeImage} 
                  alt="QR Code PIX" 
                  className="w-48 h-48"
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Escaneie o código QR com o aplicativo do seu banco
              </p>
            </>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="font-medium mb-1">PIX Copia e Cola</p>
            <div className="flex">
              <div className="flex-1 bg-gray-50 border rounded-l-md p-3 text-sm font-mono overflow-x-auto whitespace-nowrap">
                {loading ? (
                  <div className="animate-pulse h-5 bg-gray-200 rounded w-full"></div>
                ) : (
                  pixKey
                )}
              </div>
              <Button 
                variant="outline" 
                className="rounded-l-none"
                onClick={copyPixKey}
                disabled={loading}
              >
                {pixCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <ClipboardCopy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Copie este código e cole no app do seu banco
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between mb-2">
              <span>Valor a pagar:</span>
              <span className="font-semibold">R$ {amount.toFixed(2)}</span>
            </div>
            {invoice && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Referência:</span>
                <span>Fatura #{invoice.id.substring(0, 8)}</span>
              </div>
            )}
            {customer && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Cliente:</span>
                <span>{customer.full_name}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleCheckPayment}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isProcessing || loading}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando pagamento...
                </>
              ) : (
                "Já realizei o pagamento"
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={generatePixQRCode}
              disabled={loading}
            >
              Gerar novo código
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            <p className="font-medium mb-1">Instruções:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abra o aplicativo do seu banco</li>
              <li>Escolha pagar via PIX com QR Code ou chave</li>
              <li>Escaneie o QR code ou cole a chave copiada</li>
              <li>Confirme os dados e finalize o pagamento</li>
              <li>Após o pagamento, clique em "Já realizei o pagamento"</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}