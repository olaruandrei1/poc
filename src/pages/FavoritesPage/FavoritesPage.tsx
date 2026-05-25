import { useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useCartStore } from '../../store/cartStore';
import { wsService } from '../../services/wsService';
import { useAuthStore } from '../../store/authStore';
import { ProductCard } from '../../components/atoms/ProductCard/ProductCard';
import { ProductGrid } from '../../components/molecules/ProductGrid/ProductGrid';
import styles from './FavoritesPage.module.css';

export const FavoritesPage = () => {
    const { items, fetchFavorites, toggleFavorite, setItems } = useFavoritesStore();
    const { addItem } = useCartStore();
    const { user } = useAuthStore();

    // Fetch on mount
    useEffect(() => {
        fetchFavorites();
    }, []);

    // WebSocket — item indisponibil
    useEffect(() => {
        if (!user) return;
        wsService.connect(user.uid);
        const unsub = wsService.on('item_unavailable', ({ itemId }) => {
            setItems(items.filter((i) => i.id !== itemId));
        });
        return unsub;
    }, [user, items]);

    // Cross-tab sync via localStorage events
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === 'kicksneak_favorites_items' && e.newValue) {
                try {
                    const fresh = JSON.parse(e.newValue);
                    setItems(fresh);
                } catch { /* ignore */ }
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    return (
        <main className={styles.page}>
            <div className={styles.inner}>
                <Box className={styles.header}>
                    <Typography variant="h4" className={styles.title}>
                        My Favorites
                    </Typography>
                    <Typography variant="body2" className={styles.subtitle}>
                        {items.length} {items.length === 1 ? 'item' : 'items'} saved
                    </Typography>
                </Box>

                <ProductGrid
                    totalCount={items.length}
                    defaultMode="list"
                    showModeSwitch={false}
                    showSort
                    emptyState={
                        <Box className={styles.empty}>
                            <FavoriteBorderIcon sx={{ fontSize: 56, color: 'var(--color-text-muted)', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                                No favorites yet
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--color-text-muted)', mt: 1 }}>
                                Browse products and hit the heart icon to save them here.
                            </Typography>
                        </Box>
                    }
                >
                    {items.map((item) => (
                        <ProductCard
                            key={item.id}
                            item={item}
                            mode="list"
                            showCartAction
                            showDeleteAction
                            onDelete={(id) => toggleFavorite(items.find((i) => i.id === id)!)}
                        />
                    ))}
                </ProductGrid>
            </div>
        </main>
    );
};