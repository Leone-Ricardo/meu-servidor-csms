import { useEffect, useState } from 'react';
import { Server, Database, Zap, Wifi, WifiOff, Info } from 'lucide-react';

export default function Settings() {
  const [online, setOnline] = useState(false);
  const [checando, setChecando] = useState(true);

  useEffect(() => {
    async function checar() {
      try {
        const res = await fetch('http://localhost:8000/api/transactions');
        setOnline(res.ok);
      } catch {
        setOnline(false);
      } finally {
        setChecando(false);
      }
    }
    checar();
    const id = setInterval(checar, 10000);
    return () => clearInterval(id);
  }, []);

  const infos = [
    { label: 'Versão', value: 'v1.0.0', icon: Info },
    { label: 'Porta do backend', value: '8000', icon: Server },
    { label: 'Banco de dados', value: 'PostgreSQL (5432)', icon: Database },
    { label: 'Protocolo', value: 'OCPP 1.6J', icon: Zap },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Configurações</h1>
        <p className="text-slate-500 mt-1">Informações do sistema e status da conexão</p>
      </header>

      {/* Status da conexão */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-lg ${
                online ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}
            >
              {online ? <Wifi size={22} /> : <WifiOff size={22} />}
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                {checando ? 'Verificando...' : online ? 'Backend online' : 'Backend offline'}
              </p>
              <p className="text-sm text-slate-500">
                {online
                  ? 'Conectado a http://localhost:8000'
                  : 'Não foi possível conectar ao servidor'}
              </p>
            </div>
          </div>
          <span
            className={`w-3 h-3 rounded-full ${
              online ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}
          />
        </div>
      </div>

      {/* Informações do sistema */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Informações do sistema</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {infos.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3 text-slate-600">
                <Icon size={16} />
                <span className="text-sm">{label}</span>
              </div>
              <span className="text-sm font-medium text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder para futuras configurações */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Preferências</h2>
          <p className="text-xs text-slate-500 mt-1">Em breve</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between opacity-60">
            <div>
              <p className="text-sm font-medium text-slate-700">Tarifa por kWh</p>
              <p className="text-xs text-slate-500">Valor cobrado por quilowatt-hora</p>
            </div>
            <span className="text-sm font-medium text-slate-600">R$ 1,50</span>
          </div>
          <div className="flex items-center justify-between opacity-60">
            <div>
              <p className="text-sm font-medium text-slate-700">Intervalo de atualização</p>
              <p className="text-xs text-slate-500">Frequência do polling automático</p>
            </div>
            <span className="text-sm font-medium text-slate-600">5 segundos</span>
          </div>
        </div>
      </div>
    </div>
  );
}