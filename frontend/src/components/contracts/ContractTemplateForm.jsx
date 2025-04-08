import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Info, Tag, Plus } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ContractTemplateForm({ 
  template, 
  onSubmit, 
  onCancel 
}) {
  const [formData, setFormData] = useState(
    template || {
      name: "",
      description: "",
      content: getDefaultTemplateContent(),
      status: "active",
      created_date: new Date().toISOString(),
      tags: [
        "nome", "cpf", "numero_contrato", "endereco", 
        "telefone", "email", "plano", "valor_plano", 
        "data_instalacao", "data_atual"
      ],
      version: "1.0"
    }
  );

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const insertTag = (tag) => {
    const tagText = `{${tag}}`;
    handleChange('content', formData.content + tagText);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          {template ? "Editar Modelo de Contrato" : "Novo Modelo de Contrato"}
        </CardTitle>
        <CardDescription>
          Crie ou edite um modelo de contrato com campos dinâmicos
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Modelo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                placeholder="Ex: Contrato de Prestação de Serviços Padrão"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Versão</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => handleChange("version", e.target.value)}
                required
                placeholder="Ex: 1.0"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Detalhes sobre o modelo de contrato e sua aplicação"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="content">Conteúdo do Contrato</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Info className="h-4 w-4" />
                    Ajuda
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">Campos Dinâmicos</h4>
                    <p className="text-sm text-gray-500">
                      Use os campos dinâmicos abaixo para inserir dados do cliente automaticamente no contrato.
                    </p>
                    <div className="space-y-1 pt-2">
                      <div className="text-xs font-medium text-gray-500">EXEMPLOS:</div>
                      <div className="text-sm">
                        <code className="bg-gray-100 px-1 py-0.5 rounded">{'{nome}'}</code> - Nome completo do cliente
                      </div>
                      <div className="text-sm">
                        <code className="bg-gray-100 px-1 py-0.5 rounded">{'{cpf}'}</code> - CPF do cliente
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => insertTag('nome')}
                className="h-7 gap-1"
              >
                <Tag className="h-3 w-3" />
                nome
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => insertTag('cpf')}
                className="h-7 gap-1"
              >
                <Tag className="h-3 w-3" />
                cpf
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => insertTag('numero_contrato')}
                className="h-7 gap-1"
              >
                <Tag className="h-3 w-3" />
                numero_contrato
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => insertTag('endereco')}
                className="h-7 gap-1"
              >
                <Tag className="h-3 w-3" />
                endereco
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => insertTag('telefone')}
                className="h-7 gap-1"
              >
                <Tag className="h-3 w-3" />
                telefone
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => insertTag('email')}
                className="h-7 gap-1"
              >
                <Tag className="h-3 w-3" />
                email
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => insertTag('plano')}
                className="h-7 gap-1"
              >
                <Tag className="h-3 w-3" />
                plano
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => insertTag('valor_plano')}
                className="h-7 gap-1"
              >
                <Tag className="h-3 w-3" />
                valor_plano
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => insertTag('data_instalacao')}
                className="h-7 gap-1"
              >
                <Tag className="h-3 w-3" />
                data_instalacao
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => insertTag('data_atual')}
                className="h-7 gap-1"
              >
                <Tag className="h-3 w-3" />
                data_atual
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => insertTag('equipamento_mac')}
                className="h-7 gap-1"
              >
                <Tag className="h-3 w-3" />
                equipamento_mac
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => insertTag('ip_address')}
                className="h-7 gap-1"
              >
                <Tag className="h-3 w-3" />
                ip_address
              </Button>
            </div>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              required
              className="font-mono text-sm min-h-[400px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600">
            {template ? "Atualizar Modelo" : "Criar Modelo"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function getDefaultTemplateContent() {
  return `<h2 style="text-align: center; margin-bottom: 20px;"><strong>CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE INTERNET</strong></h2>

<p><strong>CONTRATO Nº:</strong> {numero_contrato}</p>

<p><strong>CONTRATADA:</strong> EXEMPLO PROVEDOR DE INTERNET LTDA, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o n° 00.000.000/0001-00, com sede na Rua Exemplo, n° 123, na cidade de Exemplo, Estado de Exemplo, doravante denominada CONTRATADA.</p>

<p><strong>CONTRATANTE:</strong> {nome}, pessoa física inscrita no CPF sob o n° {cpf}, residente e domiciliado na {endereco}, telefone {telefone}, e-mail {email}, doravante denominado CONTRATANTE.</p>

<p>Pelo presente instrumento particular, as partes acima qualificadas têm entre si, justo e contratado, o seguinte:</p>

<h3><strong>CLÁUSULA PRIMEIRA - DO OBJETO</strong></h3>

<p>1.1. O presente contrato tem por objeto a prestação de serviços de conexão à Internet, através do fornecimento de acesso dedicado e contínuo à rede mundial de computadores, pela CONTRATADA ao CONTRATANTE, mediante o pagamento de mensalidade, conforme plano contratado.</p>

<h3><strong>CLÁUSULA SEGUNDA - DO PLANO E VALORES</strong></h3>

<p>2.1. O CONTRATANTE contratou o serviço {plano}, pelo valor mensal de {valor_plano}, com as seguintes características:</p>
<p>- Velocidade de Download: conforme plano contratado<br>
- Velocidade de Upload: conforme plano contratado<br>
- Endereço IP: {ip_address}<br>
- Equipamento: {equipamento_mac}</p>

<h3><strong>CLÁUSULA TERCEIRA - DAS OBRIGAÇÕES DA CONTRATADA</strong></h3>

<p>3.1. Prestar o serviço de acesso à Internet conforme condições estabelecidas neste contrato.<br>
3.2. Garantir a qualidade do serviço prestado.<br>
3.3. Fornecer suporte técnico ao CONTRATANTE.</p>

<h3><strong>CLÁUSULA QUARTA - DAS OBRIGAÇÕES DO CONTRATANTE</strong></h3>

<p>4.1. Efetuar os pagamentos nas datas de vencimento.<br>
4.2. Utilizar adequadamente o serviço, equipamentos e redes de telecomunicações.<br>
4.3. Manter atualizados seus dados cadastrais.</p>

<h3><strong>CLÁUSULA QUINTA - DA VIGÊNCIA</strong></h3>

<p>5.1. O presente contrato tem vigência de 12 (doze) meses, contados a partir da data de instalação do serviço, que ocorreu em {data_instalacao}.</p>

<h3><strong>CLÁUSULA SEXTA - DISPOSIÇÕES GERAIS</strong></h3>

<p>6.1. Este contrato substitui e revoga todos os entendimentos verbais ou escritos havidos anteriormente entre as partes.<br>
6.2. As partes elegem o foro da Comarca de Exemplo, para dirimir quaisquer controvérsias oriundas deste contrato.</p>

<p style="margin-top: 40px;">E por estarem assim justos e contratados, firmam o presente instrumento em 02 (duas) vias de igual teor.</p>

<p style="margin-top: 20px;">[Local], {data_atual}.</p>

<div style="display: flex; justify-content: space-between; margin-top: 60px;">
  <div style="width: 45%; text-align: center;">
    <p>__________________________________</p>
    <p>CONTRATADA</p>
  </div>
  <div style="width: 45%; text-align: center;">
    <p>__________________________________</p>
    <p>CONTRATANTE: {nome}</p>
  </div>
</div>`;
}