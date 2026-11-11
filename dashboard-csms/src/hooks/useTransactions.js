import { useCallback, useEffect, useRef, useState } from 'react';
import { getTransactions } from '../services/api';

/**
 * Hook para buscar transações, com opção de polling automático.
 * @param {number} pollingMs - Intervalo em ms para atualizar automaticamente (0 = desativado)
 */
export function useTransactions(pollingMs = 0) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data);
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

  // Polling automático (se pollingMs > 0)
  useEffect(() => {
    if (!pollingMs) return;
    intervalRef.current = setInterval(() => fetchData(true), pollingMs);
    return () => clearInterval(intervalRef.current);
  }, [pollingMs, fetchData]);

  return {
    transactions,
    loading,
    error,
    lastUpdated,
    refresh: () => fetchData(false),
  };
}