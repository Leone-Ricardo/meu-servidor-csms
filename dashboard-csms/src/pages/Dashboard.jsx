import { useEffect, useState } from 'react';
import { Plug, Activity, BatteryCharging, AlertTriangle } from 'lucide-react';
import { getTransactions } from '../services/api';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  // Calcula os números a partir das transações reais
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
    { label: 'Finalizadas', value: loading ? '...' : finalizadas.length, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do CSMS em tempo real</p>
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