import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Zap, Settings } from 'lucide-react';

const menu = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
];

export default function Sidebar() {
  const [online, setOnline] = useState(false);

  // Verifica se o backend está respondendo
  useEffect(() => {
    async function checarConexao() {
      try {
        const res = await fetch('http://localhost:8000/api/transactions');
        setOnline(res.ok);
      } catch {
        setOnline(false);
      }
    }
    checarConexao();
    const id = setInterval(checarConexao, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
        <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
          <Zap size={20} className="text-slate-900" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight">CSMS</h1>
          <p className="text-xs text-slate-400 leading-tight">Simulator</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Menu
        </p>
        {menu.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Barra de acento lateral */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r" />
                )}
                <Icon size={18} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {/* Status de conexão */}
        <div className="flex items-center gap-2 px-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              online ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="text-slate-400">
            {online ? 'Backend online' : 'Backend offline'}
          </span>
        </div>

        {/* Botão de configurações (visual) */}
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all">
          <Settings size={16} />
          Configurações
        </button>

        <p className="text-xs text-slate-600 text-center pt-1">v1.0.0</p>
      </div>
    </aside>
  );
}