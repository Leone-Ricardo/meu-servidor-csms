import { useCallback, useEffect, useRef, useState } from 'react';
import { getTransactions, getChargersCount } from '../services/api';

/**
 * Hook para buscar transações e total de carregadores.
 * @param {number} pollingMs - Intervalo em ms para atualizar automaticamente (0 = desativado)
 */
export function useTransactions(pollingMs = 0) {
  const [transactions, setTransactions] = useState([]);
  const [chargersCount, setChargersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [txs, chargers] = await Promise.all([
        getTransactions(),
        getChargersCount(),
      ]);
      setTransactions(txs);
      setChargersCount(chargers.total);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Busca inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling automático
  useEffect(() => {
    if (!pollingMs) return;
    intervalRef.current = setInterval(() => fetchData(true), pollingMs);
    return () => clearInterval(intervalRef.current);
  }, [pollingMs, fetchData]);

  return {
    transactions,
    chargersCount,
    loading,
    error,
    lastUpdated,
    refresh: () => fetchData(false),
  };
}