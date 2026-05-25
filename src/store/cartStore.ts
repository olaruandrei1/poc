import { create } from 'zustand';
import type { CartItem } from '../types/product';
import { localStorageService } from '../services/localStorageService';
import { cachedFetch } from '../services/cachedFetchService';
import { ApiRoutes } from '../services/apiRoutes';

interface CartState {
    items: CartItem[];
    setItems: (items: CartItem[]) => void;
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;  // adăugat

    fetchCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: localStorageService.get<CartItem[]>('cart_items') ?? [],

    setItems: (items) => {
        localStorageService.set('cart_items', items);
        set({ items });
    },

    clearCart: () => {
        localStorageService.remove('cart_items');
        set({ items: [] });
    },

    addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        const updated = existing
            ? get().items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            )
            : [...get().items, item];
        localStorageService.set('cart_items', updated);
        set({ items: updated });
    },

    removeItem: (id) => {
        const updated = get().items.filter((i) => i.id !== id);
        localStorageService.set('cart_items', updated);
        set({ items: updated });
    },

    fetchCart: () => {
        cachedFetch<{ items: CartItem[] }>({
            key: 'cart_items_raw',
            url: ApiRoutes.cart,
            onData: (data) => {
                localStorageService.set('cart_items', data.items);
                set({ items: data.items });
            },
        });
    },
}));