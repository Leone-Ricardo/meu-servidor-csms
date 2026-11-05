const WebSocket = require('ws');

// Criptografando as credenciais no formato padrão exigido pelo OCPP
const token = Buffer.from('EVB-001:senha_segura_123').toString('base64');

// Injetando o cabeçalho no momento de bater na porta 8000
const ws = new WebSocket('ws://127.0.0.1:8000', {
  headers: {
    Authorization: `Basic ${token}`
  }
});

ws.on('open', () => {
    console.log('🔌 Handshake aceito! Túnel estabelecido com sucesso.');
    
    // Avisa que ligou
    const bootNotification = [2, "req-1", "BootNotification", { chargePointVendor: "WEG", chargePointModel: "WEMOB-01" }];
    ws.send(JSON.stringify(bootNotification));
  
    // Avisa que o motorista plugou o carro (medidor em 120500 Wh)
   // Início da recarga (medidor: 120500)
    setTimeout(() => {
        const startTransaction = [2, "req-2", "StartTransaction", { connectorId: 1, idTag: "BEE-1234", meterStart: 120500, timestamp: new Date().toISOString() }];
        ws.send(JSON.stringify(startTransaction));
    }, 2000); 

    // Final da recarga (medidor: 125500) após o usuário desligar
    setTimeout(() => {
        // Observação: Assumimos transactionId: 1 baseando-se no último teste gravado no DB
        const stopTransaction = [2, "req-3", "StopTransaction", { transactionId: 1, meterStop: 125500, timestamp: new Date().toISOString(), reason: "EVDisconnected" }];
        ws.send(JSON.stringify(stopTransaction));
    }, 5000);
});

ws.on('message', (data) => {
  console.log('[Carregador] Resposta do Servidor:', JSON.parse(data));
});

ws.on('error', (error) => {
  console.log('❌ Erro na conexão:', error.message);
});