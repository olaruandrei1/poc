import { useEffect, useState } from 'react';
import { Chip, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { Add, Edit, Visibility, Gavel } from '@mui/icons-material';
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

const SIZES = ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 42.5', 'EU 43', 'EU 44', 'EU 44.5', 'EU 45', 'EU 46'];
const CONDITIONS = ['New', 'Used — Excellent', 'Used — Good', 'Used — Fair'];
const DURATIONS = [{ value: '1d', label: '1 Day' }, { value: '3d', label: '3 Days' }, { value: '7d', label: '7 Days' }];

const EMPTY_LISTING = { name: '', brand: '', size: 'EU 42', price: '', condition: 'New', description: '', imageUrl: '' };
const EMPTY_AUCTION = { startPrice: '', reservePrice: '', duration: '3d', hasReserve: false };

const sxField = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px', background: 'var(--color-surface)', color: 'var(--color-text)',
        '& fieldset': { borderColor: 'var(--color-border)' },
        '&:hover fieldset': { borderColor: 'var(--color-secondary)' },
        '&.Mui-focused fieldset': { borderColor: 'var(--color-accent)' },
    },
    '& .MuiInputLabel-root': { color: 'var(--color-text-muted)', fontSize: '0.85rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-accent)' },
    '& input, & textarea': { color: 'var(--color-text)', fontSize: '0.85rem' },
    '& .MuiSelect-select': { color: 'var(--color-text)', fontSize: '0.85rem' },
};

export const SellerListingsSection = ({ profile }: Props) => {
    const [listings, setListings] = useState<Listing[]>([]);

    // Edit price
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<Listing | null>(null);
    const [newPrice, setNewPrice] = useState('');

    // Add listing
    const [addOpen, setAddOpen] = useState(false);
    const [addForm, setAddForm] = useState(EMPTY_LISTING);
    const [addSuccess, setAddSuccess] = useState(false);

    // Create auction
    const [auctionOpen, setAuctionOpen] = useState(false);
    const [auctionListing, setAuctionListing] = useState<Listing | null>(null);
    const [auctionForm, setAuctionForm] = useState(EMPTY_AUCTION);
    const [auctionSuccess, setAuctionSuccess] = useState(false);

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

    const handleAddListing = () => {
        if (!addForm.name || !addForm.brand || !addForm.price) return;
        const newListing: Listing = {
            id: `sl-${Date.now()}`,
            name: addForm.name,
            brand: addForm.brand,
            size: addForm.size,
            price: Number(addForm.price),
            status: 'pending_verification',
            views: 0,
            image: addForm.imageUrl || `https://picsum.photos/seed/${Date.now()}/200/200`,
            listedAt: new Date().toISOString().split('T')[0],
        };
        setListings((l) => [newListing, ...l]);
        setAddSuccess(true);
        setTimeout(() => {
            setAddOpen(false);
            setAddSuccess(false);
            setAddForm(EMPTY_LISTING);
        }, 1500);
    };

    const handleCreateAuction = () => {
        if (!auctionListing || !auctionForm.startPrice) return;
        setAuctionSuccess(true);
        setTimeout(() => {
            setAuctionOpen(false);
            setAuctionSuccess(false);
            setAuctionForm(EMPTY_AUCTION);
            setAuctionListing(null);
        }, 1500);
    };

    const openAuction = (listing: Listing) => {
        setAuctionListing(listing);
        setAuctionForm(EMPTY_AUCTION);
        setAuctionOpen(true);
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
                    onClick={() => setAddOpen(true)}
                    // TODO: Replace with real flow:
                    // 1. Search product in Elasticsearch
                    // 2. Auto-fill from DB (images from Blob, lowest ask price)
                    // 3. Upload own photos to Azure Blob
                    // 4. Submit → pending_verification → Az Func triggers admin review
                    sx={{ background: 'var(--color-secondary)', fontFamily: 'var(--font-display)', fontSize: '0.78rem', borderRadius: '100px' }}>
                    Add Listing
                </Button>
            </div>

            <div className={styles.statsRow}>
                {stats.map((s) => (
                    <GlassCard key={s.label} className={styles.statCard}>
                        <span className={styles.statValue}>{s.value}</span>
                        <span className={styles.statLabel}>{s.label}</span>
                    </GlassCard>
                ))}
            </div>

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
                                    <>
                                        <button className={styles.editBtn} onClick={() => handleEditPrice(l)}>
                                            <Edit sx={{ fontSize: 14 }} />
                                            Edit Price
                                        </button>
                                        <button className={styles.auctionBtn} onClick={() => openAuction(l)}>
                                            <Gavel sx={{ fontSize: 14 }} />
                                            Auction
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </GlassCard>

            {/* ── Edit Price Dialog ── */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth
                slotProps={{ paper: { sx: { background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '16px' } } }}>
                <DialogTitle sx={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', fontWeight: 700 }}>
                    Edit Price — {editing?.name}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="New Price ($)" type="number" value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        size="small" fullWidth sx={{ mt: 1, ...sxField }}
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

            {/* ── Add Listing Dialog ── */}
            <Dialog open={addOpen} onClose={() => { setAddOpen(false); setAddSuccess(false); setAddForm(EMPTY_LISTING); }}
                maxWidth="sm" fullWidth
                slotProps={{ paper: { sx: { background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '16px' } } }}>
                <DialogTitle sx={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', fontWeight: 700 }}>
                    Add New Listing
                </DialogTitle>
                <DialogContent>
                    {addSuccess ? (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: '#22c55e', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
                            ✓ Listing submitted for verification!
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 8 }}>
                            <TextField label="Product Name" value={addForm.name}
                                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                                size="small" fullWidth sx={{ gridColumn: '1/-1', ...sxField }} />
                            <TextField label="Brand" value={addForm.brand}
                                onChange={(e) => setAddForm((f) => ({ ...f, brand: e.target.value }))}
                                size="small" fullWidth sx={sxField} />
                            <TextField select label="Size" value={addForm.size}
                                onChange={(e) => setAddForm((f) => ({ ...f, size: e.target.value }))}
                                size="small" fullWidth sx={sxField}>
                                {SIZES.map((s) => <MenuItem key={s} value={s} sx={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>{s}</MenuItem>)}
                            </TextField>
                            <TextField label="Price ($)" type="number" value={addForm.price}
                                onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                                size="small" fullWidth sx={sxField} />
                            <TextField select label="Condition" value={addForm.condition}
                                onChange={(e) => setAddForm((f) => ({ ...f, condition: e.target.value }))}
                                size="small" fullWidth sx={sxField}>
                                {CONDITIONS.map((c) => <MenuItem key={c} value={c} sx={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>{c}</MenuItem>)}
                            </TextField>
                            <TextField label="Image URL (optional)" value={addForm.imageUrl}
                                onChange={(e) => setAddForm((f) => ({ ...f, imageUrl: e.target.value }))}
                                size="small" fullWidth sx={{ gridColumn: '1/-1', ...sxField }} />
                            <TextField label="Description (optional)" value={addForm.description}
                                onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                                multiline rows={2} size="small" fullWidth sx={{ gridColumn: '1/-1', ...sxField }} />
                        </div>
                    )}
                </DialogContent>
                {!addSuccess && (
                    <DialogActions sx={{ padding: '12px 24px' }}>
                        <Button onClick={() => setAddOpen(false)} sx={{ color: 'var(--color-text-muted)' }}>Cancel</Button>
                        <Button onClick={handleAddListing} variant="contained"
                            disabled={!addForm.name || !addForm.brand || !addForm.price}
                            sx={{ background: 'var(--color-secondary)', fontFamily: 'var(--font-display)', borderRadius: '100px', '&.Mui-disabled': { opacity: 0.4 } }}>
                            Submit Listing
                        </Button>
                    </DialogActions>
                )}
            </Dialog>

            {/* ── Create Auction Dialog ── */}
            <Dialog open={auctionOpen} onClose={() => { setAuctionOpen(false); setAuctionSuccess(false); }}
                maxWidth="sm" fullWidth
                slotProps={{ paper: { sx: { background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '16px' } } }}>
                <DialogTitle sx={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', fontWeight: 700 }}>
                    Create Auction
                </DialogTitle>
                <DialogContent>
                    {auctionSuccess ? (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: '#22c55e', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
                            ✓ Auction created successfully!
                        </div>
                    ) : (
                        <>
                            {/* Product preview */}
                            {auctionListing && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 20px', borderBottom: '1px solid var(--color-border)', marginBottom: 16 }}>
                                    <img src={auctionListing.image} alt={auctionListing.name}
                                        style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'contain', background: 'var(--color-surface)', padding: 4 }} />
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)' }}>
                                            {auctionListing.name}
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            {auctionListing.brand} · Size {auctionListing.size} · Current price: ${auctionListing.price}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <TextField label="Start Price ($)" type="number" value={auctionForm.startPrice}
                                    onChange={(e) => setAuctionForm((f) => ({ ...f, startPrice: e.target.value }))}
                                    size="small" fullWidth sx={sxField}
                                    helperText="Minimum opening bid"
                                    slotProps={{ formHelperText: { sx: { color: 'var(--color-text-muted)', fontSize: '0.7rem' } } }}
                                />
                                <TextField select label="Duration" value={auctionForm.duration}
                                    onChange={(e) => setAuctionForm((f) => ({ ...f, duration: e.target.value }))}
                                    size="small" fullWidth sx={sxField}>
                                    {DURATIONS.map((d) => <MenuItem key={d.value} value={d.value} sx={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>{d.label}</MenuItem>)}
                                </TextField>
                                <TextField label="Reserve Price ($) — optional" type="number"
                                    value={auctionForm.reservePrice}
                                    onChange={(e) => setAuctionForm((f) => ({ ...f, reservePrice: e.target.value, hasReserve: !!e.target.value }))}
                                    size="small" fullWidth sx={{ gridColumn: '1/-1', ...sxField }}
                                    helperText="Auction won't complete if bidding doesn't reach this amount"
                                    slotProps={{ formHelperText: { sx: { color: 'var(--color-text-muted)', fontSize: '0.7rem' } } }}
                                />
                            </div>
                            <div style={{
                                marginTop: 16, padding: '10px 14px',
                                background: 'rgba(64,138,113,0.08)',
                                border: '1px solid rgba(64,138,113,0.2)',
                                borderRadius: 10,
                                fontFamily: 'var(--font-body)',
                                fontSize: '0.78rem',
                                color: 'var(--color-accent)',
                            }}>
                                ⚡ Anti-snipe protection active — bids placed in the last 2 minutes extend the auction by 1 minute.
                            </div>
                        </>
                    )}
                </DialogContent>
                {!auctionSuccess && (
                    <DialogActions sx={{ padding: '12px 24px' }}>
                        <Button onClick={() => setAuctionOpen(false)} sx={{ color: 'var(--color-text-muted)' }}>Cancel</Button>
                        <Button onClick={handleCreateAuction} variant="contained"
                            disabled={!auctionForm.startPrice}
                            sx={{ background: 'var(--color-secondary)', fontFamily: 'var(--font-display)', borderRadius: '100px', '&.Mui-disabled': { opacity: 0.4 } }}>
                            <Gavel sx={{ fontSize: 16, mr: 0.5 }} />
                            Start Auction
                        </Button>
                    </DialogActions>
                )}
            </Dialog>
        </div>
    );
};