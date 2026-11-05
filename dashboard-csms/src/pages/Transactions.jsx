import { useEffect, useState } from 'react';
import { getTransactions } from '../services/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTransactions()
      .then((data) => setTransactions(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Carregando transações...</p>;
  if (error) return <p className="p-6 text-red-500">Erro: {error}</p>;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
        <p className="text-gray-500 mt-1">Histórico de sessões de recarga</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Carregador</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Início (Wh)</th>
              <th className="px-4 py-3 text-right">Fim (Wh)</th>
              <th className="px-4 py-3 text-right">Consumo (kWh)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx) => {
              const consumo = tx.meter_stop
                ? ((tx.meter_stop - tx.meter_start) / 1000).toFixed(2)
                : '—';
              return (
                <tr key={tx.transaction_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono">{tx.transaction_id}</td>
                  <td className="px-4 py-3">{tx.charge_point_id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'Charging'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{tx.meter_start}</td>
                  <td className="px-4 py-3 text-right">{tx.meter_stop ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">{consumo}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p className="p-6 text-center text-gray-500">Nenhuma transação encontrada.</p>
        )}
      </div>
    </div>
  );
}