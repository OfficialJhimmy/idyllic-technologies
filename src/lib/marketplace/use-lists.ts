"use client";

import { useCallback, useSyncExternalStore } from "react";
import { addItem, BOOKING_LIST_MAX, COMPARE_MAX, hasItem, parseStoredList, removeItem, type AddBlocked, type ListItem } from "@/lib/marketplace/list-logic";

const EMPTY: ListItem[] = [];

/**
 * A list kept in the browser (localStorage), shared between tabs and between components. Nothing is sent
 * to a server until the visitor books. When storage is blocked (some private windows) it still works for
 * the visit, held in memory.
 */
function createStore(key: string, max: number, sameCategoryOnly: boolean) {
  const listeners = new Set<() => void>();
  let memory: string | null = null;
  let lastRaw: string | null | undefined;
  let lastList: ListItem[] = EMPTY;

  const read = (): string | null => {
    try {
      return window.localStorage.getItem(key) ?? memory;
    } catch {
      return memory;
    }
  };
  const write = (value: string) => {
    memory = value;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage is blocked. The in-memory copy keeps the list for this visit.
    }
  };
  const emit = () => listeners.forEach((l) => l());

  const getSnapshot = (): ListItem[] => {
    const raw = read();
    if (raw === lastRaw) return lastList;
    lastRaw = raw;
    lastList = raw === null ? EMPTY : parseStoredList(raw, max);
    return lastList;
  };

  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => e.key === key && cb();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  };

  const set = (list: ListItem[]) => {
    write(JSON.stringify(list));
    emit();
  };

  return {
    getSnapshot,
    subscribe,
    add(item: ListItem): AddBlocked {
      const result = addItem(getSnapshot(), item, max, sameCategoryOnly);
      if (!result.blocked && result.list !== getSnapshot()) set(result.list);
      return result.blocked;
    },
    remove: (id: string) => set(removeItem(getSnapshot(), id)),
    replace: (items: ListItem[]) => set(items.slice(0, max)),
    clear: () => set([]),
  };
}

export const bookingStore = createStore("idyllic.booking-list.v1", BOOKING_LIST_MAX, false);
export const compareStore = createStore("idyllic.compare.v1", COMPARE_MAX, true);

function useStore(store: ReturnType<typeof createStore>) {
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, () => EMPTY);
  const has = useCallback((id: string) => hasItem(items, id), [items]);
  return { items, count: items.length, has, add: store.add, remove: store.remove, replace: store.replace, clear: store.clear };
}

export const useBookingList = () => useStore(bookingStore);
export const useCompareList = () => useStore(compareStore);
