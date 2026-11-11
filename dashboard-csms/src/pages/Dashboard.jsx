import { Plug, Activity, BatteryCharging, CheckCircle, RefreshCw } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';

export default function Dashboard() {
  const { transactions, loading, lastUpdated, refresh } = useTransactions(5000);

  const ativas = transactions.filter((t) => t.status === 'Charging').length;
  const finalizadas = transactions.filter((t) => t.status === 'Finished');
  const energiaTotal = finalizadas.reduce(
    (acc, t) => acc + (t.meter_stop - t.meter_start) / 1000,
    0
  );

  const stats = [
    { label: 'Total Transações', value: loading ? '...' : transactions.length, icon: Plug, color: 'bg-blue-500' },
    { label: 'Sessões Ativas', value: loading ? '...' : ativas, icon: Activity, color: 'bg-green-500' },
    { label: 'Energia Total', value: loading ? '...' : `${energiaTotal.toFixed(2)} kWh`, icon: BatteryCharging, color: 'bg-purple-500' },
    { label: 'Finalizadas', value: loading ? '...' : finalizadas.length, icon: CheckCircle, color: 'bg-gray-600' },
  ];

  return (
    <div>
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral do CSMS em tempo real</p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Atualizado às {lastUpdated.toLocaleTimeString('pt-BR')}
            </p>
          )}
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className={`${color} text-white p-3 rounded-lg`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}