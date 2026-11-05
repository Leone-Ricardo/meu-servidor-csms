const http = require('http');
const WebSocket = require('ws');
const { Pool } = require('pg');

// ============================================
// 1. Conexão com o PostgreSQL
// ============================================
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Botafogo121196@#$', // Substitua pela senha real configurada no seu PostgreSQL
  database: 'postgres'
});

const server = http.createServer();
const wss = new WebSocket.Server({ noServer: true });

// ============================================
// 2. Handshake OCPP (validação no banco)
// ============================================
server.on('upgrade', async (request, socket, head) => {
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        console.log('❌ Rejeitado: Cabeçalho Authorization ausente.');
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }

    const token = authHeader.split(' ')[1];
    const credenciaisDecodificadas = Buffer.from(token, 'base64').toString('utf-8');
    const [chargePointId, password] = credenciaisDecodificadas.split(':');

    try {
        const query = 'SELECT password_hash FROM charger_credentials WHERE charge_point_id = $1';
        const res = await pool.query(query, [chargePointId]);

        if (res.rows.length === 0 || res.rows[0].password_hash !== password) {
            console.log(`❌ Rejeitado: Credenciais inválidas para o ID [${chargePointId}].`);
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        console.log(`✅ Autenticado no BD: [${chargePointId}]. Construindo túnel...`);

        wss.handleUpgrade(request, socket, head, (ws) => {
            ws.chargePointId = chargePointId;
            wss.emit('connection', ws, request);
        });

    } catch (error) {
        console.error('Erro ao consultar banco de dados:', error);
        socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
        socket.destroy();
    }
});

// ============================================
// 3. Lógica OCPP (BootNotification, Start, Stop)
// ============================================
wss.on('connection', function connection(ws) {
  console.log(`⚡ Carregador seguro validado no túnel: ${ws.chargePointId}`);

  ws.on('message', async function incoming(message) {
      const pacote = JSON.parse(message);
      const idMensagem = pacote[1];
      const acao = pacote[2];
      const payload = pacote[3];

      console.log(`[Servidor] Pacote recebido: ${acao}`);

      // BootNotification
      if (acao === "BootNotification") {
          ws.send(JSON.stringify([3, idMensagem, { status: "Accepted", currentTime: new Date().toISOString(), interval: 300 }]));
      }

      // StartTransaction
      if (acao === "StartTransaction") {
          try {
              const query = `
                  INSERT INTO transactions (charge_point_id, id_tag, meter_start, status)
                  VALUES ($1, $2, $3, 'Charging')
                  RETURNING transaction_id;
              `;
              const res = await pool.query(query, [ws.chargePointId, payload.idTag, payload.meterStart]);
              const newTransactionId = res.rows[0].transaction_id;

              console.log(`🟢 Sessão de carga gravada no PostgreSQL! Transaction ID: ${newTransactionId}`);

              ws.send(JSON.stringify([3, idMensagem, { transactionId: newTransactionId, idTagInfo: { status: "Accepted" } }]));
          } catch (error) {
              console.error("❌ Erro ao gravar transação no banco:", error);
          }
      }

      // StopTransaction
      if (acao === "StopTransaction") {
          try {
              const transactionId = payload.transactionId;
              const meterStop = payload.meterStop;

              const query = `
                  UPDATE transactions
                  SET meter_stop = $1, status = 'Finished', ended_at = CURRENT_TIMESTAMP
                  WHERE transaction_id = $2
                  RETURNING meter_start;
              `;
              const res = await pool.query(query, [meterStop, transactionId]);

              if(res.rows.length > 0) {
                  const meterStart = res.rows[0].meter_start;
                  const consumoWh = meterStop - meterStart;
                  const consumoKwh = consumoWh / 1000;
                  const valorTotal = consumoKwh * 1.50;

                  console.log(`🛑 Sessão finalizada no banco. Consumo de ${consumoKwh} kWh. Total: R$ ${valorTotal.toFixed(2)}`);
              }

              ws.send(JSON.stringify([3, idMensagem, { idTagInfo: { status: "Accepted" } }]));
          } catch (error) {
              console.error("❌ Erro ao atualizar fechamento no banco:", error);
          }
      }
  });

  ws.on('close', () => console.log(`❌ Conexão encerrada com ${ws.chargePointId}.`));
});

// ============================================
// 4. API REST mínima para o React consumir
// ============================================
server.on('request', async (req, res) => {
  // CORS: permite o Vite (localhost:5173) acessar
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responde ao preflight do navegador
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Rota: lista as últimas transações
  if (req.url === '/api/transactions' && req.method === 'GET') {
    try {
      const result = await pool.query(
        'SELECT * FROM transactions ORDER BY transaction_id DESC LIMIT 50'
      );
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      console.error('Erro na rota /api/transactions:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Rota não encontrada
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

// ============================================
// 5. Inicia o servidor na porta 8000
// ============================================
server.listen(8000, () => {
  console.log('🚀 CSMS rodando na porta 8000 integrado ao PostgreSQL.');
});