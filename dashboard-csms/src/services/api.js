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

// Busca o total de carregadores cadastrados
export async function getChargersCount() {
  const response = await fetch(`${BASE_URL}/api/chargers/count`);
  if (!response.ok) {
    throw new Error(`Erro ao buscar carregadores: ${response.status}`);
  }
  return response.json();
}