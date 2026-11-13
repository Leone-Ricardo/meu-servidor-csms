import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;