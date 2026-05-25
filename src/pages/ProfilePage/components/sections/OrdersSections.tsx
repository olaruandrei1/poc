import { useEffect, useState } from 'react';
import { Chip } from '@mui/material';
import { LocalShipping, CheckCircle, Cancel, Refresh, HourglassEmpty } from '@mui/icons-material';
import type { Order } from '../../../../types/profile';
import { httpClient } from '../../../../services/axiosService';
import { ApiRoutes } from '../../../../services/apiRoutes';
import { GlassCard } from './GlassCard';
import styles from './OrdersSections.module.css';

const STATUS_CONFIG = {
    delivered: { label: 'Delivered', color: '#22c55e', icon: <CheckCircle sx={{ fontSize: 14 }} /> },
    shipped: { label: 'Shipped', color: 'var(--color-accent)', icon: <LocalShipping sx={{ fontSize: 14 }} /> },
    pending: { label: 'Pending', color: '#f59e0b', icon: <HourglassEmpty sx={{ fontSize: 14 }} /> },
    returned: { label: 'Returned', color: '#ef4444', icon: <Refresh sx={{ fontSize: 14 }} /> },
    cancelled: { label: 'Cancelled', color: 'var(--color-text-muted)', icon: <Cancel sx={{ fontSize: 14 }} /> },
};

export const OrdersSection = () => {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        httpClient.get<{ items: Order[] }>(ApiRoutes.orders)
            .then((r) => setOrders(r.data.items));
    }, []);

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>My Orders</h2>

            <div className={styles.list}>
                {orders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status];
                    return (
                        <GlassCard key={order.id} noPadding>
                            <div className={styles.orderHeader}>
                                <div className={styles.orderMeta}>
                                    <span className={styles.orderId}>#{order.id.toUpperCase()}</span>
                                    <span className={styles.orderDate}>
                                        {new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <Chip
                                    label={cfg.label}
                                    size="small"
                                    icon={cfg.icon}
                                    sx={{
                                        background: `${cfg.color}18`,
                                        color: cfg.color,
                                        border: `1px solid ${cfg.color}40`,
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        '& .MuiChip-icon': { color: cfg.color },
                                    }}
                                />
                            </div>

                            {order.items.map((item) => (
                                <div key={item.name} className={styles.itemRow}>
                                    <img src={item.image} alt={item.name} className={styles.itemImg} />
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemBrand}>{item.brand}</span>
                                        <span className={styles.itemName}>{item.name}</span>
                                        <span className={styles.itemSize}>Size: {item.size}</span>
                                    </div>
                                    <span className={styles.itemPrice}>${item.price}</span>
                                </div>
                            ))}

                            <div className={styles.orderFooter}>
                                <div className={styles.trackingWrap}>
                                    <LocalShipping sx={{ fontSize: 14, color: 'var(--color-text-muted)' }} />
                                    <span className={styles.tracking}>{order.tracking}</span>
                                </div>
                                <div className={styles.totalWrap}>
                                    <span className={styles.totalLabel}>Total</span>
                                    <span className={styles.totalValue}>${order.total}</span>
                                </div>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>
        </div>
    );
};