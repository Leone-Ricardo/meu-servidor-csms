// Endereço base do nosso backend CSMS
const BASE_URL = 'http://localhost:8000';

// Busca todas as transações
export async function getTransactions() {
  const response = await fetch(`${BASE_URL}/api/transactions`);
  if (!response.ok) {
    throw new Error(`Erro ao buscar transações: ${response.status}`);
  }
  return response.json();
}