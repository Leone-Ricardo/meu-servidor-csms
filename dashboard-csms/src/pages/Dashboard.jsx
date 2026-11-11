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
    {
      label: 'Total Transações',
      value: loading ? '...' : transactions.length,
      icon: Plug,
      accent: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Sessões Ativas',
      value: loading ? '...' : ativas,
      icon: Activity,
      accent: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Energia Total',
      value: loading ? '...' : `${energiaTotal.toFixed(2)} kWh`,
      icon: BatteryCharging,
      accent: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Finalizadas',
      value: loading ? '...' : finalizadas.length,
      icon: CheckCircle,
      accent: 'from-slate-500 to-slate-600',
      iconBg: 'bg-slate-50 text-slate-600',
    },
  ];

  return (
    <div>
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Visão geral do CSMS em tempo real</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, accent, iconBg }) => (
          <div
            key={label}
            className="group relative bg-white rounded-xl shadow-sm p-6 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            {/* Barra de acento no topo */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`} />

            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${iconBg} transition-transform group-hover:scale-110`}>
                <Icon size={22} />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-slate-500 font-medium">{label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}