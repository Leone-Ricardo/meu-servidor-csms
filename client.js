const WebSocket = require('ws');

// Criptografando as credenciais no formato padrão exigido pelo OCPP
const token = Buffer.from('EVB-001:senha_segura_123').toString('base64');

// Guarda o transactionId retornado pelo servidor
let transactionIdAtual = null;

// Injetando o cabeçalho no momento de bater na porta 8000
const ws = new WebSocket('ws://127.0.0.1:8000', {
  headers: {
    Authorization: `Basic ${token}`
  }
});

ws.on('open', () => {
    console.log('🔌 Handshake aceito! Túnel estabelecido com sucesso.');

    // 1. Avisa que ligou
    const bootNotification = [2, "req-1", "BootNotification", {
      chargePointVendor: "WEG",
      chargePointModel: "WEMOB-01"
    }];
    ws.send(JSON.stringify(bootNotification));

    // 2. Início da recarga (medidor: 120500) após 2s
    setTimeout(() => {
        const startTransaction = [2, "req-2", "StartTransaction", {
          connectorId: 1,
          idTag: "BEE-1234",
          meterStart: 120500,
          timestamp: new Date().toISOString()
        }];
        ws.send(JSON.stringify(startTransaction));
        console.log('▶️  StartTransaction enviado.');
    }, 2000);

    // 3. Final da recarga (medidor: 125500) após 8s
    setTimeout(() => {
        if (!transactionIdAtual) {
            console.log('⚠️  StopTransaction não enviado: transactionId ainda não recebido.');
            return;
        }
        const stopTransaction = [2, "req-3", "StopTransaction", {
          transactionId: transactionIdAtual,
          meterStop: 125500,
          timestamp: new Date().toISOString(),
          reason: "EVDisconnected"
        }];
        ws.send(JSON.stringify(stopTransaction));
        console.log(`⏹️  StopTransaction enviado para ID ${transactionIdAtual}.`);
    }, 8000);
});

ws.on('message', (data) => {
    const resposta = JSON.parse(data);
    console.log('[Carregador] Resposta do Servidor:', resposta);

    // Captura o transactionId do StartTransaction
    if (Array.isArray(resposta) && resposta[2]?.transactionId) {
        transactionIdAtual = resposta[2].transactionId;
        console.log(`🆔 Transaction ID capturado: ${transactionIdAtual}`);
    }
});

ws.on('error', (error) => {
    console.log('❌ Erro na conexão:', error.message);
});