import React, { useRef, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Check, Edit2, Save, X } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function DigitalSignature({ 
  onSign, 
  onCancel, 
  customerName, 
  contractId,
  customerEmail
}) {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState('draw'); // 'draw' ou 'type'
  const [typedSignature, setTypedSignature] = useState('');
  const [deviceInfo, setDeviceInfo] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Configurar canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = 150;
      
      const context = canvas.getContext('2d');
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.strokeStyle = '#000';
      setCtx(context);
    }
    
    // Coletar informações do dispositivo
    const collectDeviceInfo = () => {
      try {
        const deviceInfo = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timestamp: new Date().toISOString()
        };
        setDeviceInfo(JSON.stringify(deviceInfo));
      } catch (err) {
        console.error("Erro ao coletar informações do dispositivo:", err);
        setDeviceInfo(JSON.stringify({ error: "Não foi possível coletar informações do dispositivo" }));
      }
    };
    
    // Obter IP do usuário
    const getIpAddress = async () => {
      try {
        // Utilizamos uma API pública para obter o IP
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setIpAddress(data.ip);
      } catch (err) {
        console.error("Erro ao obter endereço IP:", err);
        setIpAddress('desconhecido');
      }
    };
    
    collectDeviceInfo();
    getIpAddress();
  }, [canvasRef]);

  const startDrawing = (e) => {
    if (!ctx) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (ctx) {
      ctx.closePath();
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!ctx) return;
    
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = () => {
    if (!agreementChecked) {
      setError('É necessário aceitar os termos do contrato para prosseguir.');
      return;
    }
    
    if (signatureMethod === 'draw' && !hasSignature) {
      setError('Por favor, forneça sua assinatura antes de continuar.');
      return;
    }
    
    if (signatureMethod === 'type' && !typedSignature.trim()) {
      setError('Por favor, digite seu nome completo antes de continuar.');
      return;
    }
    
    let signatureData;
    
    if (signatureMethod === 'draw') {
      signatureData = canvasRef.current.toDataURL('image/png');
    } else {
      signatureData = typedSignature;
    }
    
    onSign({
      signatureData,
      signatureMethod,
      signature_date: new Date().toISOString(),
      contract_id: contractId,
      customer_id: customerName,
      ip_address: ipAddress,
      device_info: deviceInfo
    });
  };
  
  const handleToggleAgreement = (checked) => {
    setAgreementChecked(checked);
    if (checked) {
      setError('');
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Assinatura Digital</CardTitle>
        <CardDescription>
          Assine o documento para formalizar o contrato
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <div className="flex space-x-4">
            <Button
              type="button"
              variant={signatureMethod === 'draw' ? 'default' : 'outline'}
              onClick={() => setSignatureMethod('draw')}
              className="flex-1"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Desenhar assinatura
            </Button>
            <Button
              type="button"
              variant={signatureMethod === 'type' ? 'default' : 'outline'}
              onClick={() => setSignatureMethod('type')}
              className="flex-1"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Digitar assinatura
            </Button>
          </div>
        </div>
        
        {signatureMethod === 'draw' ? (
          <div className="space-y-2">
            <Label>Desenhe sua assinatura abaixo:</Label>
            <div className="border border-gray-300 rounded-md">
              <canvas
                ref={canvasRef}
                className="w-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
              className="mt-2"
            >
              Limpar
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="typedSignature">Digite seu nome completo como assinatura:</Label>
            <Input
              id="typedSignature"
              value={typedSignature}
              onChange={(e) => setTypedSignature(e.target.value)}
              placeholder={customerName || "Nome completo"}
            />
            <p className="text-sm text-gray-500">
              Seu nome digitado será usado como assinatura no documento.
            </p>
          </div>
        )}
        
        <div className="flex items-start space-x-2 border-t pt-4">
          <Checkbox
            id="agreement"
            checked={agreementChecked}
            onCheckedChange={handleToggleAgreement}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="agreement"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Aceito os termos do contrato
            </label>
            <p className="text-sm text-gray-500">
              Ao marcar esta caixa, declaro que li e aceito os termos e condições descritos neste contrato.
              Esta assinatura digital tem valor legal conforme a legislação brasileira.
            </p>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 border-t pt-4">
          <p className="font-medium mb-1">Informações adicionais de segurança:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Uma cópia deste contrato assinado será enviada para {customerEmail || "seu e-mail cadastrado"}.</li>
            <li>Sua assinatura será registrada com data, hora e IP para segurança.</li>
            <li>O contrato terá validade jurídica conforme a Lei 14.063/2020 e MP 2.200-2/2001.</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>
          Assinar Documento
        </Button>
      </CardFooter>
    </Card>
  );
}