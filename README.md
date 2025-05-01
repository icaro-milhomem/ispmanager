# ISP Manager

Sistema de gerenciamento para provedores de internet, com recursos para gestão de clientes, planos, faturas, suporte técnico e mais.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- **Frontend**: Interface web desenvolvida em React.js com Vite
- **Backend**: API RESTful desenvolvida em Node.js com Express e TypeScript

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm 9+ ou yarn 1.22+
- Git

## Configuração

### Backend

1. Entre na pasta do backend:
   ```
   cd backend
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure o arquivo `.env` com suas credenciais de banco de dados:
   ```
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/ispmanager?schema=public"
   PORT=3000
   JWT_SECRET=sua_chave_secreta
   JWT_EXPIRES_IN=24h
   ```

4. Execute as migrações do banco de dados:
   ```
   npm run prisma:migrate
   ```

5. Popule o banco de dados com dados iniciais:
   ```
   npm run seed
   ```

6. Inicie o servidor:
   ```
   npm run dev
   ```

### Frontend

1. Entre na pasta do frontend:
   ```
   cd frontend
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure o arquivo `.env` para apontar para o backend:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

4. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```

## Usuário Padrão

Após executar o seed, você terá acesso ao sistema com o seguinte usuário administrador:

- **E-mail**: admin@ispmanager.com
- **Senha**: admin123

## Funcionalidades

### Gestão de Clientes
- Cadastro e gerenciamento de clientes
- Histórico de atendimentos
- Documentos e contratos
- Gestão de endereços

### Gestão de Planos de Internet
- Criação e personalização de planos
- Controle de velocidade e limites
- Gestão de preços e promoções

### Cobrança e Faturamento
- Geração automática de faturas
- Integração com gateways de pagamento
- Histórico de pagamentos
- Relatórios financeiros

### Suporte Técnico
- Sistema de tickets
- Atendimento em tempo real
- Histórico de atendimentos
- Base de conhecimento

### Rede FTTH
- Mapeamento de rede óptica
- Gestão de CTOs e nós de rede
- Rastreamento de fibras
- Monitoramento de equipamentos

### Contratos
- Geração automática de contratos
- Assinatura digital
- Histórico de alterações
- Renovação automática

## Tecnologias Utilizadas

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- Socket.io para comunicação em tempo real
- Swagger para documentação da API

### Frontend
- React.js
- Vite
- Chakra UI
- React Router
- React Query
- Axios
- React Hook Form
- Yup para validação
- Leaflet para mapas
- Socket.io-client

## Licença

Este projeto está licenciado sob a licença ISC. 