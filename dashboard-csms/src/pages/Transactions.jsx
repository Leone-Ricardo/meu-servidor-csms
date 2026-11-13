import { useMemo, useState } from 'react';
import { RefreshCw, Search, Filter } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';

// Formata data ISO em formato brasileiro
function formatarData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Calcula duração entre duas datas
function formatarDuracao(inicio, fim) {
  if (!inicio || !fim) return '—';
  const ms = new Date(fim) - new Date(inicio);
  const min = Math.floor(ms / 60000);
  const seg = Math.floor((ms % 60000) / 1000);
  return `${min}m ${seg}s`;
}

const FILTROS = [
  { key: 'all', label: 'Todos' },
  { key: 'Charging', label: 'Em andamento' },
  { key: 'Finished', label: 'Finalizadas' },
];

export default function Transactions() {
  const { transactions, loading, error, lastUpdated, refresh } = useTransactions(5000);
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [busca, setBusca] = useState('');

  // Aplica filtros em memória (sem refetch)
  const transacoesFiltradas = useMemo(() => {
    return transactions.filter((tx) => {
      const matchStatus = filtroStatus === 'all' || tx.status === filtroStatus;
      const termo = busca.trim().toLowerCase();
      const matchBusca =
        !termo ||
        tx.charge_point_id.toLowerCase().includes(termo) ||
        tx.id_tag.toLowerCase().includes(termo);
      return matchStatus && matchBusca;
    });
  }, [transactions, filtroStatus, busca]);

  if (loading && transactions.length === 0) {
    return <p className="p-6 text-slate-500">Carregando transações...</p>;
  }
  if (error) return <p className="p-6 text-red-500">Erro: {error}</p>;

  return (
    <div>
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Transactions</h1>
          <p className="text-slate-500 mt-1">Histórico de sessões de recarga</p>
          {lastUpdated && (
            <p className="text-xs text-slate-400 mt-1">
              Atualizado às {lastUpdated.toLocaleTimeString('pt-BR')}
            </p>
          )}
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-sm hover:shadow-md"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </header>

      {/* Barra de filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Filtro por status */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-slate-400" />
          {FILTROS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltroStatus(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filtroStatus === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Busca por carregador / tag */}
        <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por carregador ou tag..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Contador */}
      <p className="text-sm text-slate-500 mb-3">
        Mostrando <span className="font-semibold text-slate-700">{transacoesFiltradas.length}</span> de{' '}
        <span className="font-semibold text-slate-700">{transactions.length}</span> transações
      </p>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">ID</th>
              <th className="px-4 py-3 text-left font-semibold">Carregador</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Início</th>
              <th className="px-4 py-3 text-left font-semibold">Fim</th>
              <th className="px-4 py-3 text-left font-semibold">Duração</th>
              <th className="px-4 py-3 text-right font-semibold">Consumo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transacoesFiltradas.map((tx) => {
              const consumo = tx.meter_stop
                ? `${((tx.meter_stop - tx.meter_start) / 1000).toFixed(2)} kWh`
                : '—';
              const ativa = tx.status === 'Charging';

              return (
                <tr
                  key={tx.transaction_id}
                  className={`transition-colors ${
                    ativa ? 'bg-emerald-50/40 hover:bg-emerald-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-slate-700">#{tx.transaction_id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{tx.charge_point_id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        ativa
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ativa && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatarData(tx.started_at)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatarData(tx.ended_at)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatarDuracao(tx.started_at, tx.ended_at)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{consumo}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {transacoesFiltradas.length === 0 && (
          <p className="p-6 text-center text-slate-500">
            Nenhuma transação encontrada com os filtros atuais.
          </p>
        )}
      </div>
    </div>
  );
}