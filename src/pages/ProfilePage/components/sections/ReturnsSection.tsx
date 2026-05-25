import { useState } from 'react';
import { TextField, MenuItem, Button, Chip } from '@mui/material';
import { Upload, Send } from '@mui/icons-material';
import type { UserProfile, Order } from '../../../../types/profile';
import { GlassCard } from './GlassCard';
import { httpClient } from '../../../../services/axiosService';
import { ApiRoutes } from '../../../../services/apiRoutes';
import styles from './ReturnsSection.module.css';
import { useEffect } from 'react';

interface Props {
    profile: UserProfile;
    onProfileUpdate: (p: UserProfile) => void;
}

const RETURN_REASONS = [
    'Wrong size', 'Item not as described', 'Damaged on arrival',
    'Changed my mind', 'Counterfeit concern', 'Other',
];

export const ReturnsSection = ({ profile }: Props) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState('');
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        httpClient.get<{ items: Order[] }>(ApiRoutes.orders)
            .then((r) => setOrders(r.data.items.filter((o) => o.status === 'delivered')));
    }, []);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const urls = files.map((f) => URL.createObjectURL(f));
        setPhotos((prev) => [...prev, ...urls].slice(0, 5));
    };

    const handleSubmit = () => {
        if (!selectedOrder || !reason) return;
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <GlassCard className={styles.successCard}>
                <span className={styles.successIcon}>✓</span>
                <h3 className={styles.successTitle}>Return Request Submitted</h3>
                <p className={styles.successMsg}>
                    We'll review your request and get back to you within 24 hours.
                </p>
                <Button
                    variant="outlined"
                    onClick={() => { setSubmitted(false); setSelectedOrder(''); setReason(''); setDescription(''); setPhotos([]); }}
                    sx={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', borderRadius: '100px', fontFamily: 'var(--font-display)', mt: 2 }}
                >
                    Submit Another
                </Button>
            </GlassCard>
        );
    }

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Returns</h2>

            <GlassCard>
                <div className={styles.form}>
                    <TextField
                        select label="Select Order"
                        value={selectedOrder}
                        onChange={(e) => setSelectedOrder(e.target.value)}
                        size="small" fullWidth sx={sxField}
                    >
                        {orders.map((o) => (
                            <MenuItem key={o.id} value={o.id} sx={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
                                #{o.id.toUpperCase()} — {o.items[0].name} (${o.total})
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select label="Reason for Return"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        size="small" fullWidth sx={sxField}
                    >
                        {RETURN_REASONS.map((r) => (
                            <MenuItem key={r} value={r} sx={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>{r}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline rows={3} size="small" fullWidth sx={sxField}
                        placeholder="Describe the issue in detail..."
                    />

                    {/* Photo upload */}
                    <div className={styles.photoSection}>
                        <span className={styles.photoLabel}>Photos (max 5)</span>
                        <div className={styles.photoGrid}>
                            {photos.map((url, i) => (
                                <div key={i} className={styles.photoThumb}>
                                    <img src={url} alt={`upload ${i}`} />
                                    <button className={styles.photoRemove}
                                        onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}>
                                        ✕
                                    </button>
                                </div>
                            ))}
                            {photos.length < 5 && (
                                <label className={styles.photoUpload}>
                                    <Upload sx={{ fontSize: 20, color: 'var(--color-text-muted)' }} />
                                    <span>Add Photo</span>
                                    <input type="file" accept="image/*" multiple hidden onChange={handlePhotoUpload} />
                                </label>
                            )}
                        </div>
                    </div>

                    <TextField
                        label="Pickup Address"
                        value={profile.addresses.find((a) => a.isDefault)
                            ? `${profile.addresses.find((a) => a.isDefault)!.street}, ${profile.addresses.find((a) => a.isDefault)!.city}`
                            : ''}
                        size="small" fullWidth sx={sxField}
                        helperText="Using your default address"
                        slotProps={{ input: { readOnly: true } }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<Send />}
                        onClick={handleSubmit}
                        disabled={!selectedOrder || !reason}
                        fullWidth
                        sx={{
                            background: 'var(--color-secondary)',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 700,
                            borderRadius: '100px',
                            py: 1.2,
                            '&:hover': { background: 'var(--color-primary)' },
                            '&.Mui-disabled': { opacity: 0.4 },
                        }}
                    >
                        Submit Return Request
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
};

const sxField = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        '& fieldset': { borderColor: 'var(--color-border)' },
        '&:hover fieldset': { borderColor: 'var(--color-secondary)' },
        '&.Mui-focused fieldset': { borderColor: 'var(--color-accent)' },
    },
    '& .MuiInputLabel-root': { color: 'var(--color-text-muted)', fontSize: '0.85rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-accent)' },
    '& input, & textarea': { color: 'var(--color-text)', fontSize: '0.85rem' },
    '& .MuiFormHelperText-root': { color: 'var(--color-text-muted)', fontSize: '0.7rem' },
};