import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Invocar LLM (Large Language Model) para processamento de prompts
 * @route POST /api/integrations/llm
 */
export const invokeLLM = async (req: Request, res: Response) => {
  try {
    const { prompt, response_json_schema } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é necessário' });
    }
    
    // Usar a variável de ambiente diretamente
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('Chave da API OpenAI não configurada, usando dados simulados');
      return res.status(200).json(generateSimulatedLLMResponse(prompt));
    }
    
    // Chamar a API da OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Você é um assistente de IA para um sistema de gerenciamento de provedor de internet.' },
          { role: 'user', content: prompt }
        ],
        response_format: response_json_schema ? { type: "json_object" } : undefined,
        temperature: 0.7
      })
    });
    
    const data = await openaiResponse.json() as any;
    
    if (!openaiResponse.ok) {
      console.error('Erro na chamada da API OpenAI:', data);
      return res.status(200).json(generateSimulatedLLMResponse(prompt));
    }
    
    // Tentar extrair e analisar a resposta JSON
    try {
      const content = data.choices[0].message.content;
      
      // Se a resposta deve ser um JSON, tente parseá-la
      if (response_json_schema) {
        const jsonResponse = JSON.parse(content);
        return res.json(jsonResponse);
      }
      
      // Caso contrário, retorne a resposta como texto
      return res.json({ response: content });
    } catch (parseError) {
      console.error('Erro ao analisar resposta da API:', parseError);
      return res.status(200).json(generateSimulatedLLMResponse(prompt));
    }
  } catch (error) {
    console.error('Erro na integração com LLM:', error);
    return res.status(200).json(generateSimulatedLLMResponse(req.body.prompt || ""));
  }
};

/**
 * Enviar e-mail
 * @route POST /api/integrations/email
 */
export const sendEmail = async (req: Request, res: Response) => {
  try {
    // Simular envio de e-mail em ambiente de desenvolvimento
    console.log('Simulando envio de e-mail:', req.body);
    return res.json({ success: true, message: 'E-mail enviado com sucesso (simulado)' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return res.status(500).json({ error: 'Erro ao enviar e-mail' });
  }
};

/**
 * Enviar SMS
 * @route POST /api/integrations/sms
 */
export const sendSMS = async (req: Request, res: Response) => {
  try {
    // Simular envio de SMS em ambiente de desenvolvimento
    console.log('Simulando envio de SMS:', req.body);
    return res.json({ success: true, message: 'SMS enviado com sucesso (simulado)' });
  } catch (error) {
    console.error('Erro ao enviar SMS:', error);
    return res.status(500).json({ error: 'Erro ao enviar SMS' });
  }
};

/**
 * Upload de arquivo
 * @route POST /api/integrations/upload
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    // Aqui seria implementado o upload real para um serviço de armazenamento como S3
    const file = (req as any).file;
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    
    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    console.log('Arquivo recebido:', file.originalname, 'com metadados:', metadata);
    
    // Simulação de URL para ambiente de desenvolvimento
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    
    return res.json({ 
      success: true, 
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimetype: file.mimetype
    });
  } catch (error) {
    console.error('Erro no upload de arquivo:', error);
    return res.status(500).json({ error: 'Erro no upload de arquivo' });
  }
};

/**
 * Função para gerar dados simulados para o LLM 
 * baseado no prompt solicitado
 */
function generateSimulatedLLMResponse(prompt: string) {
  // Verificar se é pedido de analytics
  if (prompt.includes("Gere dados analíticos simulados")) {
    // Gerar dados simulados para analytics
    return {
      customers: {
        total_active: 520,
        growth_rate: 3.5,
        churn_rate: 1.2,
        satisfaction_score: 8.7,
        average_tenure: 18.4,
        demographics: [
          { category: "Residencial", value: 410 },
          { category: "Empresarial", value: 110 }
        ],
        acquisition: [
          { period: "Jan", value: 12 },
          { period: "Fev", value: 15 },
          { period: "Mar", value: 18 },
          { period: "Abr", value: 14 },
          { period: "Mai", value: 20 },
          { period: "Jun", value: 22 }
        ],
        plans_distribution: [
          { plan: "Básico", count: 175 },
          { plan: "Padrão", count: 240 },
          { plan: "Premium", count: 105 }
        ]
      },
      financial: {
        total_revenue: 124500,
        growth_rate: 4.2,
        average_arpu: 239.42,
        payment_rate: 97.3,
        default_rate: 2.7,
        revenue_by_period: [
          { period: "Jan", value: 18500 },
          { period: "Fev", value: 19200 },
          { period: "Mar", value: 20100 },
          { period: "Abr", value: 21300 },
          { period: "Mai", value: 22400 },
          { period: "Jun", value: 23000 }
        ],
        revenue_by_plan: [
          { plan: "Básico", value: 35000 },
          { plan: "Padrão", value: 62500 },
          { plan: "Premium", value: 27000 }
        ],
        forecast_next_month: 24500
      },
      network: {
        average_uptime: 99.82,
        bandwidth_usage: 78.4,
        peak_usage: 91.5,
        total_outages: 7,
        average_issue_resolution_time: 4.2,
        bandwidth_by_period: [
          { period: "00:00", download: 35, upload: 14 },
          { period: "04:00", download: 20, upload: 8 },
          { period: "08:00", download: 45, upload: 18 },
          { period: "12:00", download: 75, upload: 30 },
          { period: "16:00", download: 90, upload: 40 },
          { period: "20:00", download: 95, upload: 38 }
        ],
        issues_by_type: [
          { type: "Conectividade", count: 34 },
          { type: "Quedas", count: 12 },
          { type: "Lentidão", count: 28 },
          { type: "Configuração", count: 8 },
          { type: "Hardware", count: 6 }
        ]
      },
      support: {
        total_tickets: 182,
        open_tickets: 15,
        average_resolution_time: 8.4,
        satisfaction_score: 8.2,
        tickets_by_period: [
          { period: "Jan", value: 32 },
          { period: "Fev", value: 28 },
          { period: "Mar", value: 35 },
          { period: "Abr", value: 30 },
          { period: "Mai", value: 29 },
          { period: "Jun", value: 28 }
        ],
        tickets_by_category: [
          { category: "Técnico", count: 98 },
          { category: "Financeiro", count: 35 },
          { category: "Informações", count: 28 },
          { category: "Atualizações", count: 21 }
        ],
        resolution_time_trend: [
          { period: "Jan", value: 9.2 },
          { period: "Fev", value: 9.0 },
          { period: "Mar", value: 8.8 },
          { period: "Abr", value: 8.5 },
          { period: "Mai", value: 8.4 },
          { period: "Jun", value: 8.2 }
        ],
        avg_response_time: 15
      },
      geographic: {
        coverage_percentage: 68.5,
        expansion_rate: 2.7,
        highest_density_areas: [
          { area: "Centro", value: 185 },
          { area: "Zona Norte", value: 145 },
          { area: "Zona Sul", value: 120 },
          { area: "Zona Leste", value: 70 }
        ],
        installations_by_area: [
          { area: "Centro", value: 185 },
          { area: "Zona Norte", value: 145 },
          { area: "Zona Sul", value: 120 },
          { area: "Zona Leste", value: 70 }
        ],
        issue_hotspots: [
          { area: "Zona Norte", value: 18 },
          { area: "Centro", value: 12 },
          { area: "Zona Sul", value: 8 },
          { area: "Zona Leste", value: 4 }
        ]
      }
    };
  }
  
  // Retorna uma resposta genérica simulada
  return { response: "Resposta simulada para ambiente de desenvolvimento" };
} 