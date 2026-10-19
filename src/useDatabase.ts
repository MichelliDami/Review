import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import type { User, Product, Review, CategoryItem } from './types';

type State = { currentUser: User | null; allUsers: User[]; products: Product[]; reviews: Review[]; categories: CategoryItem[] };
const empty: State = { currentUser: null, allUsers: [], products: [], reviews: [], categories: [] };

export function useDatabase() {
  const [state, setState] = useState<State>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(0);
  const baseline = useRef<State>(empty);
  const queue = useRef(Promise.resolve());
  const blocked = useRef(false);
  async function reload() {
    setLoading(true);
    try {
      await queue.current;
      const data = await api<State>('/state');
      baseline.current = data;
      blocked.current = false;
      setState(data);
      setError('');
    } catch (e: any) {
      if (e.status === 401) { baseline.current = empty; setState(empty); setError(''); }
      else setError(e.message);
    } finally { setLoading(false); }
  }
  useEffect(() => { void reload(); }, []);
  useEffect(() => {
    if (!pending) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [pending]);
  useEffect(() => {
    if (loading || !state.currentUser || blocked.current) return;
    const previous = baseline.current;
    baseline.current = state;
    for (const [key, collection] of [['allUsers', 'users'], ['products', 'products'], ['reviews', 'reviews']] as const) {
      const oldItems = new Map(previous[key].map(item => [item.id, item]));
      const nextItems = new Map(state[key].map(item => [item.id, item]));
      for (const id of new Set([...oldItems.keys(), ...nextItems.keys()])) {
        const before = oldItems.get(id) || null, after = nextItems.get(id) || null;
        if (JSON.stringify(before) === JSON.stringify(after)) continue;
        setPending(value => value + 1);
        queue.current = queue.current.then(async () => {
          if (blocked.current) return;
          try { await api('/changes', { collection, before, after }); }
          catch (e: any) { blocked.current = true; setError(`${e.message} As alterações pendentes não foram salvas. Recarregue para buscar os dados do banco.`); }
        }).finally(() => setPending(value => value - 1));
      }
    }
  }, [state, loading]);
  function setter<K extends keyof State>(key: K) {
    return (update: State[K] | ((previous: State[K]) => State[K])) => setState(previous => ({
      ...previous, [key]: typeof update === 'function' ? (update as (value: State[K]) => State[K])(previous[key]) : update,
    }));
  }
  async function login(user: User) {
    await reload();
  }
  async function logout() {
    try {
      await queue.current;
      await api('/auth/logout', {});
      baseline.current = empty;
      setState(empty);
    } catch (e: any) { setError(e.message); }
  }
  return { ...state, loading, error, saving: pending > 0, reload, login, logout,
    setCurrentUser: setter('currentUser'), setAllUsers: setter('allUsers'), setProducts: setter('products'), setReviews: setter('reviews') };
}
