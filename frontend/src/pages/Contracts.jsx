
import React, { useState, useEffect } from 'react';
import { Customer } from "@/api/entities";
import { Plan } from "@/api/entities";
import { ContractTemplate } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Printer, Search, FileText, AlertCircle } from "lucide-react";

export default function ContractsPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [contractContent, setContractContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPlans, setAllPlans] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const customersData = await Customer.list();
        setCustomers(customersData);
        
        const plansData = await Plan.list();
        setAllPlans(plansData);
        
        const urlParams = new URLSearchParams(window.location.search);
        const customerId = urlParams.get('customer');
        
        if (customerId) {
          const customer = customersData.find(c => c.id === customerId);
          if (customer) {
            setSelectedCustomer(customer);
            generateContract(customer, plansData);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Erro ao carregar dados dos clientes.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    generateContract(customer, allPlans);
  };

  const generateContract = async (customer, plans) => {
    if (!customer) return;
    
    try {
      console.log("Dados do cliente:", customer);
      
      const customerPlan = plans.find(p => p.code === customer.plan);
      console.log("Plano encontrado:", customerPlan);

      const formatCPF = (cpf) => {
        if (!cpf) return "";
        const cleanCPF = cpf.replace(/\D/g, '');
        if (cleanCPF.length !== 11) return cpf;
        return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      };

      const formatCurrency = (value) => {
        if (!value) return "";
        return value.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      };

      const enderecoPartes = [];
      if (customer.address) enderecoPartes.push(customer.address);
      if (customer.address_number) enderecoPartes.push(customer.address_number);
      if (customer.address_complement) enderecoPartes.push(customer.address_complement);
      if (customer.neighborhood) enderecoPartes.push(customer.neighborhood);
      if (customer.city) enderecoPartes.push(customer.city);
      if (customer.state) enderecoPartes.push(customer.state);
      
      const endereco = enderecoPartes.join(', ');
      const dataAtual = new Date().toLocaleDateString('pt-BR');

      const template = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE INTERNET
CONTRATO Nº ${customer.contract_number || 'N/A'}

Pelo presente instrumento, de um lado ${customer.full_name || ''}, inscrito(a) no ${customer.document_type === 'cpf' ? 'CPF' : 'CNPJ'} sob o nº ${formatCPF(customer.document_number) || ''}, residente e domiciliado(a) em ${endereco}, telefone ${customer.phone || ''}, doravante denominado(a) CONTRATANTE, e de outro lado a empresa PROVEDOR XYZ, doravante denominada CONTRATADA, têm entre si justo e contratado o seguinte:

1. OBJETO
1.1 O presente contrato tem como objeto a prestação de serviços de conexão à internet, através do plano ${customerPlan?.name || ''}, com velocidade de download de ${customerPlan?.download_speed || ''} Mbps e upload de ${customerPlan?.upload_speed || ''} Mbps, pelo valor mensal de ${formatCurrency(customerPlan?.monthly_price)}.

2. VIGÊNCIA
2.1 O presente contrato tem prazo de vigência de 12 (doze) meses, a contar da data de sua assinatura.

3. OBRIGAÇÕES DA CONTRATADA
3.1 Prestar os serviços contratados conforme especificações técnicas acordadas.
3.2 Manter a disponibilidade do serviço conforme previsto no plano contratado.
3.3 Fornecer suporte técnico ao CONTRATANTE.
3.4 Garantir a velocidade de conexão contratada.

4. OBRIGAÇÕES DO CONTRATANTE
4.1 Efetuar os pagamentos nas datas acordadas (todo dia ${customer.due_day || ''} de cada mês).
4.2 Utilizar o serviço de forma adequada e dentro da legalidade.
4.3 Manter seus equipamentos em condições adequadas de uso.
4.4 Comunicar à CONTRATADA qualquer irregularidade observada.

5. DADOS DE ACESSO
5.1 Username PPPoE: ${customer.pppoe_username || ''}
5.2 Senha PPPoE: ${customer.pppoe_password || ''}

Local e data: ${customer.city || ''}, ${dataAtual}

_______________________________
${customer.full_name || ''}
CPF/CNPJ: ${formatCPF(customer.document_number) || ''}
CONTRATANTE

_______________________________
PROVEDOR XYZ
CONTRATADA`;

      setContractContent(template);
    } catch (error) {
      console.error("Erro ao gerar contrato:", error);
      setError("Erro ao gerar contrato: " + error.message);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Não foi possível abrir a janela de impressão. Verifique se o seu navegador está bloqueando popups.");
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Contrato - ${selectedCustomer?.full_name || 'Cliente'}</title>
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
  };

  const filteredCustomers = customers.filter(customer => 
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.cpf?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contratos</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar cliente por nome ou CPF..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-md">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Nenhum cliente encontrado
                      </div>
                    ) : (
                      filteredCustomers.map(customer => (
                        <div
                          key={customer.id}
                          className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                            selectedCustomer?.id === customer.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="font-medium">{customer.full_name}</div>
                          <div className="text-sm text-gray-500">{customer.cpf}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            {selectedCustomer ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Contrato - {selectedCustomer.full_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <Button onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir Contrato
                      </Button>
                    </div>
                    
                    <div className="border rounded-md p-6 bg-white">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {contractContent}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">Nenhum cliente selecionado</h3>
                  <p className="text-gray-500 mt-2">
                    Selecione um cliente para visualizar e imprimir o contrato.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
