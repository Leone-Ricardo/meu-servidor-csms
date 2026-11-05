# CSMS Simulator — OCPP 1.6J + Dashboard React

Simulador de um **Charging Station Management System (CSMS)** baseado no protocolo **OCPP 1.6J**, com backend em Node.js, persistência em PostgreSQL e dashboard em React para visualização em tempo real das sessões de recarga.

## 📋 Sobre o projeto

Este projeto simula o funcionamento de um CSMS real: um carregador de veículos elétricos (EVSE) se conecta via WebSocket ao servidor, autentica-se com credenciais válidas e troca mensagens OCPP (`BootNotification`, `StartTransaction`, `StopTransaction`). O servidor valida as credenciais no banco, grava as transações e expõe uma API REST que alimenta a dashboard.

## 🏗️ Arquitetura

Carregador (client.js)
│ WebSocket + OCPP 1.6J
▼
Servidor Node.js (server.js) ──── PostgreSQL (5432)
│ API REST (HTTP)
▼
Dashboard React (Vite + Tailwind)
text


## 🚀 Tecnologias

**Backend**
- Node.js
- `ws` (WebSocket para OCPP)
- `pg` (driver PostgreSQL)
- Módulo `http` nativo (API REST)

**Frontend**
- React
- Vite
- React Router DOM
- Tailwind CSS v4
- Lucide React (ícones)

**Banco de dados**
- PostgreSQL

## 📁 Estrutura do projeto

meu-servidor-csms/
├── server.js # Servidor OCPP + API REST
├── client.js # Simulador de carregador (OCPP)
├── package.json
├── .gitignore
└── dashboard-csms/ # Frontend React
├── src/
│ ├── components/
│ │ └── Sidebar.jsx
│ ├── pages/
│ │ ├── Dashboard.jsx
│ │ └── Transactions.jsx
│ ├── services/
│ │ └── api.js
│ ├── App.jsx
│ └── main.jsx
├── vite.config.js
└── package.json
text


## ⚙️ Como executar

### Pré-requisitos

- Node.js 18+
- PostgreSQL rodando em `localhost:5432`
- Banco `postgres` com as tabelas `charger_credentials` e `transactions`

### 1. Clonar o repositório

```bash
git clone https://github.com/Leone-Ricardo/meu-servidor-csms.git
cd meu-servidor-csms

2. Configurar o banco de dados

Crie as tabelas no PostgreSQL:
sql

CREATE TABLE charger_credentials (
    charge_point_id VARCHAR(50) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    charge_point_id VARCHAR(50) NOT NULL,
    id_tag VARCHAR(50) NOT NULL,
    meter_start INTEGER NOT NULL,
    meter_stop INTEGER,
    status VARCHAR(20) NOT NULL,
    stop_reason VARCHAR(50),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

Insira um carregador de teste:
sql

INSERT INTO charger_credentials (charge_point_id, password_hash)
VALUES ('EVB-001', 'senha_segura_123');

3. Configurar credenciais do banco

No server.js, ajuste a senha do PostgreSQL:
javascript

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'SUA_SENHA_AQUI',
  database: 'postgres'
});

4. Iniciar o backend
bash

npm install
npm start

Você verá: 🚀 CSMS rodando na porta 8000 integrado ao PostgreSQL.
5. Iniciar o frontend

Em outro terminal:
bash

cd dashboard-csms
npm install
npm run dev

Acesse http://localhost:5173.
6. Simular um carregador (opcional)

Em um terceiro terminal, ainda na pasta do backend:
bash

node client.js

O client.js envia BootNotification, StartTransaction e StopTransaction. As transações aparecem na dashboard após atualizar a página.
🔌 Endpoints da API
Método	Rota	Descrição
GET	/api/transactions	Lista as últimas 50 transações
📡 Mensagens OCPP suportadas
Ação	Direção	Descrição
BootNotification	Carregador → CSMS	Registro inicial do carregador
StartTransaction	Carregador → CSMS	Início da sessão de recarga
StopTransaction	Carregador → CSMS	Fim da sessão de recarga
📸 Screenshots

    Adicione aqui prints da dashboard e da página de transações.

🗺️ Roadmap

    □

    Botão de atualizar dados (refresh)
    □

    Atualização automática via polling
    □

    Mais cards no Dashboard (receita, carregadores ativos)
    □

    Filtros por status na página Transactions
    □

    Suporte a Heartbeat e MeterValues

📄 Licença

Este projeto está sob a licença MIT.
👤 Autor

Leone Ricardo

    GitHub: @Leone-Ricardo

text


### ⚠️ Antes de colar, ajuste estes pontos:

1. **Senha do banco**: deixe `SUA_SENHA_AQUI` como placeholder, não coloque a senha real.
2. **Nome do repositório**: confirme que é `meu-servidor-csms` (ajuste se for outro).
3. **Screenshots**: se quiser, tire prints da dashboard e salve numa pasta `docs/` depois, referenciando no README.

