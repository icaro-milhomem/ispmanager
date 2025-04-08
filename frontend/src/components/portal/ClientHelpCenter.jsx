import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Search,
  ChevronRight,
  ChevronDown,
  Book,
  Lightbulb,
  ExternalLink,
  Router,
  Wifi,
  Settings,
  DollarSign,
  Download,
  Upload,
  AlertCircle
} from "lucide-react";

export default function ClientHelpCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  
  const toggleQuestion = (id) => {
    if (expandedQuestion === id) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(id);
    }
  };
  
  const faqCategories = [
    {
      id: "internet",
      title: "Problemas de Conexão",
      icon: <Wifi className="w-5 h-5 text-blue-600" />,
      questions: [
        {
          id: "internet-1",
          question: "Minha internet está lenta. O que fazer?",
          answer: "Se sua internet estiver lenta, tente as seguintes ações: 1) Reinicie seu roteador e modem, 2) Verifique se há muitos dispositivos conectados, 3) Realize um teste de velocidade em diferentes dispositivos, 4) Verifique se há algo interferindo no sinal WiFi, como paredes grossas ou outros dispositivos eletrônicos. Se o problema persistir, entre em contato conosco."
        },
        {
          id: "internet-2",
          question: "Como reiniciar meu roteador corretamente?",
          answer: "Para reiniciar seu roteador: 1) Desligue-o da tomada, 2) Aguarde 30 segundos, 3) Ligue-o novamente, 4) Aguarde até 2 minutos para que todas as luzes estabilizem. Isso geralmente resolve problemas temporários de conectividade."
        },
        {
          id: "internet-3",
          question: "O que significa quando as luzes do meu equipamento piscam?",
          answer: "As luzes do seu equipamento indicam seu status de funcionamento. Normalmente: 1) Luz de energia acesa: equipamento ligado, 2) Luz de internet acesa/estável: conexão estabelecida, 3) Luz de internet piscando: estabelecendo conexão, 4) Luz de internet apagada: sem conexão. Se todas as luzes estiverem piscando simultaneamente, pode indicar um problema que requer reinicialização."
        },
        {
          id: "internet-4",
          question: "Como melhorar o sinal WiFi em minha casa?",
          answer: "Para melhorar o sinal WiFi: 1) Posicione o roteador em local central e elevado, 2) Evite obstáculos como paredes grossas e espelhos, 3) Mantenha o roteador longe de outros dispositivos eletrônicos, 4) Considere usar repetidores WiFi para casas grandes, 5) Verifique se o canal WiFi está congestionado e altere-o se necessário, 6) Atualize o firmware do roteador."
        }
      ]
    },
    {
      id: "billing",
      title: "Faturamento e Pagamento",
      icon: <DollarSign className="w-5 h-5 text-green-600" />,
      questions: [
        {
          id: "billing-1",
          question: "Como alterar a data de vencimento da minha fatura?",
          answer: "Para alterar a data de vencimento da sua fatura, entre em contato com nosso atendimento ao cliente. Você pode solicitar a alteração uma vez a cada 12 meses, escolhendo entre as datas disponíveis (5, 10, 15, 20 ou 25). A alteração será aplicada a partir da próxima fatura."
        },
        {
          id: "billing-2",
          question: "O que acontece se eu atrasar o pagamento?",
          answer: "Em caso de atraso no pagamento: 1) Após 5 dias, será aplicada multa de 2% + juros diários, 2) Após 15 dias, você receberá uma notificação e poderá haver redução de velocidade, 3) Após 30 dias, o serviço poderá ser temporariamente suspenso, 4) Após 60 dias, o contrato poderá ser cancelado e o caso enviado para análise de negativação. Recomendamos entrar em contato imediatamente em caso de dificuldades com o pagamento."
        },
        {
          id: "billing-3",
          question: "Como obter segunda via da fatura?",
          answer: "Você pode obter a segunda via da sua fatura de várias maneiras: 1) Através deste portal do cliente, na seção 'Faturas', 2) Solicitando via WhatsApp com nosso atendimento, 3) Ligando para nossa central de atendimento. As faturas ficam disponíveis para consulta por até 12 meses."
        }
      ]
    },
    {
      id: "technical",
      title: "Suporte Técnico",
      icon: <Settings className="w-5 h-5 text-purple-600" />,
      questions: [
        {
          id: "technical-1",
          question: "Como configurar uma rede WiFi?",
          answer: "Para configurar sua rede WiFi: 1) Acesse a interface do roteador (geralmente 192.168.0.1 ou 192.168.1.1) usando um navegador, 2) Faça login com as credenciais (geralmente encontradas na parte inferior do roteador), 3) Acesse as configurações WiFi, 4) Defina um nome (SSID) personalizado para sua rede, 5) Configure uma senha segura (recomendamos WPA2 ou WPA3), 6) Salve as configurações e reinicie o roteador se necessário."
        },
        {
          id: "technical-2",
          question: "O que fazer em caso de quedas frequentes da conexão?",
          answer: "Se você está enfrentando quedas frequentes: 1) Verifique a integridade dos cabos, 2) Reinicie o equipamento, 3) Verifique se há interferências de outros dispositivos, 4) Atualize o firmware do seu roteador, 5) Verifique se o problema ocorre em todos os dispositivos ou apenas em um específico. Se o problema persistir, abra um chamado técnico, pois pode ser necessário o envio de um técnico para verificar a instalação."
        },
        {
          id: "technical-3",
          question: "Como realizar um teste de velocidade confiável?",
          answer: "Para um teste de velocidade confiável: 1) Use sites como speedtest.net ou fast.com, 2) Conecte seu dispositivo via cabo ethernet (mais preciso que WiFi), 3) Feche todos os programas e downloads em andamento, 4) Realize o teste em diferentes horários do dia, 5) Teste em diferentes dispositivos para comparar. Lembre-se que a velocidade WiFi pode ser menor que a velocidade contratada devido a diversos fatores como distância do roteador e interferências."
        }
      ]
    },
    {
      id: "plans",
      title: "Planos e Serviços",
      icon: <Router className="w-5 h-5 text-orange-600" />,
      questions: [
        {
          id: "plans-1",
          question: "Como aumentar a velocidade do meu plano?",
          answer: "Para aumentar a velocidade do seu plano, acesse a seção 'Planos' no portal do cliente e selecione a opção para fazer upgrade. A mudança geralmente é processada em até 24 horas. Não há taxa para upgrade de plano e o valor proporcional será calculado automaticamente em sua próxima fatura."
        },
        {
          id: "plans-2",
          question: "Qual a diferença entre os planos oferecidos?",
          answer: "Nossos planos se diferenciam principalmente pela velocidade de conexão e benefícios adicionais. O plano Básico oferece 100 Mbps, ideal para uso doméstico moderado. O plano Padrão de 300 Mbps é recomendado para famílias que usam múltiplos dispositivos. O plano Premium de 500 Mbps é ideal para streamers e gamers. Já o plano Empresarial de 1 Gbps inclui recursos adicionais como IP fixo e SLA diferenciado, ideal para empresas."
        }
      ]
    }
  ];
  
  // Filtrar categorias e perguntas com base na busca
  const filteredFAQs = searchTerm.trim() === "" 
    ? faqCategories 
    : faqCategories.map(category => ({
        ...category,
        questions: category.questions.filter(q => 
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.questions.length > 0);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Central de Ajuda</h2>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Busque por dúvidas frequentes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-6 text-lg"
        />
      </div>
      
      {/* Blocos de Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-100 rounded-full mb-4">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-lg mb-2">Baixa Velocidade</h3>
              <p className="text-sm text-gray-600 mb-4">
                Está experimentando lentidão? Veja as dicas para melhorar sua conexão.
              </p>
              <Button variant="link" className="text-blue-600" onClick={() => toggleQuestion("internet-1")}>
                Ver Soluções
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-100">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-green-100 rounded-full mb-4">
                <Wifi className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-lg mb-2">Configurar WiFi</h3>
              <p className="text-sm text-gray-600 mb-4">
                Aprenda a configurar e otimizar sua rede sem fio para melhor desempenho.
              </p>
              <Button variant="link" className="text-green-600" onClick={() => toggleQuestion("technical-1")}>
                Ver Tutorial
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-orange-100 rounded-full mb-4">
                <Upload className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-medium text-lg mb-2">Testes de Velocidade</h3>
              <p className="text-sm text-gray-600 mb-4">
                Saiba como verificar corretamente a velocidade da sua conexão.
              </p>
              <Button variant="link" className="text-orange-600" onClick={() => toggleQuestion("technical-3")}>
                Ver Dicas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Perguntas Frequentes */}
      <div className="space-y-6">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma resposta encontrada</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Não encontramos respostas para sua pesquisa. Tente termos diferentes ou entre em contato com nosso suporte.
            </p>
          </div>
        ) : (
          filteredFAQs.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category.icon}
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.questions.map((faq) => (
                  <div key={faq.id} className="border rounded-lg overflow-hidden">
                    <div 
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleQuestion(faq.id)}
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-blue-600" />
                        <h3 className="font-medium">{faq.question}</h3>
                      </div>
                      {expandedQuestion === faq.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    {expandedQuestion === faq.id && (
                      <div className="p-4 bg-gray-50 border-t">
                        <p className="text-gray-700">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Recursos Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="w-5 h-5 text-blue-600" />
            Recursos Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="#" className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Book className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Tutoriais de Configuração</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Guias passo a passo para configurar seus equipamentos
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
            </a>
            
            <a href="#" className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-green-100 rounded-lg">
                <Lightbulb className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Dicas de Segurança</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Como proteger sua rede e dispositivos
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
            </a>
            
            <a href="#" className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Manuais de Equipamentos</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Documentação técnica dos roteadores e modems
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
            </a>
            
            <a href="#" className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium">Solução de Problemas Comuns</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Guia de resolução dos problemas mais frequentes
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}