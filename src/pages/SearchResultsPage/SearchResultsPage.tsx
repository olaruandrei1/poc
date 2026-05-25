import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Typography, Drawer, Button, IconButton, Chip, Box } from '@mui/material';
import { FilterList, Close, TuneOutlined } from '@mui/icons-material';
import { httpClient } from '../../services/axiosService';
import { ApiRoutes } from '../../services/apiRoutes';
import type { ProductItem } from '../../types/product';
import type { FilterState } from '../../types/filters';
import type { SortOption } from '../../components/molecules/ProductGrid/ProductGrid';
import { DEFAULT_FILTERS } from '../../types/filters';
import { ProductCard } from '../../components/atoms/ProductCard/ProductCard';
import { ProductGrid } from '../../components/molecules/ProductGrid/ProductGrid';
import { FiltersSidebar } from './components/FiltersSidebar';
import { Spinner } from '../../components/atoms/Spinner/Spinner';
import { useResponsiveStore } from '../../services/responsiveObserver';
import styles from './SearchResultsPage.module.css';

const PAGE_SIZE = 12;

export const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') ?? '';
    const { isMobile, isTablet } = useResponsiveStore();

    const [items, setItems] = useState<ProductItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [sort, setSort] = useState<SortOption>('featured');
    const [drawerOpen, setDrawerOpen] = useState(false);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const isFirstLoad = useRef(true);

    // Fetch page
    const fetchPage = useCallback(async (pageNum: number, reset = false) => {
        if (loading) return;
        setLoading(true);
        try {
            // Mock — pe real trimitem query + filters + sort + page
            const res = await httpClient.get<{ total: number; items: ProductItem[] }>(
                ApiRoutes.searchProducts(query)
            );

            const all = res.data.items ?? (res.data as any);
            const allItems: ProductItem[] = Array.isArray(all) ? all : [];

            // Simulam paginare pe mock
            const start = (pageNum - 1) * PAGE_SIZE;
            const chunk = allItems.slice(start, start + PAGE_SIZE);
            const realTotal = allItems.length;

            setTotal(realTotal);
            setItems((prev) => reset ? chunk : [...prev, ...chunk]);
            setHasMore(start + PAGE_SIZE < realTotal);
        } catch (e) {
            console.error('[Search] fetch error', e);
        } finally {
            setLoading(false);
        }
    }, [query, filters, sort]);

    // Reset on query/filter/sort change
    useEffect(() => {
        setItems([]);
        setPage(1);
        setHasMore(true);
        isFirstLoad.current = true;
        fetchPage(1, true).then(() => { isFirstLoad.current = false; });
    }, [query, filters, sort]);

    // Infinite scroll observer
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !isFirstLoad.current) {
                    setPage((prev) => {
                        const next = prev + 1;
                        fetchPage(next);
                        return next;
                    });
                }
            },
            { threshold: 0.1 }
        );

        if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
        return () => observerRef.current?.disconnect();
    }, [hasMore, loading, fetchPage]);

    const handleFiltersChange = (next: FilterState) => {
        setFilters(next);
    };

    const activeFilterCount = [
        filters.availableNow,
        filters.xpressShip,
        ...filters.categories,
        ...filters.genders,
        ...filters.brands,
        ...filters.activities,
        ...filters.colors,
        filters.priceMin > 0 || filters.priceMax < 10000,
    ].filter(Boolean).length;

    const isMobileOrTablet = isMobile || isTablet;

    return (
        <div className={styles.page}>

            {/* Breadcrumb */}
            <div className={styles.breadcrumb}>
                <button className={styles.breadcrumbLink} onClick={() => navigate('/')}>Home</button>
                <span className={styles.breadcrumbSep}>/</span>
                <span className={styles.breadcrumbCurrent}>Search</span>
            </div>

            <div className={styles.layout}>

                {/* Filters — desktop sidebar */}
                {!isMobileOrTablet && (
                    <FiltersSidebar filters={filters} onChange={handleFiltersChange} />
                )}

                {/* Main content */}
                <div className={styles.content}>

                    {/* Mobile filter button */}
                    {isMobileOrTablet && (
                        <div className={styles.mobileToolbar}>
                            <Button
                                variant="outlined"
                                startIcon={<TuneOutlined />}
                                onClick={() => setDrawerOpen(true)}
                                size="small"
                                sx={{
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text)',
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '0.78rem',
                                    borderRadius: '100px',
                                    textTransform: 'none',
                                }}
                            >
                                Filters
                                {activeFilterCount > 0 && (
                                    <Chip
                                        label={activeFilterCount}
                                        size="small"
                                        sx={{ ml: 1, height: 18, fontSize: '0.65rem', background: 'var(--color-secondary)', color: 'var(--color-bg)' }}
                                    />
                                )}
                            </Button>
                        </div>
                    )}

                    <ProductGrid
                        totalCount={total}
                        searchQuery={query}
                        defaultMode="grid"
                        showModeSwitch
                        showSort
                        showClearFilters
                        onSortChange={setSort}
                        onClearFilters={() => {
                            setFilters(DEFAULT_FILTERS);
                            navigate('/search');
                        }}
                        emptyState={
                            !loading ? (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <Typography variant="h6" sx={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                                        No results found
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'var(--color-text-muted)', mt: 1 }}>
                                        Try adjusting your filters or search query.
                                    </Typography>
                                </Box>
                            ) : undefined
                        }
                    >
                        {items.map((item) => (
                            <ProductCard key={item.id} item={item} />
                        ))}
                    </ProductGrid>

                    {/* Sentinel pentru infinite scroll */}
                    <div ref={sentinelRef} className={styles.sentinel} />

                    {/* Loading indicator */}
                    {loading && (
                        <div className={styles.loadingMore}>
                            <Spinner size="md" />
                        </div>
                    )}

                    {/* End of results */}
                    {!hasMore && items.length > 0 && (
                        <div className={styles.endMessage}>
                            <Typography variant="body2" sx={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                                You've seen all {total} results
                            </Typography>
                        </div>
                    )}
                </div>
            </div>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                slotProps={{
                    paper: {
                        sx: {
                            background: 'var(--color-bg)',
                            width: 280,
                            borderRight: '1px solid var(--color-border)',
                        },
                    },
                }}
            >
                <div className={styles.drawerHeader}>
                    <Typography variant="h6" sx={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', fontWeight: 700 }}>
                        Filters
                    </Typography>
                    <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'var(--color-text-muted)' }}>
                        <Close />
                    </IconButton>
                </div>
                <FiltersSidebar filters={filters} onChange={handleFiltersChange} />
            </Drawer>
        </div>
    );
};