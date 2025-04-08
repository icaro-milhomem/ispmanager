
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Terminal,
  Server,
  Database,
  Shield,
  Network,
  CheckCircle,
  AlertTriangle,
  Info,
  Boxes,
  Globe,
  Wrench,
  Settings,
  FileText,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";

const CodeBlock = ({ code }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Código copiado para a área de transferência",
        duration: 2000
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-slate-950 text-slate-50 p-4 rounded-md relative group">
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-4 top-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copyToClipboard}
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <pre className="overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default function DocumentationPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Documentação de Instalação</h1>
          <p className="text-gray-500">
            Guia completo para instalação do ISP Manager no Ubuntu Server 24.04 LTS
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Este guia foi atualizado para o Ubuntu Server 24.04 LTS. Certifique-se de seguir todos os passos na ordem correta.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="prepare" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="prepare">1. Preparação</TabsTrigger>
          <TabsTrigger value="install">2. Instalação</TabsTrigger>
          <TabsTrigger value="config">3. Configuração</TabsTrigger>
          <TabsTrigger value="security">4. Segurança</TabsTrigger>
          <TabsTrigger value="final">5. Finalização</TabsTrigger>
        </TabsList>

        <TabsContent value="prepare" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-500" />
                <CardTitle>Requisitos do Sistema</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-medium">Hardware Recomendado:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Processador: 4 cores ou mais</li>
                <li>Memória RAM: 8GB ou mais</li>
                <li>Armazenamento: 100GB SSD (mínimo)</li>
                <li>Rede: Interface Gigabit</li>
              </ul>

              <h3 className="font-medium mt-4">Requisitos de Software:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ubuntu Server 24.04 LTS (instalação limpa)</li>
                <li>Acesso root ou sudo</li>
                <li>Conexão à internet estável</li>
              </ul>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <p className="text-amber-800 font-medium">Antes de começar:</p>
                </div>
                <ul className="mt-2 text-amber-800 list-disc pl-6 space-y-1">
                  <li>Faça backup de dados importantes</li>
                  <li>Certifique-se de ter acesso físico ou remoto seguro ao servidor</li>
                  <li>Verifique se o servidor tem IP fixo</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-green-500" />
                <CardTitle>Preparação Inicial do Sistema</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Execute os seguintes comandos para preparar o sistema:</p>
              
              <CodeBlock code={`# Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências essenciais
sudo apt install -y curl wget git unzip net-tools \\
  software-properties-common apt-transport-https \\
  ca-certificates gnupg lsb-release

# Configurar timezone
sudo timedatectl set-timezone America/Sao_Paulo

# Instalar utilitários de sistema
sudo apt install -y htop iftop iotop`} />

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Dica</AlertTitle>
                <AlertDescription>
                  Após a atualização do sistema, é recomendado reiniciar o servidor antes de prosseguir.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="install" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-500" />
                <CardTitle>Instalação do Banco de Dados</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Instale e configure o PostgreSQL:</p>
              
              <CodeBlock code={`# Adicionar repositório PostgreSQL
sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Atualizar e instalar PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Iniciar e habilitar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar status
sudo systemctl status postgresql`} />

              <CodeBlock code={`# Configurar senha do postgres
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'sua_senha_aqui';"`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-orange-500" />
                <CardTitle>Instalação do Node.js</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Instale o Node.js LTS:</p>
              
              <CodeBlock code={`# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar versão
node --version
npm --version

# Instalar PM2 globalmente
sudo npm install -g pm2`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <CardTitle>Instalação do Nginx</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Configure o servidor web Nginx:</p>
              
              <CodeBlock code={`# Instalar Nginx
sudo apt install -y nginx

# Iniciar e habilitar serviço
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx

# Configurar firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable`} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-indigo-500" />
                <CardTitle>Configuração do Ambiente</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Configure as variáveis de ambiente e diretórios:</p>
              
              <CodeBlock code={`# Criar diretório da aplicação
sudo mkdir -p /opt/ispmanager
sudo chown -R $USER:$USER /opt/ispmanager

# Criar arquivo de ambiente
cat << EOF > /opt/ispmanager/.env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ispmanager
DB_USER=postgres
DB_PASS=sua_senha_aqui
EOF

# Configurar permissões
sudo chmod 600 /opt/ispmanager/.env`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                <CardTitle>Configuração do Nginx</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Configure o proxy reverso do Nginx:</p>
              
              <CodeBlock code={`# Criar configuração do site
sudo nano /etc/nginx/sites-available/ispmanager

# Adicionar configuração
server {
    listen 80;
    server_name seu_dominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/ispmanager /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx`} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                <CardTitle>Configurações de Segurança</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Aplique as configurações de segurança recomendadas:</p>
              
              <CodeBlock code={`# Configurar SSL com Certbot
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d seu_dominio.com.br

# Configurar firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Instalar fail2ban
sudo apt install -y fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl restart fail2ban`} />

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  Substitua "seu_dominio.com.br" pelo seu domínio real antes de executar os comandos.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="final" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <CardTitle>Finalização e Verificação</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Execute as verificações finais:</p>
              
              <CodeBlock code={`# Verificar serviços
sudo systemctl status postgresql
sudo systemctl status nginx
pm2 status

# Verificar logs
sudo tail -f /var/log/nginx/error.log
pm2 logs

# Testar backup
sudo -u postgres pg_dump ispmanager > backup.sql

# Verificar SSL
curl -vI https://seu_dominio.com.br`} />

              <div className="mt-4">
                <h3 className="font-medium mb-2">Checklist Final:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Banco de dados está rodando e acessível</li>
                  <li>Nginx está configurado e rodando</li>
                  <li>SSL está ativo e válido</li>
                  <li>Aplicação está rodando com PM2</li>
                  <li>Firewall está configurado</li>
                  <li>Backup está funcionando</li>
                  <li>Logs estão sendo gerados corretamente</li>
                </ul>
              </div>

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Próximos Passos</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-6 mt-2">
                    <li>Configure backups automáticos</li>
                    <li>Implemente monitoramento</li>
                    <li>Configure alertas de sistema</li>
                    <li>Documente senhas e configurações</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                <CardTitle>Manutenção Contínua</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Tarefas regulares de manutenção:</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Diariamente:</span>
                  <span>Verificar logs, monitorar recursos</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Semanalmente:</span>
                  <span>Backup completo, verificar atualizações</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Mensalmente:</span>
                  <span>Atualizar sistema, verificar certificados</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Trimestralmente:</span>
                  <span>Auditoria de segurança, revisão de configs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
