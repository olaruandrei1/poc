import { useState } from 'react';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import { Add, Edit, Delete, Home, Business, Check } from '@mui/icons-material';
import type { UserProfile, Address } from '../../../../types/profile';
import { GlassCard } from './GlassCard';
import styles from './AddressesSection.module.css';

interface Props {
    profile: UserProfile;
    onProfileUpdate: (p: UserProfile) => void;
}

const EMPTY_ADDRESS: Omit<Address, 'id'> = {
    label: 'Home', firstName: '', lastName: '',
    street: '', city: '', county: '', zip: '',
    country: 'Romania', phone: '', alternateEmail: '',
    isDefault: false,
};

export const AddressesSection = ({ profile, onProfileUpdate }: Props) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Address | null>(null);
    const [form, setForm] = useState<Omit<Address, 'id'>>(EMPTY_ADDRESS);

    const openAdd = () => {
        setEditing(null);
        setForm(EMPTY_ADDRESS);
        setModalOpen(true);
    };

    const openEdit = (addr: Address) => {
        setEditing(addr);
        setForm({ ...addr });
        setModalOpen(true);
    };

    const handleSave = () => {
        let addresses: Address[];
        if (editing) {
            addresses = profile.addresses.map((a) =>
                a.id === editing.id ? { ...form, id: editing.id } : a
            );
        } else {
            addresses = [...profile.addresses, { ...form, id: `addr-${Date.now()}` }];
        }
        onProfileUpdate({ ...profile, addresses });
        setModalOpen(false);
    };

    const handleDelete = (id: string) => {
        onProfileUpdate({
            ...profile,
            addresses: profile.addresses.filter((a) => a.id !== id),
        });
    };

    const handleSetDefault = (id: string) => {
        onProfileUpdate({
            ...profile,
            addresses: profile.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        });
    };

    const field = (key: keyof Omit<Address, 'id' | 'isDefault'>, label: string) => (
        <TextField
            label={label}
            value={(form as any)[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            size="small"
            fullWidth
            sx={sxField}
        />
    );

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h2 className={styles.title}>Addresses & Contact</h2>
                <Button
                    startIcon={<Add />}
                    variant="outlined"
                    size="small"
                    onClick={openAdd}
                    sx={sxBtn}
                >
                    Add Address
                </Button>
            </div>

            {/* Contact rapid — de pe adresa default */}
            {(() => {
                const def = profile.addresses.find((a) => a.isDefault) ?? profile.addresses[0];
                if (!def) return null;
                return (
                    <GlassCard>
                        <div className={styles.contactGrid}>
                            <TextField
                                label="Phone (default address)"
                                value={def.phone}
                                onChange={(e) => onProfileUpdate({
                                    ...profile,
                                    addresses: profile.addresses.map((a) =>
                                        a.id === def.id ? { ...a, phone: e.target.value } : a
                                    ),
                                })}
                                size="small"
                                sx={sxField}
                            />
                            <TextField
                                label="Alternate Email (default address)"
                                value={def.alternateEmail ?? ''}
                                onChange={(e) => onProfileUpdate({
                                    ...profile,
                                    addresses: profile.addresses.map((a) =>
                                        a.id === def.id ? { ...a, alternateEmail: e.target.value } : a
                                    ),
                                })}
                                size="small"
                                sx={sxField}
                            />
                        </div>
                    </GlassCard>
                );
            })()}

            {/* Adrese */}
            <div className={styles.addrList}>
                {profile.addresses.map((addr) => (
                    <GlassCard key={addr.id} className={styles.addrCard}>
                        <div className={styles.addrHeader}>
                            <div className={styles.addrLabelWrap}>
                                {addr.label === 'Home'
                                    ? <Home sx={{ fontSize: 16, color: 'var(--color-accent)' }} />
                                    : <Business sx={{ fontSize: 16, color: 'var(--color-accent)' }} />
                                }
                                <span className={styles.addrLabel}>{addr.label}</span>
                                {addr.isDefault && (
                                    <Chip label="Default" size="small" sx={{
                                        height: 18, fontSize: '0.6rem',
                                        background: 'rgba(64,138,113,0.15)',
                                        color: 'var(--color-accent)',
                                        fontFamily: 'var(--font-display)',
                                        fontWeight: 700,
                                    }} />
                                )}
                            </div>
                            <div className={styles.addrActions}>
                                {!addr.isDefault && (
                                    <button className={styles.actionBtn} onClick={() => handleSetDefault(addr.id)} title="Set as default">
                                        <Check sx={{ fontSize: 16 }} />
                                    </button>
                                )}
                                <button className={styles.actionBtn} onClick={() => openEdit(addr)}>
                                    <Edit sx={{ fontSize: 16 }} />
                                </button>
                                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(addr.id)}>
                                    <Delete sx={{ fontSize: 16 }} />
                                </button>
                            </div>
                        </div>
                        <p className={styles.addrText}>
                            {addr.firstName} {addr.lastName}<br />
                            {addr.street}<br />
                            {addr.city}, {addr.county} {addr.zip}<br />
                            {addr.country}<br />
                            <span className={styles.addrPhone}>{addr.phone}</span>
                        </p>
                    </GlassCard>
                ))}
            </div>

            {/* Modal add/edit */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth
                slotProps={{ paper: { sx: { background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '16px' } } }}>
                <DialogTitle sx={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', fontWeight: 700 }}>
                    {editing ? 'Edit Address' : 'Add Address'}
                </DialogTitle>
                <DialogContent>
                    <div className={styles.formGrid}>
                        <TextField label="Label (Home / Office)" value={form.label}
                            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                            size="small" fullWidth sx={sxField} />
                        {field('firstName', 'First Name')}
                        {field('lastName', 'Last Name')}
                        {field('street', 'Street Address')}
                        {field('city', 'City')}
                        {field('county', 'County / Sector')}
                        {field('zip', 'ZIP Code')}
                        {field('country', 'Country')}
                        {field('phone', 'Phone')}
                        {field('alternateEmail', 'Alternate Email (optional)')}
                    </div>
                </DialogContent>
                <DialogActions sx={{ padding: '12px 24px' }}>
                    <Button onClick={() => setModalOpen(false)} sx={{ color: 'var(--color-text-muted)' }}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained"
                        sx={{ background: 'var(--color-secondary)', fontFamily: 'var(--font-display)', borderRadius: '100px' }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
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
    '& input': { color: 'var(--color-text)', fontSize: '0.85rem' },
};

const sxBtn = {
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-display)',
    fontSize: '0.78rem',
    borderRadius: '100px',
    '&:hover': { borderColor: 'var(--color-accent)', color: 'var(--color-accent)' },
};