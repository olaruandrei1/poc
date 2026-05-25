import { GlassCard } from './GlassCard';
import type { UserProfile } from '../../../../types/profile';
import styles from './SellerReturnsSection.module.css';

interface Props {
    profile: UserProfile;
    onProfileUpdate: (p: UserProfile) => void;
}

const MOCK_RETURNS = [
    { id: 'sr-001', buyer: 'M***u', item: 'Nike SB Dunk Low Panda', size: 'EU 42', price: 195, reason: 'Wrong size', status: 'pending', date: '2026-04-20' },
    { id: 'sr-002', buyer: 'A***a', item: 'adidas Samba OG', size: 'EU 43', price: 130, reason: 'Item not as described', status: 'approved', date: '2026-04-15' },
];

const STATUS_COLOR: Record<string, string> = {
    pending: '#f59e0b',
    approved: '#22c55e',
    rejected: '#ef4444',
};

export const SellerReturnsSection = ({ }: Props) => {
    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Seller Returns</h2>
            <div className={styles.list}>
                {MOCK_RETURNS.map((r) => (
                    <GlassCard key={r.id}>
                        <div className={styles.returnHeader}>
                            <div>
                                <span className={styles.itemName}>{r.item}</span>
                                <span className={styles.itemMeta}>Size: {r.size} · ${r.price} · {new Date(r.date).toLocaleDateString('en-GB')}</span>
                            </div>
                            <span className={styles.status} style={{ color: STATUS_COLOR[r.status], background: `${STATUS_COLOR[r.status]}18` }}>
                                {r.status}
                            </span>
                        </div>
                        <div className={styles.returnBody}>
                            <span className={styles.buyerLabel}>Buyer: <strong>{r.buyer}</strong></span>
                            <span className={styles.reasonLabel}>Reason: <strong>{r.reason}</strong></span>
                        </div>
                        {r.status === 'pending' && (
                            <div className={styles.returnActions}>
                                <button className={`${styles.actionBtn} ${styles.approveBtn}`}>Approve Return</button>
                                <button className={`${styles.actionBtn} ${styles.rejectBtn}`}>Reject</button>
                            </div>
                        )}
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};