import { useEffect, useState } from 'react';
import { Chip, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Edit, Visibility } from '@mui/icons-material';
import { httpClient } from '../../../../services/axiosService';
import { ApiRoutes } from '../../../../services/apiRoutes';
import { GlassCard } from './GlassCard';
import type { UserProfile } from '../../../../types/profile';
import styles from './SellerListingsSection.module.css';

interface Listing {
    id: string; name: string; brand: string;
    size: string; price: number; status: string;
    views: number; image: string; listedAt: string;
}

interface Props {
    profile: UserProfile;
    onProfileUpdate: (p: UserProfile) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: '#22c55e' },
    sold: { label: 'Sold', color: 'var(--color-text-muted)' },
    pending_verification: { label: 'Pending', color: '#f59e0b' },
    inactive: { label: 'Inactive', color: '#ef4444' },
};

export const SellerListingsSection = ({ profile }: Props) => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<Listing | null>(null);
    const [newPrice, setNewPrice] = useState('');

    useEffect(() => {
        httpClient.get<{ items: Listing[] }>(ApiRoutes.sellerListings)
            .then((r) => setListings(r.data.items));
    }, []);

    const handleEditPrice = (listing: Listing) => {
        setEditing(listing);
        setNewPrice(String(listing.price));
        setEditOpen(true);
    };

    const handleSavePrice = () => {
        if (!editing) return;
        setListings((l) => l.map((item) =>
            item.id === editing.id ? { ...item, price: Number(newPrice) } : item
        ));
        setEditOpen(false);
    };

    const stats = [
        { label: 'Active', value: listings.filter((l) => l.status === 'active').length },
        { label: 'Sold', value: listings.filter((l) => l.status === 'sold').length },
        { label: 'Pending', value: listings.filter((l) => l.status === 'pending_verification').length },
        { label: 'Views', value: listings.reduce((s, l) => s + l.views, 0) },
    ];

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h2 className={styles.title}>My Listings</h2>
                <Button startIcon={<Add />} variant="contained" size="small"
                    sx={{ background: 'var(--color-secondary)', fontFamily: 'var(--font-display)', fontSize: '0.78rem', borderRadius: '100px' }}>
                    Add Listing
                </Button>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
                {stats.map((s) => (
                    <GlassCard key={s.label} className={styles.statCard}>
                        <span className={styles.statValue}>{s.value}</span>
                        <span className={styles.statLabel}>{s.label}</span>
                    </GlassCard>
                ))}
            </div>

            {/* Listings table */}
            <GlassCard noPadding>
                <div className={styles.tableHeader}>
                    <span>Product</span>
                    <span>Size</span>
                    <span>Price</span>
                    <span>Status</span>
                    <span>Views</span>
                    <span>Actions</span>
                </div>
                {listings.map((l) => {
                    const cfg = STATUS_CONFIG[l.status] ?? STATUS_CONFIG.inactive;
                    return (
                        <div key={l.id} className={styles.tableRow}>
                            <div className={styles.productCell}>
                                <img src={l.image} alt={l.name} className={styles.listingImg} />
                                <div>
                                    <span className={styles.listingName}>{l.name}</span>
                                    <span className={styles.listingBrand}>{l.brand}</span>
                                </div>
                            </div>
                            <span className={styles.cell}>{l.size}</span>
                            <span className={styles.cellPrice}>${l.price}</span>
                            <Chip label={cfg.label} size="small" sx={{
                                height: 20, fontSize: '0.62rem', fontWeight: 700,
                                fontFamily: 'var(--font-display)',
                                background: `${cfg.color}18`, color: cfg.color,
                                border: `1px solid ${cfg.color}40`,
                            }} />
                            <div className={styles.viewsCell}>
                                <Visibility sx={{ fontSize: 14, color: 'var(--color-text-muted)' }} />
                                <span>{l.views}</span>
                            </div>
                            <div className={styles.actionsCell}>
                                {l.status === 'active' && (
                                    <button className={styles.editBtn} onClick={() => handleEditPrice(l)}>
                                        <Edit sx={{ fontSize: 14 }} />
                                        Edit Price
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </GlassCard>

            {/* Edit price dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth
                slotProps={{ paper: { sx: { background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '16px' } } }}>
                <DialogTitle sx={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', fontWeight: 700 }}>
                    Edit Price — {editing?.name}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="New Price ($)" type="number" value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        size="small" fullWidth sx={{
                            mt: 1,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px', background: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                '& fieldset': { borderColor: 'var(--color-border)' },
                                '&.Mui-focused fieldset': { borderColor: 'var(--color-accent)' },
                            },
                            '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-accent)' },
                            '& input': { color: 'var(--color-text)' },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ padding: '12px 24px' }}>
                    <Button onClick={() => setEditOpen(false)} sx={{ color: 'var(--color-text-muted)' }}>Cancel</Button>
                    <Button onClick={handleSavePrice} variant="contained"
                        sx={{ background: 'var(--color-secondary)', fontFamily: 'var(--font-display)', borderRadius: '100px' }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};