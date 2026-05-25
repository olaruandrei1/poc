import { create } from 'zustand';
import type { ProductItem } from '../types/product';
import { localStorageService } from '../services/localStorageService';
import { cachedFetch } from '../services/cachedFetchService';
import { ApiRoutes } from '../services/apiRoutes';

interface FavoritesState {
    items: ProductItem[];
    setItems: (items: ProductItem[]) => void;
    toggleFavorite: (item: ProductItem) => void;
    isFavorite: (id: string) => boolean;
    fetchFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    items: localStorageService.get<ProductItem[]>('favorites_items') ?? [],

    setItems: (items) => {
        localStorageService.set('favorites_items', items);
        set({ items });
    },

    toggleFavorite: (item) => {
        const exists = get().items.find((i) => i.id === item.id);
        const updated = exists
            ? get().items.filter((i) => i.id !== item.id)
            : [...get().items, item];
        localStorageService.set('favorites_items', updated);
        set({ items: updated });
    },

    isFavorite: (id) => !!get().items.find((i) => i.id === id),

    fetchFavorites: () => {
        cachedFetch<{ items: ProductItem[] }>({
            key: 'favorites_items_raw',
            url: ApiRoutes.favorites,
            onData: (data) => {
                localStorageService.set('favorites_items', data.items);
                set({ items: data.items });
            },
        });
    },
}));