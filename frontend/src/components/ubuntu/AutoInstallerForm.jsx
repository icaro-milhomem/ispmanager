import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Monitor, 
  Server, 
  Shield, 
  Database, 
  Wifi, 
  Globe, 
  Terminal, 
  Copy, 
  RefreshCw, 
  HardDrive, 
  Network, 
  AlertCircle,
  Activity,
  BarChart3,
  FileText
} from 'lucide-react';

export default function AutoInstallerForm() {
  const [serverInfo, setServerInfo] = useState({
    hostname: 'isp-server',
    ipAddress: '192.168.1.100',
    netmask: '255.255.255.0', 
    gateway: '192.168.1.1',
    dns1: '8.8.8.8',
    dns2: '8.8.4.4',
    timezone: 'America/Sao_Paulo',
    userPassword: '',
    rootPassword: '',
    sshPort: '22'
  });

  const [services, setServices] = useState({
    radius: true,
    pppoe: true,
    mysql: true,
    nginx: true,
    php: true,
    iptables: true,
    netflow: false,
    snmp: true,
    grafana: true,
    zabbix: false
  });

  const [diskConfig, setDiskConfig] = useState('auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scriptGenerated, setScriptGenerated] = useState(false);
  const [installScript, setInstallScript] = useState('');

  const handleServerInfoChange = (e) => {
    const { name, value } = e.target;
    setServerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setServices(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };
  
  const generateInstallScript = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const script = createInstallScript();
      setInstallScript(script);
      setScriptGenerated(true);
      setIsGenerating(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installScript);
  };

  const resetForm = () => {
    setServerInfo({
      hostname: 'isp-server',
      ipAddress: '192.168.1.100',
      netmask: '255.255.255.0', 
      gateway: '192.168.1.1',
      dns1: '8.8.8.8',
      dns2: '8.8.4.4',
      timezone: 'America/Sao_Paulo',
      userPassword: '',
      rootPassword: '',
      sshPort: '22'
    });
    setServices({
      radius: true,
      pppoe: true,
      mysql: true,
      nginx: true,
      php: true,
      iptables: true,
      netflow: false,
      snmp: true,
      grafana: true,
      zabbix: false
    });
    setDiskConfig('auto');
    setScriptGenerated(false);
    setInstallScript('');
  };

  const createInstallScript = () => {
    return `#!/bin/bash
# Auto Instalador para ISP - Ubuntu 22.04
# Configurado automaticamente pelo ISP Manager

# Definindo cores para output
CYAN='\\033[0;36m'
GREEN='\\033[0;32m'
RED='\\033[0;31m'
YELLOW='\\033[0;33m'
NC='\\033[0m' # No Color

# Função para exibir mensagens
print_message() {
  echo -e "\${CYAN}[ISP-INSTALLER]\${NC} $1"
}

print_step() {
  echo -e "\\n\${GREEN}==>\${NC} $1"
}

print_error() {
  echo -e "\${RED}[ERRO]\${NC} $1"
}

print_warning() {
  echo -e "\${YELLOW}[AVISO]\${NC} $1"
}

# Verificar se está sendo executado como root
if [ "$(id -u)" != "0" ]; then
   print_error "Este script precisa ser executado como root!"
   exit 1
fi

# Verificar versão do Ubuntu
if ! grep -q "Ubuntu 22.04" /etc/os-release; then
  print_error "Este script foi projetado para Ubuntu 22.04 LTS."
  print_warning "Sua distribuição pode não ser compatível."
  read -p "Deseja continuar mesmo assim? (s/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
  fi
fi

# Configurações do servidor
HOSTNAME="${serverInfo.hostname}"
IP_ADDRESS="${serverInfo.ipAddress}"
NETMASK="${serverInfo.netmask}"
GATEWAY="${serverInfo.gateway}"
DNS1="${serverInfo.dns1}"
DNS2="${serverInfo.dns2}"
TIMEZONE="${serverInfo.timezone}"
SSH_PORT="${serverInfo.sshPort}"

# Configurar a interface de rede
print_step "Configurando interface de rede..."
cat > /etc/netplan/00-installer-config.yaml << EOF
network:
  version: 2
  ethernets:
    ens160:
      dhcp4: no
      addresses: [$IP_ADDRESS/24]
      gateway4: $GATEWAY
      nameservers:
        addresses: [$DNS1, $DNS2]
EOF

# Aplicar configurações de rede
print_message "Aplicando configurações de rede..."
netplan apply

# Configuração de hostname
print_step "Configurando hostname..."
hostnamectl set-hostname $HOSTNAME
echo "$IP_ADDRESS $HOSTNAME" >> /etc/hosts

# Configurando timezone
print_step "Configurando timezone..."
timedatectl set-timezone $TIMEZONE

# Atualizando o sistema
print_step "Atualizando o sistema..."
apt update
apt upgrade -y

# Instalar ferramentas básicas
print_step "Instalando ferramentas básicas..."
apt install -y nmap net-tools htop iftop iotop zip unzip wget curl vim git ufw fail2ban

# Configuração de usuário e segurança
if [ -n "${serverInfo.rootPassword}" ]; then
  print_step "Configurando senha de root..."
  echo "root:${serverInfo.rootPassword}" | chpasswd
fi

if [ -n "${serverInfo.userPassword}" ]; then
  print_step "Criando usuário administrador..."
  useradd -m -s /bin/bash admin
  echo "admin:${serverInfo.userPassword}" | chpasswd
  usermod -aG sudo admin
fi

# Configurando SSH
print_step "Configurando SSH..."
sed -i "s/#Port 22/Port $SSH_PORT/g" /etc/ssh/sshd_config
sed -i "s/#PermitRootLogin prohibit-password/PermitRootLogin no/g" /etc/ssh/sshd_config
sed -i "s/#PasswordAuthentication yes/PasswordAuthentication yes/g" /etc/ssh/sshd_config
systemctl restart sshd

${services.radius ? `
# Instalando FreeRADIUS
print_step "Instalando FreeRADIUS..."
apt install -y freeradius freeradius-utils freeradius-mysql

# Configurando FreeRADIUS para usar MySQL
print_message "Configurando FreeRADIUS..."
` : ''}

${services.pppoe ? `
# Instalando servidor PPPoE
print_step "Instalando servidor PPPoE (accel-ppp)..."
apt install -y build-essential cmake libpcre3-dev libssl-dev liblua5.1-0-dev

cd /usr/src
git clone https://github.com/accel-ppp/accel-ppp.git
cd accel-ppp
mkdir build
cd build
cmake -DBUILD_IPOE_DRIVER=TRUE -DRADIUS=TRUE -DKDIR=/usr/src/linux-headers-$(uname -r) ..
make
make install

# Configurando accel-ppp
print_message "Configurando accel-ppp..."
cat > /etc/accel-ppp.conf << EOF
[modules]
log_file
pptp
pppoe
auth_mschap_v2
auth_mschap_v1
auth_chap_md5
auth_pap
radius
ippool
shaper
connlimit

[core]
thread-count=4

[log]
log-file=/var/log/accel-ppp/accel-ppp.log
log-emerg=/var/log/accel-ppp/emerg.log
log-fail-file=/var/log/accel-ppp/auth-fail.log
copy=1
level=info

[pppoe]
interface=eth0
verbose=1
ac-name=ISP-PPPoE
service-name=ISP-PPPoE

[radius]
dictionary=/usr/local/share/accel-ppp/radius/dictionary
nas-identifier=ISP-PPPoE
server=$IP_ADDRESS,1812,testing123
dae-server=$IP_ADDRESS:3799,testing123
acct-interim-interval=600

[client-ip-range]
disable

[ip-pool]
gw-ip-address=$IP_ADDRESS
192.168.100.0/24

[dns]
dns1=$DNS1
dns2=$DNS2

[shutdown]
timeout=1
EOF

# Criando serviço para accel-ppp
cat > /etc/systemd/system/accel-ppp.service << EOF
[Unit]
Description=accel-ppp - PPP and PPtP server
After=network.target

[Service]
ExecStart=/usr/local/sbin/accel-pppd -c /etc/accel-ppp.conf
Restart=on-failure
RestartSec=5
LimitNOFILE=16384
LimitCORE=infinity

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable accel-ppp
systemctl start accel-ppp
` : ''}

${services.mysql ? `
# Instalando MySQL
print_step "Instalando MySQL..."
apt install -y mysql-server

# Configurando MySQL
print_message "Configurando MySQL..."
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'temppass';"
mysql -e "CREATE DATABASE ispmanager;"
mysql -e "CREATE USER 'ispmanager'@'localhost' IDENTIFIED BY 'ispmanager';"
mysql -e "GRANT ALL PRIVILEGES ON ispmanager.* TO 'ispmanager'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
` : ''}

${services.nginx ? `
# Instalando Nginx
print_step "Instalando Nginx..."
apt install -y nginx

# Configurando Nginx
print_message "Configurando Nginx..."
cat > /etc/nginx/sites-available/default << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.php index.html index.htm;
    
    server_name _;
    
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }
    
    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }
    
    location ~ /\\.ht {
        deny all;
    }
}
EOF

systemctl restart nginx
` : ''}

${services.php ? `
# Instalando PHP
print_step "Instalando PHP..."
apt install -y php8.1-fpm php8.1-mysql php8.1-cli php8.1-common php8.1-zip php8.1-gd php8.1-mbstring php8.1-curl php8.1-xml

# Configurando PHP
print_message "Configurando PHP..."
sed -i 's/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/g' /etc/php/8.1/fpm/php.ini
systemctl restart php8.1-fpm
` : ''}

${services.iptables ? `
# Configurando Firewall (iptables/ufw)
print_step "Configurando Firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow $SSH_PORT/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 1812/udp
ufw allow 1813/udp
ufw allow 3799/udp
ufw allow ppp
ufw allow 8728/tcp

cat > /etc/ufw/before.rules << EOF
# NAT table rules
*nat
:POSTROUTING ACCEPT [0:0]

# Forward traffic through eth0 - Change to match your NIC
-A POSTROUTING -s 192.168.100.0/24 -o eth0 -j MASQUERADE

# don't delete the 'COMMIT' line or these nat table rules won't be processed
COMMIT
EOF

# Ativar IP forwarding
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sysctl -p

ufw enable
` : ''}

${services.grafana ? `
# Instalando Grafana
print_step "Instalando Grafana..."
apt-get install -y apt-transport-https software-properties-common
wget -q -O - https://packages.grafana.com/gpg.key | apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | tee -a /etc/apt/sources.list.d/grafana.list
apt-get update
apt-get install -y grafana

systemctl enable grafana-server
systemctl start grafana-server
` : ''}

${services.snmp ? `
# Instalando SNMP
print_step "Instalando SNMP..."
apt install -y snmpd snmp

# Configurando SNMP
print_message "Configurando SNMP..."
cat > /etc/snmp/snmpd.conf << EOF
rocommunity public localhost
rocommunity public 192.168.1.0/24
sysLocation "ISP Server Room"
sysContact admin@example.com
EOF

systemctl restart snmpd
` : ''}

${services.netflow ? `
# Instalando Netflow
print_step "Instalando Netflow (nfdump e nfsen)..."
apt install -y nfdump

# Criando diretórios para netflow
mkdir -p /var/nfsen/profiles-data/live
mkdir -p /var/www/html/nfsen

# Baixando e instalando nfsen
cd /tmp
wget https://github.com/phaag/nfsen/archive/refs/heads/master.zip
unzip master.zip
cd nfsen-master
` : ''}

${services.zabbix ? `
# Instalando Zabbix
print_step "Instalando Zabbix..."
wget https://repo.zabbix.com/zabbix/6.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_6.0-1+ubuntu22.04_all.deb
dpkg -i zabbix-release_6.0-1+ubuntu22.04_all.deb
apt update
apt install -y zabbix-server-mysql zabbix-frontend-php zabbix-apache-conf zabbix-sql-scripts zabbix-agent

# Criando banco de dados para Zabbix
print_message "Criando banco de dados para Zabbix..."
mysql -e "create database zabbix character set utf8mb4 collate utf8mb4_bin;"
mysql -e "create user zabbix@localhost identified by 'zabbix';"
mysql -e "grant all privileges on zabbix.* to zabbix@localhost;"

# Importando esquema inicial do Zabbix
zcat /usr/share/doc/zabbix-sql-scripts/mysql/create.sql.gz | mysql -uzabbix -pzabbix zabbix

# Configurando Zabbix Server
sed -i 's/# DBPassword=/DBPassword=zabbix/g' /etc/zabbix/zabbix_server.conf

# Iniciando Zabbix Server
systemctl restart zabbix-server zabbix-agent
systemctl enable zabbix-server zabbix-agent
` : ''}

# Finalizando a instalação
print_step "Instalação concluída com sucesso!"
print_message "Seu servidor ISP foi configurado com os seguintes detalhes:"
echo "Hostname: $HOSTNAME"
echo "IP Address: $IP_ADDRESS"
echo "SSH Port: $SSH_PORT"
echo "Timezone: $TIMEZONE"
echo ""
print_message "Serviços instalados:"
${services.radius ? 'echo "- FreeRADIUS"' : ''}
${services.pppoe ? 'echo "- PPPoE Server (accel-ppp)"' : ''}
${services.mysql ? 'echo "- MySQL"' : ''}
${services.nginx ? 'echo "- Nginx"' : ''}
${services.php ? 'echo "- PHP 8.1"' : ''}
${services.iptables ? 'echo "- Firewall (UFW/iptables)"' : ''}
${services.netflow ? 'echo "- Netflow"' : ''}
${services.snmp ? 'echo "- SNMP"' : ''}
${services.grafana ? 'echo "- Grafana"' : ''}
${services.zabbix ? 'echo "- Zabbix"' : ''}

echo ""
print_message "Recomendações de segurança:"
echo "1. Altere as senhas padrão dos bancos de dados"
echo "2. Configure as regras de firewall adequadamente"
echo "3. Mantenha o sistema atualizado regularmente"
echo ""
print_warning "É recomendado reiniciar o servidor para aplicar todas as configurações."
read -p "Deseja reiniciar agora? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  shutdown -r now
fi`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gerador de Auto Instalador para Ubuntu 22.04</h1>
      <p className="text-muted-foreground">Configuração personalizada de servidor para provedores de internet</p>

      {scriptGenerated ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Script de Instalação Gerado
            </CardTitle>
            <CardDescription>
              Copie este script e execute-o como root no seu servidor Ubuntu 22.04
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Este script deve ser executado apenas em uma instalação limpa do Ubuntu 22.04 LTS. Execute com cuidado.
              </AlertDescription>
            </Alert>
            <div className="relative">
              <div className="h-[400px] rounded-md border bg-slate-950 text-slate-50 p-4 font-mono text-sm overflow-auto">
                <pre>{installScript}</pre>
              </div>
              <Button 
                size="sm" 
                onClick={copyToClipboard} 
                className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600"
              >
                <Copy className="w-4 h-4 mr-1" /> Copiar
              </Button>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Como usar:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Copie o script acima</li>
                <li>Faça login como root no seu servidor Ubuntu 22.04</li>
                <li>Cole o script em um arquivo: <code>nano install.sh</code></li>
                <li>Torne o script executável: <code>chmod +x install.sh</code></li>
                <li>Execute o script: <code>./install.sh</code></li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={resetForm}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Criar Novo Script
            </Button>
            <Button variant="default" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copiar Script
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs defaultValue="server">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="server" className="flex items-center gap-2">
              <Server className="w-4 h-4" /> Servidor
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Database className="w-4 h-4" /> Serviços
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Network className="w-4 h-4" /> Rede
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="server" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Servidor</CardTitle>
                <CardDescription>
                  Configure as informações básicas do servidor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hostname">Hostname</Label>
                    <Input 
                      id="hostname" 
                      name="hostname" 
                      value={serverInfo.hostname} 
                      onChange={handleServerInfoChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Select 
                      value={serverInfo.timezone} 
                      onValueChange={(value) => setServerInfo({...serverInfo, timezone: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o fuso horário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">América/São Paulo</SelectItem>
                        <SelectItem value="America/Manaus">América/Manaus</SelectItem>
                        <SelectItem value="America/Recife">América/Recife</SelectItem>
                        <SelectItem value="America/Fortaleza">América/Fortaleza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userPassword">Senha do Usuário Admin</Label>
                    <Input 
                      id="userPassword" 
                      name="userPassword" 
                      type="password" 
                      value={serverInfo.userPassword} 
                      onChange={handleServerInfoChange} 
                    />
                    <p className="text-xs text-muted-foreground">
                      Será criado um usuário "admin" com esta senha
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rootPassword">Senha de Root</Label>
                    <Input 
                      id="rootPassword" 
                      name="rootPassword" 
                      type="password" 
                      value={serverInfo.rootPassword} 
                      onChange={handleServerInfoChange} 
                    />
                    <p className="text-xs text-muted-foreground">
                      Deixe em branco para manter a senha atual
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sshPort">Porta SSH</Label>
                    <Input 
                      id="sshPort" 
                      name="sshPort" 
                      value={serverInfo.sshPort} 
                      onChange={handleServerInfoChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Configuração de Disco</Label>
                    <Select 
                      value={diskConfig} 
                      onValueChange={setDiskConfig}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione configuração de disco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automático</SelectItem>
                        <SelectItem value="lvm">Usar LVM</SelectItem>
                        <SelectItem value="raid">RAID Software</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <Alert className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                  <Shield className="w-4 h-4" />
                  <AlertDescription>
                    Recomendamos alterar a porta SSH padrão e usar senhas fortes para aumentar a segurança do servidor.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Serviços</CardTitle>
                <CardDescription>
                  Selecione quais serviços devem ser instalados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-4 border p-4 rounded-md">
                    <div className="mt-1">
                      <Switch 
                        id="radius" 
                        checked={services.radius} 
                        onCheckedChange={() => handleServiceToggle('radius')} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="radius" className="font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        RADIUS
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Servidor de autenticação para controle de acesso
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 border p-4 rounded-md">
                    <div className="mt-1">
                      <Switch 
                        id="pppoe" 
                        checked={services.pppoe} 
                        onCheckedChange={() => handleServiceToggle('pppoe')} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="pppoe" className="font-medium flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-green-500" />
                        Servidor PPPoE
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Accel-PPP para conexões de clientes
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 border p-4 rounded-md">
                    <div className="mt-1">
                      <Switch 
                        id="mysql" 
                        checked={services.mysql} 
                        onCheckedChange={() => handleServiceToggle('mysql')} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="mysql" className="font-medium flex items-center gap-2">
                        <Database className="w-4 h-4 text-orange-500" />
                        MySQL
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Banco de dados para o sistema
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 border p-4 rounded-md">
                    <div className="mt-1">
                      <Switch 
                        id="nginx" 
                        checked={services.nginx} 
                        onCheckedChange={() => handleServiceToggle('nginx')} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="nginx" className="font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-500" />
                        Nginx
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Servidor web para interface administrativa
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 border p-4 rounded-md">
                    <div className="mt-1">
                      <Switch 
                        id="php" 
                        checked={services.php} 
                        onCheckedChange={() => handleServiceToggle('php')} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="php" className="font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        PHP
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        PHP 8.1 para aplicações web
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 border p-4 rounded-md">
                    <div className="mt-1">
                      <Switch 
                        id="iptables" 
                        checked={services.iptables} 
                        onCheckedChange={() => handleServiceToggle('iptables')} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="iptables" className="font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-500" />
                        Firewall (iptables/ufw)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Proteção de rede e NAT
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 border p-4 rounded-md">
                    <div className="mt-1">
                      <Switch 
                        id="netflow" 
                        checked={services.netflow} 
                        onCheckedChange={() => handleServiceToggle('netflow')} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="netflow" className="font-medium flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-500" />
                        NetFlow
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Monitoramento de tráfego de rede
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 border p-4 rounded-md">
                    <div className="mt-1">
                      <Switch 
                        id="snmp" 
                        checked={services.snmp} 
                        onCheckedChange={() => handleServiceToggle('snmp')} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="snmp" className="font-medium flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-indigo-500" />
                        SNMP
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Protocolo para gerenciamento de dispositivos
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 border p-4 rounded-md">
                    <div className="mt-1">
                      <Switch 
                        id="grafana" 
                        checked={services.grafana} 
                        onCheckedChange={() => handleServiceToggle('grafana')} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="grafana" className="font-medium flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-orange-500" />
                        Grafana
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Dashboards para monitoramento
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 border p-4 rounded-md">
                    <div className="mt-1">
                      <Switch 
                        id="zabbix" 
                        checked={services.zabbix} 
                        onCheckedChange={() => handleServiceToggle('zabbix')} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="zabbix" className="font-medium flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-red-600" />
                        Zabbix
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Plataforma completa de monitoramento
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="network" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Rede</CardTitle>
                <CardDescription>
                  Configure as interfaces e endereçamento IP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ipAddress">Endereço IP</Label>
                    <Input 
                      id="ipAddress" 
                      name="ipAddress" 
                      value={serverInfo.ipAddress} 
                      onChange={handleServerInfoChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="netmask">Máscara de Rede</Label>
                    <Input 
                      id="netmask" 
                      name="netmask" 
                      value={serverInfo.netmask} 
                      onChange={handleServerInfoChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gateway">Gateway</Label>
                    <Input 
                      id="gateway" 
                      name="gateway" 
                      value={serverInfo.gateway} 
                      onChange={handleServerInfoChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dns1">DNS Primário</Label>
                    <Input 
                      id="dns1" 
                      name="dns1" 
                      value={serverInfo.dns1} 
                      onChange={handleServerInfoChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dns2">DNS Secundário</Label>
                    <Input 
                      id="dns2" 
                      name="dns2" 
                      value={serverInfo.dns2} 
                      onChange={handleServerInfoChange} 
                    />
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <Alert className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                  <Wifi className="w-4 h-4" />
                  <AlertDescription>
                    Certifique-se de que as configurações de rede estejam corretas para evitar perder acesso ao servidor.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={generateInstallScript} 
              disabled={isGenerating} 
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}
              {isGenerating ? "Gerando Script..." : "Gerar Script de Instalação"}
            </Button>
          </div>
        </Tabs>
      )}
    </div>
  );
}