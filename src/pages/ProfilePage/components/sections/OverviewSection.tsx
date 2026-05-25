import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import {
    ShoppingBag, Favorite, TrendingUp, LocalShipping,
} from '@mui/icons-material';
import type { UserProfile, Order } from '../../../../types/profile';
import { httpClient } from '../../../../services/axiosService';
import { ApiRoutes } from '../../../../services/apiRoutes';
import { GlassCard } from './GlassCard';
import styles from './OverviewSection.module.css';

interface Props {
    profile: UserProfile;
    onProfileUpdate?: (p: UserProfile) => void;
}

const STATUS_COLOR: Record<string, string> = {
    delivered: '#22c55e',
    shipped: 'var(--color-accent)',
    pending: '#f59e0b',
    returned: '#ef4444',
    cancelled: 'var(--color-text-muted)',
};

export const OverviewSection = ({ profile }: Props) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        httpClient.get<{ items: Order[] }>(ApiRoutes.orders)
            .then((r) => setOrders(r.data.items.slice(0, 3)))
            .catch(() => setOrders([]));
    }, []);

    const stats = [
        { icon: <ShoppingBag sx={{ fontSize: 22 }} />, label: 'Total Orders', value: profile.totalOrders, color: 'var(--color-secondary)' },
        { icon: <TrendingUp sx={{ fontSize: 22 }} />, label: 'Total Spent', value: `$${profile.totalSpent.toFixed(2)}`, color: '#a78bfa' },
        { icon: <LocalShipping sx={{ fontSize: 22 }} />, label: 'Delivered', value: orders.filter((o) => o.status === 'delivered').length, color: '#22c55e' },
        { icon: <Favorite sx={{ fontSize: 22 }} />, label: 'Member Since', value: new Date(profile.joinedAt).getFullYear(), color: '#f472b6' },
    ];

    return (
        <div className={styles.wrapper}>
            <Typography variant="h5" className={styles.title}>
                Welcome back, {profile.displayName.split(' ')[0]} 👋
            </Typography>

            {/* Stats */}
            <div className={styles.statsGrid}>
                {stats.map((s) => (
                    <GlassCard key={s.label} className={styles.statCard}>
                        <span className={styles.statIcon} style={{ color: s.color, background: `${s.color}18` }}>
                            {s.icon}
                        </span>
                        <span className={styles.statValue}>{s.value}</span>
                        <span className={styles.statLabel}>{s.label}</span>
                    </GlassCard>
                ))}
            </div>

            {/* Recent orders */}
            <GlassCard noPadding>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Recent Orders</span>
                    <button className={styles.seeAll} onClick={() => navigate('?section=orders')}>
                        See all →
                    </button>
                </div>
                <div className={styles.orderList}>
                    {orders.length === 0 ? (
                        <div className={styles.emptyOrders}>
                            <ShoppingBag sx={{ fontSize: 32, color: 'var(--color-text-muted)', opacity: 0.4 }} />
                            <span>No orders yet</span>
                        </div>
                    ) : orders.map((order) => (
                        <div key={order.id} className={styles.orderRow}>
                            <img
                                src={order.items[0]?.image}
                                alt={order.items[0]?.name}
                                className={styles.orderImg}
                            />
                            <div className={styles.orderInfo}>
                                <span className={styles.orderName}>{order.items[0]?.name}</span>
                                <span className={styles.orderDate}>
                                    {new Date(order.date).toLocaleDateString('en-GB')}
                                </span>
                            </div>
                            <span className={styles.orderTotal}>${order.total}</span>
                            <span
                                className={styles.orderStatus}
                                style={{
                                    color: STATUS_COLOR[order.status],
                                    background: `${STATUS_COLOR[order.status]}18`,
                                }}
                            >
                                {order.status}
                            </span>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Seller summary */}
            {profile.isSeller && profile.seller && (
                <GlassCard className={styles.sellerCard}>
                    <div className={styles.sellerHeader}>
                        <span className={styles.sectionTitle}>Seller Overview</span>
                        <button className={styles.seeAll} onClick={() => navigate('?section=seller-sales')}>
                            Full stats →
                        </button>
                    </div>
                    <div className={styles.sellerStats}>
                        <div className={styles.sellerStat}>
                            <span className={styles.statValue}>{profile.seller.totalSales}</span>
                            <span className={styles.statLabel}>Total Sales</span>
                        </div>
                        <div className={styles.sellerStat}>
                            <span className={styles.statValue}>⭐ {profile.seller.rating}</span>
                            <span className={styles.statLabel}>Rating</span>
                        </div>
                        <div className={styles.sellerStat}>
                            <span className={styles.statValue}>{profile.seller.storeName}</span>
                            <span className={styles.statLabel}>Store</span>
                        </div>
                    </div>
                </GlassCard>
            )}
        </div>
    );
};